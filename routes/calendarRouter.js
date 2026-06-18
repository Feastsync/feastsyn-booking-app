const express = require('express');
const router = express.Router();
const { getCalendar} = require('../controller/calendarController');

router.get('/get-calendar/:vendorId', getCalendar);

module.exports = router;