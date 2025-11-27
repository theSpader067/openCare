import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();

// Initialize Google OAuth client for verifying ID tokens from mobile app
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || "135644712771-9etjnh7005g7361gfqqd0t2ksh4hm02u.apps.googleusercontent.com"
);

/**
 * POST /api/auth/mobile-google
 *
 * Authenticates user with Google ID token from Expo Google Auth
 * and returns JWT token for mobile app
 *
 * Request body:
 * {
 *   idToken: string (from Expo Google Auth)
 * }
 *
 * Response:
 * {
 *   user: { id, email, firstName, lastName, username },
 *   token: string (JWT)
 * }
 */
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    console.log("[MOBILE_GOOGLE] Google login request received");

    // Validate input
    if (!idToken) {
      console.log("[MOBILE_GOOGLE] Missing idToken");
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the ID token with Google
    console.log("[MOBILE_GOOGLE] Verifying ID token with Google...");
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: [
          process.env.GOOGLE_EXPO_CLIENT_ID || "135644712771-9etjnh7005g7361gfqqd0t2ksh4hm02u.apps.googleusercontent.com",
          process.env.GOOGLE_ANDROID_CLIENT_ID || "135644712771-c3cbm8c21remr9snqqgsni37va07lrrb.apps.googleusercontent.com",
          process.env.GOOGLE_IOS_CLIENT_ID || "135644712771-vb6es5bcvbtdt8cns1n8vrtdr5g22jb0.apps.googleusercontent.com",
        ],
      });
    } catch (error) {
      console.error("[MOBILE_GOOGLE] Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid or expired ID token" },
        { status: 401 }
      );
    }

    const payload = ticket.getPayload();
    if (!payload) {
      console.log("[MOBILE_GOOGLE] No payload in verified token");
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const googleEmail = payload.email;
    const googleName = payload.name || "";
    const googlePicture = payload.picture || "";

    console.log("[MOBILE_GOOGLE] Token verified for email:", googleEmail);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleEmail },
    });

    if (!user) {
      console.log("[MOBILE_GOOGLE] User not found, creating new user");

      // Parse name into firstName and lastName
      const [firstName, ...lastNameParts] = googleName.split(" ");
      const lastName = lastNameParts.join(" ") || "";

      user = await prisma.user.create({
        data: {
          email: googleEmail!,
          firstName: firstName || "User",
          lastName: lastName || "",
          username: googleEmail!.split("@")[0], // username from email prefix
          emailVerified: true, // Auto-verify Google users
          image: googlePicture,
          // No password for OAuth users
        },
      });
      console.log("[MOBILE_GOOGLE] New user created:", user.email);
    } else {
      console.log("[MOBILE_GOOGLE] Existing user found:", user.email);

      // Update image if not already set
      if (!user.image && googlePicture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: googlePicture },
        });
      }
    }

    // Generate JWT token
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-key";
    console.log("[MOBILE_GOOGLE] Secret available:", !!process.env.NEXTAUTH_SECRET);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      secret,
      { expiresIn: "30d" } // 30 day expiry
    );
    console.log("[MOBILE_GOOGLE] JWT token generated successfully");

    // Return user data and token
    console.log("[MOBILE_GOOGLE] Google login successful for user:", user.email);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
      token,
    });
  } catch (error) {
    console.error("[MOBILE_GOOGLE] Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
