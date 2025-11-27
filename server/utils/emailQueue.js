/**
 * Email Queue System with Rate Limiting
 * 
 * This module manages email notifications for item matches, preventing
 * email server overload by implementing:
 * - Queue-based processing
 * - Rate limiting (configurable delay between emails)
 * - Duplicate detection (tracks already-sent match pairs)
 * - Batch processing
 */

import { sendMatchNotification, sendItemRecoveredNotification, sendFoundItemClosedNotification } from './email.js';

class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.sentMatches = new Set(); // Track sent match pairs to avoid duplicates
        this.emailDelay = 2000; // 2 seconds between emails (Gmail limit: ~100-150 emails/day for free accounts)
        this.batchSize = 5; // Process 5 emails, then pause
        this.batchDelay = 5000; // 5 seconds pause after each batch
    }

    /**
     * Generate unique key for a match pair to prevent duplicate notifications
     */
    getMatchKey(lostItemId, foundItemId) {
        const ids = [lostItemId.toString(), foundItemId.toString()].sort();
        return `${ids[0]}_${ids[1]}`;
    }

    /**
     * Add email to queue
     * @param {Object} emailData - Contains lostItem, foundItem, lostUser, foundUser
     */
    addToQueue(emailData) {
        const matchKey = this.getMatchKey(emailData.lostItem._id, emailData.foundItem._id);

        // Check if this match pair has already been sent
        if (this.sentMatches.has(matchKey)) {
            console.log(`🔁 Skipping duplicate match notification: ${matchKey}`);
            return false;
        }

        // Check if already in queue
        const alreadyQueued = this.queue.some(item =>
            this.getMatchKey(item.lostItem._id, item.foundItem._id) === matchKey
        );

        if (alreadyQueued) {
            console.log(`📋 Match already in queue: ${matchKey}`);
            return false;
        }

        // Add to queue
        this.queue.push({
            ...emailData,
            matchKey,
            queuedAt: new Date()
        });

        console.log(`✅ Added to email queue: ${matchKey} (Queue size: ${this.queue.length})`);

        // Start processing if not already processing
        if (!this.processing) {
            this.processQueue();
        }

        return true;
    }

    /**
     * Process the queue with rate limiting
     */
    async processQueue() {
        if (this.processing) {
            return; // Already processing
        }

        if (this.queue.length === 0) {
            console.log('📭 Email queue is empty');
            return;
        }

        this.processing = true;
        console.log(`\n📨 Starting email queue processing (${this.queue.length} emails)...`);

        let processedCount = 0;
        let successCount = 0;
        let failureCount = 0;

        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);

            for (const emailData of batch) {
                try {
                    console.log(`\n📧 [${processedCount + 1}] Sending notification...`);

                    let success = false;
                    const notificationType = emailData.type || 'match_notification';

                    if (notificationType === 'item_recovered_notification') {
                        console.log(`   Type: Item Recovered Notification`);
                        console.log(`   Lost Item: "${emailData.lostItem.item_name}"`);
                        console.log(`   Notify Founder: ${emailData.founderUser.email}`);

                        success = await sendItemRecoveredNotification(
                            emailData.lostItem,
                            emailData.foundItem,
                            emailData.founderUser,
                            emailData.lostUser
                        );
                    } else if (notificationType === 'found_item_closed_notification') {
                        console.log(`   Type: Found Item Closed Notification`);
                        console.log(`   Found Item: "${emailData.foundItem.item_name}"`);
                        console.log(`   Notify Lost Item Owner: ${emailData.lostUser.email}`);

                        success = await sendFoundItemClosedNotification(
                            emailData.lostItem,
                            emailData.foundItem,
                            emailData.lostUser,
                            emailData.founderUser
                        );
                    } else {
                        // Regular match notification
                        console.log(`   Type: Match Notification`);
                        console.log(`   Lost: "${emailData.lostItem.item_name}" (${emailData.lostUser.email})`);
                        console.log(`   Found: "${emailData.foundItem.item_name}" (${emailData.foundUser.email})`);

                        success = await sendMatchNotification(
                            emailData.lostItem,
                            emailData.foundItem,
                            emailData.lostUser,
                            emailData.foundUser
                        );
                    }

                    if (success) {
                        // Mark as sent (for match notifications)
                        if (emailData.matchKey) {
                            this.sentMatches.add(emailData.matchKey);
                        }
                        successCount++;
                        console.log(`   ✅ Success`);
                    } else {
                        failureCount++;
                        console.log(`   ❌ Failed`);
                    }

                    processedCount++;

                    // Delay before next email (rate limiting)
                    if (this.queue.length > 0 || batch.indexOf(emailData) < batch.length - 1) {
                        console.log(`   ⏳ Waiting ${this.emailDelay / 1000}s before next email...`);
                        await this.delay(this.emailDelay);
                    }

                } catch (error) {
                    failureCount++;
                    console.error(`   ❌ Error sending email:`, error.message);
                    processedCount++;
                }
            }

            // Pause between batches
            if (this.queue.length > 0) {
                console.log(`\n⏸️  Batch complete. Pausing ${this.batchDelay / 1000}s before next batch...`);
                await this.delay(this.batchDelay);
            }
        }

        console.log(`\n✨ Queue processing complete!`);
        console.log(`   Total processed: ${processedCount}`);
        console.log(`   Successful: ${successCount}`);
        console.log(`   Failed: ${failureCount}`);
        console.log(`   Total sent matches tracked: ${this.sentMatches.size}\n`);

        this.processing = false;
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            totalSentMatches: this.sentMatches.size,
            nextEmail: this.queue.length > 0 ? {
                lostItem: this.queue[0].lostItem.item_name,
                foundItem: this.queue[0].foundItem.item_name,
                queuedAt: this.queue[0].queuedAt
            } : null
        };
    }

    /**
     * Clear sent matches history (useful for testing)
     */
    clearHistory() {
        this.sentMatches.clear();
        console.log('🗑️  Cleared sent matches history');
    }

    /**
     * Clear queue (emergency stop)
     */
    clearQueue() {
        const cleared = this.queue.length;
        this.queue = [];
        console.log(`🗑️  Cleared ${cleared} emails from queue`);
        return cleared;
    }

    /**
     * Check if match notification was already sent
     */
    wasMatchSent(lostItemId, foundItemId) {
        const matchKey = this.getMatchKey(lostItemId, foundItemId);
        return this.sentMatches.has(matchKey);
    }
}

// Create singleton instance
const emailQueue = new EmailQueue();

// Export the instance
export default emailQueue;
