const { getDashboardStats, getAllVendorsAdmin, suspendVendor, activateVendor, getPendingKYCs, approveKYC, rejectKYC, getAllPayments, getAllBookings } = require('../controller/adminController');
const { adminAuth } = require('../middlewares/auth');

const router = require('express').Router()
router.get('/dashboard-stats', adminAuth, getDashboardStats);

router.get('/all-vendors', adminAuth, getAllVendorsAdmin);

router.patch('/suspend-vendor/:vendorId', adminAuth, suspendVendor);

router.patch('/activate-vendor/:vendorId', adminAuth, activateVendor);

router.get('/all-pending-kyc', adminAuth, getPendingKYCs);

router.patch('/approve-kyc/:kycId', adminAuth, approveKYC);

router.patch('/reject-kyc/:kycId', adminAuth, rejectKYC);

router.get('/all-payments', adminAuth, getAllPayments);

router.get('/all-bookings', adminAuth, getAllBookings);

module.exports = router;