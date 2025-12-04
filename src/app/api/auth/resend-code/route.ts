import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { sendVerificationCodeEmail } from "@/lib/mail"

const prisma = new PrismaClient()

// Helper function to generate a secure 6-digit code
function generateVerificationCode(): string {
  return Math.floor(Math.random() * 900000 + 100000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Generate new verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete old verification code if exists
    await prisma.verificationCode.deleteMany({
      where: { email }
    }).catch(() => {
      // Ignore if no code exists
    })

    // Create new verification code
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
    const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email.split('@')[0]
    await sendVerificationCodeEmail(email, code, displayName, user.language || 'en')

    console.log(`[RESEND_CODE] New verification code sent to ${email}`)

    return NextResponse.json({
      success: true,
      message: "Verification code has been resent to your email"
    })
  } catch (error) {
    console.error("[RESEND_CODE] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to resend verification code" },
      { status: 500 }
    )
  }
}
