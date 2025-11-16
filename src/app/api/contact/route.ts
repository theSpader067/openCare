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
    if (recipientEmail) {
      sendContactEmail({
        data: {
          fullName,
          email,
          specialty,
          message,
          submittedAt: contact.createdAt,
        },
        recipientEmail,
      }).catch((error) => {
        console.error("Failed to send contact notification email:", error);
        // Don't throw - email failure shouldn't fail the API request
      });
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
