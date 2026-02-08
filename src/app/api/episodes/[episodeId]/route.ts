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

// Helper function to transform episode response
function transformEpisode(ep: any) {
  return {
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
  };
}

// GET - Get a specific episode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { episodeId } = await params;

    const episode = await prisma.episode.findFirst({
      where: {
        id: episodeId,
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

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: transformEpisode(episode),
    });
  } catch (error) {
    console.error("Error fetching episode:", error);
    return NextResponse.json(
      { error: "Failed to fetch episode" },
      { status: 500 }
    );
  }
}

// PATCH - Update an episode
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { episodeId } = await params;

    const data = await request.json();
    const { motif, atcds, clinique, paraclinique, type } = data;

    // Verify episode exists and belongs to user
    const existingEpisode = await prisma.episode.findFirst({
      where: {
        id: episodeId,
        creatorId: userId,
      },
    });

    if (!existingEpisode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    if (motif !== undefined && !motif.trim()) {
      return NextResponse.json(
        { error: "Motif cannot be empty" },
        { status: 400 }
      );
    }

    if (clinique !== undefined && !clinique.trim()) {
      return NextResponse.json(
        { error: "Clinique cannot be empty" },
        { status: 400 }
      );
    }

    // Map type to status if provided
    const status = type ? (type === "fermé" ? "CLOSED" : "ACTIVE") : undefined;

    console.log("[EPISODES_API] Updating episode:", {
      episodeId,
      motif,
      clinique,
      paraclinique,
      atcds,
      type,
      status,
    });

    const updatedEpisode = await prisma.episode.update({
      where: { id: episodeId },
      data: {
        ...(motif !== undefined && { motif }),
        ...(atcds !== undefined && { atcds: atcds || null }),
        ...(clinique !== undefined && { clinique }),
        ...(paraclinique !== undefined && { paraclinique: paraclinique || null }),
        ...(status && { status: status as EpisodeStatus }),
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

    console.log("[EPISODES_API] Episode updated successfully:", {
      id: updatedEpisode.id,
      motif: updatedEpisode.motif,
    });

    return NextResponse.json({
      data: transformEpisode(updatedEpisode),
      message: "Episode updated successfully",
    });
  } catch (error) {
    console.error("Error updating episode:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update episode",
      },
      { status: 500 }
    );
  }
}

// PUT - Replace an episode (same as PATCH for this use case)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  return PATCH(request, { params });
}

// DELETE - Delete an episode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { episodeId } = await params;

    // Verify episode exists and belongs to user
    const episode = await prisma.episode.findFirst({
      where: {
        id: episodeId,
        creatorId: userId,
      },
    });

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    console.log("[EPISODES_API] Deleting episode:", episodeId);

    await prisma.episode.delete({
      where: { id: episodeId },
    });

    console.log("[EPISODES_API] Episode deleted successfully:", episodeId);

    return NextResponse.json({
      message: "Episode deleted successfully",
      id: episodeId,
    });
  } catch (error) {
    console.error("Error deleting episode:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete episode",
      },
      { status: 500 }
    );
  }
}
