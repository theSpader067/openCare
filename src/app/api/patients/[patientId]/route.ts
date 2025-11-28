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

// GET - Fetch a single patient by patientId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const  {patientId}  = await params;
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      );
    }
    console.log('PATIENT ID:', patientId)
    const p = await prisma.patient.findUnique({
      where: { id:parseInt(patientId) },
      include: {
        observations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!p) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }
    const today = new Date()
    const birthDate = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
    const age = birthDate ? (today.getFullYear() -
      birthDate.getFullYear() -
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0)) : 0;

    const parsedPatient:Patient = {
      id:String(p.id),
      pid:p.pid,
      name:p.fullName,
      birthDate:p.dateOfBirth ? p.dateOfBirth.toISOString().split('T')[0] : '',
      age: age,
      service:p.service || '',
      status:(p.status || 'Consultation') as any,
      nextVisit:p.nextContact ? String(p.nextContact) : '',
      type:p.isPrivate? 'privé':'équipe',
      diagnosis:{code:p.cim || '', label:p.diagnostic || ''},
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

    return NextResponse.json({
      success: true,
      data: parsedPatient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch patient",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { patientId } = await params;
    console.log('PID@@@@@@@@@@@',patientId)
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id:parseInt(patientId) },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('UPDATE PATIENT BODY@@@@@@@@@@@@@@')
    console.log(body)
    const {
      fullName,
      pid,
      birthdate,
      service,
      diagnostic,
      cim,
      atcdsMedical,
      atcdsChirurgical,
      atcdsExtra,
      status,
      nextContact,
      isPrivate,
    } = body;

    console.log('Extracted fields:');
    console.log('atcdsMedical:', atcdsMedical);
    console.log('atcdsChirurgical:', atcdsChirurgical);
    console.log('atcdsExtra:', atcdsExtra);


    // Calculate dateOfBirth if birthdate is provided
    let dateOfBirth: Date | undefined;
    if (birthdate) {
      try {
        const parsed = new Date(birthdate);
        if (!isNaN(parsed.getTime())) {
          dateOfBirth = parsed;
        }
      } catch (error) {
        console.error("Error parsing birthdate:", error);
      }
    }

    const updatedPatient = await prisma.patient.update({
      where: { id:parseInt(patientId) },
      data: {
        ...(fullName !== undefined && { fullName: fullName.trim() }),
        ...(pid !== undefined && { pid: pid }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(service !== undefined && { service: service.trim() }),
        ...(diagnostic !== undefined && { diagnostic: diagnostic.trim() }),
        ...(cim !== undefined && { cim: cim.trim() }),
        ...(atcdsMedical !== undefined && { atcdsMedical: atcdsMedical ? atcdsMedical.trim() : "" }),
        ...(atcdsChirurgical !== undefined && { atcdsChirurgical: atcdsChirurgical ? atcdsChirurgical.trim() : "" }),
        ...(atcdsExtra !== undefined && { atcdsExtra: atcdsExtra ? atcdsExtra.trim() : "" }),
        ...(status !== undefined && { status: status.trim() }),
        ...(nextContact !== undefined && { nextContact: nextContact }),
        ...(isPrivate !== undefined && { isPrivate: isPrivate === "privé" || isPrivate === true }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update patient",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a patient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { patientId } = await params;
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const patientIdNum = parseInt(patientId);
    if (isNaN(patientIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to current user
    const patient = await prisma.patient.findUnique({
      where: { id: patientIdNum },
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

    // Delete patient (observations will be cascade deleted due to Prisma schema)
    await prisma.patient.delete({
      where: { id: patientIdNum },
    });

    return NextResponse.json({
      success: true,
      data: { id: patientIdNum, message: "Patient deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete patient",
      },
      { status: 500 }
    );
  }
}
