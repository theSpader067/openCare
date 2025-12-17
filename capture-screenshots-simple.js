#!/usr/bin/env node

/**
 * OpenCare Tutorial Screenshot Capture - Simple Version
 *
 * This simplified script:
 * 1. Captures public pages without authentication
 * 2. Uses manual session for protected pages
 * 3. Works around auth/domain issues
 * 4. Can be used with existing screenshots
 */

const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "public/tutorial-screenshots");
const LOCALE = "fr-FR";

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Screenshots configuration - simplified approach
const pages = [
  {
    name: "01-login",
    path: "/login",
    label: "Page de Connexion",
    description: "Capture la page de connexion",
    isPublic: true,
  },
  {
    name: "02-dashboard",
    path: "/dashboard",
    label: "Tableau de Bord",
    description: "Tableau de bord principal",
    isPublic: false,
  },
];

async function capturePublicPages(browser) {
  /**
   * Capture public pages (no auth required)
   */
  console.log("\n📍 CAPTURING PUBLIC PAGES\n");

  const context = await browser.newContext({
    locale: LOCALE,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  // Capture login page
  try {
    console.log("📸 Capturing: Page de Connexion");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const screenshotPath = path.join(SCREENSHOTS_DIR, "01-login.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const size = fs.statSync(screenshotPath).size;
    console.log(`   ✓ Captured: 01-login.png (${(size / 1024).toFixed(2)} KB)\n`);
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}\n`);
  }

  await context.close();
}

async function captureProtectedPages(browser) {
  /**
   * Capture protected pages using existing screenshots or placeholders
   */
  console.log("📍 PROTECTED PAGES (Existing Screenshots)\n");

  const protectedPages = [
    {
      name: "02-dashboard",
      label: "Tableau de Bord",
    },
    {
      name: "03-patients-list",
      label: "Liste des Patients",
    },
    {
      name: "04-analyses",
      label: "Analyses et Tests",
    },
    {
      name: "05-avis",
      label: "Avis Médicaux",
    },
    {
      name: "06-comptes-rendus",
      label: "Rapports Cliniques",
    },
    {
      name: "07-ordonnances",
      label: "Ordonnances",
    },
    {
      name: "08-tasks",
      label: "Gestion des Tâches",
    },
    {
      name: "09-activities",
      label: "Activités et Calendrier",
    },
    {
      name: "10-timeline",
      label: "Chronologie des Patients",
    },
    {
      name: "11-notifications",
      label: "Notifications",
    },
    {
      name: "12-profile",
      label: "Profil et Paramètres",
    },
    {
      name: "13-statistiques",
      label: "Statistiques",
    },
  ];

  for (const page of protectedPages) {
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${page.name}.png`);
    const exists = fs.existsSync(screenshotPath);

    if (exists) {
      const size = fs.statSync(screenshotPath).size;
      console.log(
        `   ✓ ${page.label.padEnd(30)} (${(size / 1024).toFixed(2)} KB)`
      );
    } else {
      console.log(`   ⚠️  ${page.label.padEnd(30)} (missing - needs manual capture)`);
    }
  }

  console.log();
}

async function printManualInstructions() {
  /**
   * Print instructions for manually capturing protected pages
   */
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          🔐 MANUAL SCREENSHOT CAPTURE GUIDE                ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("Protected pages require manual screenshot capture:\n");

  console.log("OPTION 1: Using Browser DevTools");
  console.log("─".repeat(58));
  console.log("1. Open OpenCare in your browser:");
  console.log("   http://localhost:3000\n");

  console.log("2. Login with your credentials\n");

  console.log("3. For each page, take a screenshot using:");
  console.log("   Windows/Linux: Ctrl+Shift+S (or use browser extension)");
  console.log("   Mac: Cmd+Shift+4 (or use browser extension)\n");

  console.log("4. Save screenshots to: public/tutorial-screenshots/");
  console.log("   • 02-dashboard.png");
  console.log("   • 03-patients-list.png");
  console.log("   • 04-analyses.png");
  console.log("   • 05-avis.png");
  console.log("   • 06-comptes-rendus.png");
  console.log("   • 07-ordonnances.png");
  console.log("   • 08-tasks.png");
  console.log("   • 09-activities.png");
  console.log("   • 10-timeline.png");
  console.log("   • 11-notifications.png");
  console.log("   • 12-profile.png");
  console.log("   • 13-statistiques.png\n");

  console.log("OPTION 2: Using Playwright Interactive Mode");
  console.log("─".repeat(58));
  console.log("Edit the script to add code like:\n");

  console.log("  const context = await browser.newContext();");
  console.log("  const page = await context.newPage();");
  console.log("  await page.goto('http://localhost:3000/dashboard');");
  console.log("  // Let it load, then use inspector:");
  console.log("  await page.pause(); // Opens inspector");
  console.log("  // Manual screenshot: Ctrl+Shift+S\n");

  console.log("OPTION 3: Using Playwright With Existing Session");
  console.log("─".repeat(58));
  console.log("Create a setup script that:");
  console.log("1. Saves cookies/session after first login");
  console.log("2. Reuses those cookies for subsequent captures");
  console.log("3. Avoid re-authentication issues\n");

  console.log("OPTION 4: Fix Authentication Issues First");
  console.log("─".repeat(58));
  console.log("Check these environment variables:\n");

  console.log("  NEXTAUTH_URL=http://localhost:3000");
  console.log("  NEXTAUTH_SECRET=your-secret-key");
  console.log("  DATABASE_URL=your-database-url\n");

  console.log("Then try the capture script again.\n");
}

async function main() {
  let browser;

  try {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log(
      "║   🎬 OpenCare Screenshot Capture - Simple Version          ║"
    );
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`🌍 Locale: ${LOCALE}`);
    console.log(`📁 Screenshot Dir: ${SCREENSHOTS_DIR}\n`);

    console.log("🌐 Launching browser...");
    browser = await chromium.launch({ headless: true, locale: LOCALE });

    // Capture public pages
    await capturePublicPages(browser);

    // Show status of protected pages
    await captureProtectedPages(browser);

    // Print instructions
    await printManualInstructions();

    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    📋 CURRENT STATUS                       ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    const files = fs.readdirSync(SCREENSHOTS_DIR).sort();
    console.log(`Screenshot files: ${files.length}`);
    files.forEach((file) => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const size = fs.statSync(filePath).size;
      console.log(`  ✓ ${file} (${(size / 1024).toFixed(2)} KB)`);
    });

    console.log("\n✅ Process complete!\n");
    console.log("📖 Tutorial file: public/opencare-tutorial-fr.html");
    console.log("📸 Screenshots: public/tutorial-screenshots/\n");

    console.log("🎓 Next steps:");
    console.log("1. Manually capture protected page screenshots");
    console.log("2. Save them to public/tutorial-screenshots/");
    console.log("3. Test the tutorial: http://localhost:3000/opencare-tutorial-fr.html");
    console.log("4. Export to PDF: Ctrl+P → Save as PDF\n");

    await browser.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { capturePublicPages };
