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

exports.createVendor = async (req, res) => {
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
        console.log('OTP:', otp);
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
              _id: vendor._id,
              otp: vendor.otp
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await vendorModel.findById(id);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    let slug = vendor.slug;

    if (!vendor.slug) {
      const uniqueCode = crypto.randomBytes(6).toString('hex');

      slug = `${slugify(
        vendor.stageName || req.body.stageName,
        {
          lower: true,
          strict: true
        }
      )}-${uniqueCode}`;

      vendor.slug = slug;
      await vendor.save();
    }

    const publicUrl = `https://feastsync.com/vendor/${vendor.slug}`;

    const {
      bankName,
      accountNumber,
      bio,
      servicesOffered,
      stateOfResidence,
      category
    } = req.body;

    let categoryToUpdate;

    if (category) {
      if (vendor.category && vendor.category !== category) {
        return res.status(400).json({
          message: 'Category cannot be changed after it has been selected'
        });
      }

      if (!vendor.category) {
        categoryToUpdate = category;
      }
    }

    // Upload helper
    const uploadFile = async (file, resourceType = 'image') => {
      const absolutePath = path.resolve(file.path);

      console.log('Uploading:', absolutePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
      }

      const uploaded = await cloudinary.uploader.upload(
        absolutePath,
        {
          resource_type: resourceType
        }
      );

      // Delete local file after upload
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
      profilePicture = await uploadFile(
        req.files.profilePicture[0],
        'image'
      );
    }

    if (req.files?.coverPhoto) {
      coverPhoto = await uploadFile(
        req.files.coverPhoto[0],
        'image'
      );
    }

    if (req.files?.coverVideo) {
      coverVideo = await uploadFile(
        req.files.coverVideo[0],
        'video'
      );
    }

    if (req.files?.photoCatalogue) {
      photoCatalogue = await Promise.all(
        req.files.photoCatalogue.map(file =>
          uploadFile(file, 'image')
        )
      );
    }

    if (req.files?.videoCatalogue) {
      videoCatalogue = await Promise.all(
        req.files.videoCatalogue.map(file =>
          uploadFile(file, 'video')
        )
      );
    }

    const updatedVendor = await vendorModel.findByIdAndUpdate(
  id,
  {
    bankName,
    accountNumber,
    bio,
    servicesOffered,
    stateOfResidence,
    vendorUrl: publicUrl,
    ...(categoryToUpdate && { category: categoryToUpdate }),
    ...(slug && { slug }),
    ...(profilePicture && { profilePicture }),
    ...(coverPhoto && { coverPhoto }),
    ...(coverVideo && { coverVideo }),
    ...(photoCatalogue.length && { photoCatalogue }),
    ...(videoCatalogue.length && { videoCatalogue })
  },
  { new: true }
);

    return res.status(200).json({
      message: 'Vendor information updated successfully',
      vendorUrl: publicUrl,
      data: updatedVendor
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
    res.status(200).json({
      message: 'OTP Verified successfully',
      data: {
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        stageName: vendor.stageName,
        email: vendor.email.toLowerCase(),
        phoneNumber: vendor.phoneNumber,
        _id: vendor._id,
        otp
      }
    })
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
        message: 'Please verify your email'
      })
    };

    vendor.loginAttempts = 0;
    await vendor.save();

    const token = jwt.sign(
      { id: vendor._id },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login sucessful',
      token,
      vendor: {
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        stageName: vendor.stageName,
        email: vendor.email.toLowerCase(),
        phoneNumber: vendor.phoneNumber,
        _id: vendor._id
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const vendor = await vendorModel.findOne({ email: email.toLowerCase() });

    if (!vendor) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    const OTP = Math.round(Math.random() * 1e4).toString().padStart(4, "0");

    vendor.otp = OTP;
    vendor.otpExpires = Date.now() + 5 * 60 * 1000;
    vendor.otpVerified = false;

    const data = {
      name: vendor.firstName,
      email: vendor.email,
      otp: vendor.otp
    };

    await brevo(email, vendor.firstName, resetPasswordTemplate(data));
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

exports.resendOtp = async (req, res) => {
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

    await vendor.save();

    const data = {
      name: vendor.firstName,
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

exports.resetPassword = async (req, res) => {
  try {
    // Extract the required fields from the request body
    const { otp, password, email } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP and password are required"
      });
    }

    // Find the vendor
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() });

    // Check if vendor exists
    if (!vendor) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    // Check if OTP exists, has not expired, and matches the vendor's OTP
    if (!vendor.otp || !vendor.otpExpires || Date.now() > vendor.otpExpires || String(otp) !== String(vendor.otp)) {
      return res.status(400).json({
        message: "Invalid OTP, please request for a new one"
      });
    }

    // Reset the vendor's password with the encrypted and updated password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    vendor.password = hashPassword;
    vendor.loginAttempts = 0;
    vendor.isLocked = false;

    // Clear OTP after successful password reset
    vendor.otp = undefined;
    vendor.otpExpires = undefined;
    vendor.otpVerified = false;

    await vendor.save();

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

exports.getAllVendors = async (req, res) => {
  try {

    // const checkCache = await client.get('vendors');

    // if (checkCache) {
    //   return res.status(200).json({
    //     message: 'successfully retrieved all vendors',
    //     data: JSON.parse(checkCache)
    //   });
    // }

    const vendor = await vendorModel.find();
// await client.set(
//   'vendors',
//   JSON.stringify(vendor),
//   'EX',
//   60
// );

    return res.status(200).json({
      message: 'successfully retrieved all vendors',
      data: vendor  
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneVendor = async (req, res) => {
  try {
    const { slug } = req.params;

    const vendor = await vendorModel.findOne({ slug });

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