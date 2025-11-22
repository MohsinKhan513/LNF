// Quick test script to verify email configuration
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('=== Email Configuration Test ===\n');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_PASS (raw):', emailPass);
console.log('EMAIL_PASS (length):', emailPass ? emailPass.length : 0);
console.log('EMAIL_PASS (after removing spaces):', emailPass ? emailPass.replace(/\s+/g, '') : '');
console.log('EMAIL_PASS (after removing spaces, length):', emailPass ? emailPass.replace(/\s+/g, '').length : 0);

const cleanPass = emailPass ? emailPass.replace(/\s+/g, '') : '';

console.log('\n=== Creating Transporter ===\n');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: cleanPass
    }
});

console.log('Transporter created successfully!');

console.log('\n=== Verifying Connection ===\n');

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Verification failed:', error.message);
        console.error('Error code:', error.code);
    } else {
        console.log('✅ Server is ready to send emails!');
    }
    process.exit(error ? 1 : 0);
});
