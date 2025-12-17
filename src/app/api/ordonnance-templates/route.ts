import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    let templates;

    if (session?.user?.email) {
      // User is authenticated - fetch public templates + user's templates + teammates' templates
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          teamsAsMember: {
            include: {
              members: true,
            },
          },
          teamsAsAdmin: {
            include: {
              members: true,
            },
          },
        },
      });

      if (user) {
        // Collect all teammate IDs from teams where user is member or admin
        const teammateIds = new Set<number>();

        // Add members from teams where user is a member
        user.teamsAsMember.forEach((team) => {
          team.members.forEach((member) => {
            if (member.id !== user.id) {
              teammateIds.add(member.id);
            }
          });
        });

        // Add members from teams where user is admin
        user.teamsAsAdmin.forEach((team) => {
          team.members.forEach((member) => {
            if (member.id !== user.id) {
              teammateIds.add(member.id);
            }
          });
        });

        // Fetch templates: public OR created by user OR created by teammates
        templates = await prisma.ordonnanceTemplate.findMany({
          where: {
            OR: [
              { isPublic: true },
              { creatorId: user.id },
              { creatorId: { in: Array.from(teammateIds) } },
            ],
          },
          orderBy: [
            { isPublic: "desc" }, // Public templates first
            { createdAt: "desc" },
          ],
        });
      } else {
        // User not found, fetch only public templates
        templates = await prisma.ordonnanceTemplate.findMany({
          where: { isPublic: true },
          orderBy: [{ createdAt: "desc" }],
        });
      }
    } else {
      // User is not authenticated - fetch only public templates
      templates = await prisma.ordonnanceTemplate.findMany({
        where: { isPublic: true },
        orderBy: [{ createdAt: "desc" }],
      });
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching ordonnance templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, class: templateClass, prescriptionDetails, prescriptionConsignes } = body;

    if (!title || !templateClass || !prescriptionDetails) {
      return NextResponse.json(
        { error: "Missing required fields: title, class, prescriptionDetails" },
        { status: 400 }
      );
    }

    const template = await prisma.ordonnanceTemplate.create({
      data: {
        title,
        class: templateClass,
        prescriptionDetails,
        prescriptionConsignes: prescriptionConsignes || null,
        creatorId: user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating ordonnance template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
