import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- SMTP TEST ---');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', (process.env.EMAIL_PASS || '').length);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function run() {
    try {
        console.log('Connecting to SMTP server...');
        await transporter.verify();
        console.log('✅ Connection successful! Your SMTP settings are correct.');

        const mailOptions = {
            from: `"TAZDAYTH TEST" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SMTP Test - TAZDAYTH',
            text: 'If you see this, your email configuration is working perfectly!',
        };

        console.log('Sending test email...');
        await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully to your own address.');
    } catch (error: any) {
        console.error('❌ SMTP Error:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Possible reason: Incorrect App Password or Email.');
        } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
            console.error('Possible reason: Port 465 is blocked by your firewall or ISP.');
        }
    }
}

run();
