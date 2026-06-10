const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users',
        required: true
    },
    vendorId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'vendors',
        required: true
    },
    bookingId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'bookings'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    reference: {
        type: String,
        required: true
    },
    vendorName: {
        type: String,
        required: true, 
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank transfer', 'bank', 'korapay'],
        default: 'korapay'
    },
    paymentStatus: {  
        type: String,
        enum: ['processing', 'successful', 'failed'],
        default: 'processing'
}
}, {timestamps:true});

const paymentModel = mongoose.model('payments', paymentSchema);
module.exports = paymentModel;
