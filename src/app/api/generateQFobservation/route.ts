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
    const calculateAge = (birthDateStr: Date): number => {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0;

    // Build the examination findings description
    let examinationFindings = "";

    // Add hemodynamic findings if present
    if (hemodynamicsData && Object.keys(hemodynamicsData).some((key) => hemodynamicsData[key])) {
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
      if (hemodynamicsData.imc) findings.push(`IMC: ${hemodynamicsData.imc}`);

      examinationFindings += findings.join(", ") + "\n";

      if (hemodynamicsData.generalState) {
        examinationFindings += `État général: ${hemodynamicsData.generalState}\n`;
      }
      if (hemodynamicsData.skinState && hemodynamicsData.skinState.length > 0) {
        examinationFindings += `État cutanéomuqueux: ${hemodynamicsData.skinState.join(", ")}\n`;
      }
    }

    // Add exam selections
    if (examSelections && Object.keys(examSelections).length > 0) {
      examinationFindings += "\n**Examens complémentaires:**\n";
      for (const [examName, examData] of Object.entries(examSelections)) {
        const data = examData as any;
        if (data && examName !== "Examen général" && (Object.keys(data).some((key) => (data[key] as any)?.length > 0) || data.extraNotes)) {
          examinationFindings += `\n*${examName}:* `;
          const signs = [];
          if (data.inspection?.length > 0) signs.push(`Inspection: ${data.inspection.join(", ")}`);
          if (data.palpation?.length > 0) signs.push(`Palpation: ${data.palpation.join(", ")}`);
          if (data.percussion?.length > 0) signs.push(`Percussion: ${data.percussion.join(", ")}`);
          if (data.auscultation?.length > 0) signs.push(`Auscultation: ${data.auscultation.join(", ")}`);

          if (signs.length > 0) {
            examinationFindings += signs.join(" | ");
          }
          if (data.extraNotes) {
            examinationFindings += ` (${data.extraNotes})`;
          }
          examinationFindings += "\n";
        }
      }
    }

    // Create the prompt for OpenAI
    const prompt = `Tu es un médecin expérimenté. Basé sur les informations et examens cliniques fournis, génère une observation clinique structurée et bien détaillée.

Informations du patient:
- Nom: ${patient.fullName}
- Âge: ${age} ans
- PID: ${patient.pid}
- Diagnostic: ${patient.diagnostic || "Non spécifié"}
- Motif: ${patient.motif || "Non spécifié"}
- Profession: ${patient.profession || "Non spécifiée"}
- Situation familiale: ${patient.situationFamiliale || "Non spécifiée"}
- Antécédents médicaux: ${patient.atcdsMedical || "Aucun"}
- Antécédents chirurgicaux: ${patient.atcdsChirurgical || "Aucun"}
- Antécédents gynéco-obstétriques: ${patient.atcdsGynObstetrique || "Aucun"}
- Antécédents familiaux: ${patient.atcdsFamiliaux || "Aucun"}

Examens cliniques effectués:
${examinationFindings || "Aucun examen détaillé fourni"}

Génère une observation clinique bien structurée. L'observation doit être professionnelle, concise et cliniquement pertinente. Utilise du markdown pour la mise en forme.`;

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
