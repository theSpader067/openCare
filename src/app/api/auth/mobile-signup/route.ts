import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sendSignupNotificationEmail } from "@/lib/mailer"

const prisma = new PrismaClient()

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        emailVerified: true, // Auto-verify for mobile app
        language: "en",
      },
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret-key",
      { expiresIn: "30d" } // 30 day expiry, matching NextAuth session maxAge
    )

    // Send signup notification email to admin
    try {
      const adminEmail = "nawfalbouziane037@gmail.com"
      const fullName = `${user.firstName} ${user.lastName}`

      console.log("[MOBILE_SIGNUP] ========== SENDING SIGNUP EMAIL ==========")
      console.log("[MOBILE_SIGNUP] About to send notification for user:", fullName, "<", user.email, ">")
      console.log("[MOBILE_SIGNUP] Admin email:", adminEmail)

      await sendSignupNotificationEmail({
        data: {
          userName: fullName,
          userEmail: user.email,
          signupDate: new Date(),
        },
        recipientEmail: adminEmail,
      })

      console.log("[MOBILE_SIGNUP] ✓ Notification email sent successfully to admin")
      console.log("[MOBILE_SIGNUP] ==========================================")
    } catch (emailError) {
      console.error("[MOBILE_SIGNUP] ✗ Failed to send notification email")
      console.error("[MOBILE_SIGNUP] Error details:", emailError)
      console.error("[MOBILE_SIGNUP] ==========================================")
      // Don't fail the signup if email fails - just log it
    }

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
