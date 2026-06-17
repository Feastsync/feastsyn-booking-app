const { createVendor, updateVendor, verifyVendorEmail, vendorLogin, vendorLogout, getAllVendors, getOneVendor, getVendorDashboard, vendorVerifyResetOtp, vendorForgotPassword, vendorResendOtp, vendorResetPassword } = require('../controller/vendorController');
const { authentication, adminAuth } = require('../middlewares/auth');
const {upload} = require('../middlewares/multer');
const {signupVendorValidator, resetPasswordValidator, changePasswordValidator} = require('../middlewares/validator');
const router = require('express').Router();

router.post('/sign-up', signupVendorValidator, createVendor);
router.put('/update-profile/:id', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'coverVideo', maxCount: 1 },
  { name: 'photoCatalogue', maxCount: 4 },
  { name: 'videoCatalogue', maxCount: 2 }
]), updateVendor);
router.post('/verify', verifyVendorEmail);
router.post('/login', vendorLogin);
router.post('/logout', authentication, vendorLogout);

router.post('/forgot-password', vendorForgotPassword);
router.post('/resend-otp', vendorResendOtp);
router.post('/verify-otp', vendorVerifyResetOtp)
router.post('/reset-password', resetPasswordValidator, vendorResetPassword);

router.get('/all-vendors', getAllVendors)
// router.get('/one-vendor/:slug', getOneVendor)
router.get("/vendor-dashboard", authentication, getVendorDashboard);

module.exports = router; 