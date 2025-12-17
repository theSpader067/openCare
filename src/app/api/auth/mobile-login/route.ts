import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

/**
 * POST /api/auth/mobile-login
 *
 * Authenticates user with email/password and returns JWT token for mobile app
 * This endpoint mirrors NextAuth credentials provider but returns a JWT token
 * instead of creating a session
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log("[MOBILE_LOGIN] Request received for email:", email)

    // Validate input
    if (!email || !password) {
      console.log("[MOBILE_LOGIN] Missing email or password")
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // User not found
    if (!user) {
      console.log("[MOBILE_LOGIN] User not found for email:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log("[MOBILE_LOGIN] User found:", user.email, "has password:", !!user.password)

    // User has no password (OAuth only account)
    if (!user.password) {
      console.log("[MOBILE_LOGIN] User has no password (OAuth account)")
      return NextResponse.json(
        { error: "This account uses OAuth login. Please use Google Sign-In instead." },
        { status: 401 }
      )
    }

    // Verify password
    console.log("[MOBILE_LOGIN] Comparing passwords...")
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log("[MOBILE_LOGIN] Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("[MOBILE_LOGIN] Password invalid for User:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Generate JWT token
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-key";
    console.log("[MOBILE_LOGIN] Secret available:", !!process.env.NEXTAUTH_SECRET);
    console.log("[MOBILE_LOGIN] Using secret:", secret === "fallback-secret-key" ? "FALLBACK" : "FROM_ENV");

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      secret,
      { expiresIn: "30d" } // 30 day expiry, matching NextAuth session maxAge
    );
    console.log("[MOBILE_LOGIN] Token generated successfully");

    // Return user data and token
    console.log("[MOBILE_LOGIN] Login successful for User:", user.email)
    return NextResponse.json({
      User: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
      token,
    })
  } catch (error) {
    console.error("[MOBILE_LOGIN] Error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
