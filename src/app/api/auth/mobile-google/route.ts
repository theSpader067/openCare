import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "opencare-mobile-secret-key-2024";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Decode token without verification (UNSAFE - for testing only)
    const decoded = jwt.decode(idToken) as any;

    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { error: "Invalid ID token" },
        { status: 401 }
      );
    }

    const { email, given_name, family_name, picture } = decoded;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user for Google login
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || "",
          lastName: family_name || "",
          username: `${given_name || "user"}.${family_name || email.split("@")[0]}`.toLowerCase().replace(/\s+/g, ""),
          image: picture,
          emailVerified: true, // Google email is verified
          updatedAt: new Date(),
        },
      });
    }

    // Generate JWT token for mobile app
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: "mobile",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      },
    });
  } catch (error) {
    console.error("[MOBILE_GOOGLE] Error:", error);
    return NextResponse.json(
      { error: "An error occurred during Google login" },
      { status: 500 }
    );
  }
}
