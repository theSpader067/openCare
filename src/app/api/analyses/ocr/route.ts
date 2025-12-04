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

    // Build URL parameters for OCRSpace API
    const params = new URLSearchParams();
    params.append("apikey", "K82729097788957");
    params.append("base64image", base64Image);
    params.append("language", "fra");

    console.log("Sending OCR request to OCRSpace API");
    console.log("Base64 image length:", base64Image.length);

    // Note: URL encoding large base64 images can be problematic
    // URLSearchParams has size limits, so we use a different approach
    const bodyString = `apikey=K82729097788957&base64image=${encodeURIComponent(base64Image)}&language=fra`;

    // Call OCRSpace API with URL-encoded body
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyString,
    });

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

    return NextResponse.json({
      parsedText: result.ParsedText || "",
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
