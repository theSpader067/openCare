import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json()

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and ensure email is verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: true,
      },
    })

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { token },
    })

    // Also delete any other reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("[RESET_PASSWORD] Error:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    )
  }
}

// GET endpoint to validate token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.email,
    })
  } catch (error) {
    console.error("[VALIDATE_RESET_TOKEN] Error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
