const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },
  phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
  otp: {
    type: String, 
  },
  role: { 
    type: String,
    enum: ['admin', 'superAdmin'],
    default: 'admin'
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

const adminModel = mongoose.model('admin', adminSchema);
module.exports = adminModel