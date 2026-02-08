import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { EpisodeStatus } from "@prisma/client";

// Helper function to get userId from session or JWT token
async function getUserId(request: NextRequest): Promise<number | null> {
  const mobileUserId = verifyMobileToken(request);
  if (mobileUserId) {
    return mobileUserId;
  }

  const session = await getSession();
  if (session?.user) {
    return parseInt((session.user as any).id);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const episodes = await prisma.episode.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
          },
        },
      },
      orderBy: {
        entryAt: "desc",
      },
    });

    // Transform response to match mobile app format
    const transformedEpisodes = episodes.map((ep) => ({
      id: ep.id,
      motif: ep.motif,
      atcds: ep.atcds || "",
      clinique: ep.clinique || "",
      paraclinique: ep.paraclinique || "",
      type: ep.status === "CLOSED" ? "fermé" : "actif",
      isPrivate: false,
      patient: ep.patient ? {
        id: ep.patient.id,
        fullName: ep.patient.fullName,
        dateOfBirth: ep.patient.dateOfBirth,
      } : undefined,
      patientName: ep.fullname,
      patientAge: ep.age?.toString(),
      patientHistory: undefined,
      createdAt: ep.entryAt.toISOString(),
      updatedAt: ep.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedEpisodes,
    });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      patientId,
      patientName,
      patientAge,
      patientHistory,
      motif,
      atcds,
      clinique,
      paraclinique,
      type,
    } = data;

    if (!motif || !clinique) {
      return NextResponse.json(
        { error: "Motif and clinique are required" },
        { status: 400 }
      );
    }

    // Map type to status: "actif" → ACTIVE, "fermé" → CLOSED
    const status = type === "fermé" ? "CLOSED" : "ACTIVE";

    console.log('[EPISODES_API] Creating episode:', {
      motif,
      clinique,
      type,
      status,
      patientId,
      patientName,
      userId,
    });

    const episode = await prisma.episode.create({
      data: {
        motif,
        atcds: atcds || null,
        clinique,
        paraclinique: paraclinique || null,
        status: status as EpisodeStatus,
        fullname: patientName || "Unknown",
        sex: "Unknown",
        age: patientAge ? parseInt(patientAge) : null,
        entryAt: new Date(),
        patientId: patientId ? parseInt(String(patientId)) : null,
        creatorId: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
          },
        },
      },
    });

    // Transform response to match mobile app format
    const transformed = {
      id: episode.id,
      motif: episode.motif,
      atcds: episode.atcds || "",
      clinique: episode.clinique || "",
      paraclinique: episode.paraclinique || "",
      type: episode.status === "CLOSED" ? "fermé" : "actif",
      isPrivate: false,
      patient: episode.patient ? {
        id: episode.patient.id,
        fullName: episode.patient.fullName,
        dateOfBirth: episode.patient.dateOfBirth,
      } : undefined,
      patientName: episode.fullname,
      patientAge: episode.age?.toString(),
      patientHistory: undefined,
      createdAt: episode.entryAt.toISOString(),
      updatedAt: episode.updatedAt.toISOString(),
    };

    console.log('[EPISODES_API] Episode created successfully:', {
      id: episode.id,
      motif: episode.motif,
      type: transformed.type,
    });

    return NextResponse.json({
      data: transformed,
      message: "Episode created successfully",
    });
  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create episode",
      },
      { status: 500 }
    );
  }
}
