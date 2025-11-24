# Email Queue System - Documentation

## Overview

The LostNoMore system now includes a sophisticated **Email Queue System with Rate Limiting** to handle bulk match notifications efficiently and prevent email server overload.

---

## 🎯 Features

### ✅ What's New
1. **Strict Matching Algorithm** - Matches only occur when ALL criteria are met
2. **Email Queue** - Notifications are queued instead of sent immediately
3. **Rate Limiting** - Prevents Gmail rate limit issues (max ~100-150 emails/day for free accounts)
4. **Duplicate Prevention** - Tracks sent match pairs to avoid duplicate notifications
5. **Batch Processing** - Processes emails in batches with pauses between batches
6. **Queue Monitoring** - Admin endpoints to monitor and manage the queue

---

## 📊 Strict Matching Criteria

Auto-matches now require **ALL 4 requirements**:

| Requirement | Description | Example |
|-------------|-------------|---------|
| **Category** | Must be EXACTLY the same | "Electronics" = "Electronics" ✅ |
| **Location** | Must be EXACTLY the same (case-insensitive) | "Library" = "library" ✅ |
| **Date** | Must be within **2 days** | Lost: Nov 20, Found: Nov 21 ✅ |
| **Name** | At least **70% word similarity** | "Black Samsung Wallet" ↔ "Samsung Black Wallet" ✅ |

### Name Matching Algorithm
- Removes special characters
- Converts to lowercase
- Filters out common words ("the", "and", "or", etc.)
- Ignores very short words (≤2 characters)
- Compares meaningful words
- Requires 70%+ similarity

---

## ⚙️ Queue Configuration

### Default Settings
```javascript
emailDelay: 2000        // 2 seconds between each email
batchSize: 5            // Process 5 emails at a time
batchDelay: 5000        // 5 second pause after each batch
```

### Processing Flow
```
1. Email 1 → Wait 2s
2. Email 2 → Wait 2s
3. Email 3 → Wait 2s
4. Email 4 → Wait 2s
5. Email 5 → Pause 5s (batch complete)
6. Email 6 → Wait 2s
... continues ...
```

---

## 🔍 How It Works

### When You Report a Lost/Found Item:

1. **Item is created** in the database
2. **Strict matching** checks all active opposite-type items
3. **Valid matches** are added to the email queue (not sent immediately)
4. **Queue processes** emails in background with rate limiting
5. **Duplicate tracking** ensures same pair doesn't get multiple notifications

### Example Scenario:

```
📝 You report: "Lost Black iPhone 13 at Library on Nov 20"

🔍 System checks all Found items:
   ✓ Found "iPhone 13 Black" at Library on Nov 21 (Category: Electronics)
   → 90% name similarity ✅
   → Same location ✅
   → 1 day apart ✅
   → Same category ✅
   
   ✓ Found "iPhone" at Cafeteria on Nov 19
   → 50% name similarity ❌
   → Different location ❌
   → NO MATCH

📨 Queue: 1 match added
🕐 Processing starts in background
✅ 2 emails sent (to you and the finder) with 2s delay
```

---

## 🛠️ Admin API Endpoints

### Check Queue Status
```http
GET /api/admin/email-queue/status
```

**Response:**
```json
{
  "queueLength": 5,
  "processing": true,
  "totalSentMatches": 23,
  "nextEmail": {
    "lostItem": "Black Wallet",
    "foundItem": "Wallet Black",
    "queuedAt": "2025-11-25T01:15:00.000Z"
  }
}
```

### Clear Queue History (For Testing/Re-seeding)
```http
POST /api/admin/email-queue/clear-history
```
Clears the sent matches history, allowing duplicate notifications to be sent again.

### Emergency Clear Queue
```http
POST /api/admin/email-queue/clear
```
Stops and clears all pending emails in the queue.

---

## 📝 Console Logs

### When Posting an Item:
```
🔍 Checking for matches for new lost item: "Black Samsung Wallet"
✓ Match found! "Black Samsung Wallet" ↔ "Samsung Black Wallet" (100% similar)
  Lost by: user1@example.com | Found by: user2@example.com
✅ Added to email queue: 507f...a4b2_507f...c3d1 (Queue size: 1)
🎉 Found 1 match(es) for "Black Samsung Wallet"
```

### During Queue Processing:
```
📨 Starting email queue processing (3 emails)...

📧 [1] Sending match notification...
   Lost: "Black Samsung Wallet" (user1@example.com)
   Found: "Samsung Black Wallet" (user2@example.com)
   ✅ Success
   ⏳ Waiting 2s before next email...

📧 [2] Sending match notification...
   Lost: "iPhone 13" (user3@example.com)
   Found: "iPhone 13 Pro" (user4@example.com)
   ✅ Success
   ⏳ Waiting 2s before next email...

✨ Queue processing complete!
   Total processed: 2
   Successful: 2
   Failed: 0
   Total sent matches tracked: 15
```

---

## 🧪 Testing with Seeded Data

### Before Seeding (Recommended):
```bash
# Clear email queue history to allow new notifications
curl -X POST http://localhost:3000/api/admin/email-queue/clear-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Run Seed Script:
```bash
cd server
node seed.js
```

### Monitor Queue:
```bash
# Check queue status
curl http://localhost:3000/api/admin/email-queue/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### After Testing:
```bash
# Delete seeded data
node seed.js --delete

# Clear queue history
curl -X POST http://localhost:3000/api/admin/email-queue/clear-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Important Notes

### Gmail Rate Limits
- **Free Gmail accounts**: ~100-150 emails/day
- **Google Workspace**: ~2000 emails/day
- Current settings: Can send ~1800 emails/hour (very conservative)

### When Seeding 100 Items:
- Most items won't match (due to strict criteria)
- With new strict algorithm, expect 0-5 matches typically
- Previously (loose matching): Could have 50+ false positives
- Queue processes all matches automatically in background
- Check server console for real-time progress

### Why Matches May Not Occur:
1. **Different names** - Even slight variations fail 70% threshold
2. **Different locations** - Must be EXACT match
3. **Date too far apart** - Must be within 2 days
4. **Different categories** - Must be identical

---

## 🎉 Benefits

### Before (Old System):
- ❌ Loose matching (many false positives)
- ❌ Immediate email sending (could overload server)
- ❌ No duplicate prevention
- ❌ No rate limiting
- ❌ Could fail with bulk operations

### After (New System):
- ✅ Strict matching (only genuine matches)
- ✅ Queue-based processing
- ✅ Duplicate prevention
- ✅ Rate limiting (Gmail-safe)
- ✅ Handles bulk operations gracefully
- ✅ Admin monitoring available

---

## 📞 Support

For issues or questions:
- Check server console logs for detailed information
- Use queue status endpoint to monitor progress
- Clear queue history if testing/re-seeding

**Server Location**: `c:\Users\Mohsin Khan\Desktop\LNF\server`

**Key Files**:
- Email Queue: `server/utils/emailQueue.js`
- Match Logic: `server/routes/items.routes.js`
- Admin Routes: `server/routes/admin.routes.js`
