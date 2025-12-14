import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mail"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // For security, don't reveal if email exists
      // Still return success to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
      })
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    })

    // Generate a new token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expires: expiresAt,
      },
    })

    // Get user's preferred language
    const language = user.language || "en"

    // Get user's name for the email
    const userName = user.firstName || email.split("@")[0]

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, token, userName, language)
    } catch (emailError) {
      console.error("[PASSWORD_RESET] Failed to send email:", emailError)
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("[PASSWORD_RESET] Error:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
