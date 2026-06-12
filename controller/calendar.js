//const Booking = require('../models/booking');
// const AvailabilityBlock = require('../models/availabiltyBlock');
// const calendarModel = require('../models/calendarModel');

// exports.createCalendarEntry = async (req, res, next) => {
//     try {
//         const { eventDate, startTime, endTime, eventLocation, totalAmount } = req.body;
//         const calendarEntry = new calendarModel({
//             eventDate,
//             startTime,
//             endTime,
//             eventLocation,
//             totalAmount
//         });
//         await calendarEntry.save();
//         res.status(201).json({
//             message: 'Calendar entry created successfully',
//             data: calendarEntry
//         });
//     } catch (error) {
//         next(error);
//     }
// };


const Booking = require("../models/booking");
// const Availability = require("../models/availability");
const vendorModel = require("../models/vendor");
const pricingModel = require("../models/pricing");
const userModel = require("../models/user");

exports.getCalendar = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: "Month is required. Format: YYYY-MM"
      });
    }

    // 🔥 clean input
    const cleanMonth = month.trim();
    const [year, monthNum] = cleanMonth.split("-");

    const y = Number(year);
    const m = Number(monthNum);

    if (!y || !m || isNaN(y) || isNaN(m)) {
      return res.status(400).json({
        message: "Invalid month format. Use YYYY-MM"
      });
    }

    // 🔥 first day of month
    const firstDay = new Date(y, m - 1, 1);

    if (isNaN(firstDay.getTime())) {
      return res.status(400).json({
        message: "Invalid date generated from month"
      });
    }

    // 🔥 include 2 previous days
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - 2);

    // 🔥 first day of next month
    const endDate = new Date(y, m, 1);

    // get bookings
    const bookings = await Booking.find({
      vendorId,
      eventDate: { $gte: startDate, $lt: endDate },
      bookingStatus: "confirmed"
    });

    const bookedDates = new Set();

    bookings.forEach((b) => {
      const d = new Date(b.eventDate);

      const dateStr =
        d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");

      bookedDates.add(dateStr);
    });

    const calendar = {};

    // 🔥 safe loop (no mutation bugs)
    let current = new Date(startDate);

    while (current < endDate) {
      const dateStr =
        current.getFullYear() + "-" +
        String(current.getMonth() + 1).padStart(2, "0") + "-" +
        String(current.getDate()).padStart(2, "0");

      calendar[dateStr] = bookedDates.has(dateStr)
        ? "booked"
        : "free";

      current = new Date(current.setDate(current.getDate() + 1));
    }

    // 🔥 month label (THIS FIXES YOUR "July 2026" ISSUE)
    const monthLabel = new Date(y, m - 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

    return res.json({
      vendorId,
      monthKey: cleanMonth,   // "2026-07"
      monthLabel,             // "July 2026"
      calendar
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// exports.getCalendar = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//     const { month } = req.query;

//     if (!month) {
//       return res.status(400).json({
//         message: "Month is required. Format: YYYY-MM"
//       });
//     }

//     const [year, monthNum] = month.split("-");
//     const y = Number(year);
//     const m = Number(monthNum);


//     // start of current month
//     const startOfMonth = new Date(Number(year), Number(monthNum) - 1, 1);

//     // go 2 days back (previous month padding)
//     const beginningDate = new Date(startOfMonth);
//     beginningDate.setDate(beginningDate.getDate() - 2);

//     //  end of month
//     const finishedDate = new Date(Number(year), Number(monthNum), 1);


//     const startDate = new Date(`${month}-01`);
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + 1);

//     const bookings = await Booking.find({
//       vendorId,
//       eventDate: { $gte: startDate, $lt: endDate },
//       bookingStatus: "confirmed"
//     });

//     const bookedDates = new Set();

//     bookings.forEach((b) => {
//       const dateStr = b.eventDate.toISOString().split("T")[0];
//       bookedDates.add(dateStr);
//     });

//     const calendar = {};

//     for (
//       let d = new Date(startDate);
//       d < endDate;
//       d.setDate(d.getDate() + 1)
//     ) {
//       const dateStr = d.toISOString().split("T")[0];

//       calendar[dateStr] = bookedDates.has(dateStr)
//         ? "booked"
//         : "free";
//     }

//     return res.json({
//       vendorId,
//       month,
//       calendar
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     });
//   }
// };

// exports.getCalendar = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//         const { month } = req.query;

//         // Validate month first
//     if (!month) {
//       return res.status(400).json({
//         message: "Month is required. Format: YYYY-MM"
//       });
//     }

//     const startDate = new Date(`${month}-01`);
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + 1);
//     const bookings = await Booking.find({
//       vendorId,
//       eventDate: { $gte: startDate, $lt: endDate },
//       bookingStatus: 'confirmed'
//     });
     
//      const blocks = await Availability.find({
//        vendorId,
//        blockedDate: { $gte: startDate, $lt: endDate }
//      });

//      const bookedDates = new Set();

//      bookings.forEach(b => {
//        bookedDates.add(b.eventDate.toISOString().split('T')[0]);
//      });

//      // blocks.forEach(b => {
//      //   bookedDates.add(b.blockedDate.toISOString().split('T')[0]);
//      // });

//      const calendar = {};
//      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
//        const dateStr = d.toISOString().split('T')[0];
//        calendar[dateStr] = bookedDates.has(dateStr) ? 'booked' : 'free';
//      }

//      return res.json({ vendorId, month, calendar });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.blockDate = async (req, res) => {
//   try {
//     const { vendorId, blockedDate, reason } = req.body;

//     const existingBlock = await AvailabilityBlock.findOne({
//       vendorId,
//       blockedDate: new Date(blockedDate)
//     });

//     if (existingBlock) {
//       return res.status(400).json({ message: 'This date is already blocked' });
//     }

//     const block = new AvailabilityBlock({
//       vendorId,
//       blockedDate: new Date(blockedDate),
//       reason
//     });

//     await block.save();

//     res.status(201).json({ message: 'Date blocked successfully', block });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// exports.unblockDate = async (req, res) => {
//   try {
//     const { vendorId, blockedDate } = req.body;

//     const block = await AvailabilityBlock.findOneAndDelete({
//       vendorId,
//       blockedDate: new Date(blockedDate)
//     });

//     if (!block) {
//       return res.status(404).json({ message: 'No block found for this date' });
//     }

//     res.status(200).json({ message: 'Date unblocked successfully' });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };