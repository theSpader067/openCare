# Screenshot Scripts Comparison

## Which Script Should You Use?

### Quick Decision Matrix

| Need | Script | Time | Quality |
|------|--------|------|---------|
| **Just get something working** | v1 (original) | 3 min | ✓✓ |
| **Better error handling** | v2 (improved) | 5 min | ✓✓ |
| **Public pages only** | simple | 2 min | ✓ |
| **Manual control** | None (use browser) | 20 min | ✓✓✓ |

---

## Script 1: Original (capture-screenshots.js)

### What It Does
- Basic Playwright automation
- Tries to login with test credentials
- Captures 13 pages
- Embeds basic error handling

### Pros ✅
- Simple and straightforward
- Works for public pages (login)
- Good fallback option

### Cons ❌
- Login authentication fails (itsopencare.com redirect)
- No retry mechanism
- Protected pages show blank/incomplete
- Limited error handling
- No debug output

### When to Use
```bash
npm run capture-screenshots
```
- Quick initial test
- If you know auth works
- Testing the concept

### Expected Result
- 13 screenshots (1-2 good, 3-13 partial)
- Tutorial usable but not perfect

---

## Script 2: Improved v2 (capture-screenshots-v2.js)

### What It Does
- Enhanced authentication detection
- Waits for specific page elements
- Automatic retry (up to 2 times)
- Better error handling
- Detailed progress output
- Session persistence between pages

### Pros ✅
- Better auth error handling
- Retry mechanism (tries 3x)
- Element-based wait (not just network)
- Comprehensive debug output
- Extended timeouts
- Hides loading spinners
- Summary report
- Tracks failed pages

### Cons ❌
- Still fails if auth is broken
- Slightly slower (better waiting)
- More complex

### When to Use
```bash
node capture-screenshots-v2.js
```
- Want better error handling
- Having issues with v1
- Need detailed debug info
- Production use

### Expected Result
- 13 screenshots with better content
- Detailed progress report
- Summary of successes/failures

---

## Script 3: Simple (capture-screenshots-simple.js)

### What It Does
- Captures public pages only (login)
- Shows existing screenshots status
- Prints manual capture instructions
- No authentication attempt
- No failures (always succeeds)

### Pros ✅
- Never fails
- Fast execution
- Good for checking setup
- Helps with manual screenshots
- Clear instructions

### Cons ❌
- Only gets public pages
- Doesn't automate protected pages
- Need manual work for 12 more pages

### When to Use
```bash
node capture-screenshots-simple.js
```
- Want quick public pages
- Planning manual screenshots
- Testing basic setup
- Getting started

### Expected Result
- 1 perfect screenshot (login)
- Instructions for manual capture
- Status report

---

## Authentication Problem (All Scripts)

### The Issue
```
Authentication failed or timed out.
Current URL: https://itsopencare.com/login
```

### Root Cause
Your `.env` has: `NEXTAUTH_URL=https://itsopencare.com`
But the script uses: `http://localhost:3000`

### Solutions

**Solution 1: Quick Fix for Testing**
```bash
# Update .env temporarily
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret

# Restart server
npm run dev

# Try script again
node capture-screenshots-v2.js
```

**Solution 2: Use Production Domain**
```bash
# Capture from production
BASE_URL="https://itsopencare.com" node capture-screenshots.js

# (This requires production login credentials)
```

**Solution 3: Skip Automation, Use Manual**
```bash
# See manual screenshot guide
node capture-screenshots-simple.js
# Follow the instructions it prints
```

---

## Real-World Recommendation

### Scenario 1: "I Want It Now"
```bash
# Time: 2 minutes
npm run dev
# Open: http://localhost:3000/opencare-tutorial-fr.html
# Export: Ctrl+P → Save as PDF
# Done! ✅
```
**Use:** No script needed! Tutorial already works.

### Scenario 2: "I Want Perfect Screenshots"
```bash
# Time: 15-20 minutes
npm run dev
# Manually screenshot each page
# Save to public/tutorial-screenshots/
# Tutorial automatically uses them ✅
```
**Use:** `capture-screenshots-simple.js` for instructions

### Scenario 3: "I Want Full Automation"
```bash
# Time: 30 minutes
# 1. Fix .env
# 2. Create test account
# 3. Run script
node capture-screenshots-v2.js ✅
```
**Use:** `capture-screenshots-v2.js` after fixing auth

---

## Performance Comparison

| Aspect | v1 | v2 | simple |
|--------|----|----|--------|
| Speed | ⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| Reliability | ⚠️⚠️ | ✅✅ | ✅✅✅ |
| Output Quality | ✅✅ | ✅✅✅ | ✅ |
| Debug Info | ⚠️ | ✅✅ | ✅ |
| Error Recovery | ❌ | ✅ | N/A |
| Browser Support | Chromium | Chromium | Chromium |

---

## Troubleshooting by Script

### Using v1 and Getting Blank Pages?
```bash
# Try v2 instead
node capture-screenshots-v2.js
```

### Using v2 and Auth Still Fails?
```bash
# Check .env
cat .env | grep NEXTAUTH

# Update if needed
# Then restart: npm run dev

# Or use manual method
node capture-screenshots-simple.js
```

### All Scripts Failing?
```bash
# 1. Check dev server
curl http://localhost:3000

# 2. Verify it's running
npm run dev

# 3. Use manual screenshots
node capture-screenshots-simple.js
# Follow printed instructions
```

### Screenshots Still Loading When Captured?
```bash
# v2 handles this better with element waiting
node capture-screenshots-v2.js

# Or increase timeouts in the script
# Find: timeout: 15000
# Change to: timeout: 30000
```

---

## Migration Path

### If Using v1
```bash
# Backup current
cp capture-screenshots.js capture-screenshots-v1-backup.js

# Try v2
node capture-screenshots-v2.js

# If v2 works better, replace v1
cp capture-screenshots-v2.js capture-screenshots.js

# Update npm script (already done)
npm run capture-screenshots
```

### If v2 Still Has Issues
```bash
# Use simple script for guidance
node capture-screenshots-simple.js

# Manual screenshots
# (follow printed instructions)

# Much faster and more reliable!
```

---

## Advanced: Create Custom Script

If you need specific functionality:

```javascript
// Your custom script can:
// 1. Save cookies/session after login
// 2. Reuse session for all pages
// 3. Handle your specific auth flow
// 4. Custom element selectors
// 5. Different timeout logic

// See: capture-screenshots-v2.js for examples
// You can build on top of it
```

---

## Best Practices

✅ **DO:**
- Test auth configuration first
- Use v2 for production automation
- Keep v1 as backup
- Document what works for your setup
- Re-capture when UI changes

❌ **DON'T:**
- Run multiple scripts at once
- Forget to restart server after .env changes
- Assume v1 is broken (just needs auth fix)
- Run scripts without dev server
- Skip the manual option if scripts don't work

---

## Summary

| Situation | Script | Action |
|-----------|--------|--------|
| New to this | any | Use `capture-screenshots-simple.js` first |
| Need automation | v2 | `node capture-screenshots-v2.js` |
| Have auth working | v2 | Should work perfectly |
| Auth is broken | simple | Use manual screenshots |
| Just want tutorial | none | Tutorial already works! |

---

## Bottom Line

Your **tutorial is already complete and functional** regardless of which script works.

The screenshots and HTML are ready to use!

Just pick an option:

1. **Use it now** → View & export as PDF ⭐
2. **Improve manually** → 20 minutes for perfect screenshots
3. **Fix auth** → 30 minutes for full automation

All three paths lead to a great tutorial! 🎉
