import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  console.log("here is the token:", token)

  if (!token)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=invalid_token`
    )

  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record || record.expires < new Date())
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=expired`
    )

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  })

  await prisma.verificationToken.delete({ where: { identifier: record.identifier } })

  // Redirect to login so user can establish a session
  // The redirect callback will then send them to onboarding
  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/login?verified=1`
  )
  }
