export interface SignupNotificationData {
  userName: string;
  userEmail: string;
  signupDate?: Date;
}

export function generateSignupNotificationHTML(data: SignupNotificationData): string {
  const signupDate = data.signupDate
    ? new Date(data.signupDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelle inscription - OpenCare</title>
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: 600;
          color: #10b981;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .field {
          margin-bottom: 15px;
        }
        .field-label {
          font-weight: 600;
          color: #555;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 5px;
        }
        .field-value {
          color: #333;
          font-size: 14px;
          padding: 10px;
          background-color: #f3f4f6;
          border-left: 3px solid #10b981;
          border-radius: 4px;
          word-wrap: break-word;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background-color: #d1fae5;
          color: #065f46;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .highlight-box {
          background-color: #ecfdf5;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .highlight-box p {
          margin: 0;
          color: #065f46;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Nouvelle inscription utilisateur</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Un nouveau professionnel vient de rejoindre OpenCare</p>
        </div>

        <div class="content">
          <div class="highlight-box">
            <p><strong>📢 Action requise :</strong> Un nouvel utilisateur s'est inscrit et attend la vérification de son email.</p>
          </div>

          <div class="section">
            <div class="section-title">Informations de l'utilisateur</div>

            <div class="field">
              <div class="field-label">Nom complet</div>
              <div class="field-value">${escapeHtml(data.userName)}</div>
            </div>

            <div class="field">
              <div class="field-label">Adresse email</div>
              <div class="field-value">
                <a href="mailto:${escapeHtml(data.userEmail)}" style="color: #10b981; text-decoration: none;">
                  ${escapeHtml(data.userEmail)}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="field-label">Statut</div>
              <div class="field-value">
                <span class="badge">⏳ En attente de vérification email</span>
              </div>
            </div>
          </div>

          <div class="section" style="margin-bottom: 0;">
            <div class="section-title">Date d'inscription</div>
            <div class="field-value">${signupDate}</div>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;">
            <strong>OpenCare</strong> — Plateforme de coordination médicale
          </p>
          <p style="margin: 0; opacity: 0.8;">
            Cet email a été généré automatiquement lors d'une nouvelle inscription.
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

export function generateSignupNotificationText(data: SignupNotificationData): string {
  const signupDate = data.signupDate
    ? new Date(data.signupDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("fr-FR");

  return `
Nouvelle inscription utilisateur - OpenCare

=== INFORMATIONS DE L'UTILISATEUR ===

Nom complet: ${data.userName}
Email: ${data.userEmail}
Statut: En attente de vérification email

=== DATE D'INSCRIPTION ===

${signupDate}

---
OpenCare - Plateforme de coordination médicale
Cet email a été généré automatiquement lors d'une nouvelle inscription.
  `.trim();
}
