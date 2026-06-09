require('dotenv').config();
const vendorModel = require('../models/vendor')
const bcrypt = require('bcrypt')    
const {brevo} = require('../utils/brevo')
const fs = require('fs')
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
              _id: vendor._id
            }
        });

    } catch (error) {
 
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
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
    const uniqueCode = crypto.randomBytes(6).toString("hex");

  slug = `${slugify(vendor.stageName || req.body.stageName,{ lower: true, strict: true,})}-${uniqueCode}`;
    vendor.slug = slug;
  await vendor.save()
} 
  const publicUrl = `https://feastsync.com/vendor/${vendor.slug}`;

    const { bankName, accountNumber, bio, servicesOffered, stateOfResidence } = req.body;
    
    const uploadFile = async (file, resourceType = 'image') => {

      const uploaded = await cloudinary.uploader.upload(
        file.path,{ resource_type: resourceType });
      await fs.promises.unlink(file.path);
      return {
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    };
    
    let profilePicture;
    let coverPhoto;
    let coverVideo;
    let videoCatalogue = [];
    let photoCatalogue = [];

    if (req.files?.profilePicture) {
      profilePicture = await uploadFile(
        req.files.profilePicture[0]
      );
    }

    if (req.files?.coverPhoto) {
  coverPhoto = await uploadFile(
    req.files.coverPhoto[0]
  );
}

if (req.files?.coverVideo) {
  coverVideo = await uploadFile(
    req.files.coverVideo[0]
  );
}
    //For multiple image uploads
    if (req.files?.photoCatalogue) {
      photoCatalogue = await uploadFile(
        req.files.photoCatalogue[0]
      );
    }
    //For multiple video uploads
    if (req.files?.videoCatalogue) {
      videoCatalogue = await Promise.all(
        req.files.videoCatalogue.map(file =>
          uploadFile(file, 'video')
        )
      );
    } 
    const updatedVendor = await vendorModel.findByIdAndUpdate(id, {bankName, accountNumber, bio, servicesOffered, stateOfResidence,
        ...(coverPhoto && { coverPhoto }),
        ...(coverVideo && { coverVideo }),
        ...(slug && { slug }),
        ...(profilePicture && { profilePicture }),
        ...(photoCatalogue.length && { photoCatalogue }),
        ...(videoCatalogue.length && { videoCatalogue }) },
      { new: true });
      //Send a success response
    res.status(200).json({
      message: 'Vendor information updated successfully',
      vendorUrl: publicUrl,
      data: updatedVendor
    });

  } catch (error) {
    res.status(500).json({
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
        _id: vendor._id
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
    console.log(error.message),
      res.status(500).json({
        message: 'Something went wrong'
      })
  }
};

exports.vendorLogout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

exports.forgotPassword = async(req, res)=>{
  try {
    //extract vendor email from the request body
    const {email} = req.body;
    //find the vendor
    const vendor = await vendorModel.findOne({ email: email.toLowerCase()})
    //check if vendor exists
    if (vendor ==null){
      return res.status(404).json({
        message: 'Invalid credentials'
      })
    }

    //Generate OTP
    const OTP = Math.round(Math.random() * 1e4).toString().padStart(4,"0");
    //Update the vendor with the new OTP
    vendor.otp = OTP;
    console.log(OTP)
    
    //set expiry date
    vendor.otpExpires = Date.now() + ( 100 * 50 * 1000);
    //create the data object for the email template
    const data = {
      name: vendor.firstName,
      otp: OTP
    }
    //send the email to the vendor
    brevo(email, vendor.firstName, resetPasswordTemplate(data));
    //save the changes to the database
    await vendor.save();
    //send a success response
    res.status(200).json({
      message: 'Forgot password successful'
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};

exports.resendOTP = async(req, res) => {
   try {
     const {email} = req.body;
    //find the vendor trying to verify
    const vendor = await vendorModel.findOne({ email: email.toLowerCase() })
       if (!vendor) {
        return res.status(404).json({
            message: 'vendor not found'
        })
       }

       const OTP = otpGenerator.generate(4, {upperCaseAlphabets:false, lowerCaseAlphabets:false, specialChars:false});
       console.log(OTP)

       const expiresAt = new Date(Date.now() + 1000 * 60 * 5)


        vendor.otp = OTP;
        vendor.otpExpiresAt = expiresAt;

        //save changes to the database
        await vendor.save()
        await brevo(vendor.email, vendor.firstName, OTP, emailTemplate(vendor.firstName, OTP))

        //send a success response
        res.status(200).json({
            message: 'OTP sent successfully'
        })
   } catch (error) {
    res.status(500).json({
        message: error.message
    })
   }
}

exports.resetPassword = async(req, res)=>{
  try {
    //Extract the required field from the request body
    const { email, password, otp } = req.body;
    
    //Find the vendor
    const vendor = await vendorModel.findOne({email: email.toLowerCase()})

    //Check if vendor exists
    if(vendor== null) {
      return res.status(404).json({
        message: 'Invalid credentials'
      })
    }

    if(Date.now() > vendor.otpExpires || otp !== vendor.otp) {
      return res.status(400).json({
        message: 'Invalid OTP'
      })
    }

    //Reset the vendor's password with the encrypted and updated password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt) 

    vendor.password = hashPassword
    vendor.loginAttempts = 0;
    vendor.isLocked = false;
    //save changes in the database
    await vendor.save();
    res.status(200).json({
      message: 'password reset successfully'
    })

  } catch (error) {
    res.status(404).json({
      message: error.message
    })
  }
};

exports.changePassword = async(req, res)=>{
  try {
    //Extract the vendor ID from the request vendor object
    const { id } = req.user;
    //Extract the required field from the request body object
    const { oldPassword, newPassword } = req.body;
    //Find the vendor
    const vendor = await vendorModel.findById(id);
    //check if vendor exists
    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      })
    }
    //Confirm the old password
    const checkPassword = await bcrypt.compare(oldPassword, vendor.password);
    if(!checkPassword) {
      return res.status(400).json({
        message: 'Old password is invalid'
      })
    }
    //Encrypt and change to the new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    vendor.password = hashPassword;
    vendor.loginAttempts = 0;
    vendor.isLocked = false;

    //Save changes in the database
    await vendor.save();

    //send a success response
    res.status(200).json({
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'something went wrong'
    })
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

    const vendor = await vendorModel.find().select('stageName profilePicture mainPhoto servicesOffered');
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
    res.status(200).json({
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};