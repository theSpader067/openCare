import type { ObservationItem } from "@/types/observations";

/**
 * Get all observations for a specific patient or all patients
 */
export async function getObservations(patientId?: number): Promise<{
  success: boolean;
  data?: ObservationItem[];
  error?: string;
}> {
  try {
    const url = new URL("/api/observations", window.location.origin);
    if (patientId) {
      url.searchParams.append("patientId", patientId.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching observations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch observations",
    };
  }
}

/**
 * Get a single observation by ID
 */
export async function getObservationById(observationId: number): Promise<{
  success: boolean;
  data?: ObservationItem;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/observations/${observationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching observation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch observation",
    };
  }
}

/**
 * Create a new observation
 */
export async function createObservation({
  patientId,
  text,
}: {
  patientId: number;
  text: string;
}): Promise<{
  success: boolean;
  data?: { id: number; timestamp: string; note: string };
  error?: string;
}> {
  try {
    const response = await fetch("/api/observations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientId, text }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating observation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create observation",
    };
  }
}

/**
 * Update an observation
 */
export async function updateObservation({
  observationId,
  text,
}: {
  observationId: number;
  text: string;
}): Promise<{
  success: boolean;
  data?: ObservationItem;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/observations/${observationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating observation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update observation",
    };
  }
}

/**
 * Delete an observation
 */
export async function deleteObservation(observationId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/observations/${observationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting observation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete observation",
    };
  }
}
