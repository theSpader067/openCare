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

// DELETE - Delete a CAT block
export async function DELETE(
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

    // Get the block to delete
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

    // If this block is the current block, set current block to null
    if (cat.currentBlockId === blockId) {
      await prisma.cAT.update({
        where: { id: cat.id },
        data: { currentBlockId: null },
      });
    }

    // Remove this block from parent's childBlockIds
    if (block.parentBlockIds && block.parentBlockIds.length > 0) {
      const parentId = block.parentBlockIds[block.parentBlockIds.length - 1];
      await prisma.cATBlock.update({
        where: { id: parentId },
        data: {
          childBlockIds: {
            set: (await prisma.cATBlock.findUnique({ where: { id: parentId } }))?.childBlockIds.filter((id: string) => id !== blockId) || [],
          },
        },
      });
    }

    // Handle child blocks - remove this block from their parentBlockIds
    const childBlocks = await prisma.cATBlock.findMany({
      where: {
        parentBlockIds: {
          has: blockId,
        },
      },
    });

    for (const childBlock of childBlocks) {
      const updatedParentBlockIds = childBlock.parentBlockIds.filter((id: string) => id !== blockId);
      await prisma.cATBlock.update({
        where: { id: childBlock.id },
        data: {
          parentBlockIds: updatedParentBlockIds,
          blockDepth: updatedParentBlockIds.length,
        },
      });
    }

    // Delete the block
    await prisma.cATBlock.delete({
      where: { id: blockId },
    });

    console.log("[CAT_API] Block deleted successfully:", blockId);

    return NextResponse.json({
      data: { id: blockId },
      message: "Block deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting CAT block:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete block",
      },
      { status: 500 }
    );
  }
}
