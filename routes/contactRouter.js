const express = require("express");
const router = express.Router();

const { contactUs } = require("../controller/contactController");
const { contactValidator } = require("../middlewares/validator");
// const { optionalAuth } = require("../middlewares/optionalAuth");

router.post("/contact-us", contactValidator ,contactUs);

module.exports = router;