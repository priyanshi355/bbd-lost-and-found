require('dotenv').config();
const { sendOtpEmail } = require('./utils/emailService');

const run = async () => {
    try {
        console.log('Sending test OTP...');
        await sendOtpEmail('priyanshiyadav2505@gmail.com', '123456', 'Test OTP', 'Test');
        console.log('OTP Sent successfully');
    } catch (err) {
        console.error('Error sending OTP:', err);
    }
};

run();
