# Email Configuration Guide

This document explains how to set up email notifications for the contact form.

## Overview

When someone submits the contact form on the landing page, an email notification is sent to a configured recipient with all the submission details. The email includes:

- Contact name, email, and specialty
- Full message content
- Submission timestamp
- Formatted HTML email with professional styling

## Environment Variables

Add these variables to your `.env.local` file:

### SMTP Server Configuration

```env
# SMTP Host (e.g., smtp.gmail.com, smtp.office365.com, your-mail-server.com)
SMTP_HOST=smtp.gmail.com

# SMTP Port (typically 587 for TLS, 465 for SSL)
SMTP_PORT=587

# Use TLS/SSL (true for port 465, false for port 587)
SMTP_SECURE=false

# SMTP Authentication
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: From address (defaults to SMTP_USER if not set)
SMTP_FROM_EMAIL=noreply@opencare.fr

# Email recipient for contact form submissions
# If not set, defaults to SMTP_USER
CONTACT_EMAIL_RECIPIENT=contact@opencare.fr
```

## Setup Instructions

### Using Gmail

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password

3. Configure your `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character app password (spaces included)
CONTACT_EMAIL_RECIPIENT=your-email@gmail.com
```

### Using Office 365/Outlook

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
CONTACT_EMAIL_RECIPIENT=your-email@example.com
```

### Using Custom SMTP Server

```env
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASSWORD=password
CONTACT_EMAIL_RECIPIENT=admin@example.com
```

## Email Template

The contact form notifications use a professional HTML template located at:
```
src/lib/email-templates/contact-notification.ts
```

The template includes:
- Gradient header with "Nouvelle demande de contact"
- Formatted sections for contact info
- Message display with proper formatting
- Submission timestamp
- Professional footer

## Testing

To test email functionality:

1. Ensure all environment variables are set correctly
2. Fill out the contact form on the landing page
3. Check the recipient email inbox for the notification

You should receive an email titled: `Nouvelle demande de contact - [Name] ([Specialty])`

## Troubleshooting

### "Email configuration missing" Error

Ensure these variables are set in `.env.local`:
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASSWORD`

### Emails not being sent

1. Check server logs: `npm run dev` will show email errors
2. Verify SMTP credentials are correct
3. Check if firewall/ISP is blocking SMTP port
4. For Gmail: verify App Password is set (not regular password)
5. For Office 365: ensure Modern Authentication is enabled

### Emails go to spam

1. Add proper DNS records (SPF, DKIM, DMARC) to your domain
2. Use a professional from address
3. Avoid suspicious content in emails

## Files Modified

- `src/lib/mailer.ts` - Email sending utility
- `src/lib/email-templates/contact-notification.ts` - HTML/text templates
- `src/app/api/contact/route.ts` - Contact API endpoint (sends email)
- `.env.example` - Example environment variables

## Notes

- Email sending is non-blocking: if email fails, the API request still succeeds
- Email failures are logged but don't affect the user experience
- The contact submission is saved to the database regardless of email status
- Reply-To header is set to the submitter's email address
