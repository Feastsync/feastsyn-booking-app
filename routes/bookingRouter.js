const express = require('express');
const router = express.Router();
const { createBooking, confirmBooking, declineBooking, getVendorBookings, getClientBookings, getSingleBooking} = require('../controller/bookingController');

router.post('/create', createBooking);
router.put('/accept/:bookingId', confirmBooking);
router.put('/decline/:bookingId', declineBooking);
router.get('/vendor/:vendorId', getVendorBookings);
router.get('/client/:userId', getClientBookings);
router.get('/single/:bookingId', getSingleBooking);

module.exports = router;