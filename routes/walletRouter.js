const express = require('express');
const { authentication } = require('../middlewares/auth');
const { getWalletSummary, getWalletTransactions } = require('../controller/walletController');

const router = require('express').Router();

router.get('/wallet-summary', authentication, getWalletSummary);
router.get('/wallet-transactions', authentication, getWalletTransactions);
module.exports = router;