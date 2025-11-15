import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// DELETE - Delete a rapport
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ rapportId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { rapportId: rapportIdStr } = await params;
    const rapportId = parseInt(rapportIdStr);
    if (isNaN(rapportId)) {
      return NextResponse.json(
        { success: false, error: "Invalid rapport ID" },
        { status: 400 }
      );
    }

    const rapport = await prisma.rapport.findUnique({
      where: { id: rapportId },
    });

    if (!rapport) {
      return NextResponse.json(
        { success: false, error: "Rapport not found" },
        { status: 404 }
      );
    }

    // Verify the rapport belongs to the current user
    const userId = parseInt(String((session.user as any).id));
    if (rapport.creatorId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - you can only delete your own rapports" },
        { status: 403 }
      );
    }

    await prisma.rapport.delete({
      where: { id: rapportId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rapport:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete rapport",
      },
      { status: 500 }
    );
  }
}
