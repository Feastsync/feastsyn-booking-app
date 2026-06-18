const express = require('express');
const { authentication } = require('../middlewares/auth');
const router = express.Router();
const { createBooking, getVendorBookings, acceptBooking, rejectBooking, getBookingDetails} = require('../controller/bookingController');


router.post('/bookings',authentication, createBooking);
router.get('/booking-details/:bookingId', getBookingDetails),
router.put('/accept/:bookingId', authentication,acceptBooking);
router.put('/reject/:bookingId', authentication,rejectBooking);
router.get('/vendor/:vendorId', getVendorBookings); 
//router.get('/client/:userId', getClientBookings);
//router.get('/single/:bookingId', getSingleBooking);
//router.put('/booking-status/:bookingId', authentication, updateBookingStatus)

module.exports = router; 