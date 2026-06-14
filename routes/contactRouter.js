const express = require("express");
const router = express.Router();

const { contactUs } = require("../controller/contactController");
// const { optionalAuth } = require("../middlewares/optionalAuth");

router.post("/contact-us", contactUs);

module.exports = router;