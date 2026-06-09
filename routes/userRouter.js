const { createUser, verifyEmail, userLogin, userLogout, forgotPassword, resendOTP, resetPassword, getOneUser, changePassword, getAllUsers, deleteUser } = require('../controller/userController');
const { authentication, adminAuth } = require('../middlewares/auth');
const {signupUserValidator, resetPasswordValidator, changePasswordValidator} = require('../middlewares/validator');

const router = require('express').Router();

router.post('/register', signupUserValidator, createUser);
router.post('/verify', verifyEmail);
router.post('/login', userLogin);
router.post('/logout', authentication, userLogout);

router.post('/forgot-password', forgotPassword);
router.post('/resendOTP', resendOTP);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/change-password', authentication, changePasswordValidator, changePassword);

router.get('/all-users', authentication, getAllUsers);
router.get('/one-user', authentication, getOneUser  )
router.delete('/user/:id', authentication, adminAuth, deleteUser)

module.exports = router;