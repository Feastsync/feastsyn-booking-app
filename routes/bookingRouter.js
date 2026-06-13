const express = require('express');
const { authentication } = require('../middlewares/auth');
const router = express.Router();
const { createBooking, confirmBooking, declineBooking, getVendorBookings, getClientBookings, getSingleBooking, updateBookingStatus} = require('../controller/bookingController');


router.post('/bookings',authentication, createBooking);
router.put('/accept/:bookingId', confirmBooking);
router.put('/decline/:bookingId', declineBooking);
router.get('/vendor/:vendorId', getVendorBookings);
router.get('/client/:userId', getClientBookings);
router.get('/single/:bookingId', getSingleBooking);
router.put('/booking-status/:bookingId', authentication, updateBookingStatus)

module.exports = router;