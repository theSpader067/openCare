import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's teams
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    // Get teams where user is admin or member
    const userTeams = await prisma.team.findMany({
      where: {
        OR: [
          { adminId: parseInt(userId) },
          { members: { some: { id: parseInt(userId) } } },
        ],
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username:true,
            specialty: true,
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username:true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: userTeams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new team
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }

    const { name, hospital, service } = await req.json();

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    // Create team with current user as admin and only member
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        hospital: hospital || null,
        service: service || null,
        adminId: parseInt(userId),
        members: {
          connect: [{ id: parseInt(userId) }],
        },
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

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
