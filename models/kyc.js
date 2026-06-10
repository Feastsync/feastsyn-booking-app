const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },
    documentType: {
        type: String,
        enum: [ 'votersCard', 'driverLicense', 'nationalId']
    },
    documentImage: {
        secureUrl: {
            type: String,
            required: true
        },
        documentImageId: {
            type: String,
            required: true
        }
    },
    isKycVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['processing', 'verified', 'rejected'],
        default: 'processing'
    },
    rejectionReason: {
        type: String
    },

}, {timestamps: true});

const kycModel = mongoose.model('kyc', kycSchema);
module.exports = kycModel;