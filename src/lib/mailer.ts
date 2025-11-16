import nodemailer from "nodemailer";
import { generateContactEmailHTML, generateContactEmailText, type ContactEmailData } from "./email-templates/contact-notification";

// Create transporter using environment variables
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true"; // Use TLS if SMTP_SECURE is true
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

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
