type Ordonnance = {
  id: string;
  title: string;
  date: string | null;
  createdAt: string;
  updatedAt: string;
  patientId?: number;
  patient?: any;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  clinicalInfo?: string;
  prescriptionDetails?: string;
  isPrivate?: boolean;
  createdBy?: string;
};

/**
 * Create a new ordonnance
 */
export async function createOrdonnance({
  title,
  date,
  patientId,
  patientName,
  patientAge,
  patientHistory,
  clinicalInfo,
  prescriptionDetails,
  isPrivate = false,
}: {
  title: string;
  date?: string;
  patientId?: string | number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  clinicalInfo: string;
  prescriptionDetails: string;
  isPrivate?: boolean;
}): Promise<{ success: boolean; data?: Ordonnance; error?: string }> {
  try {
    const response = await fetch("/api/ordonnances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        date,
        patientId,
        patientName,
        patientAge,
        patientHistory,
        clinicalInfo,
        prescriptionDetails,
        isPrivate,
      }),
    });

    const result = await response.json();
    console.log('ORDONNACE @@@@@@@@@@@@@@@@@')
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error creating ordonnance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create ordonnance",
    };
  }
}

/**
 * Get all ordonnances for the current user
 */
export async function getOrdonnances(): Promise<{
  success: boolean;
  data?: Ordonnance[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/ordonnances", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching ordonnances:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch ordonnances",
    };
  }
}

/**
 * Get a single ordonnance by ID
 */
export async function getOrdonnanceById(ordonnanceId: number | string): Promise<{
  success: boolean;
  data?: Ordonnance;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/ordonnances/${ordonnanceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching ordonnance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch ordonnance",
    };
  }
}

/**
 * Update an ordonnance
 */
export async function updateOrdonnance({
  ordonnanceId,
  title,
  date,
  patientId,
  patientName,
  patientAge,
  patientHistory,
  clinicalInfo,
  prescriptionDetails,
  isPrivate,
}: {
  ordonnanceId: number | string;
  title?: string;
  date?: string;
  patientId?: string | number | null;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  clinicalInfo?: string;
  prescriptionDetails?: string;
  isPrivate?: boolean;
}): Promise<{ success: boolean; data?: Ordonnance; error?: string }> {
  try {
    const response = await fetch(`/api/ordonnances/${ordonnanceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        date,
        patientId,
        patientName,
        patientAge,
        patientHistory,
        clinicalInfo,
        prescriptionDetails,
        isPrivate,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating ordonnance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ordonnance",
    };
  }
}

/**
 * Delete an ordonnance
 */
export async function deleteOrdonnance(ordonnanceId: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/ordonnances/${ordonnanceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting ordonnance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete ordonnance",
    };
  }
}
