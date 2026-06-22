const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },
    pricingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pricing'
    },
    packageName: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'addMorePackages']
    },
    eventType: {
        type: String,
        enum: ['wedding', 'birthday party', 'corporate event', 'product launch', 'cultural festival', 'anniversary', 'graduation', 'burial']
    },
    duration: {
        type: String,
        enum: ['2 hours', '4 hours', '6 hours', '8 hours', 'full day'],
        required: true
    },
    guestCount: {
        type: String,
        enum: ['50-100', '100-200', '200-300', '300-400', '400-500', '600+'],
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    additionalDetails: {
        type: String,
        trim: true
    },
    eventLocation: {
        type: String,
        required: true
    },
    bookingReference: {
        type: String,
        unique: true
    },
    bookingStatus: { 
        type: String,
        enum: ['pending', 'accepted','confirmed','completed','rejected','disputed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid','paid','refunded'],
        default: 'unpaid'
    },
}, { timestamps: true });

bookingSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.eventDate) {
      ret.eventDate = ret.eventDate.toISOString().split('T')[0];
    }
    return ret;
  }
});

const bookingModel = mongoose.model('bookings', bookingSchema);
module.exports = bookingModel;