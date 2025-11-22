import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action_type: {
        type: String,
        required: true
    },
    item_type: {
        type: String,
        required: true
    },
    item_id: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model('ActivityLog', activityLogSchema);
