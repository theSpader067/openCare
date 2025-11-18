import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;

    // Get patient with creator info - patientId is the pid (string identifier)
    const patient = await prisma.patient.findUnique({
      where: { pid: patientId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            specialty: true,
            hospital: true,
          },
        },
        observations: {
          orderBy: { createdAt: "desc" },
        },
        ordonnances: {
          orderBy: { createdAt: "desc" },
        },
        rapports: {
          where: {
            category: "imagerie",
          },
          orderBy: { createdAt: "desc" },
        },
        analyses: {
          include: {
            labEntries: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Build timeline events
    const timelineEvents = [];

    // Add hospitalization event (patient creation)
    timelineEvents.push({
      id: `hospitalization-${patient.id}`,
      type: "hospitalization",
      title: "Admission du patient",
      date: patient.createdAt.toISOString(),
      timestamp: patient.createdAt.toISOString(),
      summary: `Patient admis au service ${patient.service || "non spécifié"}`,
      details: {
        fullName: `${patient.user.firstName || ""} ${patient.user.lastName || ""}`.trim() || "Non renseigné",
        username: patient.user.username || "Non renseigné",
        specialty: patient.user.specialty || "Non renseigné",
        hospital: patient.user.hospital || "Non renseigné",
      },
    });

    // Add observations
    for (const observation of patient.observations) {
      timelineEvents.push({
        id: `observation-${observation.id}`,
        type: "observation",
        title: "Observation médicale",
        date: observation.createdAt.toISOString(),
        timestamp: observation.createdAt.toISOString(),
        summary: observation.text.substring(0, 150) + (observation.text.length > 150 ? "..." : ""),
        details: {
          text: observation.text,
        },
      });
    }

    // Add ordonnances (prescriptions)
    for (const ordonnance of patient.ordonnances) {
      timelineEvents.push({
        id: `prescription-${ordonnance.id}`,
        type: "prescription",
        title: ordonnance.title,
        date: ordonnance.date?.toISOString() || ordonnance.createdAt.toISOString(),
        timestamp: ordonnance.date?.toISOString() || ordonnance.createdAt.toISOString(),
        summary: ordonnance.renseignementClinique || "Ordonnance médicale",
        details: {
          details: ordonnance.details || "Aucun détail disponible",
          renseignementClinique: ordonnance.renseignementClinique,
        },
      });
    }

    // Add imaging (rapports with category imagerie)
    for (const rapport of patient.rapports) {
      timelineEvents.push({
        id: `imaging-${rapport.id}`,
        type: "imaging",
        title: rapport.title,
        date: rapport.date?.toISOString() || rapport.createdAt.toISOString(),
        timestamp: rapport.date?.toISOString() || rapport.createdAt.toISOString(),
        summary: rapport.details?.substring(0, 150) + (rapport.details && rapport.details.length > 150 ? "..." : "") || "Examen d'imagerie",
        details: {
          interpretation: rapport.details || "Aucune interprétation disponible",
          recommandations: rapport.recommandations,
        },
      });
    }

    // Add lab results (analyses)
    for (const analyse of patient.analyses) {
      // Create a summary of lab entries
      const labEntriesSummary = analyse.labEntries
        .map((entry) => `${entry.name}: ${entry.value}`)
        .join(", ");

      timelineEvents.push({
        id: `lab-${analyse.id}`,
        type: "lab",
        title: analyse.title || "Analyses biologiques",
        date: analyse.createdAt.toISOString(),
        timestamp: analyse.createdAt.toISOString(),
        summary: labEntriesSummary.substring(0, 150) + (labEntriesSummary.length > 150 ? "..." : "") || "Résultats d'analyses",
        details: {
          labEntries: analyse.labEntries,
          interpretation: analyse.interpretation,
        },
      });
    }

    // Sort all events by date (most recent first)
    timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: {
        patientName: patient.fullName,
        events: timelineEvents,
      },
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
