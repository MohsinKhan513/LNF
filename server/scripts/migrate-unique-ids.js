/**
 * Migration script to add unique_id to existing items
 * Run this once to populate unique_id for all existing lost and found items
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Counter from '../models/Counter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrateItems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Migrate Lost Items
        const lostItems = await LostItem.find({ unique_id: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`\n📦 Found ${lostItems.length} lost items without unique_id`);

        for (const item of lostItems) {
            const counter = await Counter.findOneAndUpdate(
                { name: 'lost_item_id' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            const uniqueId = `LNF-LOST-${String(counter.seq).padStart(5, '0')}`;
            await LostItem.findByIdAndUpdate(item._id, { unique_id: uniqueId });
            console.log(`  ✓ ${item.item_name} → ${uniqueId}`);
        }

        // Migrate Found Items
        const foundItems = await FoundItem.find({ unique_id: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`\n📦 Found ${foundItems.length} found items without unique_id`);

        for (const item of foundItems) {
            const counter = await Counter.findOneAndUpdate(
                { name: 'found_item_id' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            const uniqueId = `LNF-FOUND-${String(counter.seq).padStart(5, '0')}`;
            await FoundItem.findByIdAndUpdate(item._id, { unique_id: uniqueId });
            console.log(`  ✓ ${item.item_name} → ${uniqueId}`);
        }

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateItems();
