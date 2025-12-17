import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ActivityItem } from "@/types/tasks";
import { activityServerAnalytics } from "@/lib/server-analytics";

// Helper function to convert Prisma Activity to ActivityItem
function convertActivityToActivityItem(activity: any): ActivityItem {
  return {
    id: activity.id.toString(),
    type: activity.category as any || "consultation",
    title: activity.title,
    description: activity.details || "",
    time: activity.horaire || "",
    location: activity.place,
    team: activity.quipe || undefined,
    status: "todo",
    createdAt: activity.createdAt,
    activityDay: activity.activityDay,
    creator: activity.User ? {
      id: activity.User.id,
      firstName: activity.User.firstName,
      lastName: activity.User.lastName,
      email: activity.User.email,
      username: activity.User.username,
    } : undefined,
  };
}

// GET - Get a single activity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { activityId: activityIdStr } = await params;
    const activityId = parseInt(activityIdStr);
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertActivityToActivityItem(activity)
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch activity",
      },
      { status: 500 }
    );
  }
}

// PUT - Update an activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { activityId: activityIdStr } = await params;
    const activityId = parseInt(activityIdStr);
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, error: "Activity not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, type, description, time, location, activityDay, team } = body;

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(type !== undefined && { category: type }),
        ...(description !== undefined && { details: description }),
        ...(time !== undefined && { horaire: time }),
        ...(location !== undefined && { place: location }),
        ...(activityDay !== undefined && { activityDay: new Date(activityDay) }),
        ...(team !== undefined && { équipe: team || null }),
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    });

    // Track activity update event
    await activityServerAnalytics.trackActivityUpdated({
      id: updatedActivity.id,
      title: updatedActivity.title,
      category: updatedActivity.category || '',
    });

    return NextResponse.json({
      success: true,
      data: convertActivityToActivityItem(updatedActivity)
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update activity",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete an activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { activityId: activityIdStr } = await params;
    const activityId = parseInt(activityIdStr);
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, error: "Activity not found" },
        { status: 404 }
      );
    }

    await prisma.activity.delete({
      where: { id: activityId },
    });

    // Track activity deletion event
    await activityServerAnalytics.trackActivityDeleted(activityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete activity",
      },
      { status: 500 }
    );
  }
}
