const express = require('express');
const router = express.Router();
const { getCalendar} = require('../controller/calendar');

router.get('/calendar/:vendorId', getCalendar);

module.exports = router;