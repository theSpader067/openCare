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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const parsedTeamId = parseInt(teamId);

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: parsedTeamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.team.findFirst({
      where: {
        id: parsedTeamId,
        OR: [
          { adminId: userId },
          { members: { some: { id: userId } } },
        ],
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await prisma.teamRequest.findFirst({
      where: {
        senderId: userId,
        teamId: parsedTeamId,
        accepted: false,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Request already sent" },
        { status: 400 }
      );
    }

    // Create team request
    const teamRequest = await prisma.teamRequest.create({
      data: {
        senderId: userId,
        teamId: parsedTeamId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            year: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Transform response
    const senderFirstName = teamRequest.sender.firstName || "";
    const senderLastName = teamRequest.sender.lastName || "";
    const senderInitials = `${senderFirstName[0] || ""}${senderLastName[0] || ""}`.toUpperCase();
    const senderName = `${senderFirstName} ${senderLastName}`.trim();

    return NextResponse.json(
      {
        request: {
          id: teamRequest.id.toString(),
          residentId: teamRequest.senderId.toString(),
          residentName: senderName,
          residentAvatar: senderInitials,
          residentRole: "Demande",
          specialty: teamRequest.sender.specialty || "",
          year: teamRequest.sender.year || "",
          teamId: teamRequest.teamId.toString(),
          teamName: teamRequest.team.name,
          requestDate: teamRequest.createdAt.toISOString().split("T")[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
