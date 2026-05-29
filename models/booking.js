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
        type: String
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
        type: Number,
        required: true
    },

    bookingStatus: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'completed',
            'cancelled',
            'disputed'
        ],
        default: 'pending'
    },

    paymentStatus: {
        type: String,
        enum: [
            'unpaid',
            'escrowed',
            'paid',
            'refunded'
        ],
        default: 'unpaid'
    },
    contractAccepted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const bookingModel = mongoose.model('bookings', bookingSchema);
module.exports = bookingModel;