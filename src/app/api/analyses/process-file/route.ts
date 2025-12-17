import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { OpenAI } from "openai";

// Helper function to get userId from session or JWT token
async function getUserId(request: NextRequest): Promise<number | null> {
  // Try mobile JWT authentication first
  const mobileUserId = verifyMobileToken(request);
  if (mobileUserId) {
    return mobileUserId;
  }

  // Fall back to session-based authentication (web)
  const session = await getSession();
  if (session?.user) {
    return parseInt((session.user as any).id);
  }

  return null;
}

interface ProcessFileRequest {
  imageData: string; // Base64 encoded image data
  fileName: string;
  testLabels: string[]; // for bilan analyses
}

interface LabDataExtraction {
  LabEntry: Array<{
    name: string;
    value: string;
    interpretation?: string;
    isNormal?: boolean;
  }>;
  primaryInterpretation?: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Allows matching names with up to 1 character difference
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Find best matching test label from extracted data using fuzzy matching
 * Allows up to 1 character difference (Levenshtein distance <= 1)
 */
function findBestMatchingLabel(extractedName: string, testLabels: string[]): string | null {
  const normalizedExtracted = extractedName.toLowerCase().trim();

  // Try exact match first (case-insensitive)
  const exactMatch = testLabels.find(
    (label) => label.toLowerCase().trim() === normalizedExtracted
  );
  if (exactMatch) {
    console.log(`  ✓ Exact match found: "${extractedName}" → "${exactMatch}"`);
    return exactMatch;
  }

  // Try fuzzy match with Levenshtein distance <= 1
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const label of testLabels) {
    const normalizedLabel = label.toLowerCase().trim();
    const distance = levenshteinDistance(normalizedExtracted, normalizedLabel);

    if (distance <= 1 && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = label;
      console.log(`  ✓ Fuzzy match found: "${extractedName}" → "${label}" (distance: ${distance})`);
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  console.log(`  ✗ No match found for "${extractedName}" (tried ${testLabels.length} labels)`);
  return null;
}

/**
 * Process image with GPT-4o Vision to extract and interpret lab data
 * Returns JSON with lab entries names, values, interpretations, and normal range status
 */
async function processWithGPT4oVision(
  imageData: string,
  fileName: string,
  testLabels?: string[]
): Promise<LabDataExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });

  // Determine image media type from file extension
  const ext = fileName.toLowerCase().split(".").pop();
  let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";

  if (ext === "png") mediaType = "image/png";
  else if (ext === "gif") mediaType = "image/gif";
  else if (ext === "webp") mediaType = "image/webp";

  // Prepare the prompt
  let prompt = `You are a medical lab data extraction specialist. Extract all laboratory test data from this medical lab image.

IMPORTANT: Determine if each value is NORMAL or ABNORMAL based on standard medical reference ranges.
- Normal ranges: typical lab reference values (e.g., Sodium 135-145 mEq/L, Potassium 3.5-5.0 mEq/L, etc.)
- Use the "isNormal" field to indicate if the value is within normal range (true) or abnormal (false)

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "labEntries": [
    {
      "name": "test name as found in image",
      "value": "numerical value (e.g., '142', '3.5')",
      "interpretation": "brief medical interpretation in French (e.g., 'hypernatrémie', 'hypokaliémie', 'normal')",
      "isNormal": true or false
    }
  ],
  "primaryInterpretation": "overall primary medical interpretation or diagnosis based on lab values"
}

Guidelines:
1. Extract ONLY numerical lab values that are clearly visible in the image
2. Return the exact name/label as it appears in the document
3. For each value, provide a French medical interpretation
4. Mark "isNormal" as true only if value is within typical reference ranges
5. For "primaryInterpretation", provide the most significant medical finding
6. Return ONLY valid JSON, no markdown, no code blocks, no extra text
7. If no lab data is found, return empty labEntries array`;

  if (testLabels && testLabels.length > 0) {
    prompt += `\n\nExpected lab tests (these may appear with slight variations in the image):
${testLabels.map((label, idx) => `${idx + 1}. ${label}`).join("\n")}

Extract values for these tests when found in the image.`;
  }

  console.log("=== GPT-4o VISION REQUEST ===");
  console.log("File name:", fileName);
  console.log("Media type:", mediaType);
  console.log("Expected tests:", testLabels);
  console.log("Prompt:", prompt);
  console.log("=== END REQUEST ===\n");

  try {
    // Call OpenAI GPT-4o Vision API using the official library
    const message = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${imageData}`,
              },
            },
          ],
        },
      ],
    });

    const responseText = message.choices[0].message.content;
    if (!responseText || typeof responseText !== "string") {
      throw new Error("Unexpected response type from OpenAI");
    }

    console.log("=== GPT-4o VISION RESPONSE ===");
    console.log("Raw response:", responseText);
    console.log("=== END RESPONSE ===\n");

    // Parse the JSON response
    const cleanedContent = responseText
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .replace(/^```\n?/, "")
      .trim();

    const extracted = JSON.parse(cleanedContent) as LabDataExtraction;

    console.log("=== PARSED LAB DATA ===");
    console.log(JSON.stringify(extracted, null, 2));

    // Match extracted test names to expected test labels using fuzzy matching
    if (testLabels && testLabels.length > 0 && extracted.LabEntry && extracted.LabEntry.length > 0) {
      console.log("\n=== FUZZY MATCHING TEST NAMES ===");
      const matchedEntries = extracted.LabEntry.map((entry) => {
        console.log(`\nProcessing: "${entry.name}"`);
        const matchedLabel = findBestMatchingLabel(entry.name, testLabels);
        if (matchedLabel) {
          return { ...entry, name: matchedLabel };
        }
        return entry;
      });
      extracted.LabEntry = matchedEntries;
    }

    console.log("\n=== FINAL EXTRACTED LAB DATA ===");
    console.log(JSON.stringify(extracted, null, 2));
    console.log("=== END EXTRACTION ===\n");

    return extracted;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Failed to parse JSON response from OpenAI");
      throw new Error("Failed to parse lab data from OpenAI response");
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ProcessFileRequest = await req.json();
    const { imageData, fileName, testLabels } = body;

    if (!imageData || !fileName) {
      return NextResponse.json(
        { error: "Missing required parameters: imageData and fileName" },
        { status: 400 }
      );
    }

    // Process image with GPT-4o Vision
    const labData = await processWithGPT4oVision(imageData, fileName, testLabels);

    return NextResponse.json({
      success: true,
      data: labData,
    });
  } catch (error) {
    console.error("Process file API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process file";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
