import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

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

// PATCH - Update current block for a CAT
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
    const { currentBlockId } = data;

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

    // Get CAT for this episode
    const cat = await prisma.cAT.findFirst({
      where: {
        episodeId: episodeId,
      },
    });

    if (!cat) {
      return NextResponse.json(
        { error: "CAT not found" },
        { status: 404 }
      );
    }

    // Update current block
    const updatedCat = await prisma.cAT.update({
      where: { id: cat.id },
      data: {
        currentBlockId: currentBlockId || null,
      },
    });

    console.log("[CAT_API] Updated current block:", currentBlockId);

    return NextResponse.json({
      data: {
        catId: updatedCat.id,
        currentBlockId: updatedCat.currentBlockId,
      },
      message: "Current block updated successfully",
    });
  } catch (error) {
    console.error("Error updating current block:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update current block",
      },
      { status: 500 }
    );
  }
}
