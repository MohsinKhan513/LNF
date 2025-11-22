import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/email.js';

const router = express.Router();

// Step 1: Request OTP for registration
router.post('/register/request-otp', async (req, res) => {
    try {
        const { email, fullName } = req.body;

        // Validate university email - allow multiple domains
        const allowedDomains = ['isb.nu.edu.pk', 'nu.edu.pk', 'gmail.com'];
        const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));

        if (!isValidDomain) {
            return res.status(400).json({
                error: `Please use your university email (${allowedDomains.join(', ')})`
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email });

        // Save OTP with 5-minute expiration
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await OTP.create({
            email,
            otp,
            expiresAt
        });

        // Send OTP email
        const emailSent = await sendOTPEmail(email, fullName, otp);

        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
        }

        res.json({
            message: 'OTP sent to your email. Please check your inbox.',
            email
        });
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Step 2: Verify OTP and complete registration
router.post('/register/verify-otp', async (req, res) => {
    try {
        const { email, otp, password, fullName, phoneNumber } = req.body;

        // Validate university email - allow multiple domains
        const allowedDomains = ['isb.nu.edu.pk', 'nu.edu.pk', 'gmail.com'];
        const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));

        if (!isValidDomain) {
            return res.status(400).json({
                error: `Please use your university email (${allowedDomains.join(', ')})`
            });
        }

        // Validate phone number
        if (!phoneNumber || phoneNumber.trim() === '') {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Find OTP
        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid OTP code' });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password_hash: passwordHash,
            full_name: fullName,
            phone_number: phoneNumber
        });

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.full_name,
                phoneNumber: user.phone_number,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Test endpoint to verify email configuration
router.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({
                error: 'Email credentials not configured',
                details: {
                    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
                    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
                }
            });
        }

        // Generate test OTP
        const testOTP = '123456';

        // Try to send email
        const emailSent = await sendOTPEmail(email, 'Test User', testOTP);

        if (emailSent) {
            res.json({
                message: 'Test email sent successfully!',
                email,
                note: 'Check your inbox for the test OTP email'
            });
        } else {
            res.status(500).json({
                error: 'Failed to send test email',
                note: 'Check server logs for details'
            });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            error: 'Test email failed',
            message: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user is banned
        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Your account has been suspended' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                phoneNumber: user.phone_number,
                whatsappNumber: user.whatsapp_number
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Reset password (simplified - sends new password via email in production)
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        // In production, send email with reset token
        // For now, just return success
        res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

export default router;
