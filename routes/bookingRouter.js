const express = require('express');
const router = express.Router();
const { createBooking, updateBookingStatus } = require('../controller/bookingController');

router.post('/create', createBooking);
// router.put('/update/:bookingId', updateBookingStatus);

module.exports = router;