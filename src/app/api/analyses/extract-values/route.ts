import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";

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

interface ExtractValuesRequest {
  parsedText: string;
  testLabels: string[];
}

interface ExtractedValue {
  testName: string;
  value: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used to find similar words allowing for small differences
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
 * Find if a label exists in text with case-insensitive and fuzzy matching
 * Allows for up to 1 character difference (Levenshtein distance <= 1)
 */
function findLabelInText(text: string, testLabel: string): number {
  const upperText = text.toUpperCase();
  const upperLabel = testLabel.toUpperCase();
  const words = text.split(/\s+/);
  let searchPosition = 0;

  // First try exact match (case-insensitive)
  const exactIndex = upperText.indexOf(upperLabel);
  if (exactIndex !== -1) {
    console.log(`  ✓ Exact match found at position ${exactIndex}`);
    return exactIndex;
  }

  // Then try fuzzy match with 1 character difference
  for (const word of words) {
    const cleanWord = word.toUpperCase().replace(/[^\w]/g, "");
    const cleanLabel = upperLabel.replace(/[^\w]/g, "");
    const distance = levenshteinDistance(cleanWord, cleanLabel);

    console.log(`  Comparing "${word}" (${cleanWord}) with "${testLabel}" (${cleanLabel}): distance = ${distance}`);

    if (distance <= 1) {
      console.log(`  ✓ Fuzzy match found: "${word}" (distance: ${distance})`);
      return searchPosition;
    }

    searchPosition += word.length + 1; // +1 for space
  }

  return -1;
}

/**
 * Extract numerical values from OCR text based on test labels
 * Searches for test names in text (case-insensitive, allows 1 char difference)
 * and extracts the next number found
 */
function extractValuesFromText(text: string, testLabels: string[]): ExtractedValue[] {
  const extractedValues: ExtractedValue[] = [];

  console.log("=== EXTRACT VALUES DEBUG ===");
  console.log("Input text:", text);
  console.log("Test labels to search for:", testLabels);

  for (const testLabel of testLabels) {
    console.log(`\nSearching for: "${testLabel}"`);

    // Find the label in text (case-insensitive, fuzzy matching)
    const labelIndex = findLabelInText(text, testLabel);

    if (labelIndex !== -1) {
      // Search for a number after the label
      // Look ahead from label position
      const searchText = text.substring(labelIndex);
      console.log(`Search text from label: "${searchText}"`);

      // Pattern to match: label followed by optional characters/whitespace, then a number
      // Matches patterns like "sodium 142" or "na+ 145" or "sodium: 142" or "glucose 3.28"
      // More precise regex that captures complete numbers with decimal points
      const valuePattern = /[\s:=,()-]*((?:\d+[.,])?\d+(?:[.,]\d+)?)\b/;
      const match = searchText.match(valuePattern);

      console.log(`Regex match result:`, match);

      if (match && match[1]) {
        let value = match[1];

        // Count commas and dots to determine decimal separator
        const commaCount = (value.match(/,/g) || []).length;
        const dotCount = (value.match(/\./g) || []).length;

        // European format: 1.234,56 (dot as thousands, comma as decimal)
        // US format: 1,234.56 (comma as thousands, dot as decimal)

        if (commaCount === 1 && dotCount === 0) {
          // Only comma: treat as decimal separator
          // "142,5" → "142.5"
          value = value.replace(',', '.');
        } else if (commaCount === 0 && dotCount === 1) {
          // Only dot: already correct format
          // "142.5" → "142.5"
        } else if (commaCount === 1 && dotCount === 1) {
          // Both present: determine which is decimal based on position
          const lastComma = value.lastIndexOf(',');
          const lastDot = value.lastIndexOf('.');

          if (lastComma > lastDot) {
            // Comma is after dot: European format (comma is decimal)
            // "1.234,56" → "1234.56"
            value = value.replace(/\./g, '').replace(',', '.');
          } else {
            // Dot is after comma: US format (dot is decimal)
            // "1,234.56" → "1234.56"
            value = value.replace(/,/g, '');
          }
        }

        console.log(`✓ Extracted value: ${value} (original: ${match[1]})`);
        extractedValues.push({
          testName: testLabel,
          value: value,
        });
      } else {
        console.log(`✗ No number found after label`);
      }
    } else {
      console.log(`✗ Label not found in text (with fuzzy matching)`);
    }
  }

  console.log("\nFinal extracted values:", extractedValues);
  console.log("=== END DEBUG ===\n");

  return extractedValues;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ExtractValuesRequest = await req.json();
    const { parsedText, testLabels } = body;

    if (!parsedText || !testLabels || !Array.isArray(testLabels)) {
      return NextResponse.json(
        { error: "Missing or invalid parameters: parsedText and testLabels are required" },
        { status: 400 }
      );
    }

    // Extract values from the parsed text
    const extractedValues = extractValuesFromText(parsedText, testLabels);

    return NextResponse.json({
      extractedValues,
      count: extractedValues.length,
    });
  } catch (error) {
    console.error("Extract values API error:", error);
    return NextResponse.json(
      { error: "Failed to extract values from text" },
      { status: 500 }
    );
  }
}
