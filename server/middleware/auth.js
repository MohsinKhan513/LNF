import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database to check current status
        const user = await User.findById(decoded.id).select('-password_hash');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if user is banned
        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
