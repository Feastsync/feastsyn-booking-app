const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors'
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    },

    amount: Number,

    transactionType: {
        type: String,
        enum: ['commission','release','withdrawal','escrow', 'refund']
    },

    status: {
        type: String,
        enum: [ 'pending', 'successful', 'failed'],
        default: 'successful'
    },
    description: {
        type: String
    }

}, { timestamps: true });

const transactionModel = mongoose.model('transaction', transactionSchema);
module.exports = transactionModel