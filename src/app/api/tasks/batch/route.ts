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

// POST - Create multiple tasks for the same patient
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
    const { titles, isPrivate = false, patientId, patientName, patientAge, patientHistory, teamIds = [] } = body;

    console.log("Batch task API received data:", {
      titles,
      isPrivate,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      teamIds,
    });

    // Validate titles array
    if (!Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one task title is required" },
        { status: 400 }
      );
    }

    // Filter out empty titles
    const validTitles = titles.filter((title: any) => title && String(title).trim());

    if (validTitles.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one valid task title is required" },
        { status: 400 }
      );
    }

    // Build the data object for task creation
    const baseTaskData: any = {
      creatorId: userId,
      isPrivate: isPrivate,
      isComplete: false,
    };

    // Store teams as JSON if provided
    if (Array.isArray(teamIds) && teamIds.length > 0) {
      baseTaskData.teamsData = JSON.stringify(teamIds);
    }

    // If an existing patient is selected, use patientId
    if (patientId) {
      baseTaskData.patientId = parseInt(patientId);
    }

    // Always store patient name and history if provided
    if (patientName) {
      const trimmedName = String(patientName).trim();
      if (trimmedName) {
        baseTaskData.patientName = trimmedName;
      }
    }
    if (patientAge) {
      const trimmedAge = String(patientAge).trim();
      if (trimmedAge) {
        baseTaskData.patientAge = trimmedAge;
      }
    }
    if (patientHistory) {
      const trimmedHistory = String(patientHistory).trim();
      if (trimmedHistory) {
        baseTaskData.patientHistory = trimmedHistory;
      }
    }

    // Create all tasks
    const createdTasks = [];

    for (const title of validTitles) {
      const taskData = {
        ...baseTaskData,
        title: String(title).trim(),
      };

      console.log("Creating task with data:", taskData);

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

      const convertedTask = await convertTaskToTaskItem(task);
      createdTasks.push(convertedTask);
    }

    console.log(`Successfully created ${createdTasks.length} tasks`);

    return NextResponse.json({
      success: true,
      data: createdTasks,
      message: `Created ${createdTasks.length} task(s) successfully`,
    });
  } catch (error) {
    console.error("Error creating batch tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create tasks",
      },
      { status: 500 }
    );
  }
}
