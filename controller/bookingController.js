const bookingModel = require('../models/booking');
const vendorModel = require('../models/vendor');
const pricingModel = require('../models/pricing');
const userModel = require('../models/user');
const Availability = require('../models/calendar');
const notificationModel = require('../models/notification');
const escrowModel = require('../models/escrow');
const {createNotification} = require('../utils/createNotification')
const {brevo} = require('../utils/brevo')
const releaseEscrow = require('../utils/releaseEscrow')

exports.createBooking = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: 'Please login first'
      });
    }

    const userId = req.user.id;

    const {vendorId,pricingId,eventType,eventLocation,eventDate,duration,guestCount,additionalDetails} = req.body;

    if (!vendorId || !pricingId || !eventType || !eventLocation || !eventDate || !duration || !guestCount || !additionalDetails ) {
      return res.status(400).json({
        message: 'All required fields must be provided'
      });
    }

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    if (!vendor.isVerified || !vendor.isOnboarded) {
    return res.status(403).json({
        message: "Vendor is not available for bookings."
    });
}

    const user = await userModel.findById(userId);
    if(!user){
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const selectedPackage = await pricingModel.findOne({
      _id: pricingId,
      vendorId
    });

    if (!selectedPackage) {
      return res.status(404).json({
        message: 'Package not found'
      });
    }

    const existingBooking = await bookingModel.findOne({
      vendorId,
      eventDate: new Date(eventDate),
      bookingStatus: {
        $in: ['pending', 'accepted', 'confirmed', 'completed']
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'Vendor is already booked on this date'
      });
    }

    const booking = await bookingModel.create({
      userId, 
      vendorId,
      packageId: pricingId,
      pricingId,
      // Snapshot of package details at the time of booking
      packageName: selectedPackage.packageName,
      amount: selectedPackage.packagePrice,
      eventType,
      eventLocation,
      eventDate: new Date(eventDate),
      duration,
      guestCount,
      additionalDetails,
      bookingStatus: 'pending', 
      paymentStatus: 'unpaid'
    });

    await notificationModel.create({
      recipientId: vendorId,
      recipientType: 'vendor',
      senderId: userId,
      bookingId: booking._id,
      notificationType: 'booking_request',
      title: 'New Booking Request',
      message: `${user.firstName} ${user.lastName} sent you a booking request`
    });


    return res.status(201).json({
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};


exports.getBookingDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;

    let booking = await bookingModel.findById(bookingId).populate("userId").populate("pricingId");
 
    if (booking.vendorId.toString() !== vendorId
) {
  return res.status(403).json({
    message: "Wrong Vendor mismatch"
  });
}
const pricing = booking.pricingId;
if (!pricing) {
  return res.status(404).json({
    message: "Pricing not found"
  });
}
     booking = await bookingModel.findById(bookingId).populate("userId").populate("pricingId").populate("vendorId");
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }



    return res.status(200).json({
      data:booking
      //  { bookingId: booking._id,
      //   pricingId: pricing._id,
      //   eventType: booking.eventType,
      //   duration: booking.duration,
      //   guestCount: booking.guestCount,
      //   eventDate: booking.eventDate,
      //   additionalDetails: booking.additionalDetails,
      //   eventLocation: booking.eventLocation,
      //   bookingStatus: booking.bookingStatus,
      //   paymentStatus: booking.paymentStatus,
      //   packageName: pricing.packageName,
      //   packagePrice: pricing.packagePrice,
      //   packageDetails: pricing.packageDetails
      // }
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// Vendor accepts a booking and auto cancels conflicting ones
exports.acceptBooking = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    console.log("Logged in Vendor:", vendorId);
console.log("Booking Vendor:", booking.vendorId.toString());

    if (booking.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({
        message: 'Vendor mismatch'
      });
    }

    if ( booking.bookingStatus === 'accepted' || booking.bookingStatus === 'confirmed' ) { 
      return res.status(400).json({ 
        message: 'Booking has already been accepted' }); 
      } 
      if (booking.bookingStatus === 'cancelled') {
         return res.status(400).json({ 
          message: 'Cancelled bookings cannot be accepted' });
         }

    booking.bookingStatus = 'accepted';
    await booking.save();

    await notificationModel.create({
      recipientId: booking.userId,
      recipientType: 'user',
      senderId: booking.vendorId,
      bookingId: booking._id,
      notificationType: 'booking_accepted',
      title: 'Booking Accepted',
      message: `Your booking request has been accepted by ${vendor.stageName}. Proceed to payment to confirm your booking.`
    });

    await Availability.findOneAndUpdate(
      {
        vendorId: booking.vendorId,
        bookingDate: booking.eventDate
      },
      {
        status: 'booked',
        bookingId: booking._id
      },
      {
        upsert: true,
        new: true
      }
    );

    return res.status(200).json({
      message: 'Booking accepted successfully',
      booking
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message
    });
  }
};

// Vendor reject a booking
exports.rejectBooking = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (booking.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({
        message: 'Vendor mismatch'
      });
    }

    booking.bookingStatus = 'rejected';
    await booking.save();

    await notificationModel.create({
      recipientId: booking.userId,
      recipientType: 'user',
      senderId: booking.vendorId,
      bookingId: booking._id,
      notificationType: 'booking_declined',
      title: 'Booking Declined',
      message: `Your booking request has been declined by ${vendor.stageName}`
    });

    await Availability.findOneAndUpdate(
      {
        vendorId: booking.vendorId,
        bookingDate: booking.eventDate
      },
      {
        status: 'available'
      },
      {
        new: true
      }
    );

    return res.status(200).json({
      message: 'Booking declined successfully'
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message
    });
  }
};

// Get all bookings for a vendor
// exports.getVendorBookings = async (req, res) => {
//   try {
//     const { vendorId } = req.params;

//     const bookings = await bookingModel.find({ vendorId })
//       .populate('userId', 'firstName lastName email phoneNumber')
//       .sort({ createdAt: -1 });

//     if (!bookings) {
//       return res.status(404).json({ message: 'No bookings found' });
//     }

//     const formattedBookings = bookings.map(b => ({
//       ...b.toObject(),
//       eventDate: b.eventDate.toISOString().split('T')[0],
//       bookingDate: b.bookingDate.toISOString().split('T')[0],
//       createdAt: b.createdAt.toISOString().split('T')[0],
//       updatedAt: b.updatedAt.toISOString().split('T')[0]
//     }));

//     res.status(200).json({
//       message: 'Bookings fetched successfully',
//       totalBookings: bookings.length,
//       bookings: formattedBookings
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

exports.markBookingCompleted = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        const booking = await bookingModel.findOne({
            _id: bookingId,
            vendorId
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found."
            });
        }

        if (booking.bookingStatus !== "confirmed") {
            return res.status(400).json({
                message: "Only confirmed bookings can be completed."
            });
        }

        booking.bookingStatus = "completed";

        booking.completedByVendor = true;

        booking.completedAt = new Date();

        await booking.save();

        const escrow = await escrowModel.findOne({ bookingId });

        if (escrow) {
            escrow.releaseAt = new Date(
                Date.now() + (24 * 60 * 60 * 1000)
            );

            await escrow.save();
        }

        return res.status(200).json({
            message: "Booking marked as completed successfully.",
            data: booking
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};

exports.confirmCompletedBooking = async (req, res) => {
    try {

        const userId = req.user.id;
        const { bookingId } = req.params;

        const booking = await bookingModel.findOne({
            _id: bookingId,
            userId
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.isEventConfirmed) {
            return res.status(400).json({
                message: "Event has already been confirmed."
            });
        }

        const escrow = await escrowModel.findOne({
            bookingId,
            finalReleaseStatus: "pending"
        });

        if (!escrow) {
            return res.status(404).json({
                message: "Escrow record not found."
            });
        }

        const wallet = await walletModel.findOne({
            vendorId: booking.vendorId
        });

        if (!wallet) {
            return res.status(404).json({
                message: "Vendor wallet not found."
            });
        }

        // Release escrow funds
        wallet.availableBalance += escrow.finalReleaseAmount;

        wallet.escrowBalance -= escrow.finalReleaseAmount;

        await wallet.save();

        booking.bookingStatus = "completed";
        booking.isEventConfirmed = true;
        booking.confirmedAt = new Date();

        await booking.save();

        escrow.finalReleaseStatus = "released";
        escrow.releaseReason = "user_confirmation";
        escrow.releasedAt = new Date();

        await escrow.save();

        await transactionModel.create({

            vendorId: booking.vendorId,

            walletId: wallet._id,

            bookingId,

            amount: escrow.finalReleaseAmount,

            transactionType: "release",

            description: "Final 30% released by customer confirmation",

            status: "successful"

        });

        return res.status(200).json({

            message: "Booking confirmed successfully. Escrow released."

        });

    } catch (error) {

        return res.status(500).json({

            message: error.message

        });

    }
};

exports.getClientBookings = async (req, res) => {
  try {
    const { id } = req.user;
    const bookings = await bookingModel.find({ userId :id}).populate('vendorId', 'firstName lastName stageName email phoneNumber profilePicture category').sort({ createdAt: -1 });
    if (!bookings) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    const formattedBookings = bookings.map(b => ({
      ...b.toObject(),
      eventDate: b.eventDate.toISOString().split('T')[0]
    }));

    res.status(200).json({
      message: 'Bookings fetched successfully',
      totalBookings: bookings.length,
      bookings: bookings
      // formattedBookings
      
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorBookings = async (req, res) => {
  try {
    const { id } = req.user;
    const bookings = await bookingModel.find({ vendorId: id }).populate('vendorId', 'firstName lastName stageName email phoneNumber profilePicture category')
      .populate('userId', 'firstName lastName email').sort({ createdAt: -1 });

    if (!bookings) {
      return res.status(404).json({
         message: 'No bookings found' });
    }
    const formattedBookings = bookings.map(b => ({
      ...b.toObject(),
      eventDate: b.eventDate.toISOString().split('T')[0]
    }));

    res.status(200).json({
      message: 'Bookings fetched successfully',
      totalBookings: bookings.length,
      bookings: bookings
      //formattedBookings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getSingleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('vendorId', 'firstName lastName stageName email phoneNumber profilePicture category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking fetched successfully',
      booking: {
        ...booking.toObject(),
        eventDate: booking.eventDate.toISOString().split('T')[0],
     
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message });
  }
};

// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { bookingStatus } = req.body;

//     if (!bookingStatus) {
//       return res.status(400).json({
//         message: "Booking status is required"
//       });
//     }
//     const allowedStatuses = ["pending", "confirmed", "cancelled", "completed", "disputed"];

//     if (!allowedStatuses.includes(bookingStatus)) {
//       return res.status(400).json({
//         message: "Invalid booking status"
//       });
//     }

//     const booking = await bookingModel.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({
//         message: "Booking not found"
//       });
//     }

//     if (String(booking.vendorId) !== String(req.user.id)) {
//       return res.status(403).json({
//         message: "You are not allowed to update this booking"
//       });
//     }

//     booking.bookingStatus = bookingStatus;
//     await booking.save();

//     await createNotification({
//       recipientId: booking.userId,
//       recipientType: "user",
//       title: "Booking Update",
//       message: `Your booking has been ${bookingStatus}.`,
//       emailSubject: "Booking status updated"
//     });

//     return res.status(200).json({
//       message: "Booking status updated successfully",
//       data: booking
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     });
//   }
// };
