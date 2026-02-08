import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";

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

// ==================== CAT OPERATIONS ====================

// GET - Fetch CATs (all for user or by specific ID)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const catId = searchParams.get("id");
    const episodeId = searchParams.get("episodeId");

    // Get specific CAT by ID
    if (catId) {
      const cat = await prisma.cAT.findUnique({
        where: { id: catId },
        include: {
          episode: true,
          blocks: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!cat) {
        return NextResponse.json(
          { success: false, error: "CAT not found" },
          { status: 404 }
        );
      }

      // Verify CAT belongs to user (through episode)
      if (cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: cat,
      });
    }

    // Get CAT for specific episode
    if (episodeId) {
      const episode = await prisma.episode.findUnique({
        where: { id: episodeId },
      });

      if (!episode) {
        return NextResponse.json(
          { success: false, error: "Episode not found" },
          { status: 404 }
        );
      }

      if (episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      const cat = await prisma.cAT.findFirst({
        where: { episodeId },
        include: {
          blocks: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: cat,
      });
    }

    // Get all CATs for user (through episodes)
    const userEpisodes = await prisma.episode.findMany({
      where: { creatorId: userId },
      select: { id: true },
    });

    const episodeIds = userEpisodes.map((ep) => ep.id);

    const cats = await prisma.cAT.findMany({
      where: {
        episodeId: { in: episodeIds },
      },
      include: {
        episode: true,
        blocks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cats,
    });
  } catch (error) {
    console.error("Error fetching CAT:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch CAT",
      },
      { status: 500 }
    );
  }
}

// POST - Create CAT or CATBlock
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
    const { operation, episodeId, title, blockData } = body;

    // ========== CREATE CAT ==========
    if (operation === "createCAT") {
      // Verify episode exists and belongs to user
      const episode = await prisma.episode.findUnique({
        where: { id: episodeId },
      });

      if (!episode) {
        return NextResponse.json(
          { success: false, error: "Episode not found" },
          { status: 404 }
        );
      }

      if (episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Check if CAT already exists for this episode
      const existingCat = await prisma.cAT.findFirst({
        where: { episodeId },
      });

      if (existingCat) {
        return NextResponse.json({
          success: true,
          data: existingCat,
          message: "CAT already exists for this episode",
        });
      }

      // Create new CAT
      const newCat = await prisma.cAT.create({
        data: {
          title: title || `CAT for ${episode.motif}`,
          episodeId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: newCat,
          message: "CAT created successfully",
        },
        { status: 201 }
      );
    }

    // ========== CREATE CATBLOCK ==========
    if (operation === "createBlock") {
      const { catId, type, taskData, conditionData, waitData } = blockData;

      // Verify CAT exists
      const cat = await prisma.cAT.findUnique({
        where: { id: catId },
        include: { episode: true },
      });

      if (!cat) {
        return NextResponse.json(
          { success: false, error: "CAT not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to user
      if (cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Serialize content based on type
      let content = "";
      if (type === "ACTION") {
        content = JSON.stringify(taskData);
      } else if (type === "CONDITION") {
        content = JSON.stringify(conditionData);
      } else if (type === "WAIT") {
        content = JSON.stringify(waitData);
      }

      // Create CATBlock
      const newBlock = await prisma.cATBlock.create({
        data: {
          catId,
          type,
          content,
          status: "PENDING",
          blockDepth: 0,
          duration: type === "WAIT" ? waitData?.duration : null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: newBlock,
          message: "Block created successfully",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error creating CAT/Block:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create CAT/Block",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update CAT or CATBlock
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
    const { operation, catId, blockId, title, blockData, currentBlockId } = body;

    // ========== UPDATE CAT ==========
    if (operation === "updateCAT") {
      // Verify CAT exists
      const cat = await prisma.cAT.findUnique({
        where: { id: catId },
        include: { episode: true },
      });

      if (!cat) {
        return NextResponse.json(
          { success: false, error: "CAT not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to user
      if (cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Update CAT
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (currentBlockId !== undefined) updateData.currentBlockId = currentBlockId;

      const updatedCat = await prisma.cAT.update({
        where: { id: catId },
        data: updateData || { title: cat.title },
      });

      return NextResponse.json({
        success: true,
        data: updatedCat,
        message: "CAT updated successfully",
      });
    }

    // ========== UPDATE CATBLOCK ==========
    if (operation === "updateBlock") {
      const { type, taskData, conditionData, waitData } = blockData;

      // Verify block exists
      const block = await prisma.cATBlock.findUnique({
        where: { id: blockId },
        include: {
          cat: {
            include: { episode: true },
          },
        },
      });

      if (!block) {
        return NextResponse.json(
          { success: false, error: "Block not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to user
      if (block.cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Serialize content based on type
      let content = "";
      if (type === "ACTION") {
        content = JSON.stringify(taskData);
      } else if (type === "CONDITION") {
        content = JSON.stringify(conditionData);
      } else if (type === "WAIT") {
        content = JSON.stringify(waitData);
      }

      // Update block
      const updatedBlock = await prisma.cATBlock.update({
        where: { id: blockId },
        data: {
          type,
          content,
          duration: type === "WAIT" ? waitData?.duration : null,
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedBlock,
        message: "Block updated successfully",
      });
    }

    // ========== UPDATE BLOCK RELATIONSHIPS ==========
    if (operation === "updateBlockRelationships") {
      const { parentBlockIds, childBlockIds } = blockData;

      // Verify block exists
      const block = await prisma.cATBlock.findUnique({
        where: { id: blockId },
        include: {
          cat: {
            include: { episode: true },
          },
        },
      });

      if (!block) {
        return NextResponse.json(
          { success: false, error: "Block not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to user
      if (block.cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Update relationships
      const updatedBlock = await prisma.cATBlock.update({
        where: { id: blockId },
        data: {
          parentBlockIds: parentBlockIds || [],
          childBlockIds: childBlockIds || [],
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedBlock,
        message: "Block relationships updated successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating CAT/Block:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update CAT/Block",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete CAT or CATBlock
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const catId = searchParams.get("catId");
    const blockId = searchParams.get("blockId");
    const operation = searchParams.get("operation");

    // ========== DELETE CAT ==========
    if (operation === "deleteCAT" && catId) {
      // Verify CAT exists
      const cat = await prisma.cAT.findUnique({
        where: { id: catId },
        include: { episode: true },
      });

      if (!cat) {
        return NextResponse.json(
          { success: false, error: "CAT not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to user
      if (cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Delete CAT (cascade will handle blocks)
      await prisma.cAT.delete({
        where: { id: catId },
      });

      return NextResponse.json({
        success: true,
        message: "CAT deleted successfully",
      });
    }

    // ========== DELETE CATBLOCK ==========
    if (operation === "deleteBlock" && blockId) {
      // Verify block exists
      const block = await prisma.cATBlock.findUnique({
        where: { id: blockId },
        include: {
          cat: {
            include: { episode: true },
          },
        },
      });

      if (!block) {
        return NextResponse.json(
          { success: false, error: "Block not found" },
          { status: 404 }
        );
      }

      // Verify episode belongs to user
      if (block.cat.episode.creatorId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Delete block
      await prisma.cATBlock.delete({
        where: { id: blockId },
      });

      return NextResponse.json({
        success: true,
        message: "Block deleted successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting CAT/Block:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete CAT/Block",
      },
      { status: 500 }
    );
  }
}
