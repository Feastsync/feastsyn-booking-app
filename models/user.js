const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        trim: true
    },
    lastName: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
        default: "user"
    },
    password: {
        type: String
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    otp: {
        type: String,
        trim: true
    },
     otpExpires: {
        type: Date,
        default: null
},
otpVerified: {
  type: Boolean,
  default: false
},
    profilePicture: {
        secureUrl:{
            type: String,
            trim: true 
        },
        profileId: {
            type: String,
            trim: true
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    },
{timestamps:true},
);
const userModel = mongoose.model('users', userSchema);

module.exports = userModel