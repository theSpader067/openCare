#!/usr/bin/env node

/**
 * OpenCare Tutorial Screenshot Capture Script - v2 (Improved)
 *
 * Improvements:
 * - Better authentication handling
 * - Wait for specific page elements to load
 * - Retry mechanism for failed pages
 * - Better debug output
 * - Longer timeouts for slow pages
 * - Cookie/session persistence
 */

const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

// Configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TEST_EMAIL = process.env.TEST_EMAIL || "test@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "password123";
const SCREENSHOTS_DIR = path.join(__dirname, "public/tutorial-screenshots");
const LOCALE = "fr-FR";

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log(`✓ Created screenshots directory: ${SCREENSHOTS_DIR}\n`);
}

const screenshots = [
  {
    name: "01-login",
    path: "/login",
    label: "Page de Connexion",
    requiresAuth: false,
    waitFor: "input[type='email']",
  },
  {
    name: "02-dashboard",
    path: "/dashboard",
    label: "Tableau de Bord",
    requiresAuth: true,
    waitFor: ".dashboard-container, [class*='dashboard'], h1, main",
  },
  {
    name: "03-patients-list",
    path: "/(app)/patients",
    label: "Liste des Patients",
    requiresAuth: true,
    waitFor: "main, [class*='patient'], table, [role='table']",
  },
  {
    name: "04-analyses",
    path: "/(app)/analyses",
    label: "Analyses et Tests",
    requiresAuth: true,
    waitFor: "main, [class*='analyse'], [class*='lab']",
  },
  {
    name: "05-avis",
    path: "/(app)/avis",
    label: "Avis Médicaux",
    requiresAuth: true,
    waitFor: "main, [class*='avis'], [class*='opinion']",
  },
  {
    name: "06-comptes-rendus",
    path: "/(app)/comptes-rendus",
    label: "Rapports Cliniques",
    requiresAuth: true,
    waitFor: "main, [class*='rapport'], [class*='report']",
  },
  {
    name: "07-ordonnances",
    path: "/(app)/ordonnances",
    label: "Ordonnances",
    requiresAuth: true,
    waitFor: "main, [class*='ordonnance'], [class*='prescription']",
  },
  {
    name: "08-tasks",
    path: "/(app)/tasks",
    label: "Gestion des Tâches",
    requiresAuth: true,
    waitFor: "main, [class*='task'], [class*='tache']",
  },
  {
    name: "09-activities",
    path: "/(app)/activities",
    label: "Activités et Calendrier",
    requiresAuth: true,
    waitFor: "main, [class*='calendar'], [class*='activity']",
  },
  {
    name: "10-timeline",
    path: "/(app)/timeline",
    label: "Chronologie des Patients",
    requiresAuth: true,
    waitFor: "main, [class*='timeline'], [class*='chronologie']",
  },
  {
    name: "11-notifications",
    path: "/(app)/notifications",
    label: "Notifications",
    requiresAuth: true,
    waitFor: "main, [class*='notification'], [class*='notif']",
  },
  {
    name: "12-profile",
    path: "/(app)/profile",
    label: "Profil et Paramètres",
    requiresAuth: true,
    waitFor: "main, [class*='profile'], [class*='settings']",
  },
  {
    name: "13-statistiques",
    path: "/(app)/statistiques",
    label: "Statistiques",
    requiresAuth: true,
    waitFor: "main, [class*='stat'], [class*='analytics']",
  },
];

async function waitForPageLoad(page, selector, timeout = 15000) {
  /**
   * Wait for page to load by checking:
   * 1. Main content element appears
   * 2. Network is idle
   * 3. No loading spinners visible
   */
  try {
    // Wait for specific selector
    if (selector) {
      await page.waitForSelector(selector, { timeout });
    }

    // Wait for network to be mostly idle
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
      console.log("   ⚠️  Network idle timeout (continuing anyway)");
    });

    // Hide any loading spinners for cleaner screenshots
    await page.evaluate(() => {
      const loaders = document.querySelectorAll(
        "[class*='spinner'], [class*='loader'], [class*='loading']"
      );
      loaders.forEach((el) => {
        el.style.display = "none";
      });
    });

    // Extra wait for animations
    await page.waitForTimeout(1000);

    return true;
  } catch (error) {
    console.log(`   ⚠️  Load timeout: ${error.message}`);
    return false;
  }
}

async function loginToApp(page) {
  /**
   * Authenticate to OpenCare
   * Returns true if successful, false otherwise
   */
  try {
    console.log("   🔐 Starting authentication...");

    // Navigate to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Wait for login form to appear
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log("   ✓ Login form detected");

    // Fill in credentials
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    if (!await emailInput.isVisible()) {
      console.log("   ✗ Email input not found");
      return false;
    }

    console.log("   • Entering credentials...");
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    // Click login button
    await loginButton.click();
    console.log("   • Waiting for authentication...");

    // Wait for redirect to dashboard or protected area
    try {
      await page.waitForURL(
        (url) => {
          const urlStr = url.toString();
          return (
            urlStr.includes("/dashboard") ||
            urlStr.includes("/(app)") ||
            !urlStr.includes("/login")
          );
        },
        { timeout: 15000 }
      );
      console.log("   ✓ Authentication successful!");
      return true;
    } catch (e) {
      // Check if we got redirected even if waitForURL failed
      const currentUrl = page.url();
      if (!currentUrl.includes("/login")) {
        console.log(`   ✓ Redirected to: ${currentUrl}`);
        await page.waitForTimeout(1500);
        return true;
      }

      console.log(
        "   ✗ Authentication failed or timed out. Current URL: " + currentUrl
      );
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Login error: ${error.message}`);
    return false;
  }
}

async function capturePageScreenshot(
  page,
  screenshot,
  isAuthenticated,
  retryCount = 0
) {
  /**
   * Capture a single page screenshot with error handling
   */
  const MAX_RETRIES = 2;

  try {
    console.log(`\n📸 Capturing: ${screenshot.label}`);
    console.log(`   Path: ${screenshot.path}`);
    console.log(`   File: ${screenshot.name}.png`);

    // Authenticate if needed and not already authenticated
    if (screenshot.requiresAuth && !isAuthenticated) {
      const authSuccess = await loginToApp(page);
      if (!authSuccess) {
        console.log(`   ⚠️  Authentication may have failed, continuing...`);
      }
      isAuthenticated = true;
    }

    const fullUrl = `${BASE_URL}${screenshot.path}`;
    console.log(`   ↓ Navigating to: ${fullUrl}`);

    // Navigate to the page
    try {
      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (navError) {
      console.log(`   ⚠️  Navigation timeout: ${navError.message}`);
    }

    // Wait for page content to load
    const loadSuccess = await waitForPageLoad(page, screenshot.waitFor);
    if (!loadSuccess && retryCount < MAX_RETRIES) {
      console.log(`   🔄 Retrying... (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
      await page.waitForTimeout(2000);
      return capturePageScreenshot(page, screenshot, isAuthenticated, retryCount + 1);
    }

    // Scroll to top to ensure full capture
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${screenshot.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      omitBackground: false,
    });

    const stats = fs.statSync(screenshotPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`   ✓ Captured: ${screenshot.name}.png (${sizeKB} KB)`);
    return { success: true, isAuthenticated };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(
        `   ⚠️  Error: ${error.message} - Retrying... (${retryCount + 1}/${MAX_RETRIES})`
      );
      await page.waitForTimeout(2000);
      return capturePageScreenshot(page, screenshot, isAuthenticated, retryCount + 1);
    }

    console.log(`   ✗ Failed after ${MAX_RETRIES + 1} attempts: ${error.message}`);
    return { success: false, isAuthenticated };
  }
}

async function captureScreenshots() {
  let browser;
  let successCount = 0;
  let failureCount = 0;
  const failedPages = [];

  try {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log(
      "║  🎬 OpenCare Tutorial Screenshot Capture - v2 (Improved)      ║"
    );
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`📍 URL de base: ${BASE_URL}`);
    console.log(`🌍 Locale: ${LOCALE}`);
    console.log(`👤 Test Email: ${TEST_EMAIL}\n`);

    // Launch browser
    console.log("🌐 Launching browser...\n");
    browser = await chromium.launch({
      headless: true,
      locale: LOCALE,
      args: ["--disable-blink-features=AutomationControlled"],
    });

    const context = await browser.newContext({
      locale: LOCALE,
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // Set default timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    let isAuthenticated = false;

    // Capture each page
    for (const screenshot of screenshots) {
      const result = await capturePageScreenshot(
        page,
        screenshot,
        isAuthenticated
      );

      if (result.success) {
        successCount++;
        isAuthenticated = result.isAuthenticated;
      } else {
        failureCount++;
        failedPages.push(screenshot.name);
      }
    }

    await browser.close();

    // Print summary
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                      📊 Summary                            ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`✅ Successful: ${successCount}/${screenshots.length}`);
    console.log(`❌ Failed: ${failureCount}/${screenshots.length}`);

    if (failureCount > 0) {
      console.log(`\n⚠️  Failed pages:`);
      failedPages.forEach((name) => {
        console.log(`   • ${name}`);
      });
    }

    // List all captured files
    const files = fs.readdirSync(SCREENSHOTS_DIR).sort();
    console.log(`\n📁 Screenshots directory: ${SCREENSHOTS_DIR}`);
    console.log(`📸 Files (${files.length}):`);

    files.forEach((file) => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ✓ ${file.padEnd(30)} (${sizeKB.padStart(8)} KB)`);
    });

    const totalSize = files.reduce((sum, file) => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      return sum + fs.statSync(filePath).size;
    }, 0);

    console.log(`\n📦 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                   ✨ Next Steps                           ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("1. 🌐 View tutorial in browser:");
    console.log(`   ${BASE_URL}/opencare-tutorial-fr.html\n`);

    console.log("2. 📄 Export to PDF:");
    console.log("   Press Ctrl+P (or Cmd+P) → Save as PDF\n");

    console.log("3. 📸 If screenshots need improvement:");
    console.log("   npm run capture-screenshots\n");

    if (failureCount === 0) {
      console.log("🎉 All screenshots captured successfully!\n");
    } else {
      console.log(
        `⚠️  ${failureCount} screenshot(s) may need manual review.\n`
      );
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  captureScreenshots().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { captureScreenshots };
