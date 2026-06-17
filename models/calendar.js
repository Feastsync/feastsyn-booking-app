const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({

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
        enum: ['available', 'booked'],
        default: 'available'
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    }

}, { timestamps: true });

const calendarModel = mongoose.model('calendar', calendarSchema);
module.exports = calendarModel;  