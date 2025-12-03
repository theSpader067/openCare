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
          max-width: 650px;
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

        .welcome-section {
          background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
          border-left: 4px solid #7c3aed;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .welcome-section p {
          margin: 0;
          color: #5b21b6;
          font-size: 15px;
          font-weight: 500;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          font-weight: 700;
          color: #7c3aed;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 16px;
          background: #7c3aed;
          border-radius: 2px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          display: block;
        }

        .field-value {
          color: #1f2937;
          font-size: 15px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-left: 4px solid #7c3aed;
          border-radius: 6px;
          word-wrap: break-word;
          font-weight: 500;
        }

        .field-value a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 600;
        }

        .field-value a:hover {
          text-decoration: underline;
        }

        .badge {
          display: inline-block;
          padding: 6px 14px;
          background: linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 100%);
          color: #6d28d9;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .info-card-title {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .info-card-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 30px 0;
        }

        .cta-section {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
          border-radius: 10px;
          margin-bottom: 30px;
        }

        .cta-button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
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

          .info-grid {
            grid-template-columns: 1fr;
            gap: 15px;
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
          <h1>✨ Nouvelle inscription utilisateur</h1>
          <p class="subtitle">Un nouveau professionnel vient de rejoindre OpenCare</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Welcome Section -->
          <div class="welcome-section">
            <p>🎉 Bienvenue! Un nouvel utilisateur s'est inscrit sur la plateforme OpenCare et attend la vérification de son adresse email.</p>
          </div>

          <!-- User Information Section -->
          <div class="section">
            <div class="section-title">Informations de l'utilisateur</div>

            <div class="field">
              <label class="field-label">📝 Nom complet</label>
              <div class="field-value">${escapeHtml(data.userName)}</div>
            </div>

            <div class="field">
              <label class="field-label">📧 Adresse email</label>
              <div class="field-value">
                <a href="mailto:${escapeHtml(data.userEmail)}">${escapeHtml(data.userEmail)}</a>
              </div>
            </div>

            <div class="field">
              <label class="field-label">✅ Statut de vérification</label>
              <div class="field-value">
                <span class="badge">⏳ En attente</span>
              </div>
            </div>
          </div>

          <!-- Signup Date Section -->
          <div class="divider"></div>

          <div class="section">
            <div class="section-title">Date et heure d'inscription</div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-card-title">🕐 Moment de l'inscription</div>
                <div class="info-card-value">${signupDate}</div>
              </div>
              <div class="info-card">
                <div class="info-card-title">🔐 Statut</div>
                <div class="info-card-value">Email non vérifiée</div>
              </div>
            </div>
          </div>

          <!-- Action Section -->
          <div class="cta-section">
            <p style="margin: 0 0 15px 0; color: #5b21b6; font-size: 14px; font-weight: 500;">
              L'utilisateur recevra une notification par email pour vérifier son adresse.
            </p>
            <p style="margin: 0; color: #7c3aed; font-size: 13px;">
              Aucune action supplémentaire n'est nécessaire de votre part.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            <span class="logo">OpenCare</span> — Plateforme intelligente de coordination médicale
          </p>
          <p class="footer-text">
            © 2024 OpenCare. Tous droits réservés.
          </p>
          <p class="footer-text" style="margin-top: 12px; opacity: 0.7;">
            Cet email a été généré automatiquement lors d'une nouvelle inscription sur la plateforme.
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
