
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

    if (!month) {
      return res.status(400).json({
        message: "Month is required. Format: YYYY-MM"
      });
    }

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
      date: entry.bookingDate.toISOString().split("T")[0],
      status: entry.status,
      bookingId: entry.bookingId
    }));

    return res.status(200).json({
      vendorId,
      month,
      totalBookings: bookedDates.length,
      bookedDates
    });

  } catch (error) {
    console.error("GET CALENDAR ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

