import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch a specific team
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { teamId: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (!userId || isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Check if user is member or admin of team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { adminId: userId },
          { members: { some: { id: userId } } },
        ],
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a team (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { teamId: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (!userId || isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Check if user is admin of team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        adminId: userId,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or you are not the admin" },
        { status: 404 }
      );
    }

    const { name, hospital, service } = await req.json();

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: name || undefined,
        hospital: hospital || null,
        service: service || null,
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a team (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { teamId: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (!userId || isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Check if user is admin of team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        adminId: userId,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or you are not the admin" },
        { status: 404 }
      );
    }

    // Delete team
    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json(
      { message: "Team deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
