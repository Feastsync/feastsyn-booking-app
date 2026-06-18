const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendors'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  notificationType: {
    type: String,
    enum: [ "booking_request", "booking_accepted", "booking_declined", "payment_received"]
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bookings'
  },
  recipientType: {
    type: String,
    enum: ['user', 'vendor', 'admin'],

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