const express = require('express');
const router = require('express').Router();

const { getDashboardStats, getAllVendorsAdmin, suspendVendor, activateVendor, getPendingKycs, approveKyc, rejectKyc, getAllPayments, getAllBookings, resolveDispute, getAllContactMessages, getUserReviews, getVendorReviews, updateSettings } = require('../controller/adminController');
const { adminAuth, authentication } = require('../middlewares/auth');
const { createDispute } = require('../controller/disputeController');
const { createReview } = require('../controller/reviewController');
const { getNotifications } = require('../controller/notificationController');

router.get('/dashboard-stats', adminAuth, getDashboardStats);

router.get('/all-vendors', adminAuth, getAllVendorsAdmin);

router.patch('/suspend-vendor/:vendorId', adminAuth, suspendVendor);

router.patch('/activate-vendor/:vendorId', adminAuth, activateVendor);

router.get('/all-pending-kyc', adminAuth, getPendingKycs);

router.patch('/approve-kyc/:kycId', adminAuth, approveKyc);

router.patch('/reject-kyc/:kycId', adminAuth, rejectKyc);

router.get('/all-payments', adminAuth, getAllPayments);

router.get('/all-bookings', adminAuth, getAllBookings);

// Disputes
router.post('/disputes/:bookingId', adminAuth, createDispute);

router.patch('/disputes/:disputeId', adminAuth,resolveDispute);

// Reviews
router.post('/reviews/:bookingId', authentication,createReview);

router.get('/vendor-reviews/:vendorId', adminAuth ,getVendorReviews);

router.get('/user-reviews/:userId', adminAuth, getUserReviews)

// Notifications
router.get('/notifications', authentication,getNotifications);

// Settings
router.patch('/settings', adminAuth, updateSettings);

//contactUs
router.get('/contact-message', adminAuth, getAllContactMessages)

module.exports = router;