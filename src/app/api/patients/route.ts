import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Patient } from "@/data/patients/patients-data";

// GET - Fetch all patients for current user
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

    const patients = await prisma.patient.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      include: {
        observations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const today = new Date()
    const parsedPatients:Patient[]= patients.map((p:any)=>{
      return {
        id:p.id,
        pid:p.pid,
        name:p.fullName,
        birthDate:p.dateOfBirth,
        age:today.getFullYear() -
        p.dateOfBirth.getFullYear() -
        (today < new Date(today.getFullYear(), p.dateOfBirth.getMonth(), p.dateOfBirth.getDate()) ? 1 : 0)
      ,
        service:p.service,
        status:p.status,
        nextVisit:p.nextContact,
        type:p.isPrivate? 'privé':'équipe',
        diagnosis:{code:p.cim, label:p.diagnostic},
        histories:{
            medical:[p.atcdsMedical],
            surgical:[p.atcdsChirurgical],
            other:[p.atcdsExtra]
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
        userId: parseInt(userId),
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
