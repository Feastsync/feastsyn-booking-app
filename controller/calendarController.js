const bookingModel = require("../models/booking");
const calendarModel = require("../models/calendar");
const vendorModel = require("../models/vendor");
const pricingModel = require("../models/pricing");
const userModel = require("../models/user");

exports.getCalendar = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: 'Month is required. Format: YYYY-MM'
      });
    }

    const [year, monthNumber] = month.split('-').map(Number);

    const startDate = new Date(year, monthNumber - 1, 1);

    const endDate = new Date(year, monthNumber, 1);

    const bookings = await bookingModel.find({ vendorId,
        bookingStatus: {
          $in: ['confirmed', 'completed']
        },
        eventDate: {
          $gte: startDate,
          $lt: endDate
        }
      });

    const bookedDates = bookings.map(booking => booking.eventDate.toISOString().split('T')[0]);
    return res.status(200).json({
      vendorId,
      month,
      bookedDates,
      totalBookings: bookings.length
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });

  }
};
