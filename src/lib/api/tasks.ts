import type { TaskItem } from "@/types/tasks";

/**
 * Create a new task
 */
export async function createTask({
  title,
  isPrivate = false,
  patientId,
  patientName,
  patientAge,
  patientHistory,
}: {
  title: string;
  isPrivate?: boolean;
  patientId?: string | number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
}): Promise<{ success: boolean; data?: TaskItem; error?: string }> {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, isPrivate, patientId, patientName, patientAge, patientHistory }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

/**
 * Get all tasks for the current user
 */
export async function getTasks(): Promise<{
  success: boolean;
  data?: TaskItem[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/tasks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    };
  }
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: number): Promise<{
  success: boolean;
  data?: TaskItem;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch task",
    };
  }
}

/**
 * Update a task
 */
export async function updateTask({
  taskId,
  title,
  isComplete,
  isPrivate,
  patientId,
  patientName,
  patientAge,
  patientHistory,
}: {
  taskId: number;
  title?: string;
  isComplete?: boolean;
  isPrivate?: boolean;
  patientId?: string | number | null;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
}): Promise<{ success: boolean; data?: TaskItem; error?: string }> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        isComplete,
        isPrivate,
        patientId,
        patientName,
        patientAge,
        patientHistory,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: number): Promise<{
  success: boolean;
  data?: TaskItem;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle task",
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}
