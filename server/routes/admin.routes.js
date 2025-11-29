import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import EmailLog from '../models/EmailLog.js';
import emailQueue from '../utils/emailQueue.js';
import { logActivity } from '../utils/itemHelpers.js';

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
                unique_id: item.unique_id,
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
                unique_id: item.unique_id,
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
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            userType,        // 'admin', 'user', or undefined (all)
            actionType,      // Filter by specific action type
            itemType,        // Filter by item type (lost, found, user, system)
            startDate,       // Filter by start date (YYYY-MM-DD)
            endDate,         // Filter by end date (YYYY-MM-DD)
            limit = 50
        } = req.query;

        // Build filter query
        const filter = {};

        // Filter by user type
        if (userType === 'admin') {
            filter.admin_id = { $ne: null }; // Only admin actions
        } else if (userType === 'user') {
            filter.admin_id = null; // Only user actions
            filter.user_id = { $ne: null };
        }

        // Filter by action type
        if (actionType) {
            filter.action_type = actionType;
        }

        // Filter by item type
        if (itemType) {
            filter.item_type = itemType;
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.createdAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        // Build sort object
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sort = { createdAt: sortDirection };

        const logs = await ActivityLog.find(filter)
            .populate('admin_id', 'full_name')
            .populate('user_id', 'full_name')
            .sort(sort)
            .limit(parseInt(limit));

        const transformedLogs = logs.map(log => ({
            id: log._id,
            admin_name: log.admin_id?.full_name || log.user_id?.full_name || 'Unknown',
            action_type: log.action_type,
            description: log.description,
            item_id: log.item_id,
            item_type: log.item_type,
            item_unique_id: log.item_unique_id,
            item_name: log.item_name,
            is_admin_action: !!log.admin_id,
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

        // Transform logs to mask sensitive content
        const sanitizedLogs = logs.map(log => {
            const logObj = log.toObject();

            // If email is sensitive (contains OTP), mask the content
            if (logObj.is_sensitive) {
                logObj.content = '[SENSITIVE CONTENT HIDDEN - OTP Email]';
                logObj.content_masked = true;
            } else {
                logObj.content_masked = false;
            }

            return logObj;
        });

        res.json(sanitizedLogs);
    } catch (error) {
        console.error('Get email logs error:', error);
        res.status(500).json({ error: 'Failed to fetch email logs' });
    }
});

// Get auto-matched items (STRICT matching - name similarity, exact category, exact location, close dates)
router.get('/matches', async (req, res) => {
    try {
        const lostItems = await LostItem.find({ status: 'active' });
        const foundItems = await FoundItem.find({ status: 'active' });

        const matches = [];

        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                // STRICT REQUIREMENT 1: Category must be EXACTLY the same
                if (lost.category !== found.category) {
                    return; // Skip this pair
                }

                // STRICT REQUIREMENT 2: Location must be EXACTLY the same (case-insensitive)
                if (lost.last_known_location.toLowerCase().trim() !== found.location_found.toLowerCase().trim()) {
                    return; // Skip this pair
                }

                // STRICT REQUIREMENT 3: Dates must be within 2 days
                const lostDate = new Date(lost.date_lost);
                const foundDate = new Date(found.date_found);
                const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));

                if (daysDiff > 2) {
                    return; // Skip this pair - dates too far apart
                }

                // STRICT REQUIREMENT 4: Names must be almost the same (same words, any order)
                // Extract words from both names (lowercase, remove special chars, filter out common words)
                const cleanWords = (name) => {
                    // Common short words to exclude (articles, prepositions, conjunctions)
                    const commonShortWords = ['a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'is', 'it'];

                    return name
                        .toLowerCase()
                        .replace(/[^\w\s]/g, '') // Remove special characters
                        .split(/\s+/)
                        .filter(word => word.length > 0) // Only filter out empty strings
                        .filter(word => !commonShortWords.includes(word)) // Filter specific common words
                        .sort(); // Sort for easy comparison
                };

                const lostWords = cleanWords(lost.item_name);
                const foundWords = cleanWords(found.item_name);

                // Check if both items have meaningful words
                if (lostWords.length === 0 || foundWords.length === 0) {
                    return; // Skip if no meaningful words
                }

                // Calculate similarity: how many words are common between the two names
                const commonWords = lostWords.filter(word => foundWords.includes(word));
                const totalUniqueWords = new Set([...lostWords, ...foundWords]).size;

                // Calculate similarity percentage
                const similarityScore = (commonWords.length / totalUniqueWords) * 100;

                // REQUIRE at least 70% word similarity (most words must match)
                if (similarityScore < 70) {
                    return; // Names are not similar enough
                }

                // Calculate confidence score based on how well everything matches
                let confidenceScore = 0;

                // Base score for meeting all requirements
                confidenceScore += 40;

                // Bonus for name similarity (0-40 points)
                confidenceScore += Math.floor(similarityScore * 0.4);

                // Bonus for date proximity (0-20 points)
                if (daysDiff === 0) {
                    confidenceScore += 20; // Same day
                } else if (daysDiff <= 1) {
                    confidenceScore += 10; // Within 1 day
                } else {
                    confidenceScore += 5; // Within 2 days
                }

                // THIS IS A VALID MATCH - Add to results
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
                    confidenceScore: Math.min(Math.round(confidenceScore), 100),
                    matchDetails: {
                        nameSimilarity: Math.round(similarityScore),
                        dateDifference: Math.round(daysDiff),
                        categoryMatch: true,
                        locationMatch: true
                    }
                });
            });
        });

        // Sort by confidence score (highest first)
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

        const item = await Model.findById(id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        await Model.findByIdAndUpdate(id, { status });

        // Log activity
        await logActivity({
            adminId: req.user.id,
            actionType: 'close',
            itemType: type,
            itemId: id,
            itemUniqueId: item.unique_id,
            itemName: item.item_name,
            description: `Admin marked item as ${status}`
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

        // Log activity before deletion
        await logActivity({
            adminId: req.user.id,
            actionType: 'delete_item',
            itemType: 'lost',
            itemId: req.params.id,
            itemUniqueId: item.unique_id,
            itemName: item.item_name,
            description: `Admin deleted lost item`
        });

        await LostItem.findByIdAndDelete(req.params.id);

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

        // Log activity before deletion
        await logActivity({
            adminId: req.user.id,
            actionType: 'delete_item',
            itemType: 'found',
            itemId: req.params.id,
            itemUniqueId: item.unique_id,
            itemName: item.item_name,
            description: `Admin deleted found item`
        });

        await FoundItem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Found item deleted successfully' });
    } catch (error) {
        console.error('Admin delete found item error:', error);
        res.status(500).json({ error: 'Failed to delete found item' });
    }
});

// ===== EMAIL QUEUE MANAGEMENT =====

// Get email queue status
router.get('/email-queue/status', (req, res) => {
    try {
        const status = emailQueue.getStatus();
        res.json(status);
    } catch (error) {
        console.error('Get queue status error:', error);
        res.status(500).json({ error: 'Failed to get queue status' });
    }
});

// Clear sent matches history (for testing/re-seeding)
router.post('/email-queue/clear-history', async (req, res) => {
    try {
        emailQueue.clearHistory();

        // Log activity
        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'system',
            description: 'Cleared email queue sent matches history'
        });

        res.json({ message: 'Email queue history cleared successfully' });
    } catch (error) {
        console.error('Clear queue history error:', error);
        res.status(500).json({ error: 'Failed to clear queue history' });
    }
});

// Clear email queue (emergency stop)
router.post('/email-queue/clear', async (req, res) => {
    try {
        const cleared = emailQueue.clearQueue();

        // Log activity
        await ActivityLog.create({
            admin_id: req.user.id,
            action_type: 'system',
            description: `Cleared ${cleared} emails from queue`
        });

        res.json({
            message: 'Email queue cleared successfully',
            clearedCount: cleared
        });
    } catch (error) {
        console.error('Clear queue error:', error);
        res.status(500).json({ error: 'Failed to clear queue' });
    }
});

export default router;
