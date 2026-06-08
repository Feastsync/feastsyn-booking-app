const bookingModel = require('../models/booking');
const vendorModel = require('../models/vendor');

exports.createBooking = async (req, res) => {
  try {
    // Logged in user
    const userId = req.user.id;
    const { vendorId, pricingId, bookingTitle, eventType, eventLocation, bookingDate} = req.body;
    // Validate required fields
    if (!vendorId || !pricingId || !bookingTitle || !eventType || !eventLocation || !bookingDate ) {
      return res.status(400).json({
        message: 'All required fields must be provided'
      });
    }

     // Check vendor
    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }
    // Check package
    const selectedPackage = vendorModel.packages.id(pricingId);
    if (!selectedPackage) {
      return res.status(404).json({
        message: 'Package not found'
      });
    }

    // Check if vendor is already booked
    const existingBooking = await bookingModel.findOne({
      vendorId,
      bookingDate,
      bookingStatus: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'Vendor is already booked on this date'
      });
    }
    // Create booking
    const booking = await bookingModel.create({
      userId,
      vendorId,
      packageId: pricingId,
      packageName: selectedPackage.name,
      bookingTitle,
      eventType,
      eventLocation,
      bookingDate,
      totalAmount: selectedPackage.price
    });

    res.status(201).json({
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Something went wrong'
    });
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
