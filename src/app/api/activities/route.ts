import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ActivityItem } from "@/types/tasks";
import { filter } from "framer-motion/client";

// Helper function to convert Prisma Activity to ActivityItem
function convertActivityToActivityItem(activity: any): ActivityItem {
  const result:ActivityItem = {
    id: activity.id.toString(),
    type: activity.category as any || "consultation",
    title: activity.title,
    description: activity.details || "",
    time: activity.horaire || "",
    location: activity.place,
    status: "todo", // Default status, can be enhanced later
    createdAt: activity.createdAt,
    activityDay: activity.activityDay,
    participants:activity.équipe.split(','),
    creator: activity.creator ? {
      id: activity.creator.id,
      firstName: activity.creator.firstName,
      lastName: activity.creator.lastName,
      email: activity.creator.email,
      username: activity.creator.username,
    } : undefined,
  }
  return result;
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
        creator: {
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

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, type, description, time, location, activityDay, team: équipe } = body;

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
        équipe: équipe || undefined,
        creatorId: parseInt(userId),
      },
      include: {
        creator: {
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
