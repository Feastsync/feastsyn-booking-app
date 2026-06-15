const { initializePayment, getAllPaymentByUser, verifyWebhook } = require('../controller/paymentController');
const { authentication } = require('../middlewares/auth');
const router = require('express').Router();

router.post('/initialize-payment/:vendorId/:bookingId', authentication, initializePayment);
router.post('/webhook', verifyWebhook)
router.get('/all-payments', authentication, getAllPaymentByUser);

module.exports = router;
