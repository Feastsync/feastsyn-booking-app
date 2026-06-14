const express = require('express');
const router = require('express').Router();

const { getDashboardStats, getAllVendorsAdmin,getPendingKycs, approveKyc, rejectKyc, getAllPayments, getAllBookings, resolveDispute, getAllContactMessages, getUserReviews, getVendorReviews, getAllVendorPricing, getOnePricing, getOneVendorAdmin, getOnePayment, getOneBooking } = require('../controller/adminController');
const { adminAuth, authentication } = require('../middlewares/auth');
const { createDispute } = require('../controller/disputeController');
const { createReview } = require('../controller/reviewController');
const { getNotifications } = require('../controller/notificationController');

router.get('/dashboard-stats', adminAuth, getDashboardStats);

router.get('/all-vendors', getAllVendorsAdmin);
router.get('/one-vendor/:vendorId', authentication, adminAuth, getOneVendorAdmin)

router.get('/all-pending-kyc', adminAuth, getPendingKycs);

router.put('/approve-kyc/:kycId', adminAuth, approveKyc);

router.put('/reject-kyc/:kycId', adminAuth, rejectKyc);

router.get('/all-payments', adminAuth, getAllPayments);
router.get('/one-payment/:paymentId', adminAuth, getOnePayment)

router.get('/all-bookings', adminAuth, getAllBookings);
router.get('/one-booking/:bookingId', adminAuth, getOneBooking)

// Disputes
router.put('/disputes/:disputeId', adminAuth,resolveDispute);

// Reviews
router.get('/vendor-reviews/:vendorId', authentication,adminAuth ,getVendorReviews);

router.get('/user-reviews/:userId', authentication, adminAuth, getUserReviews);

// // Notifications
// router.get('/notifications', authentication, getNotifications);

//contactUs
router.get('/contact-message', adminAuth, getAllContactMessages);

//pricingPackage
router.get('/all-pricing', adminAuth , getAllVendorPricing);

router.get('/one-pricing/:pricingId', getOnePricing);

module.exports = router;