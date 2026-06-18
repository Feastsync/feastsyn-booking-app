const bookingModel = require('../models/booking');
const vendorModel = require('../models/vendor');
const pricingModel = require('../models/pricing');
const userModel = require('../models/user');
const Availability = require('../models/calendar');
const notificationModel = require('../models/notification')
const {createNotification} = require('../utils/createNotification')
const {brevo} = require('../utils/brevo')

exports.createBooking = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: 'Please login first'
      });
    }

    const userId = req.user.id;

    const {
      vendorId,
      pricingId,
      eventType,
      eventLocation,
      eventDate,
      duration,
      guestCount,
      additionalDetails
    } = req.body;

    if (
      !vendorId ||
      !pricingId ||
      !eventType ||
      !eventLocation ||
      !eventDate ||
      !duration ||
      !guestCount ||
      !additionalDetails
    ) {
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

    const user = await userModel.findById(userId);

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
        $in: ['pending', 'confirmed', 'completed']
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
      eventType,
      eventLocation,
      eventDate: new Date(eventDate),
      duration,
      guestCount,
      additionalDetails
    });

    await notificationModel.create({
      recipientId: vendorId,
      senderId: userId,
      bookingId: booking._id,
      notificationType: 'booking_request',
      title: 'New Booking Request',
      message: `${user.firstName} sent you a booking request`
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

// Vendor accepts a booking and auto cancels conflicting ones
exports.acceptBooking = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    // Find all other pending bookings on the same date
    const otherBookings = await bookingModel.find({
      vendorId: booking.vendorId,
      eventDate: booking.eventDate,
      bookingStatus: 'pending',
      _id: { $ne: bookingId }
    });

    // Confirm this booking
    booking.bookingStatus = 'confirmed';
    await booking.save();

    // Update availability
    await Availability.findOneAndUpdate({ vendorId: booking.vendorId, bookingDate: booking.eventDate },
      { status: 'booked', bookingId: booking._id },
      { new: true }
    );

    res.status(200).json({
      message: 'Booking accepted successfully',
      booking: {
        ...booking.toObject(),
        eventDate: booking.eventDate.toISOString().split('T')[0],
        // bookingDate: booking.bookingDate.toISOString().split('T')[0],
        createdAt: booking.createdAt.toISOString().split('T')[0],
        updatedAt: booking.updatedAt.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message });
  }
};

// Vendor reject a booking
exports.rejectBooking = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    await Availability.findOneAndUpdate({ vendorId: booking.vendorId, bookingDate: booking.eventDate },
      { status: 'available' },
      { new: true }
    );

    res.status(200).json({
      message: 'Booking declined successfully',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for a vendor
exports.getVendorBookings = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const bookings = await bookingModel.find({ vendorId })
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    if (!bookings) {
      return res.status(404).json({ message: 'No bookings found' });
    }

    const formattedBookings = bookings.map(b => ({
      ...b.toObject(),
      eventDate: b.eventDate.toISOString().split('T')[0],
      bookingDate: b.bookingDate.toISOString().split('T')[0],
      createdAt: b.createdAt.toISOString().split('T')[0],
      updatedAt: b.updatedAt.toISOString().split('T')[0]
    }));

    res.status(200).json({
      message: 'Bookings fetched successfully',
      totalBookings: bookings.length,
      bookings: formattedBookings
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all bookings for a client
// exports.getClientBookings = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const bookings = await bookingModel.find({ userId }).populate('vendorId', 'firstName lastName stageName email phoneNumber profilePicture category').sort({ createdAt: -1 });
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

// Get a single booking
// exports.getSingleBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await bookingModel.findById(bookingId)
//       .populate('userId', 'firstName lastName email phoneNumber')
//       .populate('vendorId', 'firstName lastName stageName email phoneNumber profilePicture category');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     res.status(200).json({
//       message: 'Booking fetched successfully',
//       booking: {
//         ...booking.toObject(),
//         eventDate: booking.eventDate.toISOString().split('T')[0],
//         bookingDate: booking.bookingDate.toISOString().split('T')[0],
//         createdAt: booking.createdAt.toISOString().split('T')[0],
//         updatedAt: booking.updatedAt.toISOString().split('T')[0]
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Server error', error });
//   }
// };

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
