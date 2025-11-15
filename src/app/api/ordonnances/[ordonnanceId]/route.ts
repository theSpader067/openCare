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

// GET - Get a single ordonnance by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ordonnanceId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ordonnanceId: ordonnanceIdStr } = await params;
    const ordonnanceId = parseInt(ordonnanceIdStr);
    if (isNaN(ordonnanceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ordonnance ID" },
        { status: 400 }
      );
    }

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
      include: {
        patient: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { success: false, error: "Ordonnance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertOrdonnanceToJSON(ordonnance),
    });
  } catch (error) {
    console.error("Error fetching ordonnance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch ordonnance",
      },
      { status: 500 }
    );
  }
}

// PUT - Update an ordonnance
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ordonnanceId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ordonnanceId: ordonnanceIdStr } = await params;
    const ordonnanceId = parseInt(ordonnanceIdStr);
    if (isNaN(ordonnanceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ordonnance ID" },
        { status: 400 }
      );
    }

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { success: false, error: "Ordonnance not found" },
        { status: 404 }
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
      isPrivate,
    } = body;

    console.log("Updating ordonnance with data:", {
      title,
      date,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      clinicalInfo,
      prescriptionDetails,
      isPrivate,
    });

    // Build update data object
    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (date !== undefined) {
      updateData.date = date ? new Date(date) : null;
    }
    if (clinicalInfo !== undefined) {
      updateData.renseignementClinique = clinicalInfo.trim();
    }
    if (prescriptionDetails !== undefined) {
      updateData.details = prescriptionDetails.trim();
    }
    if (isPrivate !== undefined) {
      updateData.isPrivate = isPrivate;
    }

    // Handle patient data
    if (patientId !== undefined && patientId !== null && patientId !== "") {
      // If patientId is provided, validate and link to existing patient
      const parsedPatientId = parseInt(String(patientId));
      if (!isNaN(parsedPatientId) && parsedPatientId > 0) {
        updateData.patientId = parsedPatientId;
        // Clear patient name/age/history when linking to a patient
        updateData.patientName = null;
        updateData.patientAge = null;
        updateData.patientHistory = null;
      } else {
        // Invalid patientId, treat as new patient (clear patientId)
        console.warn("Invalid patientId provided, clearing it:", patientId);
        updateData.patientId = null;
        if (patientName !== undefined) {
          updateData.patientName = patientName ? String(patientName).trim() : null;
        }
        if (patientAge !== undefined) {
          updateData.patientAge = patientAge ? String(patientAge).trim() : null;
        }
        if (patientHistory !== undefined) {
          updateData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
        }
      }
    } else if (
      patientName !== undefined ||
      patientAge !== undefined ||
      patientHistory !== undefined
    ) {
      // If any patient field is provided without patientId, it's a new/unlinked patient
      updateData.patientId = null;
      if (patientName !== undefined) {
        updateData.patientName = patientName ? String(patientName).trim() : null;
      }
      if (patientAge !== undefined) {
        updateData.patientAge = patientAge ? String(patientAge).trim() : null;
      }
      if (patientHistory !== undefined) {
        updateData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
      }
    } else if (patientId === null || patientId === undefined) {
      // Explicitly clear patientId if provided as null/undefined
      updateData.patientId = null;
    }

    console.log("Final updateData:", updateData);

    const updatedOrdonnance = await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: updateData,
      include: {
        patient: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: convertOrdonnanceToJSON(updatedOrdonnance),
    });
  } catch (error) {
    console.error("Error updating ordonnance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update ordonnance",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete an ordonnance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ordonnanceId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ordonnanceId: ordonnanceIdStr } = await params;
    const ordonnanceId = parseInt(ordonnanceIdStr);
    if (isNaN(ordonnanceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ordonnance ID" },
        { status: 400 }
      );
    }

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { success: false, error: "Ordonnance not found" },
        { status: 404 }
      );
    }

    await prisma.ordonnance.delete({
      where: { id: ordonnanceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ordonnance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete ordonnance",
      },
      { status: 500 }
    );
  }
}
