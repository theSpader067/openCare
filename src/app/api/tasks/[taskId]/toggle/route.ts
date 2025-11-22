import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { TaskItem } from "@/types/tasks";
import { taskServerAnalytics } from "@/lib/server-analytics";

// Helper function to convert Prisma Task to TaskItem
function convertTaskToTaskItem(task: any): TaskItem {
  return {
    id: task.id.toString(),
    title: task.title,
    details: task.details || "",
    done: task.isComplete,
    patientName: undefined,
    taskType: task.isPrivate ? "private" : "team",
  };
}

// POST - Toggle task completion status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId: taskIdStr } = await params;
    const taskId = parseInt(taskIdStr);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { isComplete: !task.isComplete },
    });

    // Track task completion if toggled to done
    if (updatedTask.isComplete && !task.isComplete) {
      await taskServerAnalytics.trackTaskCompleted(taskId);
    }

    return NextResponse.json({
      success: true,
      data: convertTaskToTaskItem(updatedTask)
    });
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to toggle task",
      },
      { status: 500 }
    );
  }
}
