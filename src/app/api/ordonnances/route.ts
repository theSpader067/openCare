import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    clinicalInfo: ordonnance.renseignementClinique,
    prescriptionDetails: ordonnance.details,
    isPrivate: ordonnance.isPrivate,
    createdBy: ordonnance.creator?.firstName || "Unknown",
  };
}

// GET - Fetch all ordonnances for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    const ordonnances = await prisma.ordonnance.findMany({
      where: {
        creatorId: parseInt(userId),
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
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
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
      clinicalInfo,
      prescriptionDetails,
      isPrivate = false,
    } = body;

    console.log("API received ordonnance data:", {
      title,
      date,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      clinicalInfo,
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

    if (!clinicalInfo || !clinicalInfo.trim()) {
      return NextResponse.json(
        { success: false, error: "Clinical information cannot be empty" },
        { status: 400 }
      );
    }

    if (!prescriptionDetails || !prescriptionDetails.trim()) {
      return NextResponse.json(
        { success: false, error: "Prescription details cannot be empty" },
        { status: 400 }
      );
    }

    // Build the data object for ordonnance creation
    const ordonnanceData: any = {
      title: title.trim(),
      date: date ? new Date(date) : null,
      creatorId: parseInt(userId),
      isPrivate: isPrivate,
      renseignementClinique: clinicalInfo.trim(),
      details: prescriptionDetails.trim(),
    };

    // If an existing patient is selected, use patientId
    if (patientId) {
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
