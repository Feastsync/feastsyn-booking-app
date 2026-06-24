const mongoose = require("mongoose");
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
        status: false,
        message: "Month is required. Format: YYYY-MM"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid vendor ID"
      });
    }

    const [year, monthNumber] = month.split("-").map(Number);

    const startDate = new Date(year, monthNumber - 1, 1);

    const endDate = new Date(year, monthNumber, 1);

    const bookedDates = await calendarModel.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      status: "booked",
      bookingDate: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const formattedBookedDates = bookedDates.map((item) => ({
      bookingId: item.bookingId,
      date: item.bookingDate.toISOString().split("T")[0],
      status: item.status
    }));

    return res.status(200).json({
      status: true,
      vendorId,
      month,
      totalBookings: formattedBookedDates.length,
      bookedDates: formattedBookedDates
    });

  } catch (error) {
    console.error("GET CALENDAR ERROR:", error);

    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};
