export interface VerificationCodeEmailData {
  userName: string;
  code: string;
  language?: string;
}

export function generateVerificationCodeHTML(data: VerificationCodeEmailData): string {
  const language = data.language || 'en';

  const content = {
    en: {
      title: '✨ Verify Your Email',
      subtitle: 'Your OpenCare email verification code',
      greeting: `Hello ${escapeHtml(data.userName)},`,
      message: 'Welcome to OpenCare! Please use the following 6-digit code to verify your email address:',
      codeLabel: 'Verification Code',
      instruction: 'Enter this code in the app to complete your verification. This code will expire in 10 minutes.',
      noAction: 'If you didn\'t create this account, you can ignore this email.',
      footer: '© 2024 OpenCare. All rights reserved.'
    },
    fr: {
      title: '✨ Vérifiez votre email',
      subtitle: 'Votre code de vérification OpenCare',
      greeting: `Bonjour ${escapeHtml(data.userName)},`,
      message: 'Bienvenue sur OpenCare ! Veuillez utiliser le code à 6 chiffres suivant pour vérifier votre adresse e-mail :',
      codeLabel: 'Code de vérification',
      instruction: 'Entrez ce code dans l\'application pour terminer votre vérification. Ce code expirera dans 10 minutes.',
      noAction: 'Si vous n\'avez pas créé ce compte, vous pouvez ignorer cet e-mail.',
      footer: '© 2024 OpenCare. Tous droits réservés.'
    }
  };

  const text = content[language as 'en' | 'fr'] || content.en;

  return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${text.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          margin: 0;
          padding: 20px;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .header {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .header .subtitle {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.95;
          position: relative;
          z-index: 1;
        }

        .content {
          padding: 40px 30px;
        }

        .greeting {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 20px;
          color: #1f2937;
        }

        .message {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 30px;
          color: #4b5563;
        }

        .code-section {
          background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
          border-left: 4px solid #7c3aed;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
        }

        .code-label {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          display: block;
        }

        .code-value {
          font-size: 42px;
          font-weight: 700;
          color: #7c3aed;
          letter-spacing: 6px;
          font-family: 'Courier New', monospace;
          margin: 0;
          word-spacing: 15px;
        }

        .code-description {
          font-size: 13px;
          color: #5b21b6;
          margin-top: 15px;
        }

        .instruction {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .instruction-icon {
          margin-right: 8px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 30px 0;
        }

        .security-info {
          background: #f0fdf4;
          border-left: 4px solid #16a34a;
          border-radius: 6px;
          padding: 15px;
          font-size: 13px;
          color: #166534;
          margin-bottom: 20px;
        }

        .no-action {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .footer {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 30px 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }

        .footer-text {
          margin: 8px 0;
        }

        .logo {
          font-weight: 700;
          color: #7c3aed;
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .container {
            border-radius: 0;
          }

          .header {
            padding: 30px 20px;
          }

          .header h1 {
            font-size: 24px;
          }

          .content {
            padding: 25px 20px;
          }

          .code-section {
            padding: 20px;
          }

          .code-value {
            font-size: 36px;
            letter-spacing: 4px;
            word-spacing: 10px;
          }

          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>${text.title}</h1>
          <p class="subtitle">${text.subtitle}</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Greeting -->
          <p class="greeting">${text.greeting}</p>

          <!-- Message -->
          <p class="message">${text.message}</p>

          <!-- Code Section -->
          <div class="code-section">
            <span class="code-label">${text.codeLabel}</span>
            <div class="code-value">${escapeHtml(data.code)}</div>
            <p class="code-description">🔐 ${language === 'fr' ? 'Gardez ce code secret' : 'Keep this code secret'}</p>
          </div>

          <!-- Instruction -->
          <div class="instruction">
            <span class="instruction-icon">📱</span>${text.instruction}
          </div>

          <!-- Security Info -->
          <div class="security-info">
            🛡️ ${language === 'fr'
              ? 'Ce code n\'est valable que pour vous et expirera dans 10 minutes.'
              : 'This code is only valid for you and will expire in 10 minutes.'}
          </div>

          <!-- No Action -->
          <p class="no-action">${text.noAction}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            <span class="logo">OpenCare</span> — ${language === 'fr'
              ? 'Plateforme intelligente de coordination médicale'
              : 'Intelligent medical coordination platform'}
          </p>
          <p class="footer-text">${text.footer}</p>
          <p class="footer-text" style="margin-top: 12px; opacity: 0.7;">
            ${language === 'fr'
              ? 'Cet email a été généré automatiquement lors de l\'inscription à la plateforme.'
              : 'This email was generated automatically during platform registration.'}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateVerificationCodeText(data: VerificationCodeEmailData): string {
  const language = data.language || 'en';

  const content = {
    en: {
      title: '✨ Verify Your Email - OpenCare',
      greeting: `Hello ${data.userName},`,
      message: 'Welcome to OpenCare! Please use the following 6-digit code to verify your email address:',
      codeLabel: 'Verification Code:',
      instruction: 'Enter this code in the app to complete your verification. This code will expire in 10 minutes.',
      security: '🛡️ This code is only valid for you and will expire in 10 minutes.',
      noAction: 'If you didn\'t create this account, you can ignore this email.',
      footer: '© 2024 OpenCare. All rights reserved.'
    },
    fr: {
      title: '✨ Vérifiez votre email - OpenCare',
      greeting: `Bonjour ${data.userName},`,
      message: 'Bienvenue sur OpenCare ! Veuillez utiliser le code à 6 chiffres suivant pour vérifier votre adresse e-mail :',
      codeLabel: 'Code de vérification :',
      instruction: 'Entrez ce code dans l\'application pour terminer votre vérification. Ce code expirera dans 10 minutes.',
      security: '🛡️ Ce code n\'est valable que pour vous et expirera dans 10 minutes.',
      noAction: 'Si vous n\'avez pas créé ce compte, vous pouvez ignorer cet e-mail.',
      footer: '© 2024 OpenCare. Tous droits réservés.'
    }
  };

  const text = content[language as 'en' | 'fr'] || content.en;

  return `
${text.title}

${text.greeting}

${text.message}

${text.codeLabel}
${data.code}

${text.instruction}

${text.security}

${text.noAction}

---
${text.footer}
  `.trim();
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
