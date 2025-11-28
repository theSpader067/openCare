import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

// Helper function to convert Prisma Observation to API response format
function convertObservationToItem(observation: any) {
  return {
    id: observation.id,
    patientId: observation.patientId,
    text: observation.text,
    createdAt: observation.createdAt.toISOString(),
    updatedAt: observation.updatedAt.toISOString(),
  };
}

// GET - Fetch single observation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ observationId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { observationId: observationIdStr } = await params;
    const observationId = parseInt(observationIdStr);

    if (isNaN(observationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid observation ID" },
        { status: 400 }
      );
    }

    // Fetch observation
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { patient: true },
    });

    if (!observation) {
      return NextResponse.json(
        { success: false, error: "Observation not found" },
        { status: 404 }
      );
    }

    // Verify authorization - observation must belong to a patient owned by current user
    if (observation.patient.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertObservationToItem(observation),
    });
  } catch (error) {
    console.error("Error fetching observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch observation",
      },
      { status: 500 }
    );
  }
}

// PUT - Update observation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ observationId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { observationId: observationIdStr } = await params;
    const observationId = parseInt(observationIdStr);

    if (isNaN(observationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid observation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Observation text is required" },
        { status: 400 }
      );
    }

    // Fetch observation with patient info
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { patient: true },
    });

    if (!observation) {
      return NextResponse.json(
        { success: false, error: "Observation not found" },
        { status: 404 }
      );
    }

    // Verify authorization - observation must belong to a patient owned by current user
    if (observation.patient.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update observation
    const updatedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        text: text.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: convertObservationToItem(updatedObservation),
    });
  } catch (error) {
    console.error("Error updating observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update observation",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete observation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ observationId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { observationId: observationIdStr } = await params;
    const observationId = parseInt(observationIdStr);

    if (isNaN(observationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid observation ID" },
        { status: 400 }
      );
    }

    // Fetch observation with patient info
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { patient: true },
    });

    if (!observation) {
      return NextResponse.json(
        { success: false, error: "Observation not found" },
        { status: 404 }
      );
    }

    // Verify authorization - observation must belong to a patient owned by current user
    if (observation.patient.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete observation
    await prisma.observation.delete({
      where: { id: observationId },
    });

    return NextResponse.json({
      success: true,
      data: { id: observationId },
    });
  } catch (error) {
    console.error("Error deleting observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete observation",
      },
      { status: 500 }
    );
  }
}
