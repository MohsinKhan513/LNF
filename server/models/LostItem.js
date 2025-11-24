import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    last_known_location: {
        type: String,
        required: true
    },
    date_lost: {
        type: Date,
        required: true
    },
    image_path: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'recovered'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes for search performance
lostItemSchema.index({ item_name: 1 });
lostItemSchema.index({ category: 1 });
lostItemSchema.index({ status: 1 });
lostItemSchema.index({ user_id: 1 });

export default mongoose.model('LostItem', lostItemSchema);
