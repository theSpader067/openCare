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

// Helper function to convert Prisma Avis to a serializable format
function convertAvisToJSON(avis: any) {
  return {
    id: avis.id.toString(),
    destination_specialty: avis.destination_specialty,
    answer_date: avis.answer_date ? new Date(avis.answer_date).toISOString() : null,
    patientId: avis.patientId,
    patient: avis.patient,
    patientName: avis.patientName,
    patientAge: avis.patientAge,
    patientHistory: avis.patientHistory,
    details: avis.details,
    opinion: avis.details || "",
    answer: avis.answer,
    creatorId: avis.creatorId,
    createdAt: new Date(avis.createdAt).toISOString(),
    updatedAt: new Date(avis.updatedAt).toISOString(),
    creator: avis.creator,
    creatorSpecialty:avis.creator.specialty,
  };
}

// GET - Fetch all avis for a user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's teams and their information
    const userTeams = await prisma.team.findMany({
      where: {
        OR: [
          { adminId: (userId) },
          { members: { some: { id: (userId) } } },
        ],
      },
      include: { members: true },
    });

    // Collect all teammate IDs and team names
    const userIds = new Set<number>();
    const teamNames = new Set<string>();
    userIds.add((userId));
    userTeams.forEach((team) => {
      teamNames.add(team.name);
      team.members.forEach((member) => {
        userIds.add(member.id);
      });
    });

    const avis = await prisma.avis.findMany({
      where: {
        OR: [
          // Avis created by the user
          { creatorId: (userId) },
          // Avis created by teammates
          { creatorId: { in: Array.from(userIds) } },
          // Avis destined for user's teams
          { destination_specialty: { in: Array.from(teamNames) } },
        ],
      },
      include: {
        patient: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const convertedAvis = avis.map(convertAvisToJSON);
    return NextResponse.json({ success: true, data: convertedAvis });
  } catch (error) {
    console.error("Error fetching avis:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch avis",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new avis
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
      answer_date,
      destination_specialty,
      opinion,
      patientId,
      patientName,
      patientAge,
      patientHistory,
    } = body;

    console.log("API received avis data:", {
      answer_date,
      destination_specialty,
      opinion,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      fullBody: body,
    });

    // Validate required fields
    if (!destination_specialty || !destination_specialty.trim()) {
      return NextResponse.json(
        { success: false, error: "Destination specialty cannot be empty" },
        { status: 400 }
      );
    }

    if (!opinion || !opinion.trim()) {
      return NextResponse.json(
        { success: false, error: "Opinion cannot be empty" },
        { status: 400 }
      );
    }

    // Build the data object for avis creation
    const avisData: any = {
      destination_specialty: destination_specialty.trim(),
      details: opinion.trim(),
      answer_date: answer_date ? new Date(answer_date) : null,
      creatorId: (userId),
    };

    const parsedPatientId =
      patientId !== undefined && patientId !== null && String(patientId).trim() !== ""
        ? parseInt(String(patientId))
        : NaN;
    const hasExistingPatientId = !isNaN(parsedPatientId);

    if (hasExistingPatientId) {
      avisData.patientId = parsedPatientId;
    } else if (patientName && patientName.trim()) {
      avisData.patientId = null;
      avisData.patientName = patientName.trim();
      avisData.patientAge = patientAge ? String(patientAge).trim() : null;
      avisData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
    } else {
      return NextResponse.json(
        { success: false, error: "Patient information is required" },
        { status: 400 }
      );
    }

    console.log("Prisma creating avis with data:", avisData);

    // Prepare the data for Prisma creation
    const createData: any = {
      destination_specialty: avisData.destination_specialty,
      details: avisData.details,
      answer_date: avisData.answer_date,
      creatorId: avisData.creatorId,
    };

    // If patientId exists, connect to existing patient
    if (hasExistingPatientId && avisData.patientId) {
      createData.patientId = avisData.patientId;
    }
    else{
      createData.patientName = avisData.patientName;
      createData.patientAge = avisData.patientAge;
      createData.patientHistory = avisData.patientHistory;
    }

    const avis = await prisma.avis.create({
      data: createData,
      include: {
        patient: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: convertAvisToJSON(avis),
    });
  } catch (error) {
    console.error("Error creating avis:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create avis",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update avis answer
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { avisId, answer } = body;

    // Validate required fields
    if (!avisId) {
      return NextResponse.json(
        { success: false, error: "Avis ID is required" },
        { status: 400 }
      );
    }

    if (!answer || !answer.trim()) {
      return NextResponse.json(
        { success: false, error: "Answer cannot be empty" },
        { status: 400 }
      );
    }

    // Update the avis with the answer
    const updatedAvis = await prisma.avis.update({
      where: { id: parseInt(avisId) },
      data: {
        answer: answer.trim(),
      },
      include: {
        patient: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: convertAvisToJSON(updatedAvis),
    });
  } catch (error) {
    console.error("Error updating avis answer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update avis answer",
      },
      { status: 500 }
    );
  }
}
