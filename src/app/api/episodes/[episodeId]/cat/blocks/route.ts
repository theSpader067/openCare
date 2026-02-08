import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { CATBlockType, CATBlockStatus } from "@prisma/client";

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

// Helper function to map frontend block type to backend
function mapBlockType(type: string): CATBlockType {
  switch (type) {
    case "action":
      return "ACTION";
    case "condition":
      return "CONDITION";
    case "timer":
      return "WAIT";
    default:
      return "ACTION";
  }
}

// Helper function to generate block content
function generateBlockContent(
  type: string,
  data: any
): string {
  switch (type) {
    case "action":
      if (data.tasks && Array.isArray(data.tasks)) {
        return data.tasks
          .map((task: any) => `${task.completed ? "✓" : "○"} ${task.text}`)
          .join("\n");
      }
      return "";

    case "condition":
      return data.condition || "";

    case "timer":
      return `${data.timerMinutes} minute${
        data.timerMinutes !== 1 ? "s" : ""
      }`;

    default:
      return "";
  }
}

// POST - Create a CAT block
export async function POST(
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
    const { type, tasks, condition, timerMinutes, parentBlockId } = data;

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

    // Check if CAT exists for this episode
    let cat = await prisma.cAT.findFirst({
      where: {
        episodeId: episodeId,
      },
    });

    // Create CAT if it doesn't exist
    if (!cat) {
      console.log("[CAT_API] Creating new CAT for episode:", episodeId);
      cat = await prisma.cAT.create({
        data: {
          title: `CAT for ${episode.motif}`,
          episodeId: episodeId,
        },
      });
    }

    // Determine block depth based on parent
    let blockDepth = 0;
    let parentBlockIds: string[] = [];

    if (parentBlockId) {
      const parentBlock = await prisma.cATBlock.findUnique({
        where: { id: parentBlockId },
      });

      if (parentBlock) {
        blockDepth = parentBlock.blockDepth + 1;
        parentBlockIds = [...parentBlock.parentBlockIds, parentBlockId];
      }
    }

    // Map block type and generate content
    const blockType = mapBlockType(type);
    const content = generateBlockContent(type, { tasks, condition, timerMinutes });

    console.log("[CAT_API] Creating CAT block:", {
      catId: cat.id,
      type: blockType,
      blockDepth,
      parentBlockId,
      content,
    });

    // Create the block
    const block = await prisma.cATBlock.create({
      data: {
        catId: cat.id,
        type: blockType,
        content,
        status: "PENDING" as CATBlockStatus,
        blockDepth,
        parentBlockIds,
        ...(type === "timer" && timerMinutes && { duration: parseInt(timerMinutes) }),
      },
    });

    // If this block has a parent, update parent's children
    if (parentBlockId) {
      await prisma.cATBlock.update({
        where: { id: parentBlockId },
        data: {
          childBlockIds: {
            push: block.id,
          },
        },
      });
    }

    console.log("[CAT_API] CAT block created successfully:", block.id);

    return NextResponse.json({
      data: {
        id: block.id,
        type: type,
        catId: cat.id,
        blockDepth: block.blockDepth,
        parentBlockId: parentBlockId || null,
        createdAt: block.createdAt.toISOString(),
        updatedAt: block.updatedAt.toISOString(),
      },
      message: "Block created successfully",
    });
  } catch (error) {
    console.error("Error creating CAT block:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create block",
      },
      { status: 500 }
    );
  }
}

// GET - Get all blocks for an episode's CAT
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

    // Get CAT and blocks
    const cat = await prisma.cAT.findFirst({
      where: {
        episodeId: episodeId,
      },
      include: {
        blocks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!cat) {
      // Return empty blocks if no CAT exists yet
      return NextResponse.json({
        data: {
          catId: null,
          blocks: [],
        },
      });
    }

    return NextResponse.json({
      data: {
        catId: cat.id,
        blocks: cat.blocks.map((block) => ({
          id: block.id,
          type: block.type.toLowerCase(),
          catId: block.catId,
          blockDepth: block.blockDepth,
          content: block.content,
          parentBlockIds: block.parentBlockIds,
          childBlockIds: block.childBlockIds,
          status: block.status,
          createdAt: block.createdAt.toISOString(),
          updatedAt: block.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching CAT blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}
