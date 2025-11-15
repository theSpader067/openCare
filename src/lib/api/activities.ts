import type { ActivityItem } from "@/types/tasks";

/**
 * Create a new activity
 */
export async function createActivity({
  title,
  type,
  description,
  time,
  location,
  activityDay,
  team,
}: {
  title: string;
  type: string;
  description?: string;
  time?: string;
  location?: string;
  activityDay?: Date;
  team?: string;
}): Promise<{ success: boolean; data?: ActivityItem; error?: string }> {
  try {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, type, description, time, location, activityDay, team }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create activity",
    };
  }
}

/**
 * Get all activities
 */
export async function getActivities(): Promise<{
  success: boolean;
  data?: ActivityItem[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/activities", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch activities",
    };
  }
}

/**
 * Get a single activity by ID
 */
export async function getActivityById(activityId: number): Promise<{
  success: boolean;
  data?: ActivityItem;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/activities/${activityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch activity",
    };
  }
}

/**
 * Update an activity
 */
export async function updateActivity({
  activityId,
  title,
  type,
  description,
  time,
  location,
  activityDay,
  team,
}: {
  activityId: number;
  title?: string;
  type?: string;
  description?: string;
  time?: string;
  location?: string;
  activityDay?: Date;
  team?: string;
}): Promise<{ success: boolean; data?: ActivityItem; error?: string }> {
  try {
    const response = await fetch(`/api/activities/${activityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, type, description, time, location, activityDay, team }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update activity",
    };
  }
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/activities/${activityId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete activity",
    };
  }
}
