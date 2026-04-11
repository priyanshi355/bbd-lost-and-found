const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendOtp, login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
