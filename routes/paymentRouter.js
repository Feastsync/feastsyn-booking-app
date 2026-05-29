const { initializePayment } = require('../controller/paymentController');
const { authentication } = require('../middlewares/auth');
const router = require('express').Router();

router.post('/initialize-booking/:bookingId', authentication, initializePayment);
router.post('/initialize/:vendorId', authentication, initializePayment);

module.exports = router;
