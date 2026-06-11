require('dotenv').config()
const userModel = require('../models/user')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const {brevo} = require('../utils/brevo')
const {emailTemplate, resetPasswordTemplate} = require('../email')
const jwt = require('jsonwebtoken')

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    if (!password) {
      return res.status(400).json({
        message: "Please enter password",
      });
    }
  const otp = otpGenerator.generate(4, {upperCaseAlphabets: false,lowerCaseAlphabets: false,specialChars: false,});
    console.log("OTP:", otp);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
      phoneNumber,
      otp, 
    });

    await brevo(user.email,`${user.firstName} ${user.lastName}`,emailTemplate(`${user.firstName} ${user.lastName}`, otp ));
    return res.status(201).json({
      message: "User created successfully",
      data: {
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
        message: 'Please verify your email'
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

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    const OTP = Math.round(Math.random() * 1e4).toString().padStart(4, "0");

    user.otp = OTP;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;

    const data = {
      name: user.firstName,
      email: user.email
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

    await user.save();

    const data = {
      name: user.firstName,
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
    // Extract the required fields from the request body
    const { otp, password, email } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP and password are required"
      });
    }

    // Find the user
    const user = await userModel.findOne({ email: email.toLowerCase() });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    // Check if OTP exists, has not expired, and matches the user's OTP
    if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires || String(otp) !== String(user.otp)) {
      return res.status(400).json({
        message: "Invalid OTP, please request for a new one"
      });
    }

    // Reset the user's password with the encrypted and updated password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    user.loginAttempts = 0;
    user.isLocked = false;

    // Clear OTP after successful password reset
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpVerified = false;

    await user.save();

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

exports.changePassword = async(req, res)=>{
  try {
    //Extract the user ID from the request user object
    const { id } = req.user;
    //Extract the required field from the request body object
    const { oldPassword, newPassword } = req.body;
    //Find the user
    const user = await userModel.findById(id);
    //check if user exists
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    //Confirm the old password
    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if(!checkPassword) {
      return res.status(400).json({
        message: 'Old password is invalid'
      })
    }
    //Encrypt and change to the new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    user.loginAttempts = 0;
    user.isLocked = false;

    //Save changes in the database
    await user.save();

    //send a success response
    res.status(200).json({
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};

exports.getOneUser = async (req, res) => {
  try {
    const getUser = await userModel.findById(req.user.id).select('firstName lastName email');
    if (!getUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    res.status(200).json({
      message: 'One user fetched successfully',
      data: getUser
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Something went wrong'
    });
  }
};


exports.deleteUser = async(req, res) =>{
  try {
      const { id } = req.params;
      const users = await userModel.findByIdAndDelete(id);
      if (!users) {
        return res.status(404).json({
          message: 'User not found'
        })
      } 
      //Send a success response
      res.status(200).json({ 
        message: 'User deleted successfully',
        data: users
      })

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};

