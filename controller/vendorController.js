require('dotenv').config();
const vendorModel = require('../models/vendor')
const bcrypt = require('bcrypt')    
const {brevo} = require('../utils/brevo')
const fs = require('fs')
const path = require('path')
const slugify = require('slugify')
const crypto = require('crypto')
const cloudinary = require('../utils/cloudinary')
const {emailTemplate, resetPasswordTemplate} = require('../email')
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const {formatBankName, normalizeEnumValue} = require('../utils/normalize')

exports.createVendor = async (req, res, next) => {
    try {
        const { firstName, lastName, stageName, email, password, phoneNumber, confirmPassword} = req.body;
        // Generate OTP
        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        // Validate password
        if (!password) {
            return res.status(400).json({
                message: 'Please enter password'
            });
        }
        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create vendor
        const vendor = await vendorModel.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashPassword,
            confirmPassword: hashPassword,
            stageName,
            phoneNumber,
            otp 
        });

        // Send Email
        brevo( vendor.email, `${vendor.firstName} ${vendor.lastName}`, emailTemplate(`${vendor.firstName} ${vendor.lastName}`, vendor.otp));
        // Fetch count
        const vendors = await vendorModel.find();
        res.status(201).json({
            message: 'Vendor created successfully',
            data: {
              firstName: vendor.firstName,
              lastName: vendor.lastName,
              stageName: vendor.stageName,
              email: vendor.email.toLowerCase(),
              phoneNumber: vendor.phoneNumber,
              _id: vendor._id
            }
        });

    } catch (error) {
    
        next(error)        
    }
  };

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await vendorModel.findById(id);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    let slug = vendor.slug;

    if (!vendor.slug) {
      const uniqueCode = crypto.randomBytes(6).toString("hex");

      slug = `${slugify(vendor.stageName || req.body.stageName, {
        lower: true,
        strict: true
      })}-${uniqueCode}`;

      vendor.slug = slug;
      await vendor.save();
    }

    const publicUrl = `https://feast-sync.vercel.app/vendor/${vendor.slug}`;

    const {bankName,accountNumber, bankCode,bio,servicesOffered,stateOfResidence,category,onboardingStep} = req.body;
   

    const allowedStates = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa","Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
      "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano","Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa","Niger", "Ogun", "Ondo", 
      "Osun", "Oyo", "Plateau", "Rivers","Sokoto", "Taraba", "Yobe", "Zamfara", "Abuja"];

    const allowedCategories = ["mc","liveband","photographer","videographer","dj"];

    const normalizedBankName = formatBankName(bankName);
    const normalizedState = normalizeEnumValue(stateOfResidence, allowedStates);
    const normalizedCategory = normalizeEnumValue(category, allowedCategories);

    if (stateOfResidence && !normalizedState) {
      return res.status(400).json({
        message: `${stateOfResidence} is not a valid state`
      });
    } 

    let categoryToUpdate;
    if (category) {
      if (!normalizedCategory) {
        return res.status(400).json({
          message: `${category} is not a valid category`
        });
      }

      if (vendor.category && vendor.category.toLowerCase() !== normalizedCategory.toLowerCase()) {
        return res.status(400).json({
          message: "Category cannot be changed after it has been selected"
        });
      }

      if (!vendor.category) {
        categoryToUpdate = normalizedCategory;
      }
    }

    let nextOnboardingStep = vendor.onboardingStep || 1;
    if (onboardingStep) {
      nextOnboardingStep = Math.max(
        Number(onboardingStep),
        nextOnboardingStep
      );
    }

    const isOnboarded = nextOnboardingStep >= 7;
    console.log(isOnboarded)
    const uploadFile = async (file, resourceType = "image") => {
      const absolutePath = path.resolve(file.path);

      console.log("Uploading:", absolutePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
      }

      const uploaded = await cloudinary.uploader.upload(absolutePath, {
        resource_type: resourceType
      });

      await fs.promises.unlink(absolutePath);

      return {
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    };

    let profilePicture;
    let coverPhoto;
    let coverVideo;
    let photoCatalogue = [];
    let videoCatalogue = [];

    if (req.files?.profilePicture) {
      profilePicture = await uploadFile(req.files.profilePicture[0], "image");
    }

    if (req.files?.coverPhoto) {
      coverPhoto = await uploadFile(req.files.coverPhoto[0], "image");
    }

    if (req.files?.coverVideo) {
      coverVideo = await uploadFile(req.files.coverVideo[0], "video");
    }

    if (req.files?.photoCatalogue) {
      photoCatalogue = await Promise.all(
        req.files.photoCatalogue.map(file => uploadFile(file, "image"))
      );
    }

    if (req.files?.videoCatalogue) {
      videoCatalogue = await Promise.all(
        req.files.videoCatalogue.map(file => uploadFile(file, "video"))
      );
    } 
console.log("A")
    const updateData = {
      ...(normalizedBankName && { bankName: normalizedBankName }),
      ...(accountNumber && { accountNumber }),
      ...(bankCode !== undefined && { bankCode }),
      ...(bio && { bio }),
      ...(servicesOffered && { servicesOffered }),
      ...(normalizedState && { stateOfResidence: normalizedState }),
      vendorUrl: publicUrl,
      onboardingStep: nextOnboardingStep,
      isOnboarded,
      ...(categoryToUpdate && { category: categoryToUpdate }),
      ...(slug && { slug }),
      ...(profilePicture && { profilePicture }),
      ...(coverPhoto && { coverPhoto }),
      ...(coverVideo && { coverVideo }),
      ...(photoCatalogue.length && { photoCatalogue }),
      ...(videoCatalogue.length && { videoCatalogue })

      
    };
    console.log("B")

   const updatedVendor = await vendorModel.findByIdAndUpdate(
  id,
  updateData,
  {
    new: true,
    runValidators: true
  }
);

    return res.status(200).json({
  message: "Vendor information updated successfully",
  vendorUrl: publicUrl,
  data: updatedVendor
});
console.log("c")

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.replaceVendorMedia = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { mediaType, publicId } = req.body;

    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file"
      });
    }
    const uploadFile = async (file, resourceType) => {
      const uploaded = await cloudinary.uploader.upload(
        file.path, { resource_type: resourceType});

      await fs.promises.unlink(file.path);
      return {
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    };
    // PROFILE PICTURE
    if (mediaType === "profilePicture") {
      if (vendor.profilePicture?.publicId) {
        await cloudinary.uploader.destroy(
          vendor.profilePicture.publicId
        );
      }
      vendor.profilePicture = await uploadFile(req.file, "image");
    }
    // COVER PHOTO
    else if (mediaType === "coverPhoto") {
      if (vendor.coverPhoto?.publicId) {
        await cloudinary.uploader.destroy(
          vendor.coverPhoto.publicId
        );
      }
      vendor.coverPhoto = await uploadFile(req.file, "image");
    }
    // COVER VIDEO
    else if (mediaType === "coverVideo") {
      if (vendor.coverVideo?.publicId) {
        await cloudinary.uploader.destroy(
          vendor.coverVideo.publicId,
          {
            resource_type: "video"
          }
        );
      }
      vendor.coverVideo = await uploadFile(req.file, "video");
    }
    // PHOTO CATALOGUE
    else if (mediaType === "photoCatalogue") {
      const index = vendor.photoCatalogue.findIndex(item => item.publicId === publicId);

      if (index === -1) {
        return res.status(404).json({
          message: "Photo not found"
        });
      }

      await cloudinary.uploader.destroy(publicId);
      const uploaded = await uploadFile(req.file, "image");
      vendor.photoCatalogue[index] = uploaded;
    }
    // VIDEO CATALOGUE
    else if (mediaType === "videoCatalogue") {
      const index = vendor.videoCatalogue.findIndex(item => item.publicId === publicId);
      if (index === -1) {
        return res.status(404).json({
          message: "Video not found"
        });
      }

      await cloudinary.uploader.destroy(
        publicId,
        { 
          resource_type: "video"
        }
      );
      const uploaded = await uploadFile( req.file, "video");
      vendor.videoCatalogue[index] = uploaded;
    }
 
    else {
      return res.status(400).json({
        message: "Invalid media type"
      });
    }

    await vendor.save();
    return res.status(200).json({
      message: "Media replaced successfully",
      data: vendor
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.verifyVendorEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() })
    console.log(vendor)
    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      })
    }; 

    if (vendor.otp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP Provided'
      })
    };

    vendor.isVerified = true;
    await vendor.save();
    return res.status(200).json({
    message: "Email verified successfully"
});
  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  }
};

exports.vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() })

    if (!vendor) {
      return res.status(404).json({
        message: 'Invalid Credentials'
      })
    };

    if (vendor.isLocked) {
      return res.status(423).json({
        message: 'Account locked. Please reset your password or contact support'
      })
    };

    const correctPassword = await bcrypt.compare(password, vendor.password);

    if (!correctPassword) {
      vendor.loginAttempts += 1;

      if (vendor.loginAttempts >= 5) {
        vendor.isLocked = true;
        console.log(vendor.loginAttempts);
        await vendor.save();
        return res.status(423).json({
          message: 'Account locked after 5 failed login attempts'
        })
      };

      await vendor.save();
      return res.status(400).json({
        message: 'Invalid Credentials'
      })
    };

    
    if (vendor.isVerified == false) {
      return res.status(400).json({
        message: 'Please verify your email',
        isVerified: vendor.isVerified
      })
    };

    vendor.loginAttempts = 0;
    await vendor.save();

    const token = jwt.sign({ id: vendor._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login sucessful',
      token,
      vendor: {
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        stageName: vendor.stageName,
        email: vendor.email.toLowerCase(),
        phoneNumber: vendor.phoneNumber,
        id: vendor._id,
        slug: vendor.slug,
        onboardingStep: vendor.onboardingStep,
        isOnboarded: vendor.isOnboarded 
      }
    })
  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  } 
}; 

exports.vendorLogout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

exports.vendorForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    vendor.otp = OTP;
    vendor.otpExpires = Date.now() + 5 * 60 * 1000;
    vendor.otpVerified = false;
    const data = {
      name: vendor.firstName,
      email: vendor.email,
      otp: OTP
    };

    await brevo(vendor.email, vendor.firstName, resetPasswordTemplate(data));
    await vendor.save();

    return res.status(200).json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}; 

exports.vendorVerifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    if (!vendor.otp || !vendor.otpExpires || Date.now() > vendor.otpExpires || String(otp) !== String(vendor.otp)) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    vendor.otpVerified = true;
    await vendor.save();

    return res.status(200).json({
      message: "OTP verified successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.vendorResendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    vendor.otp = OTP;
    vendor.otpExpires = Date.now() + 5 * 60 * 1000;
    vendor.otpVerified = false;

    await vendor.save();
    const data = {
      name: vendor.firstName,
      email: vendor.email,
      otp: OTP
    };

    await brevo(vendor.email, vendor.firstName, resetPasswordTemplate(data));
    return res.status(200).json({
      message: "OTP resent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.vendorResetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const vendor = await vendorModel.findOne({ email: email.toLowerCase() });

    if (!vendor) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    if (!vendor.otpVerified) {
      return res.status(400).json({
        message: "Please verify OTP before resetting password"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    vendor.password = hashPassword;
    vendor.loginAttempts = 0;
    vendor.isLocked = false;

    vendor.otp = undefined;
    vendor.otpExpires = undefined;
    vendor.otpVerified = false;

    await vendor.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: 'i'
      };
    }

    const vendors = await vendorModel.find(filter).select('-password').populate({
        path: 'pricingId',
        select: 'packagePrice packageName'
      });

    const formattedVendors = vendors.map(vendor => {
      const basicPackage = vendor.pricingId.find(
        item => item.packageName === 'Basic Package'
      );

      return {
        ...vendor.toObject(),
        basicPrice: basicPackage?.packagePrice || null
      };
    });

    return res.status(200).json({
      message: "Successfully retrieved vendors",
      count: formattedVendors.length,
      data: formattedVendors
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneVendor = async (req, res) => {
  try {
    const { slug } = req.params;
    const vendor = await vendorModel.findOne({ slug }).populate("pricingId").lean();

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    // console.log("Vendor from DB:", vendor);
    return res.status(200).json({
      data: vendor
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const vendor = await vendorModel.findById(vendorId).select("-password");

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    const vendorUrl = `https://feastsync.com/vendor/${vendor.slug}`;

    if (!vendor.vendorUrl) {
      vendor.vendorUrl = vendorUrl;
      await vendor.save();
    }

    return res.status(200).json({
      vendorUrl,
      data: vendor
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};