
const bookingModel = require("../models/booking");
const calendarModel = require("../models/calendar");
const vendorModel = require("../models/vendor");
const pricingModel = require("../models/pricing");
const userModel = require("../models/user");
const paymentModel = require('../models/payment');


exports.getCalendar = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { month } = req.query;

    const [year, monthNumber] = month.split("-").map(Number);

    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 1);

    const calendarEntries = await calendarModel.find({
      vendorId,
      status: "booked",
      bookingDate: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const bookedDates = calendarEntries.map((entry) => ({
      date: entry.bookingDate.toISOString().split("T")[0]
    }));

    return res.status(200).json({
      vendorId,
      month,
      bookedDates,
      totalBookings: bookedDates.length
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

