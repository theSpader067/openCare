import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ analyseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIdNum = parseInt(userId as string);
    const { analyseId: analyseIdStr } = await params;
    const analyseId = parseInt(analyseIdStr);

    // Verify user owns this analyse
    const analyse = await prisma.analyse.findUnique({
      where: { id: analyseId },
    });

    if (!analyse || analyse.creatorId !== userIdNum) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own analyses" },
        { status: 403 }
      );
    }

    // Get the lab entries to update from request body
    const data = await req.json();
    const { labEntries, status } = data;

    if (!labEntries || !Array.isArray(labEntries)) {
      return NextResponse.json(
        { error: "labEntries array is required" },
        { status: 400 }
      );
    }

    // Update all lab entries
    const updatedEntries = await Promise.all(
      labEntries.map((entry: { id: number; value?: string; interpretation?: string }) =>
        prisma.labEntry.update({
          where: { id: entry.id },
          data: {
            value: entry.value || null,
            interpretation: entry.interpretation || null,
          },
        })
      )
    );

    console.log(`Updated ${updatedEntries.length} lab entries for analyse ${analyseId}`);

    // If status is provided, also update the analyse status
    let updatedAnalyse = null;
    if (status) {
      updatedAnalyse = await prisma.analyse.update({
        where: { id: analyseId },
        data: { status },
        include: {
          labEntries: true,
          patient: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
      console.log(`Updated analyse ${analyseId} status to ${status}`);
    }

    return NextResponse.json({
      data: updatedEntries,
      analyse: updatedAnalyse,
      message: "Lab entries updated successfully",
    });
  } catch (error) {
    console.error("Error updating lab entries:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update lab entries",
      },
      { status: 500 }
    );
  }
}
