const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings',
        required: true
    },

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },

    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment',
        required: true
    },

    totalAmount: Number,

    commissionAmount: Number,

    firstReleaseAmount: Number,

    finalReleaseAmount: Number,

    firstReleaseStatus: {
        type: String,
        enum: ['pending','released'],
        default: 'pending'
    },

    finalReleaseStatus: {
        type: String,
        enum: ['pending','released'],
        default: 'pending'
    }

}, { timestamps: true });

const escrowModel = mongoose.model('escrow',escrowSchema);
module.exports = escrowModel;