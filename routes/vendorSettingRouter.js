const express = require('express');
const { authentication } = require('../middlewares/auth');
const { getSettings, requestUpdate, confirmUpdate } = require('../controller/vendorSettingController');

const router = require('express').Router();

router.get('/get-settings', authentication, getSettings);
router.post('/request-update', authentication, requestUpdate);
router.post('/confirm-update', authentication, confirmUpdate);

module.exports = router;