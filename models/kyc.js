const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },
    documentType: {
        type: String,
        enum: [ 'votersCard', 'driverLicense', 'nationalId'],
        required: true
    },
    documentNumber: {
        type: String,
        required: true
    },
    documentImage: {
        secureUrl: {
            type: String,
            required: true
        },
        documentId: {
            type: String,
            required: true
        }
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },

}, {timestamps: true});

const kycModel = mongoose.model('kyc', kycSchema);
module.exports = kycModel;