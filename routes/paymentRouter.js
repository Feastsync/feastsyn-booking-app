const { initializePayment, verifyPayment, getAllPaymentByUser } = require('../controller/paymentController');
const { authentication } = require('../middlewares/auth');
const router = require('express').Router();

router.post('/initialize-payment/:vendorId/:bookingId', authentication, initializePayment);
router.post('/verify-payment/:vendorId', authentication, verifyPayment);
router.get('/all-payments', authentication, getAllPaymentByUser);

module.exports = router;
