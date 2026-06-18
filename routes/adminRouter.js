const express = require('express');
const router = require('express').Router();

const { getDashboardStats, getAllVendorsAdmin,getPendingKycs, approveKyc, rejectKyc, getAllPayments, getAllBookings, createAdmin,adminLogin, verifyEmail, adminLogout, forgotPassword, resendOtp, resetPassword,resolveDispute, getAllContactMessages, getUserReviews, getVendorReviews, getOneVendorAdmin, getOnePayment, getOneBooking } = require('../controller/adminController');
const { adminAuth, authentication } = require('../middlewares/auth');
const { createDispute } = require('../controller/disputeController');
const { createReview } = require('../controller/reviewController');
const { getNotifications } = require('../controller/notificationController');
const { resetPasswordValidator } = require('../middlewares/validator');

router.post('/admin', createAdmin)
router.post('/verify-admin', verifyEmail);
router.post('/login-admin', adminLogin);
router.post('/logout-admin', adminAuth, adminLogout);

router.post('/forgot-password-admin', forgotPassword);
router.post('/resend-otp-admin',resendOtp);
router.post('/reset-password-admin', resetPasswordValidator, resetPassword);

router.get('/dashboard-stats', adminAuth, getDashboardStats);

router.get('/all-vendors', adminAuth,getAllVendorsAdmin);
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

router.get('/contact-message', adminAuth, getAllContactMessages);

//pricingPackage
// router.get('/all-pricing', getAllVendorPricing);

// router.get('/one-pricing/:pricingId', getOnePricing);

module.exports = router;