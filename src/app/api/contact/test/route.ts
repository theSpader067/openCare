import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mailer";

/**
 * Test endpoint for email configuration
 * POST /api/contact/test
 *
 * Use this to verify your email configuration is working correctly
 *
 * Example:
 * curl -X POST http://localhost:3000/api/contact/test \
 *   -H "Content-Type: application/json" \
 *   -d '{"testEmail":"your-email@example.com"}'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testEmail = body.testEmail || process.env.SMTP_USER;

    if (!testEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "No test email provided and SMTP_USER not configured",
          message: "Either provide ?testEmail=your@email.com or set SMTP_USER env var",
        },
        { status: 400 }
      );
    }

    console.log("[TEST] Starting email configuration test...");
    console.log("[TEST] Sending test email to:", testEmail);

    await sendContactEmail({
      data: {
        fullName: "Test User",
        email: "test@example.com",
        specialty: "Testing",
        message: "This is a test email to verify your SMTP configuration is working correctly.",
        submittedAt: new Date(),
      },
      recipientEmail: testEmail,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test email sent successfully!",
        details: {
          recipientEmail: testEmail,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[TEST] Email test failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: "Email test failed",
        message: errorMessage,
        troubleshooting: {
          check1: "Verify SMTP_HOST is set in .env.local",
          check2: "Verify SMTP_USER is set in .env.local",
          check3: "Verify SMTP_PASSWORD is set in .env.local",
          check4: "Ensure SMTP_PORT is correct (usually 587 or 465)",
          check5: "Check server logs below for detailed error messages",
        },
      },
      { status: 500 }
    );
  }
}
