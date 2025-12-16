import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    // Get all templates created by the user
    const templates = await prisma.ordonnanceTemplate.findMany({
      where: {
        creatorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
