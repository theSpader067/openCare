import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { verifyMobileToken } from "@/lib/mobile-auth";

const prisma = new PrismaClient();

// CORS headers for mobile app access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to get userId from session or JWT token
async function getUserId(request: NextRequest): Promise<number | null> {
  // Try mobile JWT authentication first
  const mobileUserId = verifyMobileToken(request);
  if (mobileUserId) {
    console.log('[timeline] Mobile JWT auth successful, userId:', mobileUserId);
    return mobileUserId;
  }

  // Fall back to NextAuth session (web)
  const session = await getServerSession(authConfig);
  if (session?.user) {
    const userId = (session.user as any).id;
    if (userId) {
      console.log('[timeline] NextAuth session found for:', (session.user as any).email, 'userId:', userId);
      const parsedId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (!isNaN(parsedId)) {
        return parsedId;
      }
    }
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
      console.log('[timeline] Unauthorized - no valid auth found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;
    console.log('[timeline] Fetching timeline for Patient:', patientId, 'by User:', userId);

    // Parse patientId as numeric ID
    const numericId = parseInt(patientId, 10);
    if (isNaN(numericId)) {
      console.log('[timeline] Invalid patient ID:', patientId);
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: numericId },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            specialty: true,
            hospital: true,
          },
        },
      },
    });

    if (!patient) {
      console.log('[timeline] Patient not found:', patientId);
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Verify that the patient belongs to the current user
    if (patient.userId !== userId) {
      console.log('[timeline] Unauthorized - patient belongs to User:', patient.userId, 'but request from:', userId);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Build timeline events - ONLY include: hospitalisations, analyses, ordonnances, and comptes-rendus
    const timelineEvents = [];

    // Add hospitalization event (patient creation) - current admission
    timelineEvents.push({
      id: `hospitalization-${patient.id}`,
      type: "hospitalization",
      title: "Admission du patient",
      date: patient.createdAt.toISOString(),
      timestamp: patient.createdAt.toISOString(),
      summary: `Admission au service: ${patient.service || "non spécifié"}`,
      details: {
        fullName: `${patient.User.firstName || ""} ${patient.User.lastName || ""}`.trim() || "Non renseigné",
        username: patient.User.username || "Non renseigné",
        specialty: patient.User.specialty || "Non renseigné",
        hospital: patient.User.hospital || "Non renseigné",
        service: patient.service || "Non renseigné",
      },
    });

    // Fetch ordonnances (prescriptions) from database
    const ordonnances = await prisma.ordonnance.findMany({
      where: { patientId: numericId },
      orderBy: { createdAt: "desc" },
    });

    for (const ordonnance of ordonnances) {
      timelineEvents.push({
        id: `prescription-${ordonnance.id}`,
        type: "ordonnance",
        title: ordonnance.title || "Ordonnance médicale",
        date: ordonnance.date?.toISOString() || ordonnance.createdAt.toISOString(),
        timestamp: ordonnance.date?.toISOString() || ordonnance.createdAt.toISOString(),
        summary: ordonnance.remarquesConsignes || "Prescription médicale",
        details: {
          details: ordonnance.details || "Aucun détail disponible",
          remarquesConsignes: ordonnance.remarquesConsignes,
        },
      });
    }

    // Fetch lab results (analyses) from database
    const analyses = await prisma.analyse.findMany({
      where: { patientId: numericId },
      include: { LabEntry: true },
      orderBy: { createdAt: "desc" },
    });

    for (const analyse of analyses) {
      // Create a summary of lab entries
      const labEntriesSummary = analyse.LabEntry
        .map((entry) => `${entry.name}: ${entry.value}`)
        .join(", ");

      timelineEvents.push({
        id: `lab-${analyse.id}`,
        type: "analyse",
        title: analyse.title || "Analyses biologiques",
        date: analyse.createdAt.toISOString(),
        timestamp: analyse.createdAt.toISOString(),
        summary: labEntriesSummary.substring(0, 200) + (labEntriesSummary.length > 200 ? "..." : "") || "Résultats d'analyses",
        details: {
          LabEntry: analyse.LabEntry,
          interpretation: analyse.interpretation,
        },
      });
    }

    // Fetch comptes-rendus (reports) from database
    const rapports = await prisma.rapport.findMany({
      where: { patientId: numericId },
      orderBy: { createdAt: "desc" },
    });

    for (const rapport of rapports) {
      timelineEvents.push({
        id: `compte-rendu-${rapport.id}`,
        type: "compte-rendu",
        title: rapport.title || "Compte-rendu",
        date: rapport.date?.toISOString() || rapport.createdAt.toISOString(),
        timestamp: rapport.date?.toISOString() || rapport.createdAt.toISOString(),
        summary: rapport.details?.substring(0, 200) + (rapport.details && rapport.details.length > 200 ? "..." : "") || "Compte-rendu médical",
        details: {
          interpretation: rapport.details || "Aucun détail disponible",
          recommandations: rapport.recommandations,
          category: rapport.category,
        },
      });
    }

    // Sort all events by date (most recent first)
    timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log('[timeline] Successfully built timeline with', timelineEvents.length, 'events');

    return NextResponse.json(
      {
        success: true,
        patientId: patient.id,
        patientName: patient.fullName,
        events: timelineEvents,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500, headers: corsHeaders }
    );
  }
}
