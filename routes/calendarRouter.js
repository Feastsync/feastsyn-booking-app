const express = require('express');
const router = express.Router();
const { getCalendar} = require('../controller/calendarController');

router.get('/get-calendar/:vendorId', getCalendar);
router.get('/test', (req, res) => {
    console.log('CALENDAR TEST ROUTE HIT');
    res.status(200).json({
        message: 'Calendar route working'
    });
});
module.exports = router;