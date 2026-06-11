const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendor',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'booking',
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
  }

}, { timestamps: true });

const reviewModel = mongoose.model('review', reviewSchema);
module.exports = reviewModel