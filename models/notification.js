const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const notificationModel = mongoose.model('notification',notificationSchema);
module.exports = notificationModel