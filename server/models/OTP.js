import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
    }
}, {
    timestamps: true
});

// Index for faster lookups
otpSchema.index({ email: 1, otp: 1 });

export default mongoose.model('OTP', otpSchema);
