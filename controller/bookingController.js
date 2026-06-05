const Booking = require('../models/booking');
const Availability = require('../models/availability');

// Client creates a booking
exports.createBooking = async (req, res) => {
  try {
    const { userId, vendorId, bookingTitle, eventType, eventLocation, bookingDate, totalAmount } = req.body;

    // Check if vendor is already booked on this date
    const existingBooking = await Booking.findOne({
      vendorId,
      bookingDate: new Date(bookingDate),
      bookingStatus: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Vendor is not available on this date' });
    }

    // Create the booking
    const booking = new Booking({
      userId,
      vendorId,
      bookingTitle,
      eventType,
      eventLocation,
      bookingDate: new Date(bookingDate),
      totalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid'
    });

    await booking.save();

    // Update availability for this date
    await Availability.findOneAndUpdate(
      { vendorId, bookingDate: new Date(bookingDate) },
      { status: 'pending', bookingId: booking._id },
      { upsert: true, new: true }
    );

    res.status(201).json({ 
        message: 'Booking created successfully', 
        booking: {
            ...booking.toObject(),
            bookingDate: booking.bookingDate.toISOString().split('T')[0],
            createdAt: booking.createdAt.toISOString().split('T')[0],
            updatedAt: booking.updatedAt.toISOString().split('T')[0]
        }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Vendor confirms or cancels a booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status
    booking.bookingStatus = bookingStatus;
    await booking.save();

    // Update availability accordingly
    const availabilityStatus = bookingStatus === 'confirmed' ? 'booked'
      : bookingStatus === 'cancelled' ? 'available'
      : 'pending';

    await Availability.findOneAndUpdate(
      { vendorId: booking.vendorId, bookingDate: booking.bookingDate },
      { status: availabilityStatus },
      { new: true }
    );

    res.status(200).json({
         message: `Booking ${bookingStatus} successfully`,
        //   booking: {
        //     ...booking.toObject(),
        //     bookingDate: booking.bookingDate.toISOString().split('T')[0],
        //     createdAt: booking.createdAt.toISOString().split('T')[0],
        //     updatedAt: booking.updatedAt.toISOString().split('T')[0]
        // }
     });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};