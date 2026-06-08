const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },
    bookingTitle: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: ['wedding', 'birthday party', 'corporate event', 'product launch', 'cultural festival', 'anniversary', 'graduation', 'burial']
    },
    duration: {
        type: String,
        enum: ['2 hours', '4 hours', '6 hours', '8 hours', 'full day'],
        required: true
    },
    guestCount: {
        type: String,
        enum: ['50-100', '100-200', '200-300', '300-400', '400-500', '600+'],
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventLocation: {
        type: String,
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: String,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'completed',
            'cancelled',
            'disputed',
            'accept',
            'decline'
        ],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: [
            'unpaid',
            'paid',
            'refunded'
        ],
        default: 'unpaid'
    },
    startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
 }
}, { timestamps: true });

const bookingModel = mongoose.model('bookings', bookingSchema);
module.exports = bookingModel;