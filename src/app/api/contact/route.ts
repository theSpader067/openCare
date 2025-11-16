import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mailer";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, specialty, message } = body;

    // Validate required fields
    if (!fullName || !email || !specialty || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create contact record
    const contact = await prisma.contact.create({
      data: {
        fullName,
        email,
        specialty,
        message,
      },
    });

    // Send email notification (non-blocking - don't wait for it)
    const recipientEmail = process.env.CONTACT_EMAIL_RECIPIENT || process.env.SMTP_USER;
    console.log("[CONTACT_API] Recipient email:", recipientEmail);

    if (recipientEmail) {
      console.log("[CONTACT_API] Sending contact notification email...");
      // Use setTimeout to ensure this runs asynchronously without blocking the response
      setTimeout(async () => {
        try {
          await sendContactEmail({
            data: {
              fullName,
              email,
              specialty,
              message,
              submittedAt: contact.createdAt,
            },
            recipientEmail,
          });
          console.log("[CONTACT_API] ✓ Email notification sent successfully");
        } catch (error) {
          console.error("[CONTACT_API] ✗ Failed to send contact notification email:", error);
          // Don't throw - email failure shouldn't fail the API request
        }
      }, 0);
    } else {
      console.warn("[CONTACT_API] ⚠ No email recipient configured. Set CONTACT_EMAIL_RECIPIENT or SMTP_USER env var.");
    }

    return NextResponse.json(
      { success: true, contact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
