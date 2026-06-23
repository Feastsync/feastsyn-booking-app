const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors'
    },
     walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "wallet",
        required: true
  },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    },

    amount: {
        type: Number,
        required: true
    },

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
        type: String,
        trim: true
    }

}, { timestamps: true });

const transactionModel = mongoose.model('transaction', transactionSchema);
module.exports = transactionModel