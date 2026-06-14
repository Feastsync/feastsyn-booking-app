const express = require("express");
const { createPricing, updatePricing } = require("../controller/pricingController");
const { authentication } = require("../middlewares/auth");
const router = express.Router();

router.post('/pricing', authentication, createPricing)
router.put('/new-pricing/:pricingId', authentication, updatePricing)

module.exports = router;