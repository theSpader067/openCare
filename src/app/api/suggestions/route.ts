import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { context, additionalContext } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Initialize OpenAI client here to avoid build-time initialization
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build context message with additional information
    let userMessage = "";

    // Add additional context if provided
    if (additionalContext && Object.keys(additionalContext).length > 0) {
      const contextParts = Object.entries(additionalContext)
        .filter(([_, value]) => typeof value === "string" && value.trim())
        .map(([key, value]) => `${key}: ${value}`);

      if (contextParts.length > 0) {
        userMessage += `Informations du patient/contexte:\n${contextParts.join("\n")}\n\n`;
      }
    }

    // Add current editor context
    if (context && context.trim()) {
      userMessage += `Texte actuel: "${context}"\n\nSuggérez une continuation pertinente pour ce dossier médical.`;
    } else {
      userMessage += "Suggérez un début de note clinique professionnelle.";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Vous êtes un assistant médical intelligent qui aide les professionnels de santé à rédiger des notes cliniques.
Générez une suggestion de texte clinique pertinente et professionnelle en français.
La suggestion doit être une phrase complète et naturelle de 15 à 30 mots maximum.
La suggestion doit être directement utilisable dans un dossier médical.
Ne générez qu'UNE SEULE phrase, sans numérotation, sans point à la fin, et sans guillemets.
Tenez compte de tous les éléments du contexte fourni (patient, diagnostic, etc.) pour générer une suggestion pertinente.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error: any) {
    console.error("Error generating suggestion:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate suggestion",
      },
      { status: 500 }
    );
  }
}
