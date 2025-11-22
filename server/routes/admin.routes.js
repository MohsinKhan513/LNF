import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import EmailLog from '../models/EmailLog.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Get dashboard overview
router.get('/dashboard', async (req, res) => {
    try {
        const activeLost = await LostItem.countDocuments({ status: 'active' });
        const activeFound = await FoundItem.countDocuments({ status: 'active' });
        const recovered = await LostItem.countDocuments({ status: 'recovered' });
        const closed = await FoundItem.countDocuments({ status: 'closed' });

        const recentLost = await LostItem.find()
            .populate('user_id', 'full_name email role status')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentFound = await FoundItem.find()
            .populate('user_id', 'full_name email role status')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            stats: {
                activeLost,
                activeFound,
                recovered,
                closed
            },
            recentLost: recentLost.map(item => ({
                id: item._id,
                item_name: item.item_name,
                description: item.description,
                category: item.category,
                last_known_location: item.last_known_location,
                date_lost: item.date_lost,
                image_path: item.image_path,
                status: item.status,
                created_at: item.createdAt,
                user_id: item.user_id?._id,
                full_name: item.user_id?.full_name,
                email: item.user_id?.email,
                user_role: item.user_id?.role,
                user_status: item.user_id?.status
            })),
            recentFound: recentFound.map(item => ({
                id: item._id,
                item_name: item.item_name,
                description: item.description,
                category: item.category,
                location_found: item.location_found,
                date_found: item.date_found,
                image_path: item.image_path,
                status: item.status,
                created_at: item.createdAt,
                user_id: item.user_id?._id,
                full_name: item.user_id?.full_name,
                email: item.user_id?.email,
                user_role: item.user_id?.role,
                user_status: item.user_id?.status
            }))
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get activity history
router.get('/history', async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('admin_id', 'full_name')
            .sort({ createdAt: -1 })
            .limit(50);

        const transformedLogs = logs.map(log => ({
            id: log._id,
            admin_name: log.admin_id?.full_name || 'Unknown',
            action_type: log.action_type,
            description: log.description,
            created_at: log.createdAt
        }));

        res.json(transformedLogs);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password_hash').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get specific user profile (admin only)
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password_hash');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user._id,
            email: user.email,
            full_name: user.full_name,
            phone_number: user.phone_number,
            whatsapp_number: user.whatsapp_number,
            role: user.role,
            status: user.status,
            created_at: user.createdAt
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Get email logs
router.get('/email-logs', async (req, res) => {
    try {
        const logs = await EmailLog.find().sort({ sent_at: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        console.error('Get email logs error:', error);
        res.status(500).json({ error: 'Failed to fetch email logs' });
    }
});

// Get auto-matched items (simple keyword matching)
router.get('/matches', async (req, res) => {
    try {
        const lostItems = await LostItem.find({ status: 'active' });
        const foundItems = await FoundItem.find({ status: 'active' });

        const matches = [];

        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                let score = 0;

                // Match by category
                if (lost.category === found.category) score += 30;

                // Match by keywords in name
                const lostWords = lost.item_name.toLowerCase().split(' ');
                const foundWords = found.item_name.toLowerCase().split(' ');
                const commonWords = lostWords.filter(word => foundWords.includes(word));
                score += commonWords.length * 20;

                // Match by location proximity (simple string matching)
                if (lost.last_known_location.toLowerCase() === found.location_found.toLowerCase()) {
                    score += 25;
                }

                // Match by date proximity (within 7 days)
                const lostDate = new Date(lost.date_lost);
                const foundDate = new Date(found.date_found);
                const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 7) score += 25;

                // If score is high enough, consider it a match
                if (score >= 50) {
                    matches.push({
                        lostItem: {
                            id: lost._id,
                            item_name: lost.item_name,
                            description: lost.description,
                            last_known_location: lost.last_known_location,
                            date_lost: lost.date_lost
                        },
                        foundItem: {
                            id: found._id,
                            item_name: found.item_name,
                            description: found.description,
                            location_found: found.location_found,
                            date_found: found.date_found
                        },
                        confidenceScore: Math.min(score, 100)
                    });
                }
            });
        });

        // Sort by confidence score
        matches.sort((a, b) => b.confidenceScore - a.confidenceScore);

        res.json(matches);
    } catch (error) {
        console.error('Matches error:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// Mark found item as closed
router.patch('/close/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = type === 'lost' ? LostItem : FoundItem;
        const status = type === 'lost' ? 'recovered' : 'closed';

        await Model.findByIdAndUpdate(id, { status });

        // Log activity
        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'close',
            item_type: type,
            item_id: id,
            description: `Item marked as ${status}`
        });

        res.json({ message: `Item marked as ${status}` });
    } catch (error) {
        console.error('Close item error:', error);
        res.status(500).json({ error: 'Failed to close item' });
    }
});

// Ban user
router.post('/ban/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from banning themselves
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'You cannot ban your own account' });
        }

        await User.findByIdAndUpdate(userId, { status: 'banned' });

        // Log activity
        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'ban_user',
            item_type: 'user',
            item_id: userId,
            description: 'User account banned'
        });

        res.json({ message: 'User banned successfully' });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

// Unban user
router.post('/unban/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await User.findByIdAndUpdate(userId, { status: 'active' });

        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'unban_user',
            item_type: 'user',
            item_id: userId,
            description: 'User account unbanned'
        });

        res.json({ message: 'User unbanned successfully' });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ error: 'Failed to unban user' });
    }
});

// Admin: Delete any user's lost item
router.delete('/items/lost/:id', async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        await LostItem.findByIdAndDelete(req.params.id);

        // Log activity
        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'delete_item',
            item_type: 'lost',
            item_id: req.params.id,
            description: `Deleted lost item: ${item.item_name}`
        });

        res.json({ message: 'Lost item deleted successfully' });
    } catch (error) {
        console.error('Admin delete lost item error:', error);
        res.status(500).json({ error: 'Failed to delete lost item' });
    }
});

// Admin: Delete any user's found item
router.delete('/items/found/:id', async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        await FoundItem.findByIdAndDelete(req.params.id);

        // Log activity
        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'delete_item',
            item_type: 'found',
            item_id: req.params.id,
            description: `Deleted found item: ${item.item_name}`
        });

        res.json({ message: 'Found item deleted successfully' });
    } catch (error) {
        console.error('Admin delete found item error:', error);
        res.status(500).json({ error: 'Failed to delete found item' });
    }
});

export default router;
