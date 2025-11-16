export interface ContactEmailData {
  fullName: string;
  email: string;
  specialty: string;
  message: string;
  submittedAt?: Date;
}

export function generateContactEmailHTML(data: ContactEmailData): string {
  const submittedDate = data.submittedAt
    ? new Date(data.submittedAt).toLocaleDateString("fr-FR", {
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
      <title>Nouvelle demande de contact - OpenCare</title>
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
          color: #667eea;
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
          border-left: 3px solid #667eea;
          border-radius: 4px;
          word-wrap: break-word;
        }
        .message-content {
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          margin-top: 15px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background-color: #dbeafe;
          color: #0369a1;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Nouvelle demande de contact</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Formulaire de contact OpenCare</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Informations du contact</div>

            <div class="field">
              <div class="field-label">Nom & Prénom</div>
              <div class="field-value">${escapeHtml(data.fullName)}</div>
            </div>

            <div class="field">
              <div class="field-label">Adresse email</div>
              <div class="field-value">
                <a href="mailto:${escapeHtml(data.email)}" style="color: #667eea; text-decoration: none;">
                  ${escapeHtml(data.email)}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="field-label">Service / Spécialité</div>
              <div class="field-value">
                <span class="badge">${escapeHtml(data.specialty)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Message</div>
            <div class="field-value message-content">${escapeHtml(data.message)}</div>
          </div>

          <div class="section" style="margin-bottom: 0;">
            <div class="section-title">Date de soumission</div>
            <div class="field-value">${submittedDate}</div>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;">
            <strong>OpenCare</strong> — Plateforme de coordination médicale
          </p>
          <p style="margin: 0; opacity: 0.8;">
            Cet email a été généré automatiquement. Merci de ne pas y répondre.
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

export function generateContactEmailText(data: ContactEmailData): string {
  const submittedDate = data.submittedAt
    ? new Date(data.submittedAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("fr-FR");

  return `
Nouvelle demande de contact - OpenCare

=== INFORMATIONS DU CONTACT ===

Nom & Prénom: ${data.fullName}
Email: ${data.email}
Service / Spécialité: ${data.specialty}

=== MESSAGE ===

${data.message}

=== DATE DE SOUMISSION ===

${submittedDate}

---
OpenCare - Plateforme de coordination médicale
Cet email a été généré automatiquement.
  `.trim();
}
