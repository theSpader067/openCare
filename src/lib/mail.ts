import nodemailer from "nodemailer"
import { generateVerificationEmailHTML, generateVerificationEmailText } from "./email-templates/verification-email"
import { generateSignupNotificationHTML, generateSignupNotificationText } from "./email-templates/signup-notification"

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string, userName: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  const htmlContent = generateVerificationEmailHTML({
    userName,
    verificationUrl: verifyUrl,
  })

  const textContent = generateVerificationEmailText({
    userName,
    verificationUrl: verifyUrl,
  })

  await transporter.sendMail({
    from: `"OpenCare" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "✉️ Vérifiez votre adresse email - OpenCare",
    html: htmlContent,
    text: textContent,
  })
}

export async function sendSignupNotificationToAdmin(userName: string, userEmail: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_SERVER_USER

  if (!adminEmail) {
    console.warn("[EMAIL] No admin email configured for signup notifications")
    return
  }

  const htmlContent = generateSignupNotificationHTML({
    userName,
    userEmail,
    signupDate: new Date(),
  })

  const textContent = generateSignupNotificationText({
    userName,
    userEmail,
    signupDate: new Date(),
  })

  try {
    await transporter.sendMail({
      from: `"OpenCare Notifications" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
      to: adminEmail,
      subject: `✨ Nouvelle inscription - ${userName}`,
      html: htmlContent,
      text: textContent,
    })
    console.log(`[EMAIL] ✓ Signup notification sent to admin: ${adminEmail}`)
  } catch (error) {
    console.error("[EMAIL] ✗ Failed to send signup notification to admin:", error)
    // Don't throw error - this is a notification and shouldn't block signup
  }
}
