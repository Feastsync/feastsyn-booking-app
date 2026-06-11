const { createVendor, updateVendor, verifyVendorEmail, vendorLogin, vendorLogout, forgotPassword, resetPassword, changePassword, getAllVendors, getOneVendor, resendOtp } = require('../controller/vendorController');
const { authentication, adminAuth } = require('../middlewares/auth');
const {upload} = require('../middlewares/multer');
const {signupVendorValidator, resetPasswordValidator, changePasswordValidator, verifyOtpValidator} = require('../middlewares/validator');
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

router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/change-password', authentication, changePasswordValidator, changePassword);


router.get('/all-vendors', authentication, getAllVendors)
router.get('/one-vendor/:slug', authentication, getOneVendor)
module.exports = router; 