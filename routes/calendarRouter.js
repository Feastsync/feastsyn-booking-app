const express = require('express');
const router = express.Router();
const { getCalendar, blockDate, unblockDate } = require('../controller/calendar');

router.get('/calendar/:vendorId', getCalendar);
router.post('/block', blockDate);
router.delete('/unblock', unblockDate);

module.exports = router;