export interface VerificationEmailData {
  userName: string;
  verificationUrl: string;
  language?: string;
}

export function generateVerificationEmailHTML(data: VerificationEmailData): string {
  const lang = data.language || 'en';
  const isEnglish = lang === 'en';

  const content = {
    en: {
      title: 'Verify your email address - OpenCare',
      headerTitle: '🎉 Welcome to OpenCare!',
      headerSubtitle: 'Your medical coordination platform',
      greeting: `Hello ${escapeHtml(data.userName)},`,
      thanks: 'Thank you for creating your OpenCare account! We are delighted to welcome you to our community of healthcare professionals.',
      instruction: 'To finalize your registration and access all platform features, please verify your email address by clicking the button below:',
      buttonText: '✓ Verify my email address',
      validFor: '⏱️ Link valid for 24 hours',
      validForDetails: 'This verification link will expire in 24 hours for security reasons. If the link expires, you can request a new verification link.',
      nextStepsTitle: 'What happens next?',
      nextStepsIntro: 'Once your email is verified, you will be able to:',
      features: [
        'Manage your patients and their medical records',
        'Create and track clinical observations',
        'Coordinate with your medical team',
        'Access AI assistance tools'
      ],
      notYouTitle: '⚠️ You did not create this account?',
      notYouText: 'If you are not the source of this registration, you can safely ignore this email. No account will be created without verification.',
      buttonProblem: 'Problem with the button?',
      buttonProblemText: 'If the button does not work, copy and paste this link into your browser:',
      footerTitle: 'OpenCare — Medical coordination platform',
      footerContact: 'Questions? Contact us at',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. All rights reserved.`
    },
    fr: {
      title: 'Vérifiez votre adresse email - OpenCare',
      headerTitle: '🎉 Bienvenue sur OpenCare !',
      headerSubtitle: 'Votre plateforme de coordination médicale',
      greeting: `Bonjour ${escapeHtml(data.userName)},`,
      thanks: 'Merci d\'avoir créé votre compte OpenCare ! Nous sommes ravis de vous accueillir parmi notre communauté de professionnels de santé.',
      instruction: 'Pour finaliser votre inscription et accéder à toutes les fonctionnalités de la plateforme, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :',
      buttonText: '✓ Vérifier mon adresse email',
      validFor: '⏱️ Lien valable pendant 24 heures',
      validForDetails: 'Ce lien de vérification expirera dans 24 heures pour des raisons de sécurité. Si le lien expire, vous pourrez demander un nouveau lien de vérification.',
      nextStepsTitle: 'Que se passe-t-il ensuite ?',
      nextStepsIntro: 'Une fois votre email vérifié, vous pourrez :',
      features: [
        'Gérer vos patients et leurs dossiers médicaux',
        'Créer et suivre des observations cliniques',
        'Coordonner avec votre équipe médicale',
        'Accéder aux outils d\'assistance IA'
      ],
      notYouTitle: '⚠️ Vous n\'avez pas créé ce compte ?',
      notYouText: 'Si vous n\'êtes pas à l\'origine de cette inscription, vous pouvez ignorer cet email en toute sécurité. Aucun compte ne sera créé sans vérification.',
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .info-box {
          background-color: #f3f4f6;
          border-left: 4px solid #667eea;
          border-radius: 6px;
          padding: 20px;
          margin: 25px 0;
        }
        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #4b5563;
        }
        .info-box strong {
          color: #1f2937;
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
          color: #667eea;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 25px 0;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .warning p {
          margin: 0;
          font-size: 13px;
          color: #92400e;
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
            <a href="${data.verificationUrl}" class="button">
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

          <p class="message" style="font-size: 14px;">
            <strong>${t.nextStepsTitle}</strong><br>
            ${t.nextStepsIntro}
          </p>
          <ul style="color: #4b5563; font-size: 14px; line-height: 1.8;">
            ${t.features.map(feature => `<li>${feature}</li>`).join('\n            ')}
          </ul>

          <div class="warning">
            <p><strong>${t.notYouTitle}</strong><br>
            ${t.notYouText}
            </p>
          </div>

          <div class="divider"></div>

          <p class="message" style="font-size: 13px; color: #6b7280;">
            <strong>${t.buttonProblem}</strong><br>
            ${t.buttonProblemText}<br>
            <a href="${data.verificationUrl}" style="color: #667eea; word-break: break-all;">${data.verificationUrl}</a>
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

export function generateVerificationEmailText(data: VerificationEmailData): string {
  const lang = data.language || 'en';

  const content = {
    en: {
      welcome: 'Welcome to OpenCare!',
      greeting: `Hello ${data.userName},`,
      thanks: 'Thank you for creating your OpenCare account! We are delighted to welcome you to our community of healthcare professionals.',
      instruction: 'To finalize your registration and access all platform features, please verify your email address by clicking this link:',
      important: '⏱️ IMPORTANT: This link is valid for 24 hours.',
      nextStepsTitle: 'What happens next?',
      nextStepsIntro: 'Once your email is verified, you will be able to:',
      features: [
        '• Manage your patients and their medical records',
        '• Create and track clinical observations',
        '• Coordinate with your medical team',
        '• Access AI assistance tools'
      ],
      notYouTitle: '⚠️ You did not create this account?',
      notYouText: 'If you are not the source of this registration, you can safely ignore this email. No account will be created without verification.',
      separator: '---',
      footerTitle: 'OpenCare — Medical coordination platform',
      footerContact: 'Questions? Contact us at support@opencare.fr',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. All rights reserved.`
    },
    fr: {
      welcome: 'Bienvenue sur OpenCare !',
      greeting: `Bonjour ${data.userName},`,
      thanks: 'Merci d\'avoir créé votre compte OpenCare ! Nous sommes ravis de vous accueillir parmi notre communauté de professionnels de santé.',
      instruction: 'Pour finaliser votre inscription et accéder à toutes les fonctionnalités de la plateforme, veuillez vérifier votre adresse email en cliquant sur ce lien :',
      important: '⏱️ IMPORTANT : Ce lien est valable pendant 24 heures.',
      nextStepsTitle: 'Que se passe-t-il ensuite ?',
      nextStepsIntro: 'Une fois votre email vérifié, vous pourrez :',
      features: [
        '• Gérer vos patients et leurs dossiers médicaux',
        '• Créer et suivre des observations cliniques',
        '• Coordonner avec votre équipe médicale',
        '• Accéder aux outils d\'assistance IA'
      ],
      notYouTitle: '⚠️ Vous n\'avez pas créé ce compte ?',
      notYouText: 'Si vous n\'êtes pas à l\'origine de cette inscription, vous pouvez ignorer cet email en toute sécurité. Aucun compte ne sera créé sans vérification.',
      separator: '---',
      footerTitle: 'OpenCare — Plateforme de coordination médicale',
      footerContact: 'Questions ? Contactez-nous à support@opencare.fr',
      footerCopyright: `© ${new Date().getFullYear()} OpenCare. Tous droits réservés.`
    }
  };

  const t = content[lang as 'en' | 'fr'];

  return `
${t.welcome}

${t.greeting}

${t.thanks}

${t.instruction}

${data.verificationUrl}

${t.important}

${t.nextStepsTitle}
${t.nextStepsIntro}
${t.features.join('\n')}

${t.notYouTitle}
${t.notYouText}

${t.separator}
${t.footerTitle}
${t.footerContact}

${t.footerCopyright}
  `.trim();
}
