import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    paddingTop: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 3,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 18,
    fontWeight: "normal",
  },
  divider: {
    borderBottomColor: "#333",
    borderBottomWidth: 1.5,
    marginBottom: 14,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
    marginTop: 12,
    marginBottom: 10,
    letterSpacing: 1,
    paddingBottom: 6,
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 0.5,
  },
  twoColumn: {
    display: "flex",
    flexDirection: "row",
    gap: 30,
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    color: "#111827",
    marginBottom: 0,
    lineHeight: 1.4,
  },
  sectionContent: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.7,
    marginBottom: 10,
    textAlign: "justify",
  },
  sectionContentWrapped: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.7,
    marginBottom: 10,
    whiteSpace: "pre-wrap",
    textAlign: "justify",
  },
  bullet: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginLeft: 12,
    marginBottom: 4,
  },
  teamMember: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    marginLeft: 12,
    marginBottom: 4,
  },
  fullWidthContent: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.8,
    marginBottom: 10,
    textAlign: "justify",
    paddingLeft: 0,
    paddingRight: 0,
  },
  contentParagraph: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.8,
    marginBottom: 8,
    textAlign: "justify",
  },
  contentList: {
    marginLeft: 15,
    marginBottom: 8,
  },
  contentListItem: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.7,
    marginBottom: 6,
  },
  contentBold: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "bold",
    lineHeight: 1.7,
  },
  heading1: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 10,
    marginBottom: 6,
  },
  heading2: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 8,
    marginBottom: 5,
  },
  heading3: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4b5563",
    marginTop: 6,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginLeft: 15,
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    borderTopColor: "#e5e7eb",
    borderTopWidth: 0.5,
    paddingTop: 10,
  },
  pageBreak: {
    pageBreakAfter: "auto",
  },
});

interface CompteRenduPDFProps {
  title: string;
  type: string;
  date: string;
  formattedDate: string;
  patientName: string;
  patientAge?: string;
  patientDateOfBirth?: string | null;
  duration: string;
  createdBy: string;
  operators: Array<{ id: string; name: string; role: string }>;
  details: string;
  postNotes: string;
}

// Helper to extract clean text from HTML (removes all tags)
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Helper component to render formatted HTML content with proper structure
function FormattedContent({ content }: { content: string }) {
  if (!content || content === "N/A") return null;

  const elements: React.ReactNode[] = [];
  let key = 0;

  // Remove script tags
  const cleanContent = content.replace(/<script[^>]*>.*?<\/script>/gs, '');

  // Parse h1, h2, h3, ol, ul, and p tags
  const blockRegex = /<(h[123]|ol|ul|p)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<br\s*\/?>/gi;
  let match;

  while ((match = blockRegex.exec(cleanContent)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();

    if (tagName === 'h1') {
      const text = stripHtmlTags(fullMatch).trim();
      if (text) {
        elements.push(
          <Text key={key++} style={styles.heading1}>
            {text}
          </Text>
        );
      }
    } else if (tagName === 'h2') {
      const text = stripHtmlTags(fullMatch).trim();
      if (text) {
        elements.push(
          <Text key={key++} style={styles.heading2}>
            {text}
          </Text>
        );
      }
    } else if (tagName === 'h3') {
      const text = stripHtmlTags(fullMatch).trim();
      if (text) {
        elements.push(
          <Text key={key++} style={styles.heading3}>
            {text}
          </Text>
        );
      }
    } else if (tagName === 'ol') {
      // Extract list items from ordered list
      const liRegex = /<li(?:\s[^>]*)?>[\s\S]*?<\/li>/gi;
      let liMatch;
      let itemIndex = 1;
      while ((liMatch = liRegex.exec(fullMatch)) !== null) {
        const liText = stripHtmlTags(liMatch[0]).trim();
        if (liText) {
          elements.push(
            <Text key={key++} style={styles.listItem}>
              {itemIndex}. {liText}
            </Text>
          );
          itemIndex++;
        }
      }
    } else if (tagName === 'ul') {
      // Extract list items from unordered list
      const liRegex = /<li(?:\s[^>]*)?>[\s\S]*?<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(fullMatch)) !== null) {
        const liText = stripHtmlTags(liMatch[0]).trim();
        if (liText) {
          elements.push(
            <Text key={key++} style={styles.listItem}>
              • {liText}
            </Text>
          );
        }
      }
    } else if (tagName === 'p') {
      const text = stripHtmlTags(fullMatch).trim();
      if (text) {
        elements.push(
          <Text key={key++} style={styles.contentParagraph}>
            {text}
          </Text>
        );
      }
    } else if (fullMatch.includes('<br')) {
      elements.push(<View key={key++} style={{ height: 4 }} />);
    }
  }

  // If no block elements found, just clean and render as paragraph
  if (elements.length === 0) {
    const cleanText = stripHtmlTags(cleanContent).trim();
    if (cleanText) {
      elements.push(
        <Text key={key++} style={styles.contentParagraph}>
          {cleanText}
        </Text>
      );
    }
  }

  return <>{elements}</>;
}

export function CompteRenduPDF({
  title,
  type,
  date,
  formattedDate,
  patientName,
  patientAge = "N/A",
  patientDateOfBirth,
  duration,
  createdBy,
  operators,
  details,
  postNotes,
}: CompteRenduPDFProps) {
  // Calculate age dynamically from date of birth
  const calculateAge = (dob: string | undefined | null): string => {
    if (!dob) {
      // If no DOB, try to use patientAge
      if (patientAge) {
        const ageStr = String(patientAge).trim();
        if (ageStr && ageStr !== "N/A" && !ageStr.includes("ans")) return `${ageStr} ans`;
        return ageStr || "N/A";
      }
      return "N/A";
    }
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) {
        // Invalid date, fall back to patientAge
        if (patientAge) {
          const ageStr = String(patientAge).trim();
          if (ageStr && ageStr !== "N/A" && !ageStr.includes("ans")) return `${ageStr} ans`;
          return ageStr || "N/A";
        }
        return "N/A";
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} ans`;
    } catch {
      if (patientAge) {
        const ageStr = String(patientAge).trim();
        if (ageStr && ageStr !== "N/A" && !ageStr.includes("ans")) return `${ageStr} ans`;
        return ageStr || "N/A";
      }
      return "N/A";
    }
  };

  const displayAge = calculateAge(patientDateOfBirth);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Main Title */}
        <Text style={styles.mainTitle}>COMPTE RENDU OPÉRATOIRE</Text>
        <View style={styles.divider} />

        {/* Patient Identification */}
        <Text style={styles.sectionHeader}>IDENTIFICATION DU PATIENT</Text>
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.label}>Nom / Prénom</Text>
            <Text style={styles.value}>{patientName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Âge</Text>
            <Text style={styles.value}>{displayAge}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Operative Information */}
        <Text style={styles.sectionHeader}>INFORMATIONS OPÉRATOIRES</Text>
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.label}>Date de l'intervention</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Durée</Text>
            <Text style={styles.value}>{duration} minutes</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Operative Act - using title */}
        <Text style={styles.sectionHeader}>ACTE RÉALISÉ</Text>
        <Text style={styles.sectionContent}>{title}</Text>

        <View style={styles.divider} />

        {/* Surgical Team - Équipe */}
        <Text style={styles.sectionHeader}>ÉQUIPE ({operators.length} personne(s))</Text>
        {operators.map((op) => (
          <Text key={op.id} style={styles.teamMember}>
            • {op.name}
          </Text>
        ))}

        <View style={styles.divider} />

        {/* Operative Description */}
        <Text style={styles.sectionHeader}>DESCRIPTION OPÉRATOIRE</Text>
        {details && details !== "N/A" ? (
          <FormattedContent content={details} />
        ) : (
          <Text style={styles.contentParagraph}>N/A</Text>
        )}

        <View style={styles.divider} />

        {/* Post-operative Recommendations */}
        <Text style={styles.sectionHeader}>CONSIGNES POST-OPÉRATOIRES</Text>
        {postNotes && postNotes !== "N/A" ? (
          <FormattedContent content={postNotes} />
        ) : (
          <Text style={styles.contentParagraph}>N/A</Text>
        )}

        <View style={styles.divider} />

        {/* Validation */}
        <Text style={styles.sectionHeader}>VALIDATION</Text>
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.label}>Responsable</Text>
            <Text style={styles.value}>{createdBy}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Généré le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
        </View>
      </Page>
    </Document>
  );
}
