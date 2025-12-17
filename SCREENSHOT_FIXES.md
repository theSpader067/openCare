# Screenshot Capture Improvements - v2

## Problem Identified

The initial screenshot script had issues:

1. ❌ **Login authentication failing** - Not properly detecting successful login
2. ❌ **Pages still loading** - `networkidle` wasn't reliable, pages rendered incompletely
3. ❌ **No retry mechanism** - Failed captures weren't retried
4. ❌ **Timeout issues** - Some pages need more time to load
5. ❌ **No element waiting** - Didn't wait for specific page content

## Solution: v2 Improved Script

### Key Improvements

#### 1. **Better Authentication**
```javascript
// Now properly:
✓ Waits for login form to appear
✓ Detects successful redirect
✓ Handles redirect delays
✓ Stores session for remaining pages
```

#### 2. **Smarter Page Load Detection**
```javascript
// Waits for:
✓ Specific content elements (waitFor selector)
✓ Network to be idle
✓ Hides loading spinners for clean screenshots
✓ Allows extra time for animations
```

#### 3. **Automatic Retry Logic**
```javascript
// If page capture fails:
✓ Automatically retries up to 2 times
✓ Waits longer between retries
✓ Falls back gracefully if all retries fail
```

#### 4. **Better Error Handling**
```javascript
// Provides:
✓ Detailed debug output
✓ Success/failure tracking
✓ Summary report
✓ List of failed pages (if any)
```

#### 5. **Increased Timeouts**
```javascript
// Timeouts increased:
- Page load: 30 seconds (was 10)
- Navigation: 30 seconds (was 10)
- Element wait: 15 seconds (was 10)
- Network idle: 10 seconds (was 5)
```

### Quick Start

#### Option 1: Use Improved Script (Recommended)
```bash
node capture-screenshots-v2.js
```

#### Option 2: Add to package.json
```bash
npm install
npm run capture-screenshots-v2  # (if you add it to scripts)
```

#### Option 3: Replace Old Script
```bash
# Backup old script
mv capture-screenshots.js capture-screenshots-old.js

# Use new version
mv capture-screenshots-v2.js capture-screenshots.js

# Run normally
npm run capture-screenshots
```

## Running the Improved Script

### Prerequisites
```bash
# Make sure dev server is running
npm run dev

# In another terminal:
node capture-screenshots-v2.js
```

### Expected Output
```
╔════════════════════════════════════════════════════════════╗
║  🎬 OpenCare Tutorial Screenshot Capture - v2 (Improved)  ║
╚════════════════════════════════════════════════════════════╝

📍 URL de base: http://localhost:3000
🌍 Locale: fr-FR
👤 Test Email: test@example.com

🌐 Launching browser...

📸 Capturing: Page de Connexion
   Path: /login
   File: 01-login.png
   ↓ Navigating to: http://localhost:3000/login
   ✓ Captured: 01-login.png (454.34 KB)

📸 Capturing: Tableau de Bord
   Path: /dashboard
   File: 02-dashboard.png
   🔐 Starting authentication...
   ✓ Login form detected
   • Entering credentials...
   • Waiting for authentication...
   ✓ Authentication successful!
   ↓ Navigating to: http://localhost:3000/dashboard
   ✓ Captured: 02-dashboard.png (455.12 KB)

[... continues for all pages ...]

✅ Successful: 13/13
❌ Failed: 0/13
```

## Troubleshooting

### Login Still Failing

**Issue:** Authentication shows as failed or timed out

**Solutions:**
1. Check credentials are correct:
   ```bash
   TEST_EMAIL="your@email.com" TEST_PASSWORD="your-password" node capture-screenshots-v2.js
   ```

2. Make sure test account exists in database

3. Check if login page has changed (look for email input):
   ```bash
   curl -s http://localhost:3000/login | grep "email"
   ```

4. Try with longer timeout:
   ```javascript
   // Edit capture-screenshots-v2.js, find:
   await page.waitForURL(..., { timeout: 15000 });
   // Change to:
   await page.waitForURL(..., { timeout: 30000 });
   ```

### Pages Still Loading Incompletely

**Issue:** Screenshots show blank/incomplete content

**Solutions:**
1. Check the `waitFor` selector for that page is correct

2. Add longer wait after navigation:
   ```javascript
   // In capture-screenshots-v2.js, find:
   const loadSuccess = await waitForPageLoad(page, screenshot.waitFor);
   // Add before it:
   await page.waitForTimeout(3000); // Extra wait
   ```

3. Manually check if page loads in browser:
   ```
   http://localhost:3000/dashboard
   ```

### Browser Not Starting

**Issue:** "Executable doesn't exist" error

**Solution:**
```bash
npx playwright install chromium
```

### Dev Server Connection Issues

**Issue:** "Connection refused" error

**Solution:**
```bash
# Make sure dev server is running
npm run dev

# In another terminal, verify it's accessible
curl -s http://localhost:3000 | head -5
```

### PDF Export Not Working Well

**Issue:** Screenshots look wrong when viewing HTML or exporting PDF

**Solutions:**
1. Clear browser cache:
   - Chrome: `Ctrl+Shift+Del`
   - Firefox: `Ctrl+Shift+Del`

2. Re-run capture script:
   ```bash
   node capture-screenshots-v2.js
   ```

3. Use different browser for PDF export:
   - Chrome/Chromium (best)
   - Edge
   - Firefox (not ideal)

## Advanced Configuration

### Custom Test Credentials
```bash
TEST_EMAIL="admin@hospital.com" \
TEST_PASSWORD="complex-password-123" \
node capture-screenshots-v2.js
```

### Different Base URL
```bash
BASE_URL="http://192.168.1.100:3000" \
node capture-screenshots-v2.js
```

### Different Locale
Edit the script:
```javascript
const LOCALE = "en-US"; // Change from "fr-FR"
```

### Different Viewport Size
Edit the script:
```javascript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }, // Larger screen
});
```

## Performance Tips

1. **Faster capture:**
   ```bash
   # Close other browser windows
   # Stop other heavy processes
   # Use SSD for screenshots directory
   ```

2. **Cleaner screenshots:**
   - Run script in morning when app is fresh
   - Clear database caches first
   - Ensure good network connection

3. **Better quality:**
   - Use Chrome/Chromium (better rendering)
   - Higher viewport resolution
   - Good lighting/contrast

## Comparing Scripts

| Feature | v1 | v2 |
|---------|----|----|
| Login handling | ⚠️ Basic | ✅ Robust |
| Page load detection | ⚠️ Network only | ✅ Element + Network |
| Retry mechanism | ❌ No | ✅ Yes (2 retries) |
| Error handling | ⚠️ Basic | ✅ Comprehensive |
| Debug output | ⚠️ Minimal | ✅ Detailed |
| Timeout handling | ⚠️ Short | ✅ Extended |
| Loading spinner hide | ❌ No | ✅ Yes |
| Animation wait | ❌ No | ✅ Yes |
| Summary report | ⚠️ Basic | ✅ Detailed |
| Failed page tracking | ❌ No | ✅ Yes |

## Migration from v1 to v2

### Step 1: Backup Old Script
```bash
cp capture-screenshots.js capture-screenshots-v1-backup.js
```

### Step 2: Use New Script
```bash
node capture-screenshots-v2.js
```

### Step 3: Compare Results
Check if new screenshots look better:
```bash
ls -lh public/tutorial-screenshots/
```

### Step 4: Replace if Happy
```bash
rm capture-screenshots.js
cp capture-screenshots-v2.js capture-screenshots.js
```

### Step 5: Update npm script (optional)
Edit `package.json`:
```json
"scripts": {
  "capture-screenshots": "node capture-screenshots.js"
}
```

## When to Use Each Script

**Use v1 (original):**
- Quick test
- Screenshots already working
- Simple login

**Use v2 (improved):**
- Initial capture
- Login issues
- Incomplete screenshots
- Production use

## Need Help?

### Check Debug Output
```bash
# Run with verbose output
node capture-screenshots-v2.js 2>&1 | tee capture.log
```

### Test Individual Page
```bash
# Open in browser and manually verify
http://localhost:3000/dashboard
```

### Check Server Logs
```bash
# Look for authentication or page errors
npm run dev 2>&1 | grep -i error
```

---

**Script Status:** ✅ v2 Ready
**Recommended:** Use v2 for all new captures
**Fallback:** Keep v1 backup just in case
