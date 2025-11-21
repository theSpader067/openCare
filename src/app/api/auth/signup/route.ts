import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendVerificationEmail, sendSignupNotificationToAdmin } from "@/lib/mail"


const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { fullName, email, password, language } = await req.json()
    const username = fullName.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('.')

    if (!email || !password || !fullName) {
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
        emailVerified: false,
        language: language || 'en'
      },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.verificationToken.create({
      data: { token, userId: user.id, expires },
    })

    // Send verification email to user
    await sendVerificationEmail(email, token, fullName, language || 'en')

    // Send notification to admin (non-blocking)
    sendSignupNotificationToAdmin(fullName, email).catch((err) => {
      console.error("[SIGNUP] Failed to send admin notification:", err)
    })

    return NextResponse.json({
      message: "User created. Check your email to verify your account.",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
