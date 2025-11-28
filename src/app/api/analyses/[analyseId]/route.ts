import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ analyseId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analyseId } = await params;
    const analyseIdNum = parseInt(analyseId, 10);

    if (isNaN(analyseIdNum)) {
      return NextResponse.json({ error: "Invalid analyse ID" }, { status: 400 });
    }

    // Verify the analyse belongs to the user
    const analyse = await prisma.analyse.findUnique({
      where: { id: analyseIdNum },
      select: { creatorId: true },
    });

    if (!analyse || analyse.creatorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { interpretation, status } = await request.json();

    // Update the analyse with interpretation and status
    const updatedAnalyse = await prisma.analyse.update({
      where: { id: analyseIdNum },
      data: {
        ...(interpretation !== undefined && { interpretation }),
        ...(status !== undefined && { status }),
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        labEntries: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAnalyse,
    });
  } catch (error) {
    console.error("Error updating analyse:", error);
    return NextResponse.json(
      { error: "Failed to update analyse" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ analyseId: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analyseId } = await params;
    const analyseIdNum = parseInt(analyseId, 10);

    if (isNaN(analyseIdNum)) {
      return NextResponse.json({ error: "Invalid analyse ID" }, { status: 400 });
    }

    // Verify the analyse belongs to the user
    const analyse = await prisma.analyse.findUnique({
      where: { id: analyseIdNum },
      select: { creatorId: true },
    });

    if (!analyse || analyse.creatorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete associated lab entries first
    await prisma.labEntry.deleteMany({
      where: { analyseId: analyseIdNum },
    });

    // Delete the analyse
    await prisma.analyse.delete({
      where: { id: analyseIdNum },
    });

    return NextResponse.json({
      success: true,
      message: "Analyse deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting analyse:", error);
    return NextResponse.json(
      { error: "Failed to delete analyse" },
      { status: 500 }
    );
  }
}
