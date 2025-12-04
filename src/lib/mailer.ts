import nodemailer from "nodemailer";
import { generateContactEmailHTML, generateContactEmailText, type ContactEmailData } from "./email-templates/contact-notification";
import { generateSignupNotificationHTML, generateSignupNotificationText, type SignupNotificationData } from "./email-templates/signup-notification";

// Create transporter using environment variables
function getTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true"; // Use TLS if SMTP_SECURE is true
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASS;

  console.log("[EMAIL] SMTP Configuration Check:");
  console.log("[EMAIL] Host:", host ? "✓ Set" : "✗ Missing");
  console.log("[EMAIL] Port:", port);
  console.log("[EMAIL] Secure:", secure);
  console.log("[EMAIL] User:", user ? "✓ Set" : "✗ Missing");
  console.log("[EMAIL] Password:", pass ? "✓ Set" : "✗ Missing");

  if (!host || !user || !pass) {
    const missingVars = [];
    if (!host) missingVars.push("SMTP_HOST");
    if (!user) missingVars.push("SMTP_USER");
    if (!pass) missingVars.push("SMTP_PASSWORD");

    const error = new Error(
      `Email configuration incomplete. Missing: ${missingVars.join(", ")}. Please set these in your .env.local file.`
    );
    console.error("[EMAIL] Configuration Error:", error.message);
    throw error;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

export interface SendContactEmailOptions {
  data: ContactEmailData;
  recipientEmail: string;
}

export async function sendContactEmail(options: SendContactEmailOptions): Promise<void> {
  const { data, recipientEmail } = options;

  try {
    console.log("[EMAIL] Preparing to send contact notification...");
    console.log("[EMAIL] Recipient:", recipientEmail);
    console.log("[EMAIL] From:", data.fullName);

    const transporter = getTransporter();
    console.log("[EMAIL] Transporter created successfully");

    const htmlContent = generateContactEmailHTML(data);
    const textContent = generateContactEmailText(data);

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
      from: `"OpenCare Contact" <${fromEmail}>`,
      to: recipientEmail,
      subject: `Nouvelle demande de contact - ${data.fullName} (${data.specialty})`,
      html: htmlContent,
      text: textContent,
      replyTo: data.email,
    };

    console.log("[EMAIL] Sending email with options:", {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] ✓ Contact email sent successfully!", {
      messageId: result.messageId,
      response: result.response,
    });
  } catch (error) {
    console.error("[EMAIL] ✗ Failed to send contact email:", error);
    throw error;
  }
}

export interface SendSignupNotificationOptions {
  data: SignupNotificationData;
  recipientEmail: string;
}

export async function sendSignupNotificationEmail(options: SendSignupNotificationOptions): Promise<void> {
  const { data, recipientEmail } = options;

  try {
    console.log("[EMAIL] ========== SIGNUP NOTIFICATION ==========");
    console.log("[EMAIL] Preparing to send signup notification...");
    console.log("[EMAIL] Recipient:", recipientEmail);
    console.log("[EMAIL] New user:", data.userName, "Email:", data.userEmail);

    const transporter = getTransporter();
    console.log("[EMAIL] Transporter created successfully");

    const htmlContent = generateSignupNotificationHTML(data);
    const textContent = generateSignupNotificationText(data);

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    console.log("[EMAIL] From email:", fromEmail);

    const mailOptions = {
      from: `"OpenCare Signup" <${fromEmail}>`,
      to: recipientEmail,
      subject: `✨ Nouvelle inscription utilisateur - ${data.userName}`,
      html: htmlContent,
      text: textContent,
    };

    console.log("[EMAIL] Sending signup notification with options:", {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] ✓ Signup notification email sent successfully!", {
      messageId: result.messageId,
      response: result.response,
    });
    console.log("[EMAIL] ==========================================");
  } catch (error) {
    console.error("[EMAIL] ✗ Failed to send signup notification email:");
    console.error("[EMAIL] Error:", error);
    console.error("[EMAIL] ==========================================");
    throw error;
  }
}
