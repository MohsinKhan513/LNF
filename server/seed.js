import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import LostItem from './models/LostItem.js';
import FoundItem from './models/FoundItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Categories for items
const CATEGORIES = [
    'Electronics', 'Clothing', 'Accessories', 'Documents', 'Books',
    'Sports Equipment', 'Jewelry', 'Keys', 'Bags', 'Toys',
    'Musical Instruments', 'Pet Items', 'Tools', 'Eyewear', 'Student ID'
];

// Locations on campus
const LOCATIONS = [
    'Library Main Hall', 'Student Center Cafeteria', 'Engineering Building Room 301',
    'Science Lab Block A', 'Basketball Court', 'Parking Lot B', 'Admin Block Reception',
    'Computer Lab 2', 'Auditorium Entrance', 'Garden Near Fountain', 'Gym Locker Room',
    'Bus Stop Area', 'Lecture Hall 5', 'Football Field', 'Art Studio', 'Music Room',
    'Chemistry Lab', 'Physics Department', 'Business School Building', 'Medical Center',
    'Tennis Courts', 'Swimming Pool', 'Student Housing Block C', 'Main Gate',
    'Canteen Area', 'Prayer Room', 'Conference Room A', 'Workshop Hall', 'Dance Studio',
    'Theater Room', 'Reading Room', 'Study Hall 3', 'Corridor Floor 2', 'Entrance Lobby',
    'Bathroom 1st Floor', 'Stairs Near Library', 'Elevator Block D', 'Roof Garden',
    'Biotech Lab', 'Mathematics Department', 'Economics Building', 'Law School',
    'Nursing Department', 'Pharmacy Building', 'Outdoor Seating Area', 'Bike Parking',
    'Security Office', 'Lost and Found Office', 'Maintenance Room', 'IT Support Center'
];

// Colors
const COLORS = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange',
    'Pink', 'Brown', 'Gray', 'Navy', 'Maroon', 'Beige', 'Teal', 'Silver',
    'Gold', 'Rose Gold', 'Light Blue', 'Dark Green', 'Burgundy', 'Cream',
    'Charcoal', 'Olive', 'Cyan', 'Magenta', 'Lime', 'Turquoise'
];

// Brands
const BRANDS = [
    'Samsung', 'Apple', 'HP', 'Dell', 'Lenovo', 'Nike', 'Adidas', 'Puma',
    'Casio', 'Sony', 'Canon', 'Nikon', 'JBL', 'Bose', 'Fossil', 'Titan',
    'Ray-Ban', 'Oakley', 'The North Face', 'Columbia', 'Samsonite', 'Gucci',
    'Louis Vuitton', 'Michael Kors', 'Coach', 'Unbranded', 'Generic', 'Local Brand'
];

// Item templates for lost items
const LOST_ITEM_TEMPLATES = [
    {
        name: 'Smartphone',
        category: 'Electronics',
        descriptions: [
            'Latest model with cracked screen protector',
            'Has a distinctive phone case with stickers',
            'Contains important work data',
            'With earphones attached',
            'Has my name engraved on the back'
        ]
    },
    {
        name: 'Laptop',
        category: 'Electronics',
        descriptions: [
            'Contains important project files',
            'Has multiple stickers on the lid',
            'Silver colored with minor scratches',
            'In a black laptop bag',
            'With university ID sticker'
        ]
    },
    {
        name: 'Backpack',
        category: 'Bags',
        descriptions: [
            'Contains textbooks and notebooks',
            'Has a broken zipper on the front pocket',
            'With a keychain attached',
            'Contains my lunch box',
            'Has my initials embroidered'
        ]
    },
    {
        name: 'Wallet',
        category: 'Accessories',
        descriptions: [
            'Contains important cards and cash',
            'Leather wallet with my ID inside',
            'Has a photo of my family',
            'Brown leather with card slots',
            'Contains my student ID'
        ]
    },
    {
        name: 'Textbook',
        category: 'Books',
        descriptions: [
            'Heavily annotated with notes',
            'Has my name written on first page',
            'Contains important bookmarks',
            'Worn cover with highlights inside',
            'For my current semester course'
        ]
    },
    {
        name: 'Water Bottle',
        category: 'Accessories',
        descriptions: [
            'Stainless steel with dents',
            'Has university logo sticker',
            'Contains motivational quotes',
            'Insulated bottle with straw',
            'Unique design pattern'
        ]
    },
    {
        name: 'Headphones',
        category: 'Electronics',
        descriptions: [
            'Wireless with charging case',
            'Over-ear with cushioned pads',
            'Bluetooth earbuds in case',
            'Noise-canceling feature',
            'With personalized case'
        ]
    },
    {
        name: 'Watch',
        category: 'Accessories',
        descriptions: [
            'Smart watch with fitness tracker',
            'Analog with leather strap',
            'Digital sports watch',
            'Has sentimental value',
            'Gift from parents'
        ]
    },
    {
        name: 'Jacket',
        category: 'Clothing',
        descriptions: [
            'Denim with patches',
            'Winter jacket with hood',
            'Varsity jacket with team logo',
            'Leather jacket with zippers',
            'Contains items in pockets'
        ]
    },
    {
        name: 'Umbrella',
        category: 'Accessories',
        descriptions: [
            'Automatic open/close mechanism',
            'Large golf umbrella',
            'Compact foldable design',
            'Colorful pattern',
            'With wooden handle'
        ]
    },
    {
        name: 'Calculator',
        category: 'Electronics',
        descriptions: [
            'Scientific calculator for exams',
            'Graphing calculator',
            'Has my name sticker',
            'Used for engineering courses',
            'Essential for finals'
        ]
    },
    {
        name: 'Glasses',
        category: 'Eyewear',
        descriptions: [
            'Prescription glasses in case',
            'Sunglasses with UV protection',
            'Reading glasses',
            'Has unique frame design',
            'Cannot see without them'
        ]
    },
    {
        name: 'USB Drive',
        category: 'Electronics',
        descriptions: [
            'Contains important assignments',
            'Has unique keychain attached',
            '32GB with project files',
            'Blue colored flash drive',
            'Contains thesis backup'
        ]
    },
    {
        name: 'Notebook',
        category: 'Books',
        descriptions: [
            'Contains lecture notes',
            'Journal with personal entries',
            'Sketch book with drawings',
            'Lab report notebook',
            'Has personalized cover'
        ]
    },
    {
        name: 'ID Card',
        category: 'Documents',
        descriptions: [
            'Student ID with photo',
            'Library card',
            'Access card for labs',
            'Bus pass card',
            'Combo ID with multiple access'
        ]
    },
    {
        name: 'Keys',
        category: 'Keys',
        descriptions: [
            'House keys with keyring',
            'Car keys with remote',
            'Locker keys',
            'Has multiple keys on chain',
            'With distinctive keychain'
        ]
    },
    {
        name: 'Charger',
        category: 'Electronics',
        descriptions: [
            'Phone charger with cable',
            'Laptop power adapter',
            'Portable power bank',
            'Multi-device charging hub',
            'Has my name written on it'
        ]
    },
    {
        name: 'Sports Equipment',
        category: 'Sports Equipment',
        descriptions: [
            'Basketball with my signature',
            'Tennis racket in bag',
            'Soccer ball',
            'Yoga mat in carrier',
            'Swimming goggles'
        ]
    },
    {
        name: 'Lunchbox',
        category: 'Accessories',
        descriptions: [
            'Insulated food container',
            'Bento box with compartments',
            'Thermos food jar',
            'Has stickers on lid',
            'Contains utensils'
        ]
    },
    {
        name: 'Scarf',
        category: 'Clothing',
        descriptions: [
            'Wool scarf with pattern',
            'Silk scarf',
            'Winter scarf with fringes',
            'Team colors scarf',
            'Handmade by grandmother'
        ]
    }
];

// Generate random date within last 30 days
function getRandomDate() {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date;
}

// Get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Generate unique item name
// UPDATED: Does NOT add to the Set automatically. Checks provided set for existence.
function generateUniqueItemName(template, index, usedNames) {
    const color = getRandomElement(COLORS);
    const brand = getRandomElement(BRANDS);

    let itemName;
    do {
        const variation = Math.random();
        if (variation < 0.33) {
            itemName = `${color} ${brand} ${template.name}`;
        } else if (variation < 0.66) {
            itemName = `${brand} ${template.name} (${color})`;
        } else {
            itemName = `${template.name} - ${color} ${brand}`;
        }
    } while (usedNames.has(itemName));

    return itemName;
}

// Generate unique description
// UPDATED: Does NOT add to the Set automatically.
function generateUniqueDescription(template, itemName, usedDescriptions) {
    let description;
    do {
        const baseDesc = getRandomElement(template.descriptions);
        const additionalDetails = [
            `Desperately need this back. `,
            `Lost during rush hour. `,
            `Has great sentimental value. `,
            `Reward offered for return. `,
            `Contains important information. `,
            `Please contact if found. `,
            `Last seen at mentioned location. `,
            `Very urgent to find. `,
            ``
        ];
        const detail = getRandomElement(additionalDetails);
        description = `${detail}${baseDesc}. Item: ${itemName}`;
    } while (usedDescriptions.has(description));

    return description;
}

// Connect to database
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Main seed function
async function seedItems() {
    try {
        console.log('🌱 Starting seed process...\n');

        // Connect to database
        await connectDB();

        // Find admin user
        // CHANGE EMAIL HERE IF NEEDED
        const adminUser = await User.findOne({ email: 'mohsinkhansial786@gmail.com' });
        if (!adminUser) {
            console.error('❌ Admin user not found. Please make sure admin account exists.');
            process.exit(1);
        }
        console.log(`✅ Found admin user: ${adminUser.full_name}\n`);

        // Track used names and descriptions to ensure uniqueness
        const usedLostNames = new Set();
        const usedFoundNames = new Set();
        const usedLostDescriptions = new Set();
        const usedFoundDescriptions = new Set();
        const usedLocations = new Set();

        // ------------------------------------------------
        // 1. Create 50 LOST items
        // ------------------------------------------------
        console.log('📦 Creating 50 lost items...');
        const lostItems = [];
        for (let i = 0; i < 50; i++) {
            const template = getRandomElement(LOST_ITEM_TEMPLATES);

            // Generate Name
            const itemName = generateUniqueItemName(template, i, usedLostNames);
            usedLostNames.add(itemName); // Add to set manually

            // Generate Description
            const description = generateUniqueDescription(template, itemName, usedLostDescriptions);
            usedLostDescriptions.add(description); // Add to set manually

            // Get unique location
            let location;
            do {
                location = getRandomElement(LOCATIONS);
            } while (usedLocations.has(`lost_${location}_${itemName}`));
            usedLocations.add(`lost_${location}_${itemName}`);

            const lostItem = new LostItem({
                user_id: adminUser._id,
                item_name: itemName,
                description: description,
                category: template.category,
                last_known_location: location,
                date_lost: getRandomDate(),
                image_path: null,
                status: 'active'
            });

            await lostItem.save();
            lostItems.push(lostItem);

            if ((i + 1) % 10 === 0) {
                console.log(`   ✓ Created ${i + 1} lost items`);
            }
        }
        console.log('✅ Successfully created 50 lost items\n');

        // ------------------------------------------------
        // 2. Create 50 FOUND items
        // ------------------------------------------------
        console.log('📦 Creating 50 found items...');
        const foundItems = [];
        for (let i = 0; i < 50; i++) {
            const template = getRandomElement(LOST_ITEM_TEMPLATES);
            let itemName;

            // CRITICAL FIX: Ensure name is unique in 'Found' set AND doesn't exist in 'Lost' set
            do {
                // Generate a name that is unique within usedFoundNames
                itemName = generateUniqueItemName(template, i + 50, usedFoundNames);
            } while (usedLostNames.has(itemName)); // Keep retrying if this name exists in Lost items

            usedFoundNames.add(itemName); // Add to set manually

            const description = generateUniqueDescription(template, itemName, usedFoundDescriptions);
            usedFoundDescriptions.add(description); // Add to set manually

            // Get unique location
            let location;
            do {
                location = getRandomElement(LOCATIONS);
            } while (usedLocations.has(`found_${location}_${itemName}`));
            usedLocations.add(`found_${location}_${itemName}`);

            const foundItem = new FoundItem({
                user_id: adminUser._id,
                item_name: itemName,
                description: description,
                category: template.category,
                location_found: location,
                date_found: getRandomDate(),
                image_path: null,
                status: 'active'
            });

            await foundItem.save();
            foundItems.push(foundItem);

            if ((i + 1) % 10 === 0) {
                console.log(`   ✓ Created ${i + 1} found items`);
            }
        }
        console.log('✅ Successfully created 50 found items\n');

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n📊 Summary:`);
        console.log(`   • Total Lost Items: ${lostItems.length}`);
        console.log(`   • Total Found Items: ${foundItems.length}`);
        console.log(`   • Total Items: ${lostItems.length + foundItems.length}`);
        console.log(`   • Posted by: ${adminUser.email}`);
        console.log(`   • All items are unique (no matches)`);
        console.log(`\n✨ You can now view these items in your application!`);
        console.log(`\n🗑️  To delete all seeded data, run: node seed.js --delete\n`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Delete function
async function deleteSeededData() {
    try {
        console.log('🗑️  Starting deletion process...\n');

        // Connect to database
        await connectDB();

        // Find admin user
        const adminUser = await User.findOne({ email: 'mohsinkhansial786@gmail.com' });
        if (!adminUser) {
            console.error('❌ Admin user not found.');
            process.exit(1);
        }

        // Delete all items posted by admin
        const deletedLost = await LostItem.deleteMany({ user_id: adminUser._id });
        const deletedFound = await FoundItem.deleteMany({ user_id: adminUser._id });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DELETION COMPLETED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n📊 Summary:`);
        console.log(`   • Deleted Lost Items: ${deletedLost.deletedCount}`);
        console.log(`   • Deleted Found Items: ${deletedFound.deletedCount}`);
        console.log(`   • Total Deleted: ${deletedLost.deletedCount + deletedFound.deletedCount}`);
        console.log(`\n✨ All seeded data has been removed!\n`);

    } catch (error) {
        console.error('❌ Error deleting data:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--delete') || args.includes('-d')) {
    deleteSeededData();
} else {
    seedItems();
}