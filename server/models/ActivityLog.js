import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for user actions, populated for admin actions
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // For tracking user who created/edited item
    },
    action_type: {
        type: String,
        required: true,
        enum: [
            'create_item',
            'edit_item',
            'delete_item',
            'recover_item',
            'close_item',
            'close',
            'view_item',
            'admin_view_item',
            'ban_user',
            'unban_user',
            'system'
        ]
    },
    item_type: {
        type: String,
        required: true,
        enum: ['lost', 'found', 'user', 'system']
    },
    item_id: {
        type: String,
        required: true
    },
    item_unique_id: {
        type: String,
        default: null // Human-readable ID like LNF-LOST-00001
    },
    item_name: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: null // For storing additional details
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ item_id: 1 });
activityLogSchema.index({ item_unique_id: 1 });
activityLogSchema.index({ admin_id: 1 });
activityLogSchema.index({ user_id: 1 });
activityLogSchema.index({ action_type: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
