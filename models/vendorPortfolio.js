const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },

    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },

    mediaUrl: {
        type: String,
        required: true
    },

    publicId: {
        type: String
    },

    caption: {
        type: String
    },

    category: {
        type: String
    }

}, { timestamps: true });

const vendorPortfolioModel = mongoose.model('vendorPortfolio', portfolioSchema);
module.exports = vendorPortfolioModel;