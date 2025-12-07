import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { OpenAI } from "openai";

// CORS headers for mobile app access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Helper function to get userId from session or JWT token
async function getUserId(request: NextRequest): Promise<number | null> {
  const mobileUserId = verifyMobileToken(request);
  if (mobileUserId) {
    return mobileUserId;
  }

  const session = await getSession();
  if (session?.user) {
    return parseInt((session.user as any).id);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { patientId, profileKey, clinicalExams, examSelections, hemodynamicsData } = body;
    const paracliniques = body.paracliniques || [];
    const traitements = body.traitements || [];

    console.log('[generateQFobservation] Received body:', JSON.stringify(body, null, 2));
    console.log('[generateQFobservation] clinicalExams:', JSON.stringify(clinicalExams, null, 2));
    console.log('[generateQFobservation] profileKey:', profileKey);
    console.log('DEBUG: paracliniques received:', JSON.stringify(paracliniques));
    console.log('DEBUG: traitements received:', JSON.stringify(traitements));

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch patient with full details
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (patient.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare patient context for the prompt
    const calculateAge = (birthDate: Date | string): number => {
      const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return age;
    };

    const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0;

    // Build examen clinique with strict structure
    let examineClinique = "";

    // EXAMEN GÉNÉRAL - 6 specific lines
    examineClinique += "### Examen général\n";

    // Line 1: Plan hémodynamique (FC, TA, TRC)
    const hemodynamiqueParts = [];
    if (hemodynamicsData?.fc) hemodynamiqueParts.push(`FC: ${hemodynamicsData.fc}`);
    if (hemodynamicsData?.taSys || hemodynamicsData?.taDias) {
      hemodynamiqueParts.push(`TA: ${hemodynamicsData.taSys}/${hemodynamicsData.taDias}`);
    }
    if (hemodynamicsData?.trc) hemodynamiqueParts.push(`TRC: ${hemodynamicsData.trc}`);
    if (hemodynamiqueParts.length > 0) {
      examineClinique += `Plan hémodynamique: ${hemodynamiqueParts.join(", ")}\n`;
    }

    // Line 2: Plan neurologique (GCS)
    if (hemodynamicsData?.gcs) {
      examineClinique += `Plan neurologique: GCS ${hemodynamicsData.gcs}\n`;
    }

    // Line 3: Plan respiratoire (FR, SaO2)
    const respiratoryParts = [];
    if (hemodynamicsData?.fr) respiratoryParts.push(`FR: ${hemodynamicsData.fr}`);
    if (hemodynamicsData?.sao2) respiratoryParts.push(`SaO2: ${hemodynamicsData.sao2}%`);
    if (respiratoryParts.length > 0) {
      examineClinique += `Plan respiratoire: ${respiratoryParts.join(", ")}\n`;
    }

    // Line 4: Taille et poids et IMC
    const anthropometryParts = [];
    if (hemodynamicsData?.height) anthropometryParts.push(`Taille: ${hemodynamicsData.height} cm`);
    if (hemodynamicsData?.weight) anthropometryParts.push(`Poids: ${hemodynamicsData.weight} kg`);
    if (anthropometryParts.length > 0) {
      examineClinique += `${anthropometryParts.join(", ")}\n`;
    }

    // Line 5: T° et dextro
    const tempDextroParts = [];
    if (hemodynamicsData?.temperature) tempDextroParts.push(`T°: ${hemodynamicsData.temperature}°C`);
    if (hemodynamicsData?.dextro) tempDextroParts.push(`Dextro: ${hemodynamicsData.dextro} mg/dL`);
    if (tempDextroParts.length > 0) {
      examineClinique += `${tempDextroParts.join(", ")}\n`;
    }

    // Line 6: État cutanéomuqueux et autres observations
    const cutaneousParts = [];
    if (hemodynamicsData?.skinState && hemodynamicsData.skinState.length > 0) {
      cutaneousParts.push(`État cutanéomuqueux: ${hemodynamicsData.skinState.join(", ")}`);
    }
    if (hemodynamicsData?.generalState) {
      cutaneousParts.push(`État général: ${hemodynamicsData.generalState}`);
    }
    if (hemodynamicsData?.additionalNotes) {
      cutaneousParts.push(`${hemodynamicsData.additionalNotes}`);
    }
    if (cutaneousParts.length > 0) {
      examineClinique += `${cutaneousParts.join(", ")}\n`;
    }

    // OTHER EXAMS - apparatus by apparatus, only modified ones
    const otherExamsText: string[] = [];

    // Handle new clinicalExams format from mobile app
    if (clinicalExams && Object.keys(clinicalExams).length > 0) {
      console.log('[generateQFobservation] Processing new clinicalExams format');
      for (const [examId, examData] of Object.entries(clinicalExams)) {
        const data = examData as any;
        console.log(`[generateQFobservation] Processing exam ${examId}:`, data);

        if (data && data.label) {
          const examName = data.label;
          const sections = data.sections || {};

          let hasAnyFindings = false;
          const examinationLines: string[] = [];

          // Process each section
          for (const [section, findings] of Object.entries(sections)) {
            if (Array.isArray(findings) && (findings as any[]).length > 0) {
              hasAnyFindings = true;
              const findingsStr = (findings as string[]).join(", ");
              examinationLines.push(`${section}: ${findingsStr}`);
            }
          }

          // Add notes if present
          if (data.notes && data.notes.trim()) {
            hasAnyFindings = true;
            examinationLines.push(`Notes: ${data.notes}`);
          }

          if (hasAnyFindings) {
            otherExamsText.push(`### ${examName}`);
            examinationLines.forEach(line => {
              otherExamsText.push(line);
            });
          }
        }
      }
    }
    // Fallback to old examSelections format if clinicalExams not present
    else if (examSelections && Object.keys(examSelections).length > 0) {
      console.log('[generateQFobservation] Processing legacy examSelections format');
      for (const [examName, examData] of Object.entries(examSelections)) {
        const data = examData as any;
        if (data && examName !== "Examen général") {
          const hasInspection = Array.isArray(data.inspection) && data.inspection.length > 0;
          const hasPalpation = Array.isArray(data.palpation) && data.palpation.length > 0;
          const hasPercussion = Array.isArray(data.percussion) && data.percussion.length > 0;
          const hasAuscultation = Array.isArray(data.auscultation) && data.auscultation.length > 0;
          const hasExtraNotes = data.extraNotes && data.extraNotes.trim().length > 0;

          if (hasInspection || hasPalpation || hasPercussion || hasAuscultation || hasExtraNotes) {
            otherExamsText.push(`### ${examName}`);

            if (hasInspection) {
              otherExamsText.push(`Inspection: ${data.inspection.join(", ")}`);
            }
            if (hasPalpation) {
              otherExamsText.push(`Palpation: ${data.palpation.join(", ")}`);
            }
            if (hasPercussion) {
              otherExamsText.push(`Percussion: ${data.percussion.join(", ")}`);
            }
            if (hasAuscultation) {
              otherExamsText.push(`Auscultation: ${data.auscultation.join(", ")}`);
            }
            if (hasExtraNotes) {
              otherExamsText.push(`${data.extraNotes}`);
            }
          }
        }
      }
    }

    if (otherExamsText.length > 0) {
      examineClinique += "\n" + otherExamsText.join("\n");
    }

    // Build Identité paragraph with STRICT format
    let identiteText = `Il s'agit de ${patient.fullName} agé de ${age} ans`;

    if (patient.situationFamiliale?.trim()) {
      identiteText += `, ${patient.situationFamiliale}`;
    }

    const addressParts: string[] = [];
    if (patient.addressOrigin?.trim()) {
      addressParts.push(`originaire de ${patient.addressOrigin}`);
    }
    if (patient.addressHabitat?.trim()) {
      addressParts.push(`habitant à ${patient.addressHabitat}`);
    }
    if (addressParts.length > 0) {
      identiteText += `, ${addressParts.join(` et `)}`;
    }

    if (patient.profession?.trim()) {
      identiteText += `, profession: ${patient.profession}`;
    }

    if (patient.couvertureSociale?.trim()) {
      identiteText += `, ayant comme couverture sociale ${patient.couvertureSociale}`;
    }

    identiteText += ".";

    // Build ATCDs list (only show non-empty ones)
    const atcdsList: string[] = [];
    if (patient.atcdsMedical?.trim()) {
      atcdsList.push(`<b>- Antécédents médicaux: </b> ${patient.atcdsMedical}`);
    }
    if (patient.atcdsChirurgical?.trim()) {
      atcdsList.push(`<b>- Antécédents chirurgicaux:</b> ${patient.atcdsChirurgical}`);
    }
    if (patient.atcdsFamiliaux?.trim()) {
      atcdsList.push(`<b>- Antécédents familiaux:</b> ${patient.atcdsFamiliaux}`);
    }
    if (patient.atcdsExtra?.trim()) {
      atcdsList.push(`<b>- Autres antécédents:</b> ${patient.atcdsExtra}`);
    }

    const atcdsText = atcdsList.length > 0
      ? atcdsList.join("\n")
      : "Le patient ne rapporte pas d'antécédents notables.";

    // Build ATCDs summary for conclusion
    const atcdsConclusionText = atcdsList.length > 0
      ? atcdsList.map(item => item.replace("- ", "").replace(": ", " ")).join(", ")
      : "sans antécédents notables";

    // Gather all examination findings for conclusion
    const examinationSummary: string[] = [];

    // Add hemodynamic findings if present

    // Add apparatus exam findings from new clinicalExams format
    if (clinicalExams && Object.keys(clinicalExams).length > 0) {
      for (const [examId, examData] of Object.entries(clinicalExams)) {
        const data = examData as any;
        if (data && data.label) {
          const examName = data.label;
          const sections = data.sections || {};

          for (const [section, findings] of Object.entries(sections)) {
            if (Array.isArray(findings) && (findings as string[]).length > 0) {
              examinationSummary.push(`${examName} - ${section}: ${(findings as string[]).join(", ")}`);
            }
          }
        }
      }
    }
    // Fallback to old examSelections format
    else if (examSelections && Object.keys(examSelections).length > 0) {
      for (const [examName, examData] of Object.entries(examSelections)) {
        const data = examData as any;
        if (data && examName !== "Examen général") {
          if (Array.isArray(data.inspection) && data.inspection.length > 0) {
            examinationSummary.push(`${examName} - Inspection: ${data.inspection.join(", ")}`);
          }
          if (Array.isArray(data.palpation) && data.palpation.length > 0) {
            examinationSummary.push(`${examName} - Palpation: ${data.palpation.join(", ")}`);
          }
          if (Array.isArray(data.percussion) && data.percussion.length > 0) {
            examinationSummary.push(`${examName} - Percussion: ${data.percussion.join(", ")}`);
          }
          if (Array.isArray(data.auscultation) && data.auscultation.length > 0) {
            examinationSummary.push(`${examName} - Auscultation: ${data.auscultation.join(", ")}`);
          }
        }
      }
    }

    const examinationText = examinationSummary.length > 0
      ? examinationSummary.join(", ")
      : "examen sans particularités";

    // Build conclusion with examination findings
    const conclusionText = `Il s'agit de ${patient.fullName} agé de ${age} ans, admis pour ${patient.motif || "consultation"}, \n <br/>Ayant comme ATCDs ${atcdsConclusionText}.\n<br/>Histoire de maladie remonte à _____________________.\n<br/>Chez qui l'examen clinique trouve ${examinationText}.`;

    // Wrap conclusion in p tag
    const conclusionTextHtml = `<p>${conclusionText}</p>`;

    // Build complete observation as HTML
    const examinationHtml = examineClinique
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        if (line.startsWith('### ')) {
          return `<h3>${line.replace('### ', '')}</h3>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');

    const atcdsHtml = atcdsList.length > 0
      ? `<ul>${atcdsList.map(item => `<li>${item.replace('- ', '')}</li>`).join('')}</ul>`
      : '<p>Le patient ne rapporte pas d\'antécédents notables.</p>';

    // Build Paraclinique section
    const paracliniquesHtml = paracliniques && paracliniques.length > 0
      ? `<ul>${(paracliniques as any[]).map(item => `<li>${item.bilan}: ${item.valeur}</li>`).join('')}</ul>`
      : '<p>Aucun bilan paraclinique.</p>';

    // Build Traitement section
    const traitementsList = traitements && traitements.length > 0
      ? (traitements as any[]).map(t => `<li><strong>${t.name}</strong><br/>Administration: ${t.administration}<br/>Posologie: ${t.posologie}<br/>Durée: ${t.duree}</li>`).join('')
      : '';
    const traitementHtml = traitements && traitements.length > 0
      ? `<ul>${traitementsList}</ul>`
      : '<p>Aucun traitement prescrit.</p>';

    const fullObservation = `
<h1>Observation Médicale</h1>

<h2>Identité</h2>
<p>${identiteText}</p>

<h2>Motif</h2>
<p>${patient.motif || "Non spécifié"}</p>

<h2>Antécédents</h2>
${atcdsText}

<h2>Histoire de maladie</h2>
<p>Histoire de maladie remonte à _____________________.</p>

<h2>Examen Clinique</h2>
${examinationHtml}

<h2>Conclusion</h2>
${conclusionTextHtml}

<h2>Paraclinique</h2>
${paracliniquesHtml}

<h2>Traitement</h2>
${traitementHtml}
`;

    // Return observation WITHOUT saving to database
    return NextResponse.json({
      success: true,
      data: {
        observation: fullObservation,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error generating observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate observation",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
