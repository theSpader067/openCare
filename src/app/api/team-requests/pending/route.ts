import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);

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
