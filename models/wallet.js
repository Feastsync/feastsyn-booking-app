const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        unique: true,
        required: true
    },
    availableBalance: {
        type: Number,
        default: 0
    },
    escrowBalance: {
        type: Number,
        default: 0
    },
    withdrawnAmount: {
        type: Number,
        default: 0
},

    totalTransactions: {
        type: Number,
        default: 0
},
    totalEarned: {
        type: Number,
        default: 0
    },
    lastWithdrawnDate: Date
    
}, { timestamps: true });

const walletModel = mongoose.model('wallet', walletSchema);
module.exports = walletModel;