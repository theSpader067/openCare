import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
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

    const template = await prisma.ordonnanceTemplate.findUnique({
      where: { id: parseInt(templateId) },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (template.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.ordonnanceTemplate.delete({
      where: { id: parseInt(templateId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ordonnance template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
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

    const template = await prisma.ordonnanceTemplate.findUnique({
      where: { id: parseInt(templateId) },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (template.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, class: templateClass, prescriptionDetails, prescriptionConsignes } = body;

    const updated = await prisma.ordonnanceTemplate.update({
      where: { id: parseInt(templateId) },
      data: {
        ...(title && { title }),
        ...(templateClass && { class: templateClass }),
        ...(prescriptionDetails && { prescriptionDetails }),
        ...(prescriptionConsignes !== undefined && { prescriptionConsignes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating ordonnance template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}
