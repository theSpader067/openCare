import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { TaskItem } from "@/types/tasks";

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

// GET - Fetch all tasks for a user
export async function GET(request: NextRequest) {
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

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: parseInt(userId) },
          { isPrivate: false },
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
    const { title, isPrivate = false } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Task title cannot be empty" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        creatorId: parseInt(userId),
        isPrivate: isPrivate,
        isComplete: false,
      },
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
