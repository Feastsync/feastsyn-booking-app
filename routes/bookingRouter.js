const express = require('express');
const { createBooking } = require('../controller/bookingController');
const { authentication } = require('../middlewares/auth');
const router = express.Router();

router.post('/bookings', authentication, createBooking);
module.exports = router;