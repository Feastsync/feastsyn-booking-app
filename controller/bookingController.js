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