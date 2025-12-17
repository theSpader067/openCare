import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendVerificationEmail, sendSignupNotificationToAdmin, sendVerificationCodeEmail } from "@/lib/mail"


const prisma = new PrismaClient()

// Helper function to generate a secure 6-digit code
function generateVerificationCode(): string {
  return Math.floor(Math.random() * 900000 + 100000).toString()
}

export async function POST(req: Request) {
  try {
    const { fullName, email, password, language, isMobileApp, firstName, lastName } = await req.json()

    // Support both web (fullName) and mobile (firstName + lastName) formats
    const displayName = fullName || `${firstName} ${lastName}`.trim()
    const username = displayName.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('.')

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        firstName: firstName || displayName.split(' ')[0],
        lastName: lastName || displayName.split(' ')[1] || '',
        emailVerified: false,
        language: language || 'en',
        updatedAt: new Date(),
      },
    })

    // Check if this is a mobile app signup
    if (isMobileApp) {
      // Generate 6-digit verification code for mobile
      const code = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store verification code
      await prisma.verificationCode.create({
        data: {
          email,
          code,
          expiresAt,
          attempts: 0,
          maxAttempts: 5
        }
      })

      // Send verification code email
      await sendVerificationCodeEmail(email, code, displayName, language || 'en')

      console.log(`[SIGNUP] 6-digit verification code sent to ${email}`)
    } else {
      // Use token-based verification for web
      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

      await prisma.verificationToken.create({
        data: { identifier: token, token, userId: user.id, expires },
      })

      // Send verification email to user
      await sendVerificationEmail(email, token, displayName, language || 'en')

      console.log(`[SIGNUP] Token-based verification email sent to ${email}`)
    }

    // Send notification to admin (non-blocking)
    sendSignupNotificationToAdmin(displayName, email).catch((err) => {
      console.error("[SIGNUP] Failed to send admin notification:", err)
    })

    return NextResponse.json({
      message: isMobileApp
        ? "User created. Check your email for the 6-digit verification code."
        : "User created. Check your email to verify your account.",
    })
  } catch (err) {
    console.error("[SIGNUP] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
