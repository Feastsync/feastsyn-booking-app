const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },

    bookingDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['available', 'pending', 'booked'],
        default: 'available'
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    }

}, { timestamps: true });

const availabiltyModel = mongoose.model('availability', availabilitySchema);
module.exports = availabiltyModel;  