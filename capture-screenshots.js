#!/usr/bin/env node

/**
 * OpenCare Tutorial Screenshot Capture Script
 *
 * This script automates the capture of screenshots for all pages in the OpenCare tutorial.
 *
 * Installation:
 *   npm install -D @playwright/test playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   npm run capture-screenshots
 *   # Or directly:
 *   node capture-screenshots.js
 *
 * Configuration:
 *   - Update BASE_URL if your dev server runs on a different port/domain
 *   - Update TEST_EMAIL and TEST_PASSWORD if using different credentials
 */

const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

// Configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TEST_EMAIL = process.env.TEST_EMAIL || "test@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "password123";
const SCREENSHOTS_DIR = path.join(__dirname, "public/tutorial-screenshots");
const LOCALE = "fr-FR"; // French locale for French UI

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log(`✓ Created screenshots directory: ${SCREENSHOTS_DIR}`);
}

const screenshots = [
  {
    name: "01-login",
    path: "/login",
    label: "Page de Connexion",
    description: "Capture la page de connexion initiale",
    requiresAuth: false,
  },
  {
    name: "02-dashboard",
    path: "/dashboard",
    label: "Tableau de Bord",
    description: "Vue principale avec tâches, activités et aperçu des patients",
    requiresAuth: true,
  },
  {
    name: "03-patients-list",
    path: "/(app)/patients",
    label: "Liste des Patients",
    description: "Gestion et vue de tous les patients",
    requiresAuth: true,
  },
  {
    name: "04-analyses",
    path: "/(app)/analyses",
    label: "Analyses et Tests",
    description: "Tests de laboratoire, imagerie et analyses",
    requiresAuth: true,
  },
  {
    name: "05-avis",
    path: "/(app)/avis",
    label: "Avis Médicaux",
    description: "Consultations médicales et avis spécialisés",
    requiresAuth: true,
  },
  {
    name: "06-comptes-rendus",
    path: "/(app)/comptes-rendus",
    label: "Rapports Cliniques",
    description: "Rapports cliniques et documents de synthèse",
    requiresAuth: true,
  },
  {
    name: "07-ordonnances",
    path: "/(app)/ordonnances",
    label: "Ordonnances",
    description: "Gestion des prescriptions et modèles",
    requiresAuth: true,
  },
  {
    name: "08-tasks",
    path: "/(app)/tasks",
    label: "Gestion des Tâches",
    description: "Tâches et éléments d'action",
    requiresAuth: true,
  },
  {
    name: "09-activities",
    path: "/(app)/activities",
    label: "Activités et Calendrier",
    description: "Calendrier et planification des activités",
    requiresAuth: true,
  },
  {
    name: "10-timeline",
    path: "/(app)/timeline",
    label: "Chronologie des Patients",
    description: "Vue chronologique complète des interactions",
    requiresAuth: true,
  },
  {
    name: "11-notifications",
    path: "/(app)/notifications",
    label: "Notifications",
    description: "Centre de notifications et alertes",
    requiresAuth: true,
  },
  {
    name: "12-profile",
    path: "/(app)/profile",
    label: "Profil et Paramètres",
    description: "Paramètres utilisateur et configuration",
    requiresAuth: true,
  },
  {
    name: "13-statistiques",
    path: "/(app)/statistiques",
    label: "Statistiques",
    description: "Analytics et métriques",
    requiresAuth: true,
  },
];

async function captureScreenshots() {
  let browser;
  try {
    console.log("🎬 Démarrage de la capture de captures d'écran OpenCare...\n");
    console.log(`📍 URL de base: ${BASE_URL}`);
    console.log(`🌍 Locale: ${LOCALE}\n`);

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      locale: LOCALE,
    });

    const context = await browser.newContext({
      locale: LOCALE,
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    let isAuthenticated = false;

    // Capture each page
    for (const screenshot of screenshots) {
      try {
        console.log(`📸 Capturing: ${screenshot.label}`);
        console.log(`   Path: ${screenshot.path}`);
        console.log(`   File: ${screenshot.name}.png`);

        const fullUrl = `${BASE_URL}${screenshot.path}`;

        // Handle authentication if needed
        if (screenshot.requiresAuth && !isAuthenticated) {
          console.log("   🔐 Logging in...");
          await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
          await page.waitForTimeout(500);

          // Fill login form
          const emailInput = page.locator('input[type="email"]');
          const passwordInput = page.locator('input[type="password"]');
          const loginButton = page.locator('button[type="submit"]');

          if (await emailInput.isVisible()) {
            await emailInput.fill(TEST_EMAIL);
            await passwordInput.fill(TEST_PASSWORD);
            await loginButton.click();

            // Wait for redirect to dashboard
            try {
              await page.waitForURL(
                (url) =>
                  url.toString().includes("/dashboard") ||
                  url.toString().includes("/(app)"),
                { timeout: 10000 }
              );
              isAuthenticated = true;
              console.log("   ✓ Login successful");
            } catch (e) {
              console.log("   ⚠️  Login may have failed, continuing anyway...");
            }
          }
        }

        // Navigate to the page
        await page.goto(fullUrl, { waitUntil: "networkidle" });
        await page.waitForTimeout(1000); // Extra wait for content to load

        // Take screenshot
        const screenshotPath = path.join(SCREENSHOTS_DIR, `${screenshot.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        console.log(`   ✓ Captured: ${screenshot.name}.png`);
        console.log();
      } catch (error) {
        console.error(`   ✗ Error capturing ${screenshot.name}:`, error.message);
        console.log();
      }
    }

    await browser.close();

    // Summary
    console.log("\n✅ Capture d'écran terminée!");
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}\n`);

    // List all captured files
    const files = fs.readdirSync(SCREENSHOTS_DIR).sort();
    console.log("📸 Fichiers capturés:");
    files.forEach((file) => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ✓ ${file} (${sizeKB} KB)`);
    });

    console.log("\n📝 Next Steps:");
    console.log("1. Review screenshots in: public/tutorial-screenshots/");
    console.log("2. Update the HTML tutorial with screenshot references");
    console.log("3. Test the tutorial PDF export");
    console.log("\n🎉 Done!");
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
