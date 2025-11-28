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

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch pending team requests for teams where user is admin
    const teamRequests = await prisma.teamRequest.findMany({
      where: {
        team: {
          adminId: userId,
        },
        accepted: false,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform response to match frontend expectations
    const transformedRequests = teamRequests.map((req) => {
      const senderFirstName = req.sender.firstName || "";
      const senderLastName = req.sender.lastName || "";
      const senderInitials = `${senderFirstName[0] || ""}${senderLastName[0] || ""}`.toUpperCase();
      const senderName = `${senderFirstName} ${senderLastName}`.trim();

      return {
        id: req.id.toString(),
        residentId: req.sender.id.toString(),
        residentName: senderName,
        residentAvatar: senderInitials,
        residentRole: req.sender.year || "Demande",
        specialty: req.sender.specialty || "",
        year: req.sender.year || "",
        teamId: req.team.id.toString(),
        teamName: req.team.name,
        requestDate: req.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json({ requests: transformedRequests });
  } catch (error) {
    console.error("Error fetching team requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
