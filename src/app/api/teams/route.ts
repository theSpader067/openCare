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

// GET - Fetch user's teams or search all teams
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get search parameter from query
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search");

    if (searchQuery && searchQuery.trim()) {
      // If search query is provided, search all teams
      const searchTerm = searchQuery.toLowerCase().trim();
      const allTeams = await prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { hospital: { contains: searchTerm, mode: "insensitive" } },
            { service: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              specialty: true,
            },
          },
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              specialty: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: allTeams });
    } else {
      // If no search query, get teams where user is admin or member
      const userTeams = await prisma.team.findMany({
        where: {
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
              username: true,
              specialty: true,
            },
          },
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              specialty: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: userTeams });
    }
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
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        adminId: userId,
        members: {
          connect: [{ id: userId }],
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
