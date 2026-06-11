const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'booking',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendor',
    required: true
  },

  raisedBy: {
    type: String,
    enum: ['user', 'vendor'],
    required: true
  },

  reason: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ['open','in-review','resolved','rejected'],
    default: 'open'
  },

  adminComment: String

}, { timestamps: true });

const disputeModel = mongoose.model('dispute', disputeSchema);
module.exports = disputeModel