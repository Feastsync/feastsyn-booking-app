const { initializePayment, verifyWebhook, payoutFunds } = require('../controller/paymentController');
const { authentication } = require('../middlewares/auth');
const router = require('express').Router();

router.post('/initialize-payment/:vendorId/:bookingId', authentication, initializePayment);
router.post('/webhook', verifyWebhook);
router.post('/payout-funds', authentication, payoutFunds);
module.exports = router; 
 