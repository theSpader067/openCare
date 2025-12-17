import { chromium, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(process.cwd(), "public/tutorial-screenshots");

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.createContext({
    locale: "fr-FR",
  });

  const page = await context.newPage();

  try {
    console.log("🎬 Starting Tutorial Screenshots Capture...\n");

    // 1. Navigate to login page
    console.log("📸 1. Capturing Login Screen...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "01-login.png"),
      fullPage: true,
    });
    console.log("✓ Login screen captured");

    // 2. Login with test credentials
    console.log("\n🔐 Logging in...");
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    // Check if credentials exist in environment
    const testEmail = process.env.TEST_EMAIL || "test@example.com";
    const testPassword = process.env.TEST_PASSWORD || "password123";

    if (await emailInput.isVisible()) {
      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);
      await loginButton.click();
      await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 }).catch(() => {
        console.log("⚠️  Login may not have succeeded, continuing with available pages...");
      });
    }

    // 3. Dashboard
    console.log("📸 2. Capturing Dashboard...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "02-dashboard.png"),
      fullPage: true,
    });
    console.log("✓ Dashboard captured");

    // 4. Patients List
    console.log("📸 3. Capturing Patients List...");
    await page.goto(`${BASE_URL}/(app)/patients`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "03-patients-list.png"),
      fullPage: true,
    });
    console.log("✓ Patients list captured");

    // 5. Analyses/Lab Tests
    console.log("📸 4. Capturing Lab Tests & Analyses...");
    await page.goto(`${BASE_URL}/(app)/analyses`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "04-analyses.png"),
      fullPage: true,
    });
    console.log("✓ Analyses page captured");

    // 6. Medical Opinions
    console.log("📸 5. Capturing Medical Opinions...");
    await page.goto(`${BASE_URL}/(app)/avis`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "05-avis.png"),
      fullPage: true,
    });
    console.log("✓ Medical opinions page captured");

    // 7. Clinical Reports
    console.log("📸 6. Capturing Clinical Reports...");
    await page.goto(`${BASE_URL}/(app)/comptes-rendus`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "06-comptes-rendus.png"),
      fullPage: true,
    });
    console.log("✓ Clinical reports page captured");

    // 8. Prescriptions
    console.log("📸 7. Capturing Prescriptions...");
    await page.goto(`${BASE_URL}/(app)/ordonnances`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "07-ordonnances.png"),
      fullPage: true,
    });
    console.log("✓ Prescriptions page captured");

    // 9. Tasks
    console.log("📸 8. Capturing Tasks...");
    await page.goto(`${BASE_URL}/(app)/tasks`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "08-tasks.png"),
      fullPage: true,
    });
    console.log("✓ Tasks page captured");

    // 10. Activities
    console.log("📸 9. Capturing Activities & Calendar...");
    await page.goto(`${BASE_URL}/(app)/activities`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "09-activities.png"),
      fullPage: true,
    });
    console.log("✓ Activities page captured");

    // 11. Timeline
    console.log("📸 10. Capturing Patient Timeline...");
    await page.goto(`${BASE_URL}/(app)/timeline`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "10-timeline.png"),
      fullPage: true,
    });
    console.log("✓ Timeline page captured");

    // 12. Notifications
    console.log("📸 11. Capturing Notifications...");
    await page.goto(`${BASE_URL}/(app)/notifications`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "11-notifications.png"),
      fullPage: true,
    });
    console.log("✓ Notifications page captured");

    // 13. Profile
    console.log("📸 12. Capturing Profile & Settings...");
    await page.goto(`${BASE_URL}/(app)/profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "12-profile.png"),
      fullPage: true,
    });
    console.log("✓ Profile page captured");

    // 14. Statistics
    console.log("📸 13. Capturing Statistics...");
    await page.goto(`${BASE_URL}/(app)/statistiques`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "13-statistiques.png"),
      fullPage: true,
    });
    console.log("✓ Statistics page captured");

    console.log("\n✅ All screenshots captured successfully!");
    console.log(
      `📁 Screenshots saved to: ${SCREENSHOTS_DIR}`
    );

    // List captured screenshots
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    console.log("\n📸 Captured files:");
    files.forEach((file) => {
      console.log(`  - ${file}`);
    });
  } catch (error) {
    console.error("❌ Error during screenshot capture:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the script
captureScreenshots().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
