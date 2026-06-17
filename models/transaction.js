const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors'
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
    },

    amount: Number,

    transactionType: {
        type: String,
        enum: ['commission','release','withdrawal','escrow']
    },

    status: {
        type: String,
        default: 'successful'
    }

}, { timestamps: true });

const transactionModel = mongoose.model('transaction', transactionSchema);
module.exports = transactionModel