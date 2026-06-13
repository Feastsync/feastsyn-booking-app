const { createUser, verifyEmail, userLogin, userLogout, forgotPassword, resendOtp, resetPassword, getOneUser, deleteUser } = require('../controller/userController');
const { authentication, adminAuth } = require('../middlewares/auth');
const {signupUserValidator, resetPasswordValidator, changePasswordValidator, verifyOtpValidator} = require('../middlewares/validator');

const router = require('express').Router();

router.post('/register', signupUserValidator, createUser);
router.post('/verify', verifyEmail);
router.post('/login', userLogin);
router.post('/logout', authentication, userLogout);

router.post('/forgot-password', forgotPassword);
router.post('/resend-otp',resendOtp);
router.post('/reset-password', resetPasswordValidator, resetPassword);

//router.get('/one-user', authentication, getOneUser  )
router.delete('/user/:id', authentication, adminAuth, deleteUser)

module.exports = router;