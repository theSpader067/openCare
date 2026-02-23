import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { CATBlockType, CATBlockStatus } from "@prisma/client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Interface for block data
interface BlockData {
  id: number;
  type: "action" | "condition" | "wait";
  content: string;
  children_nodes: number[];
  depth: number;
}

/**
 * Determine block type based on French keywords
 */
function determineBlockType(text: string): "action" | "condition" | "wait" {
  const lowerText = text.toLowerCase().trim();

  if (lowerText.startsWith("faire")) {
    return "action";
  } else if (lowerText.startsWith("vérifier")) {
    return "condition";
  } else if (lowerText.startsWith("attendre")) {
    return "wait";
  }

  // Default to action if no keyword found
  return "action";
}

/**
 * Parse tasks from action block content (comma-separated)
 */
function parseTasksFromContent(content: string): string {
  // If it starts with "faire", extract the tasks part
  if (content.toLowerCase().startsWith("faire")) {
    const afterFaire = content.substring(5).trim();
    // Split by comma and clean up each task
    const tasks = afterFaire
      .split(",")
      .map((task) => task.trim())
      .filter((task) => task.length > 0);

    // Join with newlines for multi-line task display
    return tasks.join("\n");
  }

  return content;
}

/**
 * Parse text description into block structure using ChatGPT
 */
async function parseTextToBlocks(description: string): Promise<BlockData[]> {
  console.log("[CAT_GENERATION] Parsing text to blocks with ChatGPT...");

  const prompt = `You are a medical decision tree expert. Convert the following text description into a structured JSON format for a Clinical Adaptive Tree (CAT).

Important: Use these French keywords to determine block types:
- If a line starts with "faire": it's an ACTION block with comma-separated tasks
- If a line starts with "vérifier": it's a CONDITION block
- If a line starts with "attendre": it's a TIMER/WAIT block

Text description:
${description}

Return a valid JSON array of blocks with this exact structure:
[
  {
    "id": 0,
    "type": "action|condition|wait",
    "content": "block content description",
    "children_nodes": [list of child block ids],
    "depth": 0
  }
]

Rules:
1. Each block must have a unique id starting from 0
2. type is determined by the French keyword:
   - "faire" → "action" (extract tasks after "faire")
   - "vérifier" → "condition"
   - "attendre" → "wait"
3. content should contain what follows the keyword
4. children_nodes should list ONLY the immediate child block ids
5. depth should be based on hierarchical nesting level:
   - Root blocks (first level, no parent) = depth 0
   - Blocks nested under root = depth 1
   - Blocks nested under depth 1 = depth 2, etc.
6. CRITICAL: Analyze the text structure:
   - Indentation or nesting indicates parent-child relationships
   - A block's children are the blocks that directly follow and are nested under it
   - Do NOT include descendant blocks (grandchildren) in children_nodes; only direct children
7. For action blocks starting with "faire", content should list comma-separated tasks
8. For condition blocks starting with "vérifier", content should describe the condition
9. For timer blocks starting with "attendre", content should describe the wait time
10. Ensure there is exactly ONE root block (depth 0, no parent references)
11. All non-root blocks must have at least one parent in the structure
12. Make sure the tree structure is hierarchically correct and complete

Return ONLY the JSON array, no other text.`;

  try {
    const message = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let responseText = message.choices[0].message.content || "";
    console.log("[CAT_GENERATION] ChatGPT response:", responseText);

    // Strip markdown code fences if present
    responseText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Parse the JSON response
    const blocks: BlockData[] = JSON.parse(responseText);
    console.log("[CAT_GENERATION] Parsed blocks:", blocks.length);

    // Validate block structure
    const rootBlocks = blocks.filter((b) => b.depth === 0);
    if (rootBlocks.length !== 1) {
      throw new Error(`Expected exactly 1 root block (depth 0), but found ${rootBlocks.length}. Tree structure is invalid.`);
    }

    // Validate that all non-root blocks are reachable from the root
    const blockIds = new Set(blocks.map((b) => b.id));
    const visited = new Set<number>();

    function traverseTree(blockId: number): void {
      if (visited.has(blockId)) return;
      visited.add(blockId);

      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      for (const childId of block.children_nodes) {
        traverseTree(childId);
      }
    }

    traverseTree(rootBlocks[0].id);

    if (visited.size !== blocks.length) {
      const unreachableIds = blocks.filter((b) => !visited.has(b.id)).map((b) => b.id);
      throw new Error(`Block structure is invalid. Unreachable blocks: ${unreachableIds.join(", ")}`);
    }

    // Process blocks to ensure proper task formatting for action blocks
    const processedBlocks = blocks.map((block) => {
      if (block.type === "action") {
        // Parse comma-separated tasks into newline-separated format
        block.content = parseTasksFromContent(block.content);
      }
      return block;
    });

    return processedBlocks;
  } catch (error) {
    console.error("[CAT_GENERATION] Error parsing text with ChatGPT:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to parse CAT structure"
    );
  }
}

/**
 * Create blocks and CAT in database from parsed block data
 */
async function createCATFromBlocks(
  episodeId: string,
  blocks: BlockData[],
  motif: string
): Promise<string> {
  console.log("[CAT_GENERATION] Creating CAT with", blocks.length, "blocks");

  if (blocks.length === 0) {
    throw new Error("No blocks to create");
  }

  try {
    // Create the CAT
    const cat = await prisma.cAT.create({
      data: {
        title: `CAT for '${motif}'`,
        episodeId: episodeId,
        blocks: {
          create: blocks.map((block) => ({
            type: (block.type.toUpperCase() as CATBlockType),
            content: block.content,
            status: "PENDING" as CATBlockStatus,
            blockDepth: block.depth,
            parentBlockIds: [],
            childBlockIds: [],
          })),
        },
      },
      include: {
        blocks: true,
      },
    });

    console.log("[CAT_GENERATION] CAT created:", cat.id);

    // Now we need to update the parent-child relationships
    // Create a map of original id to database id
    const idMap: { [key: number]: string } = {};
    const blocksByOriginalId: { [key: number]: (typeof cat.blocks)[0] } = {};

    // First, establish the id mapping
    cat.blocks.forEach((dbBlock, index) => {
      idMap[blocks[index].id] = dbBlock.id;
      blocksByOriginalId[blocks[index].id] = dbBlock;
    });

    // Update parent-child relationships
    for (const block of blocks) {
      const dbBlock = blocksByOriginalId[block.id];

      // Update child block IDs
      const childIds = block.children_nodes.map((childId) => idMap[childId]);

      // Find parent blocks
      const parentIds: string[] = [];
      for (const potentialParent of blocks) {
        if (potentialParent.children_nodes.includes(block.id)) {
          parentIds.push(idMap[potentialParent.id]);
        }
      }

      // Update the block with parent and child relationships
      await prisma.cATBlock.update({
        where: { id: dbBlock.id },
        data: {
          childBlockIds: childIds,
          parentBlockIds: parentIds,
        },
      });
    }

    // Set the current block to the first block (root block with depth 0)
    const rootBlockOriginal = blocks.find((b) => b.depth === 0);
    if (rootBlockOriginal) {
      const rootBlockDb = idMap[rootBlockOriginal.id];
      if (rootBlockDb) {
        await prisma.cAT.update({
          where: { id: cat.id },
          data: {
            currentBlockId: rootBlockDb,
          },
        });
        console.log("[CAT_GENERATION] Set current block to:", rootBlockDb);
      }
    }

    console.log(
      "[CAT_GENERATION] CAT created and blocks linked successfully"
    );
    return cat.id;
  } catch (error) {
    console.error("[CAT_GENERATION] Error creating CAT:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create CAT"
    );
  }
}

/**
 * POST endpoint - generate CAT from text description
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { episodeId, description } = body;

    if (!episodeId || !description) {
      return NextResponse.json(
        { error: "episodeId and description are required" },
        { status: 400 }
      );
    }

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

    console.log(
      "[CAT_GENERATION] Starting CAT generation for episode:",
      episodeId
    );

    // Step 1: Parse text to blocks using ChatGPT
    const blocks = await parseTextToBlocks(description);

    // Step 2: Create CAT and blocks in database
    const catId = await createCATFromBlocks(episodeId, blocks, episode.motif);

    console.log("[CAT_GENERATION] CAT generation completed successfully");

    return NextResponse.json({
      data: {
        catId,
        blockCount: blocks.length,
        message: "CAT generated successfully",
      },
      message: "CAT generated and stored successfully",
    });
  } catch (error) {
    console.error("[CAT_GENERATION] Error in CAT generation:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate CAT",
      },
      { status: 500 }
    );
  }
}
