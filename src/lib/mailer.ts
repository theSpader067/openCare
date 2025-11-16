import nodemailer from "nodemailer";
import { generateContactEmailHTML, generateContactEmailText, type ContactEmailData } from "./email-templates/contact-notification";

// Create transporter using environment variables
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true"; // Use TLS if SMTP_SECURE is true
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "Email configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables."
    );
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
    const transporter = getTransporter();

    const htmlContent = generateContactEmailHTML(data);
    const textContent = generateContactEmailText(data);

    const mailOptions = {
      from: `"OpenCare Contact" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Nouvelle demande de contact - ${data.fullName} (${data.specialty})`,
      html: htmlContent,
      text: textContent,
      replyTo: data.email,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Contact email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw error;
  }
}
