import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import type { TaskItem } from "@/types/tasks";
import { taskServerAnalytics } from "@/lib/server-analytics";

// Helper function to convert Prisma Task to TaskItem
function convertTaskToTaskItem(task: any): TaskItem {
  return {
    id: task.id.toString(),
    title: task.title,
    details: task.details || "",
    done: task.isComplete,
    patientId: task.patientId || undefined,
    patientName: task.patientName || undefined,
    patientAge: task.patientAge || undefined,
    patientHistory: task.patientHistory || undefined,
    taskType: task.isPrivate ? "private" : "team",
  };
}

// GET - Fetch all tasks for a user
export async function GET(request: NextRequest) {
  try {
    // Try JWT token first (mobile app)
    let userId = verifyMobileToken(request);

    // Fall back to session (web app)
    if (!userId) {
      const session = await getSession();
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = parseInt((session.user as any).id);
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    // Get user's teams to find teammate IDs
    const userTeams = await prisma.team.findMany({
      where: {
        OR: [
          { adminId: userId },
          { members: { some: { id: userId } } },
        ],
      },
      include: { members: true },
    });

    // Collect all teammate IDs (including user's own ID)
    const userIds = new Set<number>();
    userIds.add(userId);
    userTeams.forEach((team) => {
      team.members.forEach((member) => {
        userIds.add(member.id);
      });
    });

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: userId },
          {
            AND: [
              { creatorId: { in: Array.from(userIds) } },
              { isPrivate: false },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const convertedTasks = tasks.map(convertTaskToTaskItem);
    return NextResponse.json({ success: true, data: convertedTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    // Try JWT token first (mobile app)
    let userId = verifyMobileToken(request);

    // Fall back to session (web app)
    if (!userId) {
      const session = await getSession();
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = parseInt((session.user as any).id);
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, isPrivate = false, patientId, patientName, patientAge, patientHistory } = body;

    console.log("API received task data:", {
      title,
      isPrivate,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      fullBody: body
    });

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Task title cannot be empty" },
        { status: 400 }
      );
    }

    // Build the data object for task creation
    const taskData: any = {
      title: title.trim(),
      creatorId: userId,
      isPrivate: isPrivate,
      isComplete: false,
    };

    // If an existing patient is selected, use patientId
    if (patientId) {
      taskData.patientId = parseInt(patientId);
    } else {
      // Otherwise, store patient name and history if provided
      if (patientName) {
        const trimmedName = String(patientName).trim();
        if (trimmedName) {
          taskData.patientName = trimmedName;
        }
      }
      if (patientAge) {
        const trimmedAge = String(patientAge).trim();
        if (trimmedAge) {
          taskData.patientAge = trimmedAge;
        }
      }
      if (patientHistory) {
        const trimmedHistory = String(patientHistory).trim();
        if (trimmedHistory) {
          taskData.patientHistory = trimmedHistory;
        }
      }
    }

    console.log("Prisma creating task with data:", taskData);

    const task = await prisma.task.create({
      data: taskData,
    });

    // Track task creation event
    await taskServerAnalytics.trackTaskCreated({
      id: task.id,
      title: task.title,
      isPrivate: task.isPrivate,
      creatorId: task.creatorId,
      patientId: task.patientId || undefined,
      patientName: task.patientName || undefined,
    });

    return NextResponse.json({
      success: true,
      data: convertTaskToTaskItem(task)
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create task",
      },
      { status: 500 }
    );
  }
}
