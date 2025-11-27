import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';

const router = express.Router();

// Get activity logs for a specific item
router.get('/item/:itemType/:itemId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { itemType, itemId } = req.params;

        // Validate item type
        if (!['lost', 'found'].includes(itemType)) {
            return res.status(400).json({ error: 'Invalid item type' });
        }

        // First, check if there are any activity logs for this item
        const logs = await ActivityLog.find({ item_id: itemId })
            .populate('admin_id', 'full_name email')
            .populate('user_id', 'full_name email')
            .sort({ createdAt: -1 });

        if (logs.length === 0) {
            return res.status(404).json({ error: 'No activity logs found for this item' });
        }

        // Try to get item details
        const ItemModel = itemType === 'lost' ? LostItem : FoundItem;
        const item = await ItemModel.findById(itemId).populate('user_id');

        // If item exists, return full details
        if (item) {
            return res.json({
                item: {
                    id: item._id,
                    unique_id: item.unique_id,
                    item_name: item.item_name,
                    category: item.category,
                    status: item.status,
                    reporter: {
                        id: item.user_id._id,
                        full_name: item.user_id.full_name,
                        email: item.user_id.email
                    },
                    created_at: item.createdAt,
                    is_deleted: false
                },
                activity_logs: logs.map(log => ({
                    id: log._id,
                    action_type: log.action_type,
                    description: log.description,
                    performed_by: log.admin_id || log.user_id,
                    is_admin_action: !!log.admin_id,
                    timestamp: log.createdAt,
                    metadata: log.metadata
                }))
            });
        }

        // Item was deleted - reconstruct from activity logs
        const firstLog = logs[logs.length - 1]; // Oldest log (creation)
        const deletionLog = logs.find(log => log.action_type === 'delete_item');

        return res.json({
            item: {
                id: itemId,
                unique_id: firstLog.item_unique_id || 'Unknown',
                item_name: firstLog.item_name || 'Deleted Item',
                category: 'Unknown',
                status: 'deleted',
                reporter: firstLog.user_id ? {
                    id: firstLog.user_id._id,
                    full_name: firstLog.user_id.full_name,
                    email: firstLog.user_id.email
                } : {
                    id: null,
                    full_name: 'Unknown',
                    email: 'Unknown'
                },
                created_at: firstLog.createdAt,
                is_deleted: true,
                deleted_at: deletionLog?.createdAt,
                deleted_by: deletionLog?.admin_id || deletionLog?.user_id
            },
            activity_logs: logs.map(log => ({
                id: log._id,
                action_type: log.action_type,
                description: log.description,
                performed_by: log.admin_id || log.user_id,
                is_admin_action: !!log.admin_id,
                timestamp: log.createdAt,
                metadata: log.metadata
            }))
        });
    } catch (error) {
        console.error('Get item activity logs error:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Get all activity logs (paginated)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 50, itemType, actionType } = req.query;

        let query = {};
        if (itemType) query.item_type = itemType;
        if (actionType) query.action_type = actionType;

        const logs = await ActivityLog.find(query)
            .populate('admin_id', 'full_name email')
            .populate('user_id', 'full_name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await ActivityLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLogs: count
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

export default router;
