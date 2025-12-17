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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { requestId: requestIdStr } = await params;
    const requestId = parseInt(requestIdStr);

    // Get the team request
    const teamRequest = await prisma.teamRequest.findUnique({
      where: { id: requestId },
      include: {
        Team: {
          select: {
            adminId: true,
          },
        },
      },
    });

    if (!teamRequest) {
      return NextResponse.json(
        { error: "Team request not found" },
        { status: 404 }
      );
    }

    // Verify user is admin of the team
    if (teamRequest.Team.adminId !== userId) {
      return NextResponse.json(
        { error: "Only team admin can accept requests" },
        { status: 403 }
      );
    }

    // Update the request to accepted
    const updatedRequest = await prisma.teamRequest.update({
      where: { id: requestId },
      data: { accepted: true },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            year: true,
          },
        },
        Team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Add the sender as a member of the team
    await prisma.team.update({
      where: { id: teamRequest.teamId },
      data: {
        members: {
          connect: { id: teamRequest.senderId },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Request accepted",
        request: {
          id: updatedRequest.id.toString(),
          residentId: updatedRequest.User.id.toString(),
          residentName: `${updatedRequest.User.firstName || ""} ${updatedRequest.User.lastName || ""}`.trim(),
          specialty: updatedRequest.User.specialty || "",
          year: updatedRequest.User.year || "",
          teamId: updatedRequest.Team.id.toString(),
          teamName: updatedRequest.Team.name,
          accepted: updatedRequest.accepted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting team request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { requestId: requestIdStr } = await params;
    const requestId = parseInt(requestIdStr);

    // Get the team request
    const teamRequest = await prisma.teamRequest.findUnique({
      where: { id: requestId },
      include: {
        Team: {
          select: {
            adminId: true,
          },
        },
      },
    });

    if (!teamRequest) {
      return NextResponse.json(
        { error: "Team request not found" },
        { status: 404 }
      );
    }

    // Verify user is admin of the team
    if (teamRequest.Team.adminId !== userId) {
      return NextResponse.json(
        { error: "Only team admin can decline requests" },
        { status: 403 }
      );
    }

    // Delete the team request
    await prisma.teamRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json(
      { message: "Request declined" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error declining team request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
