const bookingModel = require('../models/booking');
const vendorModel = require('../models/vendor');

exports.createBooking = async (req, res) => {
  try {
    // Logged in user
    const userId = req.user.id;
    const { vendorId, pricingId, bookingTitle, eventType, eventLocation, bookingDate, eventTime} = req.body;
    // Validate required fields
    if (!vendorId || !pricingId || !bookingTitle || !eventType || !eventLocation || !bookingDate ) {
      return res.status(400).json({
        message: 'All required fields must be provided'
      });
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Something went wrong'
    });
  }
};