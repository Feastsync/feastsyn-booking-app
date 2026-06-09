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