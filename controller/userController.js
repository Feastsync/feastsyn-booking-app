require('dotenv').config()
const userModel = require('../models/user')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const {brevo} = require('../utils/brevo')
const {emailTemplate, resetPasswordTemplate} = require('../email')
const jwt = require('jsonwebtoken')
const bookingModel = require('../models/booking');
const reviewModel = require('../models/review');
const paymentModel = require('../models/payment')

  exports.createUser = async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNumber } = req.body;

      const otp = otpGenerator.generate(4, {upperCaseAlphabets: false,lowerCaseAlphabets: false,specialChars: false,});
      console.log("OTP:", otp);

      if (!password) {
        return res.status(400).json({
          message: "Please enter password",
        });
      }
    

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const user = await userModel.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashPassword,
        confirmPassword: hashPassword,
        phoneNumber,
        otp
      });


      await brevo(user.email,`${user.firstName} ${user.lastName}`,
        emailTemplate(`${user.firstName} ${user.lastName}`, user.otp ));

      const users = await userModel.find()
      return res.status(201).json({
        message: "User created successfully",
        data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email.toLowerCase(),
                phoneNumber: user.phoneNumber,
                _id: user._id,
                otp: user.otp
        },
      });
    } catch (error) {
     return res.status(500).json({
    message: error.message
  });
    }
  };

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() })
    console.log(user)
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }; 


    if (user.otp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP Provided'
      })
    };

   if (user.isVerified) {
  return res.status(400).json({
    message: 'User already verified'
  });
}

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: 'OTP Verified successfully',
      data: user
    })
  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({
        message: 'Invalid Credentials' 
      })
    };

    if (user.isLocked) {
      return res.status(423).json({
        message: 'Account locked. Please reset your password or contact support'
      })
    };

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      user.loginAttempts += 1;

      console.log("LOGIN ATTEMPT:", {
  email: user.email,
  isVerified: user.isVerified,
  otpVerified: user.otpVerified
});
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        console.log(user.loginAttempts);
        await user.save();
        return res.status(423).json({
          message: 'Account locked after 5 failed login attempts'
        })
      };

      await user.save();
      return res.status(400).json({
        message: 'Invalid Credentials'
      })
    };

    
    if (user.isVerified == false) {
      return res.status(400).json({
        message: 'Please verify your email',
        isVerified: user.isVerified,
      })
    };

    user.loginAttempts = 0;
    await user.save();

    const token = jwt.sign({ id: user._id}, process.env.SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login sucessful',
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email.toLowerCase(),
        phoneNumber: user.phoneNumber,
        _id: user._id
      }
    })
  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  }
}

exports.userLogout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = OTP;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;

    const data = {
      name: user.firstName,
      email: user.email,
      otp: OTP
    };

    await brevo(email, user.firstName, resetPasswordTemplate(data));
    await user.save();

    return res.status(200).json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    if ( !user.otp || !user.otpExpires || Date.now() > user.otpExpires || String(otp) !== String(user.otp)) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    user.otpVerified = true;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully"
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
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = OTP;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;

    await user.save();

    const data = {
      name: user.firstName,
      email: user.email,
      otp: OTP
    };

    await brevo(user.email, user.firstName, resetPasswordTemplate(data));

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
    const {email, password  } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    if (!user.otpVerified) {
      return res.status(400).json({
        message: "Please verify OTP before resetting password"
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    user.loginAttempts = 0;
    user.isLocked = false;

    user.otp = null;
    user.otpExpires = null;
    user.otpVerified = false;
    console.log("BEFORE RESET SAVE:", {
  email: user.email,
  isVerified: user.isVerified
});

    await user.save();

    const updatedUser =
  await userModel.findById(user._id);

console.log("AFTER RESET SAVE:", {
  email: updatedUser.email,
  isVerified: updatedUser.isVerified
});
    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.userDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("firstName lastName email profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [
      completedBookings,
      totalReviews,
      totalSpentResult,
      uniqueEvents,
      upcomingEvents,
      recentBookings,
    ] = await Promise.all([

      // Completed bookings
      bookingModel.countDocuments({
        userId,
        bookingStatus: "completed",
      }),

      // Reviews given by user
      reviewModel.countDocuments({
        userId,
      }),

      // Total amount spent
      paymentModel.aggregate([
        {
          $match: {
            userId: user._id,
            paymentStatus: "success",
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: {
              $sum: "$amount",
            },
          },
        },
      ]),

      // Unique events hosted
      bookingModel.aggregate([
        {
          $match: {
            userId: user._id,
          },
        },
        {
          $group: {
            _id: {
              eventType: "$eventType",
              eventDate: "$eventDate",
              eventLocation: "$eventLocation",
            },
          },
        },
        {
          $count: "totalEventsHosted",
        },
      ]),

      // Upcoming events
      bookingModel
        .find({
          userId,
          bookingStatus: {
            $in: ["accepted", "confirmed"],
          },
          eventDate: {
            $gte: new Date(),
          },
        })
        .populate(
          "vendorId",
          "stageName profilePicture"
        )
        .sort({ eventDate: 1 })
        .limit(5),

      // Recent bookings
      bookingModel
        .find({ userId })
        .populate("vendorId", "stageName profilePicture")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalSpent =
      totalSpentResult.length > 0
        ? totalSpentResult[0].totalSpent
        : 0;

    const totalEventsHosted =
      uniqueEvents.length > 0
        ? uniqueEvents[0].totalEventsHosted
        : 0;

    return res.status(200).json({
      message: "Dashboard fetched successfully",
      data: {
        user,

        statistics: {
          totalEventsHosted,
          completedBookings,
          totalSpent,
          reviewsGiven: totalReviews,
        },

        upcomingEvents,

        recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// exports.deleteUser = async(req, res) =>{
//   try {
//       const { id } = req.params;
//       const users = await userModel.findByIdAndDelete(id);
//       if (!users) {
//         return res.status(404).json({
//           message: 'User not found'
//         })
//       } 
//       //Send a success response
//       res.status(200).json({ 
//         message: 'User deleted successfully',
//         data: users
//       })

//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     })
//   }
// };

