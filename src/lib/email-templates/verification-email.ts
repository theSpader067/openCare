export interface VerificationEmailData {
  userName: string;
  verificationUrl: string;
}

export function generateVerificationEmailHTML(data: VerificationEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérifiez votre adresse email - OpenCare</title>
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
          <h1>🎉 Bienvenue sur OpenCare !</h1>
          <p>Votre plateforme de coordination médicale</p>
        </div>

        <div class="content">
          <p class="greeting">Bonjour ${escapeHtml(data.userName)},</p>

          <p class="message">
            Merci d'avoir créé votre compte OpenCare ! Nous sommes ravis de vous accueillir parmi notre communauté de professionnels de santé.
          </p>

          <p class="message">
            Pour finaliser votre inscription et accéder à toutes les fonctionnalités de la plateforme, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
          </p>

          <div class="button-container">
            <a href="${data.verificationUrl}" class="button">
              ✓ Vérifier mon adresse email
            </a>
          </div>

          <div class="info-box">
            <p><strong>⏱️ Lien valable pendant 24 heures</strong></p>
            <p style="margin-top: 8px;">
              Ce lien de vérification expirera dans 24 heures pour des raisons de sécurité.
              Si le lien expire, vous pourrez demander un nouveau lien de vérification.
            </p>
          </div>

          <div class="divider"></div>

          <p class="message" style="font-size: 14px;">
            <strong>Que se passe-t-il ensuite ?</strong><br>
            Une fois votre email vérifié, vous pourrez :
          </p>
          <ul style="color: #4b5563; font-size: 14px; line-height: 1.8;">
            <li>Gérer vos patients et leurs dossiers médicaux</li>
            <li>Créer et suivre des observations cliniques</li>
            <li>Coordonner avec votre équipe médicale</li>
            <li>Accéder aux outils d'assistance IA</li>
          </ul>

          <div class="warning">
            <p><strong>⚠️ Vous n'avez pas créé ce compte ?</strong><br>
            Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email en toute sécurité. Aucun compte ne sera créé sans vérification.
            </p>
          </div>

          <div class="divider"></div>

          <p class="message" style="font-size: 13px; color: #6b7280;">
            <strong>Problème avec le bouton ?</strong><br>
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${data.verificationUrl}" style="color: #667eea; word-break: break-all;">${data.verificationUrl}</a>
          </p>
        </div>

        <div class="footer">
          <p class="footer-text" style="font-weight: 600; color: #1f2937; font-size: 14px;">
            OpenCare — Plateforme de coordination médicale
          </p>
          <p class="footer-text">
            Questions ? Contactez-nous à <a href="mailto:support@opencare.fr" class="footer-link">support@opencare.fr</a>
          </p>
          <p class="footer-text" style="margin-top: 15px; opacity: 0.8;">
            © ${new Date().getFullYear()} OpenCare. Tous droits réservés.
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
  return `
Bienvenue sur OpenCare !

Bonjour ${data.userName},

Merci d'avoir créé votre compte OpenCare ! Nous sommes ravis de vous accueillir parmi notre communauté de professionnels de santé.

Pour finaliser votre inscription et accéder à toutes les fonctionnalités de la plateforme, veuillez vérifier votre adresse email en cliquant sur ce lien :

${data.verificationUrl}

⏱️ IMPORTANT : Ce lien est valable pendant 24 heures.

Que se passe-t-il ensuite ?
Une fois votre email vérifié, vous pourrez :
• Gérer vos patients et leurs dossiers médicaux
• Créer et suivre des observations cliniques
• Coordonner avec votre équipe médicale
• Accéder aux outils d'assistance IA

⚠️ Vous n'avez pas créé ce compte ?
Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email en toute sécurité. Aucun compte ne sera créé sans vérification.

---
OpenCare — Plateforme de coordination médicale
Questions ? Contactez-nous à support@opencare.fr

© ${new Date().getFullYear()} OpenCare. Tous droits réservés.
  `.trim();
}
