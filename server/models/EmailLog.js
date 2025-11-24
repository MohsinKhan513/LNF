import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
    recipient_email: {
        type: String,
        required: true
    },
    recipient_name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    email_type: {
        type: String,
        enum: ['registration_otp', 'password_reset_otp', 'match_notification', 'general'],
        default: 'general'
    },
    is_sensitive: {
        type: Boolean,
        default: false,
        // Sensitive emails (containing OTPs) should NEVER have their content exposed to admins
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    error_message: {
        type: String
    },
    sent_at: {
        type: Date,
        default: Date.now
    }
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;
