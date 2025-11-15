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
    patientName: task.patientName,
    patientAge: task.patientAge,
    patientHistory: task.patientHistory,
    patientId: task.patientId,
    taskType: task.isPrivate ? "private" : "team",
  };
}

// GET - Get a single task by ID
export async function GET(
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

    return NextResponse.json({
      success: true,
      data: convertTaskToTaskItem(task)
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch task",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a task
export async function PUT(
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

    const body = await request.json();
    const { title, isComplete, isPrivate, patientId, patientName, patientAge, patientHistory } = body;

    console.log("Updating task with data:", { title, isComplete, isPrivate, patientId, patientName, patientAge, patientHistory });

    // Build update data object
    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (isComplete !== undefined) {
      updateData.isComplete = isComplete;
    }
    if (isPrivate !== undefined) {
      updateData.isPrivate = isPrivate;
    }

    // Handle patient data
    if (patientId !== undefined && patientId !== null && patientId !== "") {
      // If patientId is provided, validate and link to existing patient
      const parsedPatientId = parseInt(String(patientId));
      if (!isNaN(parsedPatientId) && parsedPatientId > 0) {
        updateData.patientId = parsedPatientId;
        // Clear patient name/age/history when linking to a patient
        updateData.patientName = null;
        updateData.patientAge = null;
        updateData.patientHistory = null;
      } else {
        // Invalid patientId, treat as new patient (clear patientId)
        console.warn("Invalid patientId provided, clearing it:", patientId);
        updateData.patientId = null;
        if (patientName !== undefined) {
          updateData.patientName = patientName ? String(patientName).trim() : null;
        }
        if (patientAge !== undefined) {
          updateData.patientAge = patientAge ? String(patientAge).trim() : null;
        }
        if (patientHistory !== undefined) {
          updateData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
        }
      }
    } else if (patientName !== undefined || patientAge !== undefined || patientHistory !== undefined) {
      // If any patient field is provided without patientId, it's a new/unlinked patient
      updateData.patientId = null;
      if (patientName !== undefined) {
        updateData.patientName = patientName ? String(patientName).trim() : null;
      }
      if (patientAge !== undefined) {
        updateData.patientAge = patientAge ? String(patientAge).trim() : null;
      }
      if (patientHistory !== undefined) {
        updateData.patientHistory = patientHistory ? String(patientHistory).trim() : null;
      }
    } else if (patientId === null || patientId === undefined) {
      // Explicitly clear patientId if provided as null/undefined
      updateData.patientId = null;
    }

    console.log("Final updateData:", updateData);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: convertTaskToTaskItem(updatedTask)
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update task",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(
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

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete task",
      },
      { status: 500 }
    );
  }
}
