const { initializePayment, verifyWebhook, payoutFunds } = require('../controller/paymentController');
const { authentication } = require('../middlewares/auth');
const router = require('express').Router();

router.post('/initialize-payment/:vendorId/:bookingId', authentication, initializePayment);
router.post('/webhook', verifyWebhook);
router.post(
  '/payout-funds',
  (req, res, next) => {
    console.log("BEFORE AUTH");
    next();
  },
  authentication,
  (req, res, next) => {
    console.log("AFTER AUTH");
    next();
  },
  payoutFunds
);

module.exports = router; 
 