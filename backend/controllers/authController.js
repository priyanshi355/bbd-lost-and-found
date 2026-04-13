const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOtp, sendOtpEmail } = require('../utils/emailService');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ error: 'Name, email, password and mobile number are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isEmailVerified)
        return res.status(409).json({ error: 'An account with this email already exists' });
      // Re-send OTP if not verified
      const otp = generateOtp();
      existing.name = name;
      existing.phone = phone;
      existing.passwordHash = await bcrypt.hash(password, 12);
      existing.emailOtp = otp;
      existing.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await existing.save();
      await sendOtpEmail(email, otp, 'Verify your BBD Lost & Found account', 'Verify Your Email');
      return res.status(200).json({ message: 'OTP resent. Please verify your email.', email });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      emailOtp: otp,
      emailOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, otp, 'Verify your BBD Lost & Found account', 'Verify Your Email');
    res.status(201).json({ message: 'Account created! Check your email for the OTP.', email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ error: 'Email already verified' });
    if (!user.emailOtp || user.emailOtp !== otp)
      return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.emailOtpExpiry)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });

    user.isEmailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Server error during verification' });
  }
};

// POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ error: 'Email already verified' });

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, otp, 'Your new OTP — BBD Lost & Found', 'Verify Your Email');
    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.isEmailVerified)
      return res.status(403).json({ error: 'Please verify your email first', needsVerification: true, email });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond the same to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset OTP has been sent.' });

    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, otp, 'Reset your BBD Lost & Found password', 'Reset Your Password');
    res.json({ message: 'Password reset OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp)
      return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.resetPasswordOtpExpiry)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, verifyEmail, resendOtp, login, forgotPassword, resetPassword };
