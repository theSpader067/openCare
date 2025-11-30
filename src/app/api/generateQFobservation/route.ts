import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { OpenAI } from "openai";

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
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patientId, examSelections, hemodynamicsData } = body;

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Fetch patient with full details
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    if (patient.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
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

    // Build the examination findings description
    let examinationFindings = "";

    // Add hemodynamic findings if present
    if (hemodynamicsData && (hemodynamicsData.fc || hemodynamicsData.taSys || hemodynamicsData.taDias ||
        hemodynamicsData.trc || hemodynamicsData.gcs || hemodynamicsData.fr || hemodynamicsData.sao2 ||
        hemodynamicsData.temperature || hemodynamicsData.dextro || hemodynamicsData.weight ||
        hemodynamicsData.height || hemodynamicsData.generalState || (hemodynamicsData.skinState && hemodynamicsData.skinState.length > 0))) {
      examinationFindings += "**Examen général:**\n";
      const findings = [];

      if (hemodynamicsData.fc) findings.push(`FC: ${hemodynamicsData.fc} bpm`);
      if (hemodynamicsData.taSys || hemodynamicsData.taDias) {
        findings.push(`TA: ${hemodynamicsData.taSys}/${hemodynamicsData.taDias} mmHg`);
      }
      if (hemodynamicsData.trc) findings.push(`TRC: ${hemodynamicsData.trc} sec`);
      if (hemodynamicsData.gcs) findings.push(`GCS: ${hemodynamicsData.gcs}`);
      if (hemodynamicsData.fr) findings.push(`FR: ${hemodynamicsData.fr} /min`);
      if (hemodynamicsData.sao2) findings.push(`SaO2: ${hemodynamicsData.sao2}%`);
      if (hemodynamicsData.temperature) findings.push(`T°: ${hemodynamicsData.temperature}°C`);
      if (hemodynamicsData.dextro) findings.push(`Dextro: ${hemodynamicsData.dextro} mg/dL`);
      if (hemodynamicsData.weight) findings.push(`Poids: ${hemodynamicsData.weight} kg`);
      if (hemodynamicsData.height) findings.push(`Taille: ${hemodynamicsData.height} cm`);

      examinationFindings += findings.join(", ") + "\n";

      if (hemodynamicsData.generalState) {
        examinationFindings += `État général: ${hemodynamicsData.generalState}\n`;
      }
      if (hemodynamicsData.skinState && hemodynamicsData.skinState.length > 0) {
        examinationFindings += `État cutanéomuqueux: ${hemodynamicsData.skinState.join(", ")}\n`;
      }
      if (hemodynamicsData.additionalNotes) {
        examinationFindings += `Notes supplémentaires: ${hemodynamicsData.additionalNotes}\n`;
      }
    }

    // Add exam selections
    if (examSelections && Object.keys(examSelections).length > 0) {
      let hasComplementaryExams = false;
      const complementaryExamsText: string[] = [];

      for (const [examName, examData] of Object.entries(examSelections)) {
        const data = examData as any;
        if (data && examName !== "Examen général") {
          const hasInspection = Array.isArray(data.inspection) && data.inspection.length > 0;
          const hasPalpation = Array.isArray(data.palpation) && data.palpation.length > 0;
          const hasPercussion = Array.isArray(data.percussion) && data.percussion.length > 0;
          const hasAuscultation = Array.isArray(data.auscultation) && data.auscultation.length > 0;
          const hasExtraNotes = data.extraNotes && data.extraNotes.trim().length > 0;

          if (hasInspection || hasPalpation || hasPercussion || hasAuscultation || hasExtraNotes) {
            hasComplementaryExams = true;
            let examText = `*${examName}:* `;
            const signs = [];

            if (hasInspection) signs.push(`Inspection: ${data.inspection.join(", ")}`);
            if (hasPalpation) signs.push(`Palpation: ${data.palpation.join(", ")}`);
            if (hasPercussion) signs.push(`Percussion: ${data.percussion.join(", ")}`);
            if (hasAuscultation) signs.push(`Auscultation: ${data.auscultation.join(", ")}`);

            if (signs.length > 0) {
              examText += signs.join(" | ");
            }
            if (hasExtraNotes) {
              examText += ` (${data.extraNotes})`;
            }

            complementaryExamsText.push(examText);
          }
        }
      }

      if (hasComplementaryExams) {
        examinationFindings += "\n**Examens complémentaires:**\n";
        examinationFindings += complementaryExamsText.join("\n") + "\n";
      }
    }

    // Build Identité paragraph with conditional fields
    const identiteParts: string[] = [];
    identiteParts.push(`Il s'agit de ${patient.fullName} agé de ${age} ans`);

    if (patient.situationFamiliale?.trim()) {
      identiteParts.push(`${patient.situationFamiliale}`);
    }

    const addressParts: string[] = [];
    if (patient.addressOrigin?.trim()) {
      addressParts.push(`originaire de ${patient.addressOrigin}`);
    }
    if (patient.addressHabitat?.trim()) {
      addressParts.push(`habitant à ${patient.addressHabitat}`);
    }
    if (addressParts.length > 0) {
      identiteParts.push(addressParts.join(` et `));
    }

    if (patient.profession?.trim()) {
      identiteParts.push(`profession: ${patient.profession}`);
    }

    if (patient.couvertureSociale?.trim()) {
      identiteParts.push(`ayant comme couverture sociale ${patient.couvertureSociale}`);
    }

    const identiteText = identiteParts.join(`, `);

    // Create the prompt for OpenAI with detailed structure
    const prompt = `Tu es un médecin expérimenté. Génère une observation clinique professionnelle et bien structurée au format markdown. Chaque section doit être rédigée sous forme de paragraphes cohérents et fluides, pas sous forme de listes.

**STRUCTURE OBLIGATOIRE:**

## Identité
${identiteText}.

## Motif de Consultation
${patient.motif || "Non spécifié"}

## Antécédents
Rédige les antécédents du patient sous forme de paragraphe:
${patient.atcdsMedical ? `- Antécédents médicaux: ${patient.atcdsMedical}` : ""}
${patient.atcdsChirurgical ? `- Antécédents chirurgicaux: ${patient.atcdsChirurgical}` : ""}
${patient.atcdsGynObstetrique ? `- Antécédents gynéco-obstétriques: ${patient.atcdsGynObstetrique}` : ""}
${patient.atcdsFamiliaux ? `- Antécédents familiaux: ${patient.atcdsFamiliaux}` : ""}

${patient.atcdsMedical || patient.atcdsChirurgical || patient.atcdsGynObstetrique || patient.atcdsFamiliaux ? "" : "Le patient ne rapporte pas d'antécédents notables."}

## Examen Clinique
Rédige l'examen clinique du patient sous forme de paragraphes détaillés en mettant en évidence les résultats objectifs:

${examinationFindings || "Aucun examen détaillé fourni."}

## Conclusion
Rédige une brève conclusion synthétisant l'état clinique général du patient et ses principaux problèmes.

**INSTRUCTIONS IMPORTANTES:**
- Chaque section doit être rédigée en paragraphes fluides, pas en listes à puces
- Utilise un langage médical professionnel et approprié
- Sois concis mais exhaustif
- N'ajoute pas de section supplémentaire non demandée
- Assure-toi que l'observation est appropriée pour être imprimée`;

    // Call OpenAI API
    const message = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const observationContent = message.choices[0].message.content;

    if (!observationContent) {
      return NextResponse.json(
        { success: false, error: "Failed to generate observation" },
        { status: 500 }
      );
    }

    // Save observation to database
    const observation = await prisma.observation.create({
      data: {
        text: observationContent,
        patientId: parseInt(patientId),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: observation.id,
        observation: observationContent,
        timestamp: observation.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate observation",
      },
      { status: 500 }
    );
  }
}
