import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Fetch observations for the patient from Observation table
    const observations = await prisma.observation.findMany({
      where: {
        patientId: patientId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: observations,
    });
  } catch (error) {
    console.error("[GET /api/patients/[patientId]/observations]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
