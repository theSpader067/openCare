import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sendSignupNotificationToAdmin, sendVerificationCodeEmail } from "@/lib/mail"

const prisma = new PrismaClient()

// Helper function to generate a secure 6-digit code
function generateVerificationCode(): string {
  return Math.floor(Math.random() * 900000 + 100000).toString()
}

/**
 * POST /api/auth/mobile-signup
 *
 * Creates a new user account and returns JWT token for mobile app
 * User email is auto-verified for mobile app convenience
 */
export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, first name, and last name are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate username from first and last name
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`

    // Create user - NOT auto-verified, will verify via code
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        emailVerified: false, // Will be verified after code entry
        language: "en",
      },
    })

    // Generate 6-digit verification code for mobile
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete old verification code if exists (unique constraint on email)
    await prisma.verificationCode.deleteMany({
      where: { email }
    }).catch(() => {
      // Ignore if no code exists
    })

    // Store verification code
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
      },
    })

    // Send verification code email
    const displayName = `${firstName} ${lastName}`
    try {
      await sendVerificationCodeEmail(email, code, displayName, "en")
      console.log(`[MOBILE_SIGNUP] Verification code sent to ${email}`)
    } catch (emailError) {
      console.error("[MOBILE_SIGNUP] Failed to send verification code email:", emailError)
      // Note: We don't throw here - user is already created with code in DB
      // Mobile app will show verification screen, and email may arrive later
    }

    // Generate JWT token for immediate use (will be re-verified after code entry)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret-key",
      { expiresIn: "30d" } // 30 day expiry, matching NextAuth session maxAge
    )

    // Send notification to admin (non-blocking, same as web signup)
    const fullName = `${user.firstName} ${user.lastName}`
    sendSignupNotificationToAdmin(fullName, user.email).catch((err) => {
      console.error("[MOBILE_SIGNUP] Failed to send admin notification:", err)
    })

    // Return user data and token
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[MOBILE_SIGNUP] Error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
