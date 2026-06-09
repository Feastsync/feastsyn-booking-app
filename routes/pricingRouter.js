const express = require("express");
const { createPricing, getAllVendorPricing, getOnePricing, updatePricing, deletePricing } = require("../controller/pricingController");
const { authentication } = require("../middlewares/auth");
const router = express.Router();

router.post('/pricing', authentication, createPricing)
router.get('/all-pricing', authentication, getAllVendorPricing)
router.get('/one-pricing/:pricingId', authentication, getOnePricing)
router.put('/new-pricing/:pricingId', authentication, updatePricing)
router.delete('/delete-pricing/:pricingId', authentication, deletePricing)

module.exports = router;