const express = require('express');
const { authentication } = require('../middlewares/auth');
const router = express.Router();
const { createBooking, getVendorBookings, acceptBooking, rejectBooking, getBookingDetails, getClientBookings, getSingleBooking, markBookingCompleted, confirmCompletedBooking} = require('../controller/bookingController');


router.post('/bookings',authentication, createBooking);
router.get('/booking-details/:bookingId', authentication ,getBookingDetails),
router.put('/accept/:bookingId', authentication,acceptBooking);
router.put('/reject/:bookingId', authentication,rejectBooking);
router.put('complete-task/:bookingId', authentication, markBookingCompleted);
router.put('/confirm-booking/:bookingId', authentication, confirmCompletedBooking);
// router.get('/vendor/:vendorId', getVendorBookings); 
router.get('/client/',authentication, getClientBookings);
router.get('/single/:bookingId', getSingleBooking);
router.get('/vendor',authentication, getVendorBookings);

//router.put('/booking-status/:bookingId', authentication, updateBookingStatus)

module.exports = router; 