import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json()

    // Validate input
    if (!code || !email) {
      return NextResponse.json(
        { success: false, error: "Code and email are required" },
        { status: 400 }
      )
    }

    // Find verification code record
    const verificationRecord = await prisma.verificationCode.findUnique({
      where: { email }
    })

    if (!verificationRecord) {
      return NextResponse.json(
        { success: false, error: "No verification code found for this email" },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (new Date() > verificationRecord.expiresAt) {
      // Delete expired code
      await prisma.verificationCode.delete({ where: { email } })
      return NextResponse.json(
        { success: false, error: "Verification code has expired" },
        { status: 400 }
      )
    }

    // Check attempt limit
    if (verificationRecord.attempts >= verificationRecord.maxAttempts) {
      // Delete code after too many attempts
      await prisma.verificationCode.delete({ where: { email } })
      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Please request a new code." },
        { status: 400 }
      )
    }

    // Check if code matches
    if (verificationRecord.code !== code) {
      // Increment attempts
      await prisma.verificationCode.update({
        where: { email },
        data: { attempts: verificationRecord.attempts + 1 }
      })
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Code is valid - verify user email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 400 }
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    })

    // Delete verification code
    await prisma.verificationCode.delete({ where: { email } })

    // Generate JWT token for auto-login
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret-key",
      { expiresIn: "30d" }
    )

    console.log(`[VERIFY_CODE] Email verified for User: ${email}`)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      token,
      User: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    }, { status: 200 })

  } catch (error) {
    console.error("[VERIFY_CODE] Error:", error)
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}
