const joi = require('joi');

exports.signupVendorValidator = (req, res, next) => {

    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[a-zA-Z]+(-[a-zA-Z]+)*$/).required().messages({
            'any.required': 'First name is required', 
            'string.empty': 'First name cannot be empty',
            'string.pattern.base': 'First name cannot contain numbers or special characters'
        }),
        lastName: joi.string().trim().pattern(/^[a-zA-Z]+(-[a-zA-Z]+)*$/).required().messages({
            'any.required': 'Last name is required', 
            'string.empty': 'Last name cannot be empty',
            'string.pattern.base': 'Last name cannot contain numbers or special characters'
        }),

       stageName: joi.string().trim().pattern(/^[a-zA-Z0-9\s!@#$%^&*()_+=\-[\]{}|;:',.<>/?`~]+$/).required().messages({
            'any.required': 'Stage name is required', 
            'string.empty': 'Stage name cannot be empty'
        }),
         email: joi.string().email().required().messages({ 
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        }),
        phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
          'any.required': 'Phone number is required',
          'string.empty': 'Phone number cannot be empty',
          'string.pattern.base': 'Phone number must only contain numbers and must be 11 digits'  
        }),
        password: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
          'any.required': 'Password is required',
          'string.empty': 'Password cannot be empty',
          'string.pattern.base': 'Password must be at least 8 characters and must include 1 uppercase and 1 lowercase' 
        }),
        confirmPassword: joi.string().required().valid(joi.ref('password')).messages({
          'any.only': 'confirm password must match password',
          'any.required': 'confirm password is required'
        })
    });
    const {error} = schema.validate(req.body);
    if (error) {
        return res.status(500).json({
            message: error.details[0].message
        })
    }
    next()
};

exports.signupUserValidator = (req, res, next) => {

    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[a-zA-Z]+(-[a-zA-Z]+)*$/).required().messages({
            'any.required': 'First name is required', 
            'string.empty': 'First name cannot be empty',
            'string.pattern.base': 'First name cannot contain numbers or special characters'
        }),
        lastName: joi.string().trim().pattern(/^[a-zA-Z]+(-[a-zA-Z]+)*$/).required().messages({
            'any.required': 'Last name is required', 
            'string.empty': 'Last name cannot be empty',
            'string.pattern.base': 'Last name cannot contain numbers or special characters'
        }),
         email: joi.string().email().required().messages({ 
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        }),
        phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
          'any.required': 'Phone number is required',
          'string.empty': 'Phone number cannot be empty',
          'string.pattern.base': 'Phone number must only contain numbers and must be 11 digits'  
        }),
        password: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
          'any.required': 'Password is required',
          'string.empty': 'Password cannot be empty',
          'string.pattern.base': 'Password must be at least 8 characters and must include 1 uppercase and 1 lowercase' 
        }),
        confirmPassword: joi.string().required().valid(joi.ref('password')).messages({
          'any.only': 'confirm password must match password',
          'any.required': 'confirm password is required'
        })
    });
    const {error} = schema.validate(req.body);
    // console.log(error.details[0])
    if (error) {
        return res.status(500).json({
            message: error.details[0].message
        })
    }
    next()
};

exports.resetPasswordValidator = (req, res, next)=>{
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        }),
        password: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
          'any.required': 'Password is required',
          'string.empty': 'Password cannot be empty',
          'string.pattern.base': 'Password must be at least 8 characters and must include 1 uppercase and 1 lowercase' 
        }),
        confirmPassword: joi.string().required().valid(joi.ref('password')).messages({
          'any.only': 'confirm password must match password',
          'any.required': 'confirm password is required'
        })
    })

    const { error } = schema.validate(req.body);
    // console.log(error.details[0])
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}

exports.verifyOtpValidator = (req, res, next) => {
    const schema = joi.object({
        otp: joi.string().pattern(/^\d{4}$/).required().messages({
          'any.required': 'OTP is required',
          'string.empty': 'OTP cannot be empty',
          'string.pattern.base': 'OTP must only contain numbers and must be 4 digits'  
        }),
    })
}

exports.changePasswordValidator = (req, res, next)=>{
    const schema = joi.object({
        oldPassword: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
          'any.required': 'old password is required',
          'string.empty': 'old password cannot be empty',
          'string.pattern.base': 'old password must be at least 8 characters and must include 1 uppercase and 1 lowercase'
        }),
        newPassword: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
          'any.required': 'new password is required',
          'string.empty': 'new password cannot be empty',
          'string.pattern.base': 'new password must be at least 8 characters and must include 1 uppercase and 1 lowercase' 
        }),
        confirmPassword: joi.string().required().valid(joi.ref('newPassword')).messages({
          'any.only': 'confirm password must match New password',
          'any.required': 'confirm password is required'
        })
    })

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}
