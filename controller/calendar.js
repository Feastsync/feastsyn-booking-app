const Booking = require('../models/booking');
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



exports.getCalendar = async (req, res) => {
  try {
    const { vendorId } = req.params;
        const { month } = req.query;

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const bookings = await Booking.find({
      vendorId,
      bookingDate: { $gte: startDate, $lt: endDate },
      bookingStatus: 'confirmed'
    });

     // const blocks = await AvailabilityBlock.find({
     //   vendorId,
     //   blockedDate: { $gte: startDate, $lt: endDate }
     // });

     const bookedDates = new Set();

     bookings.forEach(b => {
       bookedDates.add(b.bookingDate.toISOString().split('T')[0]);
     });

     // blocks.forEach(b => {
     //   bookedDates.add(b.blockedDate.toISOString().split('T')[0]);
     // });

     const calendar = {};
     for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
       const dateStr = d.toISOString().split('T')[0];
       calendar[dateStr] = bookedDates.has(dateStr) ? 'booked' : 'free';
     }

     return res.json({ vendorId, month, calendar });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

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