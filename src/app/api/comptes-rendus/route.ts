import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { connect } from "http2";

// Helper function to convert Prisma Rapport to a serializable format
function convertRapportToJSON(rapport: any) {
  const interventionDate = rapport.date ? new Date(rapport.date).toISOString().split("T")[0] : new Date(rapport.createdAt).toISOString().split("T")[0];

  return {
    id: rapport.id.toString(),
    title: rapport.title,
    type: rapport.category,
    date: interventionDate,
    duration: parseInt(rapport.duration || "0"),
    operators: rapport.participants?.map((p: any) => ({
      id: p.id.toString(),
      name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      role: p.specialty || "Medical Staff",
    })) || [],
    details: rapport.details || "",
    postNotes: rapport.recommandations || "",
    patient: rapport.patient ? {
      id: rapport.patient.id.toString(),
      fullName: rapport.patient.fullName,
      age: rapport.patient.dateOfBirth ? Math.floor((Date.now() - new Date(rapport.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
      histoire: rapport.patientHistory || "",
    } : null,
    patientName: rapport.patientName || null,
    patientAge: rapport.patientAge || null,
    patientHistory: rapport.patientHistory || null,
    createdAt: rapport.createdAt.toISOString(),
    updatedAt: rapport.updatedAt.toISOString(),
    createdBy: `${rapport.creator?.firstName || ""} ${rapport.creator?.lastName || ""}`.trim() || "Unknown",
  };
}

// GET - Fetch all rapports for a user
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

    const rapports = await prisma.rapport.findMany({
      where: {
        creatorId: parseInt(userId),
      },
      include: {
        patient: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const convertedRapports = rapports.map(convertRapportToJSON);
    return NextResponse.json({ success: true, data: convertedRapports });
  } catch (error) {
    console.error("Error fetching rapports:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch rapports",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new rapport
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
      type,
      date,
      duration,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      details,
      postNotes,
      operatorIds = [],
    } = body;
    console.log('rapport data ||||||||||||||||||||')
    console.log(body)
    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (!type || !type.trim()) {
      return NextResponse.json(
        { success: false, error: "Type cannot be empty" },
        { status: 400 }
      );
    }

    if (!details || !details.trim()) {
      return NextResponse.json(
        { success: false, error: "Details cannot be empty" },
        { status: 400 }
      );
    }

    if (!postNotes || !postNotes.trim()) {
      return NextResponse.json(
        { success: false, error: "Post-operative recommendations cannot be empty" },
        { status: 400 }
      );
    }

    if (!operatorIds || operatorIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one operator is required" },
        { status: 400 }
      );
    }

    // Build the data object for rapport creation
    const rapportData: any = {
      title: title.trim(),
      category: type.trim(),
      date: date ? new Date(date) : new Date(),
      duration: String(duration),
      details: details.trim(),
      recommandations: postNotes.trim(),
      creatorId: parseInt(userId),
    };

    // Handle patient - either use existing patient or store inline patient data
    // Either patientId OR patientName must be provided
    if (patientId) {
      // Use existing patient from DB
      const parsedPatientId = parseInt(String(patientId));
      if (!isNaN(parsedPatientId)) {
        rapportData.patientId = parsedPatientId;
        const rapport = await prisma.rapport.create({
          data: {
            title:rapportData.title,
            category:rapportData.category,
            date:rapportData.date,
            duration:rapportData.duration,
            details:rapportData.details,
            recommandations: rapportData.recommandations,
            patient: {
              connect:{
                id:rapportData.patientId
              }
            },
            creator: {
              connect:{
                  id: rapportData.creatorId,
                  }
                }
          },
        });
    
        return NextResponse.json({
          success: true,
          data: convertRapportToJSON(rapport),
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid patient ID" },
          { status: 400 }
        );
      }
    } else if (patientName && patientName.trim()) {
      // Store inline patient data (not linked to DB)
      rapportData.patientId = null;
      rapportData.patientName = patientName.trim();
      rapportData.patientAge = patientAge ? String(patientAge).trim() : null;
      rapportData.patientHistory = patientHistory ? String(patientHistory).trim() : null;

      const rapport = await prisma.rapport.create({
        data: {
          title:rapportData.title,
          category:rapportData.category,
          date:rapportData.date,
          duration:rapportData.duration,
          details:rapportData.details,
          recommandations: rapportData.recommandations,
          patientName:rapportData.patientName,
          patientAge:rapportData.patientAge,
          patientHistory:rapportData.patientHistory,
          creator: {
            connect:{
                id: rapportData.creatorId,
                }
              }
        },
      });
  
      return NextResponse.json({
        success: true,
        data: convertRapportToJSON(rapport),
      });
    } else {
      // Neither patientId nor patientName provided
      return NextResponse.json(
        { success: false, error: "Either provide a patient ID or patient name" },
        { status: 400 }
      );
    }

    
  } catch (error) {
    console.error("Error creating rapport:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create rapport",
      },
      { status: 500 }
    );
  }
}
