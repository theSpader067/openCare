import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { Patient } from "@/data/patients/patients-data";

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

// GET - Fetch all patients for current user
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
          { adminId: userId },
          { members: { some: { id: userId } } },
        ],
      },
      include: { members: true },
    });

    // Collect all teammate IDs (including user's own ID)
    const userIds = new Set<number>();
    userIds.add(userId);
    userTeams.forEach((team) => {
      team.members.forEach((member) => {
        userIds.add(member.id);
      });
    });

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          // Patients created by the user (all of them)
          { userId: userId },
          // Public patients created by teammates
          {
            AND: [
              { userId: { in: Array.from(userIds) } },
              { isPrivate: false },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        observations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const today = new Date()
    const parsedPatients = patients.map((p:any)=>{
      return {
        id:String(p.id),
        fullName:p.fullName,
        pid:p.pid,
        birthDate:p.dateOfBirth?.toISOString().split("T")[0],
        age:p.dateOfBirth ? today.getFullYear() -
        p.dateOfBirth.getFullYear() -
        (today < new Date(today.getFullYear(), p.dateOfBirth.getMonth(), p.dateOfBirth.getDate()) ? 1 : 0) : undefined,
        service:p.service,
        status:p.status,
        nextVisit:p.nextContact,
        type:p.isPrivate? 'privé':'équipe',
        diagnosis:{code:p.cim, label:p.diagnostic},
        histories:{
            medical:p.atcdsMedical ? [p.atcdsMedical] : [],
            surgical:p.atcdsChirurgical ? [p.atcdsChirurgical] : [],
            other:p.atcdsExtra ? [p.atcdsExtra] : []
        },
        observations: p.observations.map((obs:any) => ({
          id: String(obs.id),
          timestamp: obs.createdAt.toISOString(),
          note: obs.text,
        }))
      }
    })

    return NextResponse.json({ success: true, data: parsedPatients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch patients",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new patient
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
    console.log('Patient DATA @@@@@@@@@@@@@@@@@@@@@@@')
    console.log(body)

    if (!body.fullName || !body.fullName.trim()) {
      return NextResponse.json(
        { success: false, error: "Patient name is required" },
        { status: 400 }
      );
    }

    // Extract initial observation if provided
    const { initialObservation, ...patientData } = body;

    const patient = await prisma.patient.create({
      data: {
        fullName: patientData.fullName.trim(),
        pid: patientData.pid,
        userId: userId,
        dateOfBirth:new Date(patientData.birthdate) || new Date(),
        isPrivate: patientData.isPrivate === "privé",
        service: patientData.service?.trim() || undefined,
        diagnostic: patientData.diagnostic?.trim() || undefined,
        atcdsMedical: patientData.histoire?.trim() || undefined,
        cim: patientData.cim?.trim() || undefined,
        atcdsChirurgical: patientData.atcdsChirurgical?.trim() || undefined,
        atcdsExtra: patientData.atcdsExtra?.trim() || undefined,
        status: patientData.status?.trim() || undefined,
        nextContact: patientData.nextContact,
      },
    });

    // Create initial observation if provided
    if (initialObservation && initialObservation.trim()) {
      await prisma.observation.create({
        data: {
          text: initialObservation.trim(),
          patientId: patient.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create patient",
      },
      { status: 500 }
    );
  }
}
