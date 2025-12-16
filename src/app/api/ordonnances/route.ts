import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { ordonnanceServerAnalytics } from "@/lib/server-analytics";

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

// Helper function to convert Prisma Ordonnance to a serializable format
function convertOrdonnanceToJSON(ordonnance: any) {
  return {
    id: ordonnance.id.toString(),
    title: ordonnance.title,
    date: ordonnance.date ? new Date(ordonnance.date).toISOString() : null,
    createdAt: new Date(ordonnance.createdAt).toISOString(),
    updatedAt: new Date(ordonnance.updatedAt).toISOString(),
    patientId: ordonnance.patientId,
    patient: ordonnance.patient,
    patientName: ordonnance.patientName,
    patientAge: ordonnance.patientAge,
    patientHistory: ordonnance.patientHistory,
    remarquesConsignes: ordonnance.remarquesConsignes,
    prescriptionDetails: ordonnance.details,
    isPrivate: ordonnance.isPrivate,
    teamsData: ordonnance.teamsData,
    createdBy: ordonnance.creator?.firstName || "Unknown",
  };
}

// GET - Fetch all ordonnances for a user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's teams to find teammate IDs
    const userTeams = await prisma.team.findMany({
      where: {
        OR: [
          { adminId: (userId) },
          { members: { some: { id: (userId) } } },
        ],
      },
      include: { members: true },
    });

    // Collect all teammate IDs (including user's own ID)
    const userIds = new Set<number>();
    userIds.add((userId));
    userTeams.forEach((team) => {
      team.members.forEach((member) => {
        userIds.add(member.id);
      });
    });

    const ordonnances = await prisma.ordonnance.findMany({
      where: {
        OR: [
          // Ordonnances created by the user (all of them)
          { creatorId: (userId) },
          // Public ordonnances created by teammates
          {
            AND: [
              { creatorId: { in: Array.from(userIds) } },
              { isPrivate: false },
            ],
          },
        ],
      },
      include: {
        patient: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const convertedOrdonnances = ordonnances.map(convertOrdonnanceToJSON);
    return NextResponse.json({ success: true, data: convertedOrdonnances });
  } catch (error) {
    console.error("Error fetching ordonnances:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch ordonnances",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new ordonnance
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
    const {
      title,
      date,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      remarquesConsignes,
      prescriptionDetails,
      isPrivate = false,
      teamsData,
    } = body;

    console.log("API received ordonnance data:", {
      title,
      date,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      remarquesConsignes,
      prescriptionDetails,
      isPrivate,
      fullBody: body,
    });

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Ordonnance title cannot be empty" },
        { status: 400 }
      );
    }

    if (!prescriptionDetails || !prescriptionDetails.trim()) {
      return NextResponse.json(
        { success: false, error: "Prescription details cannot be empty" },
        { status: 400 }
      );
    }

    const hasExistingPatientId =
      patientId !== undefined &&
      patientId !== null &&
      String(patientId).trim() !== "" &&
      !isNaN(parseInt(String(patientId)));

    const remarquesConsignesValue = remarquesConsignes?.trim() || null;

    // Build the data object for ordonnance creation
    const ordonnanceData: any = {
      title: title.trim(),
      date: date ? new Date(date) : null,
      creatorId: (userId),
      isPrivate: isPrivate,
      remarquesConsignes: remarquesConsignesValue,
      details: prescriptionDetails.trim(),
      teamsData: teamsData ? (typeof teamsData === 'string' ? teamsData : JSON.stringify(teamsData)) : null,
    };

    // If an existing patient is selected, use patientId
    if (hasExistingPatientId) {
      const parsedPatientId = parseInt(String(patientId));
      if (!isNaN(parsedPatientId)) {
        ordonnanceData.patientId = parsedPatientId;
      } else {
        // If patientId is invalid, create a new patient or use inline data
        if (patientName && patientName.trim()) {
          ordonnanceData.patientName = patientName.trim();
          ordonnanceData.patientAge = patientAge ? String(patientAge).trim() : null;
          ordonnanceData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
          // Don't set patientId, let it be null
          ordonnanceData.patientId = null;
        } else {
          return NextResponse.json(
            { success: false, error: "Patient information is required" },
            { status: 400 }
          );
        }
      }
    } else {
      // Otherwise, store patient name and history if provided
      if (patientName && patientName.trim()) {
        ordonnanceData.patientId = null;
        ordonnanceData.patientName = patientName.trim();
        ordonnanceData.patientAge = patientAge ? String(patientAge).trim() : null;
        ordonnanceData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
      } else {
        return NextResponse.json(
          { success: false, error: "Patient information is required" },
          { status: 400 }
        );
      }
    }

    console.log("Prisma creating ordonnance with data:", ordonnanceData);

    // Either patientId or patientName must be provided
    if (!ordonnanceData.patientId && !ordonnanceData.patientName) {
      return NextResponse.json(
        { success: false, error: "Either select an existing patient or provide patient name" },
        { status: 400 }
      );
    }

    const ordonnance = await prisma.ordonnance.create({
      data: ordonnanceData,
      include: {
        patient: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    // Track ordonnance creation event
    await ordonnanceServerAnalytics.trackOrdonnanceCreated({
      id: ordonnance.id,
      title: ordonnance.title,
      creatorId: ordonnance.creatorId,
      patientId: ordonnance.patientId ?? undefined,
      patientName: ordonnance.patientName ?? undefined,
      isPrivate: ordonnance.isPrivate,
    });

    return NextResponse.json({
      success: true,
      data: convertOrdonnanceToJSON(ordonnance),
    });
  } catch (error) {
    console.error("Error creating ordonnance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create ordonnance",
      },
      { status: 500 }
    );
  }
}
