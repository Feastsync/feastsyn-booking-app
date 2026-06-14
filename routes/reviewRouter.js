const express = require('express');
const { authentication } = require('../middlewares/auth');
const { createReview } = require('../controller/reviewController');
const router = require('express').Router();

router.post('/create-review/:bookingId', authentication, createReview)
module.exports = router;