const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({ 
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings',
    },
    minimumPrice: {
        type: Number,
        required: true
    },
    bookingFee: {
        type: Number,
        required: true
    }, 
    packageName: {
        type: String,
        required: true,
        enum: ['basic', 'standard', 'premium', 'addMorePackages']
    },
    packageDescription: {
        type: String,
        required: true
    },
}, {timestamps: true});

const pricingModel = mongoose.model('pricing', pricingSchema);  
module.exports = pricingModel;