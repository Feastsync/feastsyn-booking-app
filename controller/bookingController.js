// const Booking = require('../models/booking');
// const Availability = require('../models/availability');

// // Client creates a booking
// exports.createBooking = async (req, res) => {
//   try {
//     const { userId, vendorId, bookingTitle, eventType, eventLocation, bookingDate, totalAmount } = req.body;

//     // Check if vendor is already booked on this date
//     const existingBooking = await Booking.findOne({
//       vendorId,
//       bookingDate: new Date(bookingDate),
//       bookingStatus: 'confirmed'
//     });

//     if (existingBooking) {
//       return res.status(400).json({ message: 'Vendor is not available on this date' });
//     }

//     // Create the booking
//     const booking = new Booking({
//       userId,
//       vendorId,
//       bookingTitle,
//       eventType,
//       eventLocation,
//       bookingDate: new Date(bookingDate),
//       totalAmount,
//       bookingStatus: 'pending',
//       paymentStatus: 'unpaid'
//     });

//     await booking.save();

//     // Update availability for this date
//     await Availability.findOneAndUpdate(
//       { vendorId, bookingDate: new Date(bookingDate) },
//       { status: 'pending', bookingId: booking._id },
//       { upsert: true, new: true }
//     );

//     res.status(201).json({ 
//         message: 'Booking created successfully', 
//         booking: {
//             ...booking.toObject(),
//             bookingDate: booking.bookingDate.toISOString().split('T')[0],
//             createdAt: booking.createdAt.toISOString().split('T')[0],
//             updatedAt: booking.updatedAt.toISOString().split('T')[0]
//         }
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // Vendor confirms or cancels a booking
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { bookingStatus } = req.body;

//     // Find the booking
//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     // Update booking status
//     booking.bookingStatus = bookingStatus;
//     await booking.save();

//     // Update availability accordingly
//     const availabilityStatus = bookingStatus === 'confirmed' ? 'booked'
//       : bookingStatus === 'cancelled' ? 'available'
//       : 'pending';

//     await Availability.findOneAndUpdate(
//       { vendorId: booking.vendorId, bookingDate: booking.bookingDate },
//       { status: availabilityStatus },
//       { new: true }
//     );

//     res.status(200).json({
//          message: `Booking ${bookingStatus} successfully`,
//         //   booking: {
//         //     ...booking.toObject(),
//         //     bookingDate: booking.bookingDate.toISOString().split('T')[0],
//         //     createdAt: booking.createdAt.toISOString().split('T')[0],
//         //     updatedAt: booking.updatedAt.toISOString().split('T')[0]
//         // }
//      });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Booking = require('../models/booking');
const Availability = require('../models/availability');
const Vendor = require('../models/vendor');

// Helper function to convert time to minutes
const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Client creates a booking
exports.createBooking = async (req, res) => {
  try {
    const { userId, vendorId, bookingTitle, eventType, eventLocation, eventDate, bookingDate, totalAmount, duration, guestCount, startTime, endTime } = req.body;

    // Get vendor and buffer time
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const bufferTime = vendor.bufferTime || 60;

    // Get all confirmed bookings for this vendor on this event date
    const existingBookings = await Booking.find({
      vendorId,
      eventDate: new Date(eventDate),
      bookingStatus: 'confirmed'
    });

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime) + bufferTime;

    // Check for time conflicts
    const hasConflict = existingBookings.some(b => {
      const existingStart = toMinutes(b.startTime);
      const existingEnd = toMinutes(b.endTime) + bufferTime;
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      return res.status(400).json({ message: 'Vendor is not available at this time' });
    }

    // Create the booking
    const booking = new Booking({
      userId,
      vendorId,
      bookingTitle,
      eventType,
      eventLocation,
      eventDate: new Date(eventDate),
      bookingDate: new Date(bookingDate),
      totalAmount,
      duration,
      guestCount,
      startTime,
      endTime,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid'
    });

    await booking.save();

    // Update availability
    await Availability.findOneAndUpdate(
      { vendorId, bookingDate: new Date(eventDate) },
      { status: 'pending', bookingId: booking._id },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking.toObject(),
        eventDate: booking.eventDate.toISOString().split('T')[0],
        bookingDate: booking.bookingDate.toISOString().split('T')[0],
        createdAt: booking.createdAt.toISOString().split('T')[0],
        updatedAt: booking.updatedAt.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor confirms a booking and auto cancels conflicting ones
exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Get vendor buffer time
    const vendor = await Vendor.findById(booking.vendorId);
    const bufferTime = vendor.bufferTime || 60;

    const confirmedStart = toMinutes(booking.startTime);
    const confirmedEnd = toMinutes(booking.endTime) + bufferTime;

    // Find all other pending bookings on the same date
    const otherBookings = await Booking.find({
      vendorId: booking.vendorId,
      eventDate: booking.eventDate,
      bookingStatus: 'pending',
      _id: { $ne: bookingId }
    });

    // Cancel only those that conflict with the confirmed booking time
    const conflictingIds = otherBookings
      .filter(b => {
        const otherStart = toMinutes(b.startTime);
        const otherEnd = toMinutes(b.endTime) + bufferTime;
        return confirmedStart < otherEnd && confirmedEnd > otherStart;
      })
      .map(b => b._id);

    if (conflictingIds.length > 0) {
      await Booking.updateMany(
        { _id: { $in: conflictingIds } },
        { bookingStatus: 'cancelled' }
      );
    }

    // Confirm this booking
    booking.bookingStatus = 'accept';
    await booking.save();

    // Update availability
    await Availability.findOneAndUpdate(
      { vendorId: booking.vendorId, bookingDate: booking.eventDate },
      { status: 'booked', bookingId: booking._id },
      { new: true }
    );

    res.status(200).json({
      message: 'Booking accepted successfully',
      booking: {
        ...booking.toObject(),
        eventDate: booking.eventDate.toISOString().split('T')[0],
        bookingDate: booking.bookingDate.toISOString().split('T')[0],
        createdAt: booking.createdAt.toISOString().split('T')[0],
        updatedAt: booking.updatedAt.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Vendor declines a booking
exports.declineBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    await Availability.findOneAndUpdate(
      { vendorId: booking.vendorId, bookingDate: booking.eventDate },
      { status: 'available' },
      { new: true }
    );

    res.status(200).json({
      message: 'Booking declined successfully',
      // booking: {
      //   ...booking.toObject(),
      //   eventDate: booking.eventDate.toISOString().split('T')[0],
      //   bookingDate: booking.bookingDate.toISOString().split('T')[0],
      //   createdAt: booking.createdAt.toISOString().split('T')[0],
      //   updatedAt: booking.updatedAt.toISOString().split('T')[0]
      // }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all bookings for a vendor
exports.getVendorBookings = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const bookings = await Booking.find({ vendorId })
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
exports.getClientBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate('vendorId', 'firstName lastName stageName email phoneNumber profilePicture category')
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

// Get a single booking
exports.getSingleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
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
        bookingDate: booking.bookingDate.toISOString().split('T')[0],
        createdAt: booking.createdAt.toISOString().split('T')[0],
        updatedAt: booking.updatedAt.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
