import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ActivityItem } from "@/types/tasks";

// Helper function to convert Prisma Activity to ActivityItem
function convertActivityToActivityItem(activity: any): ActivityItem {
  return {
    id: activity.id.toString(),
    type: activity.category as any || "consultation",
    title: activity.title,
    description: activity.details || "",
    time: activity.horaire || "",
    location: activity.place,
    team: undefined,
    status: "todo", // Default status, can be enhanced later
    createdAt: activity.createdAt,
    activityDay: activity.activityDay,
  };
}

// GET - Fetch all activities
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        participants: true,
      },
    });

    const convertedActivities = activities.map(convertActivityToActivityItem);
    return NextResponse.json({ success: true, data: convertedActivities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch activities",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type, description, time, location, activityDay } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Activity title cannot be empty" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        title: title.trim(),
        category: type,
        details: description,
        horaire: time,
        place: location,
        activityDay: activityDay ? new Date(activityDay) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: convertActivityToActivityItem(activity)
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create activity",
      },
      { status: 500 }
    );
  }
}
