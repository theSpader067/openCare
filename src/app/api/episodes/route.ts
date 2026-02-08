import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";

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

// Helper function to convert Prisma Episode to API response format
function convertEpisodeToItem(episode: any) {
  return {
    id: episode.id,
    entryAt: episode.entryAt.toISOString(),
    exitAt: episode.exitAt ? episode.exitAt.toISOString() : null,
    motif: episode.motif,
    status: episode.status,
    fullname: episode.fullname,
    sex: episode.sex || null,
    age: episode.age || null,
    origin: episode.origin || null,
    patientId: episode.patientId || null,
    atcds: episode.atcds || null,
    clinique: episode.clinique || null,
    paraclinique: episode.paraclinique || null,
    creatorId: episode.creatorId,
    createdAt: episode.createdAt.toISOString(),
    updatedAt: episode.updatedAt.toISOString(),
  };
}

// GET - Fetch all episodes for user or by specific ID
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get episodeId from query params if provided
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("id");

    if (episodeId) {
      // Fetch specific episode by ID
      const episode = await prisma.episode.findUnique({
        where: { id: episodeId },
      });

      if (!episode) {
        return NextResponse.json(
          { success: false, error: "Episode not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to current user
      if (episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: convertEpisodeToItem(episode),
      });
    } else {
      // Fetch all episodes for current user
      const episodes = await prisma.episode.findMany({
        where: {
          creatorId: userId,
        },
        orderBy: { createdAt: "desc" },
        include: {
          patient: {
            select: {
              fullName: true,
            },
          },
        },
      });

      const convertedEpisodes = episodes.map(convertEpisodeToItem);
      return NextResponse.json({
        success: true,
        data: convertedEpisodes,
      });
    }
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch episodes",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new episode
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
    const {
      motif,
      fullname,
      sex,
      age,
      origin,
      patientId,
      atcds,
      clinique,
      paraclinique,
    } = body;

    // Validate required fields
    if (!motif || !motif.trim() || !fullname || !fullname.trim()) {
      return NextResponse.json(
        { success: false, error: "Motif and fullname are required" },
        { status: 400 }
      );
    }

    // If patientId is provided, verify it belongs to the user
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(patientId) },
      });

      if (!patient || patient.userId !== userId) {
        return NextResponse.json(
          { success: false, error: "Invalid patient" },
          { status: 400 }
        );
      }
    }

    // Create the episode
    const episode = await prisma.episode.create({
      data: {
        motif: motif.trim(),
        fullname: fullname.trim(),
        sex: sex || "",
        age: age ? parseInt(age) : null,
        origin: origin || null,
        patientId: patientId ? parseInt(patientId) : null,
        creatorId: userId,
        entryAt: new Date(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: convertEpisodeToItem(episode),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create episode",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update an episode
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
      motif,
      fullname,
      sex,
      age,
      origin,
      exitAt,
      status,
      atcds,
      clinique,
      paraclinique,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Episode ID is required" },
        { status: 400 }
      );
    }

    // Fetch the episode
    const episode = await prisma.episode.findUnique({
      where: { id },
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: "Episode not found" },
        { status: 404 }
      );
    }

    // Verify episode belongs to current user
    if (episode.creatorId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (motif !== undefined) updateData.motif = motif.trim();
    if (fullname !== undefined) updateData.fullname = fullname.trim();
    if (sex !== undefined) updateData.sex = sex;
    if (age !== undefined) updateData.age = age ? parseInt(age) : null;
    if (origin !== undefined) updateData.origin = origin;
    if (atcds !== undefined) updateData.atcds = atcds;
    if (clinique !== undefined) updateData.clinique = clinique;
    if (paraclinique !== undefined) updateData.paraclinique = paraclinique;
    if (exitAt !== undefined) updateData.exitAt = exitAt ? new Date(exitAt) : null;
    if (status !== undefined) updateData.status = status;
    updateData.updatedAt = new Date();

    // Update the episode
    const updatedEpisode = await prisma.episode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: convertEpisodeToItem(updatedEpisode),
    });
  } catch (error) {
    console.error("Error updating episode:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update episode",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete an episode
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get episodeId from query params
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("id");

    if (!episodeId) {
      return NextResponse.json(
        { success: false, error: "Episode ID is required" },
        { status: 400 }
      );
    }

    // Fetch the episode
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: "Episode not found" },
        { status: 404 }
      );
    }

    // Verify episode belongs to current user
    if (episode.creatorId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the episode (cascade will handle related records)
    await prisma.episode.delete({
      where: { id: episodeId },
    });

    return NextResponse.json({
      success: true,
      message: "Episode deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting episode:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete episode",
      },
      { status: 500 }
    );
  }
}
