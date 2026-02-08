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

// PATCH - Mark a CAT block as completed
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string; blockId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { episodeId, blockId } = await params;

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

    // Get the CAT for this episode
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

    // Get the block to mark as completed
    const block = await prisma.cATBlock.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    // Verify block belongs to this CAT
    if (block.catId !== cat.id) {
      return NextResponse.json(
        { error: "Block does not belong to this CAT" },
        { status: 403 }
      );
    }

    // Mark the block as completed
    const completedBlock = await prisma.cATBlock.update({
      where: { id: blockId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    console.log("[CAT_API] Block marked as completed:", blockId);

    return NextResponse.json({
      data: completedBlock,
      message: "Block marked as completed successfully",
    });
  } catch (error) {
    console.error("Error marking block as completed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to complete block",
      },
      { status: 500 }
    );
  }
}
