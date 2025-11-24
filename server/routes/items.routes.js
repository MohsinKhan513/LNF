import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import User from '../models/User.js';
import { upload } from '../config/cloudinary.js';
import emailQueue from '../utils/emailQueue.js';

const router = express.Router();

// Helper function to check for matches using STRICT criteria
const checkForMatches = async (newItem, type) => {
    try {
        console.log(`\n🔍 Checking for matches for new ${type} item: "${newItem.item_name}"`);

        let matchCount = 0;
        const TargetModel = type === 'lost' ? FoundItem : LostItem;

        // Get all active items of the opposite type
        const targetItems = await TargetModel.find({ status: 'active' }).populate('user_id');

        for (const targetItem of targetItems) {
            // STRICT REQUIREMENT 1: Category must be EXACTLY the same
            if (newItem.category !== targetItem.category) {
                continue;
            }

            // STRICT REQUIREMENT 2: Location must be EXACTLY the same (case-insensitive)
            const newItemLocation = type === 'lost' ? newItem.last_known_location : newItem.location_found;
            const targetItemLocation = type === 'lost' ? targetItem.location_found : targetItem.last_known_location;

            if (newItemLocation.toLowerCase().trim() !== targetItemLocation.toLowerCase().trim()) {
                continue;
            }

            // STRICT REQUIREMENT 3: Dates must be within 2 days
            const newItemDate = type === 'lost' ? new Date(newItem.date_lost) : new Date(newItem.date_found);
            const targetItemDate = type === 'lost' ? new Date(targetItem.date_found) : new Date(targetItem.date_lost);
            const daysDiff = Math.abs((targetItemDate - newItemDate) / (1000 * 60 * 60 * 24));

            if (daysDiff > 2) {
                continue;
            }

            // STRICT REQUIREMENT 4: Names must be almost the same (70% word similarity)
            const cleanWords = (name) => {
                return name
                    .toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .split(/\s+/)
                    .filter(word => word.length > 2)
                    .filter(word => !['the', 'and', 'or', 'of', 'in', 'on', 'at'].includes(word))
                    .sort();
            };

            const newItemWords = cleanWords(newItem.item_name);
            const targetItemWords = cleanWords(targetItem.item_name);

            if (newItemWords.length === 0 || targetItemWords.length === 0) {
                continue;
            }

            const commonWords = newItemWords.filter(word => targetItemWords.includes(word));
            const totalUniqueWords = new Set([...newItemWords, ...targetItemWords]).size;
            const similarityScore = (commonWords.length / totalUniqueWords) * 100;

            // Require at least 70% similarity
            if (similarityScore < 70) {
                continue;
            }

            // ✅ ALL REQUIREMENTS MET - This is a valid match!
            matchCount++;

            const lostItem = type === 'lost' ? newItem : targetItem;
            const foundItem = type === 'lost' ? targetItem : newItem;
            const lostUser = type === 'lost' ? await User.findById(newItem.user_id) : targetItem.user_id;
            const foundUser = type === 'lost' ? targetItem.user_id : await User.findById(newItem.user_id);

            if (lostUser && foundUser) {
                console.log(`✓ Match found! "${lostItem.item_name}" ↔ "${foundItem.item_name}" (${Math.round(similarityScore)}% similar)`);
                console.log(`  Lost by: ${lostUser.email} | Found by: ${foundUser.email}`);

                // Add to email queue instead of sending immediately
                emailQueue.addToQueue({
                    lostItem,
                    foundItem,
                    lostUser,
                    foundUser
                });
            }
        }

        if (matchCount === 0) {
            console.log(`❌ No matches found for "${newItem.item_name}"`);
        } else {
            console.log(`🎉 Found ${matchCount} match(es) for "${newItem.item_name}"`);
        }
    } catch (error) {
        console.error('Error checking for matches:', error);
    }
};

// Create lost item
router.post('/lost', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { itemName, description, category, lastKnownLocation, dateLost } = req.body;
        const imagePath = req.file ? req.file.path : null;

        const lostItem = await LostItem.create({
            user_id: req.user.id,
            item_name: itemName,
            description,
            category,
            last_known_location: lastKnownLocation,
            date_lost: dateLost,
            image_path: imagePath
        });

        // Check for matches asynchronously
        checkForMatches(lostItem, 'lost');

        res.status(201).json({
            message: 'Lost item reported successfully',
            itemId: lostItem._id
        });
    } catch (error) {
        console.error('Create lost item error:', error);
        res.status(500).json({ error: 'Failed to create lost item report' });
    }
});

// Get all lost items (with filters)
router.get('/lost', async (req, res) => {
    try {
        const { keyword, category, location, dateFrom, dateTo, sort } = req.query;

        let query = { status: 'active' };

        if (keyword) {
            query.$or = [
                { item_name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (location) {
            query.last_known_location = { $regex: location, $options: 'i' };
        }

        if (dateFrom || dateTo) {
            query.date_lost = {};
            if (dateFrom) query.date_lost.$gte = new Date(dateFrom);
            if (dateTo) query.date_lost.$lte = new Date(dateTo);
        }

        const sortOrder = sort === 'oldest' ? 1 : -1;

        const items = await LostItem.find(query)
            .populate('user_id', 'full_name email status')
            .sort({ createdAt: sortOrder });

        // Filter out posts from banned users (unless requester is admin)
        const token = req.headers.authorization?.split(' ')[1];
        let isAdmin = false;

        if (token) {
            try {
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                isAdmin = decoded.role === 'admin';
            } catch (err) {
                // Token invalid or expired, treat as non-admin
            }
        }

        const filteredItems = isAdmin
            ? items
            : items.filter(item => item.user_id?.status === 'active');

        const transformedItems = filteredItems.map(item => ({
            id: item._id,
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            last_known_location: item.last_known_location,
            date_lost: item.date_lost,
            image_path: item.image_path,
            status: item.status,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            full_name: item.user_id?.full_name,
            email: item.user_id?.email,
            user_status: item.user_id?.status
        }));

        res.json(transformedItems);
    } catch (error) {
        console.error('Get lost items error:', error);
        res.status(500).json({ error: 'Failed to fetch lost items' });
    }
});

// Get user's lost items
router.get('/lost/my', authMiddleware, async (req, res) => {
    try {
        const items = await LostItem.find({ user_id: req.user.id })
            .sort({ createdAt: -1 });

        const transformedItems = items.map(item => ({
            id: item._id,
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            last_known_location: item.last_known_location,
            date_lost: item.date_lost,
            image_path: item.image_path,
            status: item.status,
            created_at: item.createdAt,
            updated_at: item.updatedAt
        }));

        res.json(transformedItems);
    } catch (error) {
        console.error('Get my lost items error:', error);
        res.status(500).json({ error: 'Failed to fetch your lost items' });
    }
});

// Get specific lost item
router.get('/lost/:id', async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id)
            .populate('user_id', 'full_name email phone_number whatsapp_number');

        if (!item) {
            return res.status(404).json({ error: 'Lost item not found' });
        }

        const transformedItem = {
            id: item._id,
            user_id: item.user_id._id,
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            last_known_location: item.last_known_location,
            date_lost: item.date_lost,
            image_path: item.image_path,
            status: item.status,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            full_name: item.user_id.full_name,
            email: item.user_id.email,
            phone_number: item.user_id.phone_number,
            whatsapp_number: item.user_id.whatsapp_number
        };

        res.json(transformedItem);
    } catch (error) {
        console.error('Get lost item error:', error);
        res.status(500).json({ error: 'Failed to fetch lost item' });
    }
});

// Update lost item
router.put('/lost/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { itemName, description, category, lastKnownLocation, dateLost } = req.body;

        const item = await LostItem.findById(req.params.id);
        if (!item || item.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = {
            item_name: itemName,
            description,
            category,
            last_known_location: lastKnownLocation,
            date_lost: dateLost
        };

        if (req.file) {
            updateData.image_path = req.file.path;
        }

        await LostItem.findByIdAndUpdate(req.params.id, updateData);

        res.json({ message: 'Lost item updated successfully' });
    } catch (error) {
        console.error('Update lost item error:', error);
        res.status(500).json({ error: 'Failed to update lost item' });
    }
});

// Mark as recovered
router.patch('/lost/:id/recover', authMiddleware, async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);
        if (!item || item.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await LostItem.findByIdAndUpdate(req.params.id, { status: 'recovered' });

        res.json({ message: 'Item marked as recovered' });
    } catch (error) {
        console.error('Mark recovered error:', error);
        res.status(500).json({ error: 'Failed to mark item as recovered' });
    }
});

// Delete lost item
router.delete('/lost/:id', authMiddleware, async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);
        if (!item || item.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await LostItem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Lost item deleted successfully' });
    } catch (error) {
        console.error('Delete lost item error:', error);
        res.status(500).json({ error: 'Failed to delete lost item' });
    }
});

// ===== FOUND ITEMS =====

// Create found item
router.post('/found', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { itemName, description, category, locationFound, dateFound } = req.body;
        const imagePath = req.file ? req.file.path : null;

        const foundItem = await FoundItem.create({
            user_id: req.user.id,
            item_name: itemName,
            description,
            category,
            location_found: locationFound,
            date_found: dateFound,
            image_path: imagePath
        });

        // Check for matches asynchronously
        checkForMatches(foundItem, 'found');

        res.status(201).json({
            message: 'Found item reported successfully',
            itemId: foundItem._id
        });
    } catch (error) {
        console.error('Create found item error:', error);
        res.status(500).json({ error: 'Failed to create found item report' });
    }
});

// Get all found items (with filters)
router.get('/found', async (req, res) => {
    try {
        const { keyword, category, location, dateFrom, dateTo, sort } = req.query;

        let query = { status: 'active' };

        if (keyword) {
            query.$or = [
                { item_name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (location) {
            query.location_found = { $regex: location, $options: 'i' };
        }

        if (dateFrom || dateTo) {
            query.date_found = {};
            if (dateFrom) query.date_found.$gte = new Date(dateFrom);
            if (dateTo) query.date_found.$lte = new Date(dateTo);
        }

        const sortOrder = sort === 'oldest' ? 1 : -1;

        const items = await FoundItem.find(query)
            .populate('user_id', 'full_name email status')
            .sort({ createdAt: sortOrder });

        // Filter out posts from banned users (unless requester is admin)
        const token = req.headers.authorization?.split(' ')[1];
        let isAdmin = false;

        if (token) {
            try {
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                isAdmin = decoded.role === 'admin';
            } catch (err) {
                // Token invalid or expired, treat as non-admin
            }
        }

        const filteredItems = isAdmin
            ? items
            : items.filter(item => item.user_id?.status === 'active');

        const transformedItems = filteredItems.map(item => ({
            id: item._id,
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            location_found: item.location_found,
            date_found: item.date_found,
            image_path: item.image_path,
            status: item.status,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            full_name: item.user_id?.full_name,
            email: item.user_id?.email,
            user_status: item.user_id?.status
        }));

        res.json(transformedItems);
    } catch (error) {
        console.error('Get found items error:', error);
        res.status(500).json({ error: 'Failed to fetch found items' });
    }
});

// Get user's found items
router.get('/found/my', authMiddleware, async (req, res) => {
    try {
        const items = await FoundItem.find({ user_id: req.user.id })
            .sort({ createdAt: -1 });

        const transformedItems = items.map(item => ({
            id: item._id,
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            location_found: item.location_found,
            date_found: item.date_found,
            image_path: item.image_path,
            status: item.status,
            created_at: item.createdAt,
            updated_at: item.updatedAt
        }));

        res.json(transformedItems);
    } catch (error) {
        console.error('Get my found items error:', error);
        res.status(500).json({ error: 'Failed to fetch your found items' });
    }
});

// Get specific found item
router.get('/found/:id', async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id)
            .populate('user_id', 'full_name email phone_number whatsapp_number');

        if (!item) {
            return res.status(404).json({ error: 'Found item not found' });
        }

        const transformedItem = {
            id: item._id,
            user_id: item.user_id._id,
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            location_found: item.location_found,
            date_found: item.date_found,
            image_path: item.image_path,
            status: item.status,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            full_name: item.user_id.full_name,
            email: item.user_id.email,
            phone_number: item.user_id.phone_number,
            whatsapp_number: item.user_id.whatsapp_number
        };

        res.json(transformedItem);
    } catch (error) {
        console.error('Get found item error:', error);
        res.status(500).json({ error: 'Failed to fetch found item' });
    }
});

// Update found item
router.put('/found/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { itemName, description, category, locationFound, dateFound } = req.body;

        const item = await FoundItem.findById(req.params.id);
        if (!item || item.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = {
            item_name: itemName,
            description,
            category,
            location_found: locationFound,
            date_found: dateFound
        };

        if (req.file) {
            updateData.image_path = req.file.path;
        }

        await FoundItem.findByIdAndUpdate(req.params.id, updateData);

        res.json({ message: 'Found item updated successfully' });
    } catch (error) {
        console.error('Update found item error:', error);
        res.status(500).json({ error: 'Failed to update found item' });
    }
});

// Delete found item
router.delete('/found/:id', authMiddleware, async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id);
        if (!item || item.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await FoundItem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Found item deleted successfully' });
    } catch (error) {
        console.error('Delete found item error:', error);
        res.status(500).json({ error: 'Failed to delete found item' });
    }
});

export default router;
