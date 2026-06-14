const express = require('express');
const { authentication } = require('../middlewares/auth');
const { createDispute } = require('../controller/disputeController');
const router = require('express').Router();

router.post('/create-dispute/:bookingId', authentication, createDispute);

module.exports = router;