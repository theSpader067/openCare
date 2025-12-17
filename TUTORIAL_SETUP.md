# OpenCare Tutorial Setup Guide

This guide explains how to capture screenshots and generate the tutorial PDF.

## Files Included

- **`public/opencare-tutorial-fr.html`** - French tutorial (complete HTML page)
- **`capture-screenshots.js`** - Automated screenshot capture script
- **`public/tutorial-screenshots/`** - Directory where screenshots will be saved

## Quick Start

### Step 1: Install Dependencies

```bash
npm install -D @playwright/test playwright
npx playwright install chromium
```

### Step 2: Start the Dev Server

Open a terminal and start the OpenCare dev server:

```bash
npm run dev
```

Wait for it to be ready (you'll see "Ready in X seconds").

### Step 3: Capture Screenshots

In another terminal, run the screenshot capture script:

```bash
node capture-screenshots.js
```

The script will:
- Launch a headless Chromium browser
- Navigate to each page in the application
- Capture full-page screenshots
- Save them to `public/tutorial-screenshots/`

**Expected Output:**
```
🎬 Démarrage de la capture de captures d'écran OpenCare...

📍 URL de base: http://localhost:3000
🌍 Locale: fr-FR

📸 Capturing: Tableau de Bord
   ✓ Captured: 02-dashboard.png

[... more screenshots ...]

✅ Capture d'écran terminée!
📁 Screenshots saved to: /path/to/public/tutorial-screenshots/

📸 Fichiers capturés:
  ✓ 01-login.png
  ✓ 02-dashboard.png
  [... etc ...]
```

### Step 4: Add Screenshots to Tutorial

1. Open the captured screenshots in `public/tutorial-screenshots/`
2. Edit `public/opencare-tutorial-fr.html`
3. Replace the `<!-- Screenshot will be inserted here -->` comments with actual `<img>` tags:

```html
<div class="screenshot-container">
    <div>
        <div class="screenshot-label">Vue Principale du Tableau de Bord</div>
        <img src="/tutorial-screenshots/02-dashboard.png" alt="Dashboard screenshot" />
    </div>
</div>
```

### Step 5: Generate PDF

#### Using Browser Print Function

1. Open `http://localhost:3000/opencare-tutorial-fr.html` in your browser
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF"
4. Choose your download location
5. Click "Save"

**PDF Settings (Recommended):**
- **Orientation:** Portrait
- **Paper size:** A4
- **Margins:** Default
- **Include headers/footers:** Off
- **Background graphics:** On

#### Using Command Line (Linux/Mac)

If you have a tool like `wkhtmltopdf` installed:

```bash
wkhtmltopdf \
  --enable-local-file-access \
  --margin-top 10mm \
  --margin-bottom 10mm \
  --margin-left 10mm \
  --margin-right 10mm \
  http://localhost:3000/opencare-tutorial-fr.html \
  opencare-tutorial-fr.pdf
```

## Configuration

### Custom API Credentials

If your test account uses different credentials:

```bash
TEST_EMAIL="your-email@example.com" \
TEST_PASSWORD="your-password" \
node capture-screenshots.js
```

### Different Base URL

If your dev server runs on a different port:

```bash
BASE_URL="http://localhost:5000" \
node capture-screenshots.js
```

### Different Locale

To capture screenshots in English instead:

Edit `capture-screenshots.js` and change:
```javascript
const LOCALE = "en-US"; // Change from "fr-FR"
```

## Troubleshooting

### "Executable doesn't exist" Error

The Playwright browsers haven't been installed. Run:

```bash
npx playwright install chromium
```

### "Connection refused" Error

The dev server isn't running. Make sure to run `npm run dev` in another terminal.

### Screenshots are blank

1. Wait longer for the page to load (increase `waitForTimeout` values)
2. Check that you're logged in properly
3. Verify the page paths are correct for your application

### PDF conversion issues

- Make sure the HTML file is accessible (test in browser first)
- Use a modern browser (Chrome, Edge, Firefox)
- Check that screenshots are loading properly before exporting

## File Descriptions

### Screenshots Generated

| File | Page | Description |
|------|------|-------------|
| `01-login.png` | Login | Initial login screen |
| `02-dashboard.png` | Dashboard | Main dashboard view |
| `03-patients-list.png` | Patients | Patient management |
| `04-analyses.png` | Analyses | Lab tests & imaging |
| `05-avis.png` | Avis | Medical opinions |
| `06-comptes-rendus.png` | Comptes-rendus | Clinical reports |
| `07-ordonnances.png` | Ordonnances | Prescriptions |
| `08-tasks.png` | Tasks | Task management |
| `09-activities.png` | Activities | Calendar & scheduling |
| `10-timeline.png` | Timeline | Patient timeline |
| `11-notifications.png` | Notifications | Notifications center |
| `12-profile.png` | Profile | User settings |
| `13-statistiques.png` | Statistiques | Statistics & analytics |

## Best Practices

1. **Screenshot Quality**
   - Ensure good lighting (high contrast UI)
   - Use a standard viewport size (1280x800 is default)
   - Capture full pages (scrollable content)

2. **Tutorial Maintenance**
   - Update screenshots when UI changes significantly
   - Keep French and English versions in sync
   - Test PDF export regularly

3. **Accessibility**
   - Add `alt` text to all screenshot images
   - Use descriptive labels
   - Include step-by-step instructions with screenshots

## Advanced Usage

### Selective Screenshot Capture

Edit `capture-screenshots.js` to capture only specific pages:

```javascript
// Capture only dashboard and patients
const screenshots = [
  screenshots[1], // dashboard
  screenshots[2], // patients
];
```

### Custom Viewport Sizes

Modify the context configuration in `capture-screenshots.js`:

```javascript
const context = await browser.createContext({
  locale: LOCALE,
  viewport: { width: 1920, height: 1080 }, // Larger viewport
});
```

### Extract Specific Components

Modify the script to capture only specific elements:

```javascript
// Instead of full page screenshot
await page.locator(".dashboard-container").screenshot({
  path: screenshotPath,
});
```

## Support

If you encounter issues:

1. Check that Node.js version is 16 or higher: `node --version`
2. Verify Playwright is installed: `npm list @playwright/test`
3. Ensure dev server is accessible: `curl http://localhost:3000`
4. Check screenshot folder permissions: `ls -l public/tutorial-screenshots/`

## Next Steps

After generating the PDF:

1. Review for quality and accuracy
2. Add watermark or branding if needed
3. Distribute to users
4. Collect feedback and update as needed
5. Version control the PDF alongside the HTML

---

**Version:** 1.0
**Created:** 2025
**Language:** French (fr-FR)
