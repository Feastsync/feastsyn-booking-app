const express = require("express");
const router = express.Router();

const { contactUs } = require("../controllers/contactController");
const { optionalAuth } = require("../middlewares/optionalAuth");

router.post("/contact-us", optionalAuth , contactUs);

module.exports = router;