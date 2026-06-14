const express = require("express");
const { createPricing, updatePricing, getAllVendorPricing, getOnePricing } = require("../controller/pricingController");
const { authentication } = require("../middlewares/auth");
const router = express.Router();

router.post('/pricing', authentication, createPricing);
router.put('/new-pricing/:pricingId', authentication, updatePricing);
router.get('/all-pricing', authentication, getAllVendorPricing);
router.get('/one-pricing/:pricingId', authentication, getOnePricing);

module.exports = router;