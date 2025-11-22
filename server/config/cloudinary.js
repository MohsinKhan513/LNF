import dotenv from 'dotenv';
dotenv.config(); // Load env vars immediately when this module is imported

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

let storage;
let uploadInstance;

// Lazy initialization function
const initializeCloudinary = () => {
    if (uploadInstance) return uploadInstance; // Already initialized

    console.log('🔍 Cloudinary Config Debug:');
    console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
    console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'undefined');

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Configure Cloudinary storage for Multer
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lost-and-found', // Folder name in Cloudinary
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [
                { width: 800, height: 800, crop: 'limit' }, // Resize large images
                { quality: 'auto' } // Automatic quality optimization
            ]
        }
    });

    // Configure Multer with Cloudinary storage
    uploadInstance = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    return uploadInstance;
};

// Export a getter that initializes on first use
export { cloudinary };
export const getUpload = () => initializeCloudinary();
// For backward compatibility, export upload as a getter
export const upload = {
    single: (fieldName) => {
        const uploader = initializeCloudinary();
        return uploader.single(fieldName);
    }
};

