import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const userId = parseInt((session.user as any).id);

    if (!query.trim()) {
      return NextResponse.json({ teams: [] });
    }

    // Search for teams by name, hospital, or service
    // Only return teams the user is not already a member of

    console.log('SEARCH @@@@@')
    console.log(query)
    const teams = await prisma.team.findMany({
      where: {
        AND: [
          // Search filter
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { hospital: { contains: query, mode: "insensitive" } },
              { service: { contains: query, mode: "insensitive" } },
            ],
          },
          //User is not already a member or admin
          {
            NOT: {
              OR: [
                { adminId: userId },
                { members: { some: { id: userId } } },
              ],
            },
          },
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
          },
        },
      },
      take: 10, // Limit results
    });

    // Transform the data to match the UI expectations
    const transformedTeams = teams.map((team) => {
      const adminFirstName = team.admin.firstName || "";
      const adminLastName = team.admin.lastName || "";
      const adminInitials = `${adminFirstName[0] || ""}${adminLastName[0] || ""}`.toUpperCase();
      const adminName = `${adminFirstName} ${adminLastName}`.trim();
      const teamDescription = team.service && team.hospital 
      ? `${team.hospital}: ${team.service}`
      : team.hospital
        ? `Hôpital: ${team.hospital}`
      : team.service
        ? `Service: ${team.service}`
        : "Équipe"
      return {
        id: team.id.toString(),
        name: team.name,
        members: team.members?.length || 0,
        joined: false,
        requestPending: false,
        description: teamDescription,
        hospital: team.hospital,
        service: team.service,
        adminId: team.adminId?.toString(),
        teamMembers: [
          {
            id: team.admin.id.toString(),
            name: adminName,
            avatar: adminInitials,
            role: "Admin",
            specialty: team.admin.specialty || "",
          },
        ],
      };
    });

    console.log(transformedTeams)

    return NextResponse.json({ teams: transformedTeams });
  } catch (error) {
    console.error("Error searching teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
