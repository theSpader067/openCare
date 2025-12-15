import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";

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

// Pediatric reference data (simplified WHO reference)
function getPediatricWeightReference(ageYears: number): { mean: number; stdDev: number } {
  const references: Record<number, { mean: number; stdDev: number }> = {
    1: { mean: 9.5, stdDev: 1.1 },
    2: { mean: 12.5, stdDev: 1.4 },
    3: { mean: 14.5, stdDev: 1.6 },
    4: { mean: 16.5, stdDev: 1.8 },
    5: { mean: 18.5, stdDev: 2.0 },
    6: { mean: 20.5, stdDev: 2.3 },
    7: { mean: 22.5, stdDev: 2.6 },
    8: { mean: 25.0, stdDev: 3.0 },
    9: { mean: 27.5, stdDev: 3.5 },
    10: { mean: 30.5, stdDev: 4.0 },
    11: { mean: 33.5, stdDev: 4.5 },
    12: { mean: 36.5, stdDev: 5.0 },
    13: { mean: 40.0, stdDev: 5.5 },
    14: { mean: 44.0, stdDev: 6.0 },
    15: { mean: 49.0, stdDev: 6.5 },
  };
  return references[ageYears] || { mean: 25, stdDev: 3 };
}

function getPediatricHeightReference(ageYears: number): { mean: number; stdDev: number } {
  const references: Record<number, { mean: number; stdDev: number }> = {
    1: { mean: 75, stdDev: 3.5 },
    2: { mean: 88, stdDev: 3.7 },
    3: { mean: 97, stdDev: 3.8 },
    4: { mean: 104, stdDev: 4.0 },
    5: { mean: 110, stdDev: 4.2 },
    6: { mean: 116, stdDev: 4.5 },
    7: { mean: 122, stdDev: 4.7 },
    8: { mean: 127, stdDev: 5.0 },
    9: { mean: 132, stdDev: 5.2 },
    10: { mean: 137, stdDev: 5.5 },
    11: { mean: 142, stdDev: 5.8 },
    12: { mean: 147, stdDev: 6.2 },
    13: { mean: 152, stdDev: 6.5 },
    14: { mean: 157, stdDev: 6.8 },
    15: { mean: 161, stdDev: 6.9 },
  };
  return references[ageYears] || { mean: 110, stdDev: 5 };
}

function calculateZScore(value: number, reference: { mean: number; stdDev: number }): number {
  return (value - reference.mean) / reference.stdDev;
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

    // // Initialize OpenAI client
    // const openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY,
    // });

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
    const patientAge = age; // Use patientAge consistently throughout

    // Calculate IMC
    let imc = "";
    if (hemodynamicsData?.weight && hemodynamicsData?.height) {
      const weight = parseFloat(hemodynamicsData.weight);
      const heightM = parseFloat(hemodynamicsData.height) / 100;
      if (weight > 0 && heightM > 0) {
        imc = (weight / (heightM * heightM)).toFixed(1);
      }
    }

    // Build examen clinique with strict structure
    let examineClinique = "";

    // EXAMEN GÉNÉRAL - specific detailed structure
    examineClinique += "### Examen général\n";

    // Line 1: Plan hémodynamique (FC, TA, TRC)
    const hemodynamiqueParts = [];
    if (hemodynamicsData?.fc) hemodynamiqueParts.push(`FC: ${hemodynamicsData.fc} (bpm)`);
    if (hemodynamicsData?.taSys && hemodynamicsData?.taDias) {
      hemodynamiqueParts.push(`TA: ${hemodynamicsData.taSys}/${hemodynamicsData.taDias} (mmHg)`);
    }
    if (hemodynamicsData?.trc) hemodynamiqueParts.push(`TRC: ${hemodynamicsData.trc} (sec)`);
    if (hemodynamiqueParts.length > 0) {
      examineClinique += `#### Plan HD\n${hemodynamiqueParts.join(", ")}\n`;
    }

    // Line 2: Plan neurologique (GCS)
    if (hemodynamicsData?.gcs) {
      examineClinique += `#### Plan neurologique\nGCS: ${hemodynamicsData.gcs}\n`;
    }

    // Line 3: Plan respiratoire (FR, SaO2)
    const respiratoryParts = [];
    if (hemodynamicsData?.sao2) respiratoryParts.push(`SaO2%: ${hemodynamicsData.sao2}`);
    if (hemodynamicsData?.fr) respiratoryParts.push(`FR: ${hemodynamicsData.fr} (cpm)`);
    if (respiratoryParts.length > 0) {
      examineClinique += `#### Plan respiratoire\n${respiratoryParts.join(", ")}\n`;
    }

    // Line 4: Temperature, Dextro, and BU (Bandelette Urinaire)
    const tempDextroBuParts = [];
    if (hemodynamicsData?.temperature) tempDextroBuParts.push(`T°: ${hemodynamicsData.temperature} °C`);
    if (hemodynamicsData?.dextro) tempDextroBuParts.push(`Dextro: ${hemodynamicsData.dextro} (g/l)`);
    if (hemodynamicsData?.bandelette) tempDextroBuParts.push(`BU: ${hemodynamicsData.bandelette}`);
    if (tempDextroBuParts.length > 0) {
      examineClinique += `#### Autres paramètres\n${tempDextroBuParts.join(", ")}\n`;
    }

    // Line 5: Poids, Taille, IMC with Z-score for pediatric patients
    const anthropometryParts = [];
    if (hemodynamicsData?.weight) {
      let weightStr = `poids: ${hemodynamicsData.weight} kg`;
      // Add Z-score or deviation standard for children < 16 years
      if (patientAge < 16) {
        const ref = getPediatricWeightReference(Math.floor(patientAge));
        const zScore = calculateZScore(parseFloat(hemodynamicsData.weight), ref);
        weightStr += ` (Z-score: ${zScore.toFixed(2)})`;
      }
      anthropometryParts.push(weightStr);
    }
    if (hemodynamicsData?.height) {
      let heightStr = `taille: ${hemodynamicsData.height} cm`;
      // Add Z-score or deviation standard for children < 16 years
      if (patientAge < 16) {
        const ref = getPediatricHeightReference(Math.floor(patientAge));
        const zScore = calculateZScore(parseFloat(hemodynamicsData.height), ref);
        heightStr += ` (Z-score: ${zScore.toFixed(2)})`;
      }
      anthropometryParts.push(heightStr);
    }
    if (imc) {
      let imcStr = `IMC: ${imc}`;
      // Add interpretation based on age
      if (patientAge < 16) {
        // Simplified interpretation for children
        imcStr += " (à interpréter selon courbes de croissance)";
      } else {
        // Adult interpretation
        const imcVal = parseFloat(imc);
        if (imcVal < 18.5) imcStr += " (insuffisance pondérale)";
        else if (imcVal < 25) imcStr += " (normal)";
        else if (imcVal < 30) imcStr += " (surpoids)";
        else imcStr += " (obésité)";
      }
      anthropometryParts.push(imcStr);
    }
    if (anthropometryParts.length > 0) {
      examineClinique += `#### Anthropométrie\n${anthropometryParts.join(", ")}\n`;
    }

    // Line 6: État général
    if (hemodynamicsData?.generalState) {
      examineClinique += `#### État général\n${hemodynamicsData.generalState}\n`;
    }

    // Line 7: État cutanéomuqueux
    if (hemodynamicsData?.skinState && hemodynamicsData.skinState.length > 0) {
      examineClinique += `#### État cutanéomuqueuse\n${hemodynamicsData.skinState.join(", ")}\n`;
    }

    // Line 8: Signes supplémentaires if any
    if (hemodynamicsData?.additionalNotes && hemodynamicsData.additionalNotes.trim()) {
      examineClinique += `#### Signes supplémentaires\n${hemodynamicsData.additionalNotes}\n`;
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
          // Collect all sections with selected signs (handle both standard and custom sections)
          const sectionTexts: string[] = [];
          let hasAnyContent = false;

          for (const [sectionKey, sectionValue] of Object.entries(data)) {
            if (sectionKey === "extraNotes") {
              // Skip extraNotes here, handle separately below
              continue;
            }

            if (Array.isArray(sectionValue) && sectionValue.length > 0) {
              hasAnyContent = true;
              // Capitalize section name properly
              const sectionName = sectionKey.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              sectionTexts.push(`${sectionName}: ${sectionValue.join(", ")}`);
            }
          }

          const hasExtraNotes = data.extraNotes && data.extraNotes.trim().length > 0;

          if (hasAnyContent || hasExtraNotes) {
            otherExamsText.push(`### ${examName}`);

            // Add all section texts
            for (const text of sectionTexts) {
              otherExamsText.push(text);
            }

            // Add extra notes if present
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
    // Format: "il s'agit de [fullname], agé de [age in years or months if 0 years], originaire de [address origine] et Habitant a [adresse habitat] (or originaire et habitant) if same adresse for both, [profession], [situation familiale, but don't write it if age < 16years old], ayant comme couverture sociale [couverture] (or : sans couverture sociale if not specified)"

    let identiteText = `Il s'agit de ${patient.fullName}, agé de ${age} ans`;

    // Handle addresses
    const addressOrigin = patient.addressOrigin?.trim() || "";
    const addressHabitat = patient.addressHabitat?.trim() || "";

    if (addressOrigin && addressHabitat) {
      if (addressOrigin === addressHabitat) {
        identiteText += `, originaire et habitant à ${addressOrigin}`;
      } else {
        identiteText += `, originaire de ${addressOrigin} et habitant à ${addressHabitat}`;
      }
    } else if (addressOrigin) {
      identiteText += `, originaire de ${addressOrigin}`;
    } else if (addressHabitat) {
      identiteText += `, habitant à ${addressHabitat}`;
    }

    // Add profession if present
    if (patient.profession?.trim()) {
      identiteText += `, ${patient.profession}`;
    }

    // Add family situation only if age >= 16
    if (age >= 16 && patient.situationFamiliale?.trim()) {
      identiteText += `, ${patient.situationFamiliale}`;
    }

    // Add social coverage
    if (patient.couvertureSociale?.trim()) {
      identiteText += `, ayant comme couverture sociale ${patient.couvertureSociale}`;
    } else {
      identiteText += `, sans couverture sociale`;
    }

    identiteText += ".";

    // Build ATCDs list - each category as bold underlined title with content below
    const atcdsList: string[] = [];

    if (patient.atcdsMedical?.trim()) {
      atcdsList.push(`<p><b><u>Antécédents médicaux</u></b></p>\n<p>${patient.atcdsMedical}</p>`);
    }
    if (patient.atcdsChirurgical?.trim()) {
      atcdsList.push(`<p><b><u>Antécédents chirurgicaux</u></b></p>\n<p>${patient.atcdsChirurgical}</p>`);
    }
    if (patient.atcdsFamiliaux?.trim()) {
      // Format family antecedents: Père and Mère each on their own line with spaces after colons and commas after each info
      let formattedFamiliaux = patient.atcdsFamiliaux
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '';

          // Add spacing after colons and ensure commas between pieces of info
          let formatted = trimmed.replace(/:\s*/g, ' :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ');

          // Ensure pieces of info are separated by commas if not already
          if (formatted.includes('Âge') && !formatted.match(/,\s*Profession/)) {
            formatted = formatted.replace(/(\d+)(?!\s*,)(?=\s*Profession)/g, '$1,');
          }
          if (formatted.includes('Profession') && !formatted.match(/,\s*Pays/)) {
            formatted = formatted.replace(/(\w+)(?!\s*,)(?=\s*Pays)/g, '$1,');
          }
          if (formatted.includes('Pays') && !formatted.match(/,\s*Pathologies/)) {
            formatted = formatted.replace(/(\w+)(?!\s*,)(?=\s*Pathologies)/g, '$1,');
          }
          if (formatted.includes('Pathologies') && !formatted.endsWith(',')) {
            formatted = formatted + ',';
          }
          formatted = formatted + '\n';
          return formatted;
        })
        .filter(line => line.length > 0)
        .join('<br/>');
      atcdsList.push(`<p><b><u>Antécédents familiaux</u></b></p>\n<p>${formattedFamiliaux}</p>`);
    }
    if (patient.atcdsExtra?.trim()) {
      atcdsList.push(`<p><b><u>Autres antécédents</u></b></p>\n<p>${patient.atcdsExtra}</p>`);
    }

    const atcdsText = atcdsList.length > 0
      ? atcdsList.join("")
      : "<p>Le patient ne rapporte pas d'antécédents notables.</p>";

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

    // Build Histoire de maladie with the specified template
    // Template: "remonte à _________, par l'apparition de _____________, avec _______________, sans ________________. Le tout évoluant dans un contexte de _____________. Ce qui motivé le patient a consulter _________________."
    const histoireMaladieText = `remonte à <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>, par l'apparition de <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>, avec <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>, sans <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>. Le tout évoluant dans un contexte de <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>. Ce qui a motivé le patient à consulter <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>.`;

    // Build simplified conclusion - just provide fill-in templates
    const conclusionText = `
      <p>Il s'agit de <strong>${patient.fullName}</strong>, agé de <strong>${age} ans</strong>, admis pour <strong>${patient.motif || "consultation"}</strong>.</p>
      <p>Ayant comme antécédents <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p>
      <p>Chez qui l'histoire de maladie remonte à <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p>
      <p>Chez qui l'examen clinique <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p>
    `;

    // Wrap conclusion (no additional p tag needed since it's already in the template)
    const conclusionTextHtml = conclusionText;

    // Build complete observation as HTML
    const examinationHtml = examineClinique
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        if (line.startsWith('### ')) {
          return `<h3>${line.replace('### ', '')}</h3>`;
        }
        if (line.startsWith('#### ')) {
          return `<p><b><u>${line.replace('#### ', '')}</u></b></p>`;
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
<p><strong>${patient.motif || "Non spécifié"}</strong></p>

<h2>Antécédents</h2>
${atcdsText}

<h2>Histoire de maladie</h2>
<p>${histoireMaladieText}</p>

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
