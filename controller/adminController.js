const adminModel = require('../models/admin');
const contactModel = require('../models/contact');
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const {brevo} = require('../utils/brevo')
const {emailTemplate, resetPasswordTemplate} = require('../email')
const jwt = require('jsonwebtoken')

exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password} = req.body;
    if (!password) {
      return res.status(400).json({
        message: "Please enter password",
      });
    }
  const otp = otpGenerator.generate(4, {upperCaseAlphabets: false,lowerCaseAlphabets: false,specialChars: false,});
    console.log("OTP:", otp);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const admin = await adminModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
      otp, 
    });
      console.log("OTP being sent:", otp);
    await brevo(admin.email,`${admin.firstName} ${admin.lastName}`,emailTemplate(`${admin.firstName} ${admin.lastName}`, otp ));
    return res.status(201).json({
      message: "Admin created successfully",
      data: {
              firstName: admin.firstName,
              lastName: admin.lastName,
              email: admin.email.toLowerCase(),
              _id: admin._id,
              otp: admin.otp
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await adminModel.findOne({ email: email.toLowerCase() })
    console.log(admin)
    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      })
    }; 
    
    if (admin.otp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP Provided'
      })
    };

   if (admin.isVerified) {
  return res.status(400).json({
    message: 'Admin already verified'
  });
}

  admin.isVerified = true;
    await admin.save();
    res.status(200).json({
      message: 'OTP Verified successfully',
      data: admin
    })
  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email: email.toLowerCase() })

    if (!admin) {
      return res.status(404).json({
        message: 'Invalid Credentials' 
      })
    };

    if (admin.isLocked) {
      return res.status(423).json({
        message: 'Account locked. Please reset your password or contact support'
      })
    };

    const correctPassword = await bcrypt.compare(password, admin.password);

    if (!correctPassword) {
      admin.loginAttempts += 1;

      if (admin.loginAttempts >= 5) {
        admin.isLocked = true;
        console.log(admin.loginAttempts);
        await admin.save();
        return res.status(423).json({
          message: 'Account locked after 5 failed login attempts'
        })
      };

      await admin.save();
      return res.status(400).json({
        message: 'Invalid Credentials'
      })
    };

    
    if (admin.isVerified == false) {
      return res.status(400).json({
        message: 'Please verify your email'
      })
    };

    admin.loginAttempts = 0;
    await admin.save();

    const token = jwt.sign({ id: admin._id}, process.env.SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login sucessful',
      token,
      admin: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email.toLowerCase(),
        _id: admin._id
      }
    })
  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  }
}

exports. adminLogout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await adminModel.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    const OTP = Math.round(Math.random() * 1e4).toString().padStart(4, "0");

    admin.otp = OTP;
    admin.otpExpires = Date.now() + 5 * 60 * 1000;
    admin.otpVerified = false;

    const data = {
      name: admin.firstName,
      email: admin.email,
      otp: admin.otp
    };

    await brevo(email, admin.firstName, resetPasswordTemplate(data));
    await admin.save();

    return res.status(200).json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const admin = await adminModel.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    admin.otp = OTP;
    admin.otpExpires = Date.now() + 5 * 60 * 1000;

    await admin.save();

    const data = {
      name: admin.firstName,
      otp: OTP
    };

    await brevo(admin.email, admin.firstName, resetPasswordTemplate(data));

    return res.status(200).json({
      message: "OTP resent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    // Extract the required fields from the request body
    const { otp, password, email } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP and password are required"
      });
    }

    // Find the admin
    const admin = await adminModel.findOne({ email: email.toLowerCase() });

    // Check if admin exists
    if (!admin) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    // Check if OTP exists, has not expired, and matches the admin's OTP
    if (!admin.otp || !admin.otpExpires || Date.now() > admin.otpExpires || String(otp) !== String(admin.otp)) {
      return res.status(400).json({
        message: "Invalid OTP, please request for a new one"
      });
    }

    // Reset the admin's password with the encrypted and updated password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    admin.password = hashPassword;
    admin.loginAttempts = 0;
    admin.isLocked = false;

    // Clear OTP after successful password reset
    admin.otp = undefined;
    admin.otpExpires = undefined;
    admin.otpVerified = false;

    await admin.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalVendors = await vendorModel.countDocuments();
    const pendingKYC = await kycModel.countDocuments({  verificationStatus: 'processing'});
    const verifiedVendors = await vendorModel.countDocuments({ isKycVerified: true});
    const totalBookings = await bookingModel.countDocuments();
    const totalPayments = await paymentModel.countDocuments({  status: 'success'});
    res.status(200).json({
      data: {
        totalUsers,
        totalVendors,
        pendingKYC,
        verifiedVendors,
        totalBookings,
        totalPayments
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllVendorsAdmin = async (req, res) => {
  try {
    const vendors = await vendorModel.find().select('-password');
    res.status(200).json({
      count: vendors.length,
      data: vendors
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneVendorAdmin = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await vendorModel.findById(vendorId).select('-password');
    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }
    res.status(200).json({
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


exports.getPendingKycs = async (req, res) => {
  try {
    const pendingKycs = await kycModel.find({verificationStatus: 'processing'}).populate(
        'vendorId',
        'firstName lastName stageName email'
      );

    res.status(200).json({
      count: pendingKycs.length,
      data: pendingKycs
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const { kycId } = req.params;
    const kyc = await kycModel.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        message: 'KYC not found'
      });
    }
    kyc.verificationStatus = 'verified';
    await kyc.save();
    await vendorModel.findByIdAndUpdate(
      kyc.vendorId,
      {
        isKycVerified: true
      }
    );

    res.status(200).json({
      message: 'KYC approved successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { rejectionReason } = req.body;
    const kyc = await kycModel.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        message: 'KYC not found'
      });
    }
    kyc.verificationStatus = 'rejected';
    kyc.rejectionReason = rejectionReason;

    await kyc.save();

    res.status(200).json({
      message: 'KYC rejected successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentModel.find().populate('userId','firstName lastName email').populate(
        'vendorId',
        'stageName firstName lastName'
      ).sort({createdAt: -1});

    res.status(200).json({
      message: 'All payments retrieved',  
      count: payments.length,
      data: payments
    }); 

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOnePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentModel.findById(paymentId).populate('userId','firstName lastName email').populate('vendorId','stageName');
    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      data: payment
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.find().populate('userId','firstName lastName email').populate(
        'vendorId',
        'stageName firstName lastName'
      );

    res.status(200).json({
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId).populate('userId','firstName lastName email').populate('vendorId','firstName lastName stageName' );
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      message: 'One booking successfully retrieved',  
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, adminComment} = req.body;

    const dispute = await disputeModel.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        message: 'Dispute not found'
      });
    }
    dispute.status = status;
    dispute.adminComment = adminComment;
    await dispute.save();

    res.status(200).json({
      message: 'Dispute updated successfully',
      data: dispute
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const reviews = await reviewModel.find({ vendorId }).populate(
        'userId',
        'firstName lastName'
      );

    res.status(200).json({
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await reviewModel.find({ userId }).populate(
        'vendorId',
        'firstName lastName'
      );

    res.status(200).json({
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await contactModel.find().populate("userId", "firstName lastName email phoneNumber").populate("vendorId", "businessName email phoneNumber").sort({ createdAt: -1 });
    return res.status(200).json({
      count: messages.length,
      data: messages
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllVendorPricing = async (req, res) => {
    try {
        const { id } = req.user;
        const pricing = await pricingModel.find({ vendorId: id});
        res.status(200).json({
            message: 'Pricing packages retrieved successfully',
            totalPackages: pricing.length,
            data: pricing
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

exports.getOnePricing = async (req, res) => {
  try {
    const { pricingId } = req.params;
    const pricing = await pricingModel.findById(pricingId)
    if (!pricing) {
      return res.status(404).json({
        message: "Package not found"
      });
    }
    return res.status(200).json({
      message: "Package retrieved successfully",
      data: pricing
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};