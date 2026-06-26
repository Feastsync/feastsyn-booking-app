const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendors',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bookings',
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  comment: {
    type: String
  },
images: [
    {
      secureUrl: String,
      publicId: String
    }
  ],

  video: {
    secureUrl: String,
    publicId: String
  },

  isApproved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const reviewModel = mongoose.model('review', reviewSchema);
module.exports = reviewModel