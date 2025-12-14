export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  language?: string;
}

export function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const lang = data.language || 'en';

  const content = {
    en: {
      title: 'Reset your password - OpenCare',
      headerTitle: '🔐 Password Reset Request',
      headerSubtitle: 'OpenCare Security',
      greeting: `Hello ${escapeHtml(data.userName)},`,
      thanks: 'We received a request to reset your password for your OpenCare account.',
      instruction: 'Click the button below to create a new password. This link will expire in 1 hour for security reasons.',
      buttonText: '🔑 Reset my password',
      validFor: '⏱️ Link valid for 1 hour',
      validForDetails: 'For your security, this password reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.',
      didNotRequest: '⚠️ Did not request this?',
      didNotRequestText: 'If you did not request a password reset, your account is still secure. No changes will be made unless you click the link above.',
      buttonProblem: 'Problem with the button?',
      buttonProblemText: 'If the button does not work, copy and paste this link into your browser:',
      footerTitle: 'OpenCare — Medical coordination platform',
      footerContact: 'Questions? Contact us at',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. All rights reserved.`
    },
    fr: {
      title: 'Réinitialisez votre mot de passe - OpenCare',
      headerTitle: '🔐 Demande de réinitialisation de mot de passe',
      headerSubtitle: 'Sécurité OpenCare',
      greeting: `Bonjour ${escapeHtml(data.userName)},`,
      thanks: 'Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte OpenCare.',
      instruction: 'Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expirera dans 1 heure pour des raisons de sécurité.',
      buttonText: '🔑 Réinitialiser mon mot de passe',
      validFor: '⏱️ Lien valable pendant 1 heure',
      validForDetails: 'Pour votre sécurité, ce lien de réinitialisation expirera dans 1 heure. Si vous n\'avez pas demandé une réinitialisation de mot de passe, vous pouvez ignorer cet email en toute sécurité.',
      didNotRequest: '⚠️ Vous n\'avez pas demandé cela ?',
      didNotRequestText: 'Si vous n\'avez pas demandé une réinitialisation de mot de passe, votre compte reste sécurisé. Aucune modification ne sera apportée si vous ne cliquez pas sur le lien ci-dessus.',
      buttonProblem: 'Problème avec le bouton ?',
      buttonProblemText: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
      footerTitle: 'OpenCare — Plateforme de coordination médicale',
      footerContact: 'Questions ? Contactez-nous à',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. Tous droits réservés.`
    }
  };

  const t = content[lang as 'en' | 'fr'];

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 15px;
          opacity: 0.95;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message {
          font-size: 15px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .info-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          padding: 20px;
          margin: 25px 0;
        }
        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #92400e;
        }
        .info-box strong {
          color: #78350f;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          font-size: 13px;
          color: #6b7280;
          margin: 8px 0;
        }
        .footer-link {
          color: #ef4444;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 25px 0;
        }
        .warning {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .warning p {
          margin: 0;
          font-size: 13px;
          color: #7f1d1d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${t.headerTitle}</h1>
          <p>${t.headerSubtitle}</p>
        </div>

        <div class="content">
          <p class="greeting">${t.greeting}</p>

          <p class="message">
            ${t.thanks}
          </p>

          <p class="message">
            ${t.instruction}
          </p>

          <div class="button-container">
            <a href="${data.resetUrl}" class="button">
              ${t.buttonText}
            </a>
          </div>

          <div class="info-box">
            <p><strong>${t.validFor}</strong></p>
            <p style="margin-top: 8px;">
              ${t.validForDetails}
            </p>
          </div>

          <div class="divider"></div>

          <div class="warning">
            <p><strong>${t.didNotRequest}</strong><br>
            ${t.didNotRequestText}
            </p>
          </div>

          <div class="divider"></div>

          <p class="message" style="font-size: 13px; color: #6b7280;">
            <strong>${t.buttonProblem}</strong><br>
            ${t.buttonProblemText}<br>
            <a href="${data.resetUrl}" style="color: #ef4444; word-break: break-all;">${data.resetUrl}</a>
          </p>
        </div>

        <div class="footer">
          <p class="footer-text" style="font-weight: 600; color: #1f2937; font-size: 14px;">
            ${t.footerTitle}
          </p>
          <p class="footer-text">
            ${t.footerContact} <a href="mailto:support@opencare.fr" class="footer-link">support@opencare.fr</a>
          </p>
          <p class="footer-text" style="margin-top: 15px; opacity: 0.8;">
            ${t.footerCopyright}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
  const lang = data.language || 'en';

  const content = {
    en: {
      title: 'Password Reset Request',
      greeting: `Hello ${data.userName},`,
      thanks: 'We received a request to reset your password for your OpenCare account.',
      instruction: 'Click the link below to create a new password. This link will expire in 1 hour for security reasons:',
      important: '⏱️ IMPORTANT: This link is valid for 1 hour only.',
      didNotRequest: '⚠️ Did not request this?',
      didNotRequestText: 'If you did not request a password reset, your account is still secure. No changes will be made unless you click the link above.',
      separator: '---',
      footerTitle: 'OpenCare — Medical coordination platform',
      footerContact: 'Questions? Contact us at support@opencare.fr',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. All rights reserved.`
    },
    fr: {
      title: 'Demande de réinitialisation de mot de passe',
      greeting: `Bonjour ${data.userName},`,
      thanks: 'Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte OpenCare.',
      instruction: 'Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe. Ce lien expirera dans 1 heure pour des raisons de sécurité :',
      important: '⏱️ IMPORTANT : Ce lien est valable pendant 1 heure seulement.',
      didNotRequest: '⚠️ Vous n\'avez pas demandé cela ?',
      didNotRequestText: 'Si vous n\'avez pas demandé une réinitialisation de mot de passe, votre compte reste sécurisé. Aucune modification ne sera apportée si vous ne cliquez pas sur le lien ci-dessus.',
      separator: '---',
      footerTitle: 'OpenCare — Plateforme de coordination médicale',
      footerContact: 'Questions ? Contactez-nous à support@opencare.fr',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. Tous droits réservés.`
    }
  };

  const t = content[lang as 'en' | 'fr'];

  return `
${t.title}

${t.greeting}

${t.thanks}

${t.instruction}

${data.resetUrl}

${t.important}

${t.didNotRequest}
${t.didNotRequestText}

${t.separator}
${t.footerTitle}
${t.footerContact}

${t.footerCopyright}
  `.trim();
}
