const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (toEmail, otp, subject, purpose) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #818cf8; margin-bottom: 0.5rem;">BBD Lost & Found</h2>
      <p style="color: #cbd5e1; margin-bottom: 2rem;">BBD University, Lucknow</p>
      <h3 style="margin-bottom: 1rem;">${purpose}</h3>
      <p style="color: #cbd5e1;">Use the OTP below to ${purpose.toLowerCase()}. It expires in <strong>10 minutes</strong>.</p>
      <div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.5rem; text-align: center; margin: 2rem 0;">
        <span style="font-size: 2.5rem; font-weight: 900; letter-spacing: 0.5rem; color: #a78bfa;">${otp}</span>
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem;">If you did not request this, please ignore this email.</p>
      <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;" />
      <p style="color: #475569; font-size: 0.8rem;">© 2026 BBD Lost & Found Platform</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"BBD Lost & Found" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
};

module.exports = { generateOtp, sendOtpEmail };
