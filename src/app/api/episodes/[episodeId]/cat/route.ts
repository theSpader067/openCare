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

// DELETE - Delete a CAT and all its blocks
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

    // Delete all blocks for this CAT
    await prisma.cATBlock.deleteMany({
      where: {
        catId: cat.id,
      },
    });

    // Delete the CAT
    await prisma.cAT.delete({
      where: { id: cat.id },
    });

    console.log("[CAT_API] CAT deleted successfully:", cat.id);

    return NextResponse.json({
      data: { id: cat.id },
      message: "CAT deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting CAT:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete CAT",
      },
      { status: 500 }
    );
  }
}
