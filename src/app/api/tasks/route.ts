import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import type { TaskItem } from "@/types/tasks";
import { taskServerAnalytics } from "@/lib/server-analytics";

// Helper function to convert Prisma Task to TaskItem
async function convertTaskToTaskItem(task: any): Promise<TaskItem> {
  let teams:any[] = [];

  // Parse teamsData JSON and fetch team details if available
  if (task.teamsData) {
    try {
      const teamIds = JSON.parse(task.teamsData);
      if (Array.isArray(teamIds) && teamIds.length > 0) {
        const teamRecords = await prisma.team.findMany({
          where: {
            id: { in: teamIds },
          },
          select: {
            id: true,
            name: true,
          },
        });
        teams = teamRecords;
      }
    } catch (error) {
      console.error("Error parsing teams data:", error);
    }
  }

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
    teams: teams,
  };
}

// GET - Fetch all tasks for a user
export async function GET(request: NextRequest) {
  try {
    console.log("[TASKS_API] GET request received");

    // Try JWT token first (mobile app)
    let userId = verifyMobileToken(request);
    console.log("[TASKS_API] JWT verification result, userId:", userId);

    // Fall back to session (web app)
    if (!userId) {
      console.log("[TASKS_API] No JWT token, checking session...");
      const session = await getSession();
      console.log("[TASKS_API] Session check result, has User:", !!session?.user);

      if (!session?.user) {
        console.log("[TASKS_API] No session and no JWT token - returning 401");
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = parseInt((session.user as any).id);
    }
    console.log("[TASKS_API] Final userId:", userId);
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

    const convertedTasks = await Promise.all(tasks.map(convertTaskToTaskItem));
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
    const { title, isPrivate = false, patientId, patientName, patientAge, patientHistory, teamIds = [] } = body;

    console.log("API received task data:", {
      title,
      isPrivate,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      teamIds,
      teamIdsType: typeof teamIds,
      teamIdsArray: Array.isArray(teamIds),
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

    // Store teams as JSON if provided
    if (Array.isArray(teamIds) && teamIds.length > 0) {
      taskData.teamsData = JSON.stringify(teamIds);
    }

    // If an existing patient is selected, use patientId
    if (patientId) {
      taskData.patientId = parseInt(patientId);
    }

    // Always store patient name and history if provided
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

    console.log("Prisma creating task with data:", taskData);

    const task = await prisma.task.create({
      data: {
        ...taskData,
        updatedAt: new Date(),
      },
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

    const convertedTask = await convertTaskToTaskItem(task);
    return NextResponse.json({
      success: true,
      data: convertedTask
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
