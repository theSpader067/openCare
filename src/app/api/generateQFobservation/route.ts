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
    const age = patient.dateOfBirth
      ? new Date().getFullYear() - patient.dateOfBirth.getFullYear() -
        (new Date() <
        new Date(
          new Date().getFullYear(),
          patient.dateOfBirth.getMonth(),
          patient.dateOfBirth.getDate()
        )
          ? 1
          : 0)
      : 0;

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
      if (hemodynamicsData.temp) findings.push(`T°: ${hemodynamicsData.temp}°C`);
      if (hemodynamicsData.dextro) findings.push(`Dextro: ${hemodynamicsData.dextro} mg/dL`);
      if (hemodynamicsData.weight) findings.push(`Poids: ${hemodynamicsData.weight} kg`);
      if (hemodynamicsData.height) findings.push(`Taille: ${hemodynamicsData.height} cm`);
      if (hemodynamicsData.bmi) findings.push(`IMC: ${hemodynamicsData.bmi}`);

      examinationFindings += findings.join(", ") + "\n";

      if (hemodynamicsData.etatGeneral) {
        examinationFindings += `État général: ${hemodynamicsData.etatGeneral}\n`;
      }
      if (hemodynamicsData.etatCutaneomuqueux && hemodynamicsData.etatCutaneomuqueux.length > 0) {
        examinationFindings += `État cutanéomuqueux: ${hemodynamicsData.etatCutaneomuqueux.join(", ")}\n`;
      }
      if (hemodynamicsData.additionalNotes) {
        examinationFindings += `Notes supplémentaires: ${hemodynamicsData.additionalNotes}\n`;
      }
    }

    // Add exam selections
    if (examSelections && Object.keys(examSelections).length > 0) {
      examinationFindings += "\n**Examens complémentaires:**\n";
      for (const [examName, examData] of Object.entries(examSelections)) {
        const data = examData as any;
        if (data && (Object.keys(data).some((key) => (data[key] as any).length > 0) || data.extraNotes)) {
          examinationFindings += `\n*${examName}:* `;
          const signs = [];
          for (const [section, items] of Object.entries(data)) {
            if (section !== "extraNotes" && Array.isArray(items) && items.length > 0) {
              signs.push(`${items.join(", ")}`);
            }
          }
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
    const prompt = `Tu es un médecin expérimenté. Basé sur les informations et examens cliniques fournis, génère une observation clinique professionnelle et bien structurée au format markdown. L'observation doit être brève, précise et cliniquement pertinente.

Informations du patient:
- Nom: ${patient.fullName}
- Âge: ${age} ans
- PID: ${patient.pid}
- Diagnostic: ${patient.diagnostic || "Non spécifié"}
- Adresse d'origine: ${patient.addressOrigin || "Non spécifiée"}
- Adresse d'habitation: ${patient.addressHabitat || "Non spécifiée"}
- Couverture sociale: ${patient.couvertureSociale || "Non spécifiée"}

Examens cliniques effectués:
${examinationFindings}

Génère une observation clinique structurée avec les sections suivantes:

## **Identité**
Il s'agit du patient [fullname], agé de [age] ans, originaire de [address_origin] et habitant à [address_habitat], ayant pour couverture sociale [couverture_social].

## **Examen Clinique**
Décris les résultats de l'examen clinique en mettant en évidence ce qui est présent et ce qui est absent. Sois concis et professionnel.

## **Conclusion**
Fournis une brève conclusion sur l'état clinique global du patient.

Utilise du markdown pour la mise en forme (gras, italique, listes si nécessaire). Assure-toi que l'observation est appropriée pour être imprimée.`;

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
