import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { observationServerAnalytics } from "@/lib/server-analytics";

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

// GET - Fetch observations (all or by patientId)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get patientId from query params if provided
    const { searchParams } = new URL(request.url);
    const patientIdParam = searchParams.get("patientId");

    let observations;

    if (patientIdParam) {
      // Fetch observations for specific patient
      const patientId = parseInt(patientIdParam);
      if (isNaN(patientId)) {
        return NextResponse.json(
          { success: false, error: "Invalid patientId" },
          { status: 400 }
        );
      }

      // Verify patient exists and belongs to current user
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
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

      observations = await prisma.observation.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Fetch observations for all patients belonging to current user
      observations = await prisma.observation.findMany({
        where: {
          patient: {
            userId: userId,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const convertedObservations = observations.map(convertObservationToItem);
    return NextResponse.json({ success: true, data: convertedObservations });
  } catch (error) {
    console.error("Error fetching observations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch observations",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new observation
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
    const { patientId, text } = body;

    if (!patientId || !text) {
      return NextResponse.json(
        { success: false, error: "Patient ID and observation text are required" },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to current user
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
        { success: false, error: "Unauthorized - patient does not belong to your account" },
        { status: 403 }
      );
    }

    // Create observation
    const observation = await prisma.observation.create({
      data: {
        text: text.trim(),
        patientId: patient.id,
      },
    });

    // Track observation creation event
    await observationServerAnalytics.trackObservationCreated({
      id: observation.id,
      patientId: observation.patientId,
      text: observation.text,
      creatorId: userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: observation.id,
        timestamp: observation.createdAt.toISOString(),
        note: observation.text,
      },
    });
  } catch (error) {
    console.error("Error creating observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create observation",
      },
      { status: 500 }
    );
  }
}
