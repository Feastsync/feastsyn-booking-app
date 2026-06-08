const { createVendor, updateVendor, verifyVendorEmail, vendorLogin, vendorLogout, forgotPassword, resendOTP, resetPassword, changePassword, getAllVendors, getOneVendor } = require('../controller/vendorController');
const { authentication, adminAuth } = require('../middlewares/auth');
const { profile, loginProfile } = require('../middlewares/vendorPassport');
const {upload} = require('../middlewares/multer');
const {signupVendorValidator, resetPasswordValidator, changePasswordValidator} = require('../middlewares/validator');
const router = require('express').Router();

router.post('/sign-up', signupVendorValidator, createVendor);
router.put('/update-profile/:id', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'coverVideo', maxCount: 1 },
  { name: 'photoCatalogue', maxCount: 3 },
  { name: 'videoCatalogue', maxCount: 2 }
]), updateVendor);
router.post('/verify', verifyVendorEmail);
router.post('/login', vendorLogin);
router.post('/logout', authentication, vendorLogout);

router.post('/forgot-password', forgotPassword);
router.post('/resendOTP', resendOTP);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/change-password', authentication, changePasswordValidator, changePassword);

router.get('/google', profile)
router.get('/google/callback', loginProfile)

router.get('/all-vendors', authentication, getAllVendors)
router.get('/one-vendor/:slug', authentication, getOneVendor)
module.exports = router;