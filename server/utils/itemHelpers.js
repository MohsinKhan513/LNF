import Counter from '../models/Counter.js';

/**
 * Generate unique ID for items
 * @param {string} type - 'lost' or 'found'
 * @returns {Promise<string>} - Unique ID like LNF-LOST-00001
 */
export const generateUniqueId = async (type) => {
    try {
        const counterName = type === 'lost' ? 'lost_item_id' : 'found_item_id';

        // Find and increment counter atomically
        const counter = await Counter.findOneAndUpdate(
            { name: counterName },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const prefix = type === 'lost' ? 'LNF-LOST-' : 'LNF-FOUND-';
        const paddedNumber = String(counter.seq).padStart(5, '0');

        return `${prefix}${paddedNumber}`;
    } catch (error) {
        console.error('Error generating unique ID:', error);
        throw error;
    }
};

/**
 * Log activity for audit trail
 * @param {Object} params - Activity log parameters
 */
export const logActivity = async ({
    adminId = null,
    userId = null,
    actionType,
    itemType,
    itemId,
    itemUniqueId = null,
    itemName = null,
    description = null,
    metadata = null
}) => {
    try {
        const ActivityLog = (await import('../models/ActivityLog.js')).default;

        await ActivityLog.create({
            admin_id: adminId,
            user_id: userId,
            action_type: actionType,
            item_type: itemType,
            item_id: itemId,
            item_unique_id: itemUniqueId,
            item_name: itemName,
            description,
            metadata
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw - logging shouldn't break main operations
    }
};
