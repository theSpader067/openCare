import nodemailer from "nodemailer"
import { generateVerificationEmailHTML, generateVerificationEmailText } from "./email-templates/verification-email"
import { generateSignupNotificationHTML, generateSignupNotificationText } from "./email-templates/signup-notification"
import { generateVerificationCodeHTML, generateVerificationCodeText } from "./email-templates/verification-code"

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string, userName: string, language: string = 'en') {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  const htmlContent = generateVerificationEmailHTML({
    userName,
    verificationUrl: verifyUrl,
    language,
  })

  const textContent = generateVerificationEmailText({
    userName,
    verificationUrl: verifyUrl,
    language,
  })

  const subjects = {
    en: "✉️ Verify your email address - OpenCare",
    fr: "✉️ Vérifiez votre adresse email - OpenCare"
  }

  const subject = subjects[language as 'en' | 'fr'] || subjects.en

  await transporter.sendMail({
    from: `"OpenCare" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject,
    html: htmlContent,
    text: textContent,
  })
}

export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  userName: string,
  language: string = 'en'
) {
  const htmlContent = generateVerificationCodeHTML({
    userName,
    code,
    language,
  })

  const textContent = generateVerificationCodeText({
    userName,
    code,
    language,
  })

  const subjects = {
    en: "✉️ Verify your email with code - OpenCare",
    fr: "✉️ Vérifiez votre email avec le code - OpenCare"
  }

  const subject = subjects[language as 'en' | 'fr'] || subjects.en

  await transporter.sendMail({
    from: `"OpenCare" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject,
    html: htmlContent,
    text: textContent,
  })
}

export async function sendSignupNotificationToAdmin(userName: string, userEmail: string) {
  // Send to hardcoded email address for signup notifications
  const adminEmail = "nawfalbouziane037@gmail.com"

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
