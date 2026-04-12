const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    console.error('[CRITICAL] Missing BREVO_API_KEY in .env file!');
    throw new Error('Email service configuration is missing block out email.');
  }

  const payload = {
    sender: { name: "BBD Lost & Found", email: process.env.GMAIL_USER || 'priyanshiyadav2505@gmail.com' },
    to: [{ email: toEmail }],
    subject: subject,
    htmlContent: htmlContent
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[EMAIL ERROR] Brevo API Failed:', response.status, errorData);
    throw new Error('Failed to dispatch email via HTTP API.');
  }
};

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
  await sendBrevoEmail(toEmail, subject, html);
};

const sendGenericEmail = async (toEmail, subject, htmlContent) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #818cf8; margin-bottom: 0.5rem;">BBD Lost & Found</h2>
      ${htmlContent}
      <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;" />
      <p style="color: #475569; font-size: 0.8rem;">© 2026 BBD Lost & Found Platform</p>
    </div>
  `;
  await sendBrevoEmail(toEmail, subject, html);
};

module.exports = { generateOtp, sendOtpEmail, sendGenericEmail };
