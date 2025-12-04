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
 */
function findLabelInText(text: string, testLabel: string): number {
  const upperText = text.toUpperCase();
  const upperLabel = testLabel.toUpperCase();
  const words = text.split(/\s+/);
  let searchPosition = 0;

  const exactIndex = upperText.indexOf(upperLabel);
  if (exactIndex !== -1) {
    return exactIndex;
  }

  for (const word of words) {
    const cleanWord = word.toUpperCase().replace(/[^\w]/g, "");
    const cleanLabel = upperLabel.replace(/[^\w]/g, "");
    const distance = levenshteinDistance(cleanWord, cleanLabel);

    if (distance <= 1) {
      return searchPosition;
    }

    searchPosition += word.length + 1;
  }

  return -1;
}

/**
 * Extract numerical values from OCR text based on test labels
 */
function extractValuesFromText(text: string, testLabels: string[]): Array<{ testName: string; value: string }> {
  const extractedValues: Array<{ testName: string; value: string }> = [];

  for (const testLabel of testLabels) {
    const labelIndex = findLabelInText(text, testLabel);

    if (labelIndex !== -1) {
      const searchText = text.substring(labelIndex);
      const valuePattern = /[\s:=,()-]*((?:\d+[.,])?\d+(?:[.,]\d+)?)\b/;
      const match = searchText.match(valuePattern);

      if (match && match[1]) {
        let value = match[1];

        const commaCount = (value.match(/,/g) || []).length;
        const dotCount = (value.match(/\./g) || []).length;

        if (commaCount === 1 && dotCount === 0) {
          value = value.replace(',', '.');
        } else if (commaCount === 0 && dotCount === 1) {
          // Already correct format
        } else if (commaCount === 1 && dotCount === 1) {
          const lastComma = value.lastIndexOf(',');
          const lastDot = value.lastIndexOf('.');

          if (lastComma > lastDot) {
            value = value.replace(/\./g, '').replace(',', '.');
          } else {
            value = value.replace(/,/g, '');
          }
        }

        extractedValues.push({
          testName: testLabel,
          value: value,
        });
      }
    }
  }

  return extractedValues;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "Missing base64Image in request body" },
        { status: 400 }
      );
    }

    // Format base64 image with data URI prefix as required by OCRSpace
    const base64ImageWithPrefix = `data:image/jpeg;base64,${base64Image}`;

    console.log("Sending OCR request to OCRSpace API");
    console.log("Base64 image length:", base64Image.length);

    // OCRSpace language codes: fre (French), eng (English), spa (Spanish), deu (German), etc.
    const bodyString = `apikey=K82729097788957&base64image=${encodeURIComponent(base64ImageWithPrefix)}&language=fre&filetype=jpeg`;

    // Call OCRSpace API with URL-encoded body (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for OCR processing

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("OCRSpace API response status:", ocrResponse.status);

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error("OCRSpace API error response:", errorText);
      throw new Error(`OCRSpace API error: ${ocrResponse.status} ${ocrResponse.statusText}`);
    }

    const result = await ocrResponse.json();
    console.log("OCRSpace API result:", {
      isErrored: result.IsErroredOnProcessing,
      hasText: !!result.ParsedText,
      textLength: result.ParsedText?.length || 0,
    });

    if (result.IsErroredOnProcessing) {
      console.error("OCRSpace processing error:", result.ErrorMessage);
      return NextResponse.json(
        { error: result.ErrorMessage || "OCR processing failed" },
        { status: 400 }
      );
    }

    const parsedText = result.ParsedText || "";

    return NextResponse.json({
      parsedText: parsedText,
      confidence: result.Confidence || 0,
    });
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Failed to process OCR request" },
      { status: 500 }
    );
  }
}
