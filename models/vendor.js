const mongoose = require('mongoose');
const vendorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        trim: true
    },
    lastName: {
        type: String,
        require: true,
        trim: true
    },
    bookingFee: {
        type: Number,
        required: true,
        default: 0
    },
    stageName: {
        type: String,
        trim: true,
        require: true
    },
    slug: {
        type: String, 
        trim: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    role : {
        type: String,
        enum: ['vendor', 'admin'],
        default: "vendor"
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    stateOfResidence: {
        type: String,
        enum: ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe','Zamfara','Abuja'],
        require: true,
        trim: true
    },
    password: {
        type: String
    },
     bio: {
        type: String,
        maxlength: 500
    },
    servicesOffered: {
        type: String,
        maxlength: 500
    },
    category: {
        type: String,
        enum: [ 'MC', 'Live Band Artist', 'Photographer', 'Videographer', 'DJ'
        ],
        immutable: true
},
 otp: {
        type: String,
        trim: true 
},
  otpExpires: {
   type: Number,
    default: () => {
    return Date.now() + ( 10 * 60 * 1000)   
    }
},
otpVerified: {
  type: Boolean,
  default: false
},
photoCatalogue: [
  {
    secureUrl: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    }
  }
],

videoCatalogue: [
  {
    secureUrl: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    }
  }
],

coverPhoto: {
  secureUrl: {
    type: String,
    trim: true
  },
  publicId: {
    type: String,
    trim: true
  }
},

coverVideo: {
  secureUrl: {
    type: String,
    trim: true
  },
  publicId: {
    type: String,
    trim: true
  }
},

profilePicture: {
  secureUrl: {
    type: String,
    trim: true
  },
  publicId: {
    type: String,
    trim: true
  }
},
 isVerified: {
    type: Boolean,
    default: false
 },
  isOnboarded: {
    type: Boolean,
    default: false
},
  loginAttempts: {
    type: Number,
    default: 0
},
  isLocked: {
    type: Boolean,
    default: false
},
  accountNumber: {
    type: String, 
    trim: true
},
   vendorUrl: {
    type: String,
    trim: true
}, 
   bankName: {
    type: String,
    trim: true
},
   averageRating: { 
    type: Number,
    default: 0
},
   totalReviews: {
    type: Number,
    default: 0
},
  reviews: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review'
    }
],  
   totalBookings: {
    type: Number,
    default: 0       
},
   responseRate: {
    type: Number,
    default: 100
   }, 
   bufferTime: {
    type: Number,
    default: 60 
}
},    
{timestamps:true},
);
const vendorModel = mongoose.model('vendors', vendorSchema);

module.exports = vendorModel
