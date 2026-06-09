const bookingModel = require('../models/booking');
const vendorModel = require('../models/vendor');
const pricingModel = require('../models/pricing');

exports.createBooking = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: 'Please login first'
      });
    }
    const userId = req.user.id;

    const { vendorId, pricingId, eventType, eventLocation, eventDate, duration, guestCount, additionalDetails} = req.body;
    if ( !vendorId || !pricingId || !eventType || !eventLocation || !eventDate || !duration || !guestCount || !additionalDetails ) {
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
    // Check package
const selectedPackage = await pricingModel.findOne({
    _id: pricingId,
    vendorId: vendorId
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
        $in: ['pending', 'confirmed']
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
      eventType,
      eventLocation,
      eventDate: new Date(eventDate),
      duration,
      guestCount,
      pricingId,
      additionalDetails,
      totalAmount: selectedPackage.packagePrice
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
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
