import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ analyseId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analyseId } = await params;
    const analyseIdNum = parseInt(analyseId, 10);

    if (isNaN(analyseIdNum)) {
      return NextResponse.json({ error: "Invalid analyse ID" }, { status: 400 });
    }

    const { interpretation, status } = await request.json();

    // Update the analyse with interpretation and status
    const updatedAnalyse = await prisma.analyse.update({
      where: { id: analyseIdNum },
      data: {
        ...(interpretation && { interpretation }),
        ...(status && { status }),
      },
      include: {
        patient: true,
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
