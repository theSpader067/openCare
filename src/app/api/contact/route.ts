import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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
