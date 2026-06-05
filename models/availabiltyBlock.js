const mongoose = require('mongoose');

const availabilityBlockSchema = new mongoose.Schema({

  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'vendors', 
    required: true
   },
   
   blockedDate: { 
    type: Date, 
    required: true 
},
  reason: { 
    type: String
 },
}, { timestamps: true });

const AvailabilityBlock = mongoose.model('AvailabilityBlock', availabilityBlockSchema);

module.exports = AvailabilityBlock;