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
