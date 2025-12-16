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
    padding: 50,
    paddingTop: 40,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
    paddingBottom: 20,
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  patientAge: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  dateInfo: {
    flex: 1,
    textAlign: "right",
  },
  dateLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  title: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  ordonnanceLabel: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 14,
    letterSpacing: 1,
  },
  ordonnanceTitle: {
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 0,
    fontWeight: "600",
  },
  divider: {
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 2,
    marginBottom: 30,
    marginTop: 30,
  },
  prescriptionSection: {
    marginBottom: 25,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.8,
    paddingBottom: 8,
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
  },
  prescriptionContent: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    textAlign: "justify",
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 40,
    paddingTop: 20,
  },
  signature: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.6,
    width: 150,
  },
  signatureSpace: {
    height: 50,
    borderBottomColor: "#374151",
    borderBottomWidth: 1.5,
    marginBottom: 6,
  },
  signatureText: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "600",
  },
});

interface OrdonnancePDFProps {
  title: string;
  date: string | null;
  patientName?: string;
  patientAge?: string;
  prescriptionDetails?: string;
  remarquesConsignes?: string;
  formattedDate: string;
}

export function OrdonnancePDF({
  title,
  date,
  patientName = "N/A",
  patientAge = "N/A",
  prescriptionDetails = "N/A",
  remarquesConsignes = "",
  formattedDate,
}: OrdonnancePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Patient Info and Date */}
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientAge}>
              {patientAge !== "N/A" ? `${patientAge} ans` : "Âge non disponible"}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Date</Text>
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.title}>
          <Text style={styles.ordonnanceLabel}>Ordonnance</Text>
          <Text style={styles.ordonnanceTitle}>{title}</Text>
        </View>

        <View style={styles.divider} />

        {/* Prescription Details */}
        <View style={styles.prescriptionSection}>
          <Text style={styles.sectionTitle}>Détails de la Prescription</Text>
          <Text style={styles.prescriptionContent}>{prescriptionDetails}</Text>
        </View>

        {/* Remarques/Consignes */}
        {remarquesConsignes && remarquesConsignes !== "N/A" && (
          <View style={styles.prescriptionSection}>
            <Text style={styles.sectionTitle}>Remarques/Consignes</Text>
            <Text style={styles.prescriptionContent}>{remarquesConsignes}</Text>
          </View>
        )}

        {/* Footer with Signature - positioned left */}
        <View style={styles.footer}>
          <View style={styles.signature}>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureText}>Signature et cachet</Text>
            <Text style={styles.signatureText}>du médecin</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
