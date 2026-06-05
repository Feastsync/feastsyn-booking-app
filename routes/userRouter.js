const { createUser, verifyEmail, userLogin, forgotPassword, resendOTP, resetPassword, loginWithGoogle, changePassword, getAllUsers, deleteUser } = require('../controller/userController');
const { authentication, adminAuth } = require('../middlewares/auth');
const { profile, loginProfile } = require('../middlewares/userPassport');
const {signupUserValidator, resetPasswordValidator, changePasswordValidator} = require('../middlewares/validator');

const router = require('express').Router();

router.post('/register', signupUserValidator, createUser);
router.post('/verify', verifyEmail);
router.post('/login', userLogin);

router.post('/forgot-password', forgotPassword);
router.post('/resendOTP', resendOTP);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/change-password', authentication, changePasswordValidator, changePassword);

router.get('/auth/google', profile)
router.get('/auth/google/callback', loginProfile , loginWithGoogle);

router.get('/all-users', authentication, getAllUsers);
router.delete('/user/:id', authentication, adminAuth, deleteUser)

module.exports = router;