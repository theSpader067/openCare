export type Operator = {
  id: string;
  name: string;
  role: string;
};

export type Patient = {
  id: string;
  fullName: string;
  age?: number;
  histoire?: string;
};

export type CompteRendu = {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  operators: Operator[];
  participants?: Operator[];
  details: string;
  postNotes: string;
  patient?: Patient;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

/**
 * Create a new compte-rendu (rapport opératoire)
 * Either patientId OR patientName must be provided
 */
export async function createCompteRendu({
  title,
  type,
  date,
  duration,
  patientId,
  patientName,
  patientAge,
  patientHistory,
  details,
  postNotes,
  operatorIds = [],
  participantIds = [],
}: {
  title: string;
  type: string;
  date: string;
  duration: number | string;
  patientId?: number | string;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  details: string;
  postNotes: string;
  operatorIds?: (number | string)[];
  participantIds?: (number | string)[];
}): Promise<{ success: boolean; data?: CompteRendu; error?: string }> {
  try {
    const response = await fetch("/api/comptes-rendus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        type,
        date,
        duration,
        patientId,
        patientName,
        patientAge,
        patientHistory,
        details,
        postNotes,
        operatorIds,
        participantIds,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating compte-rendu:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create compte-rendu",
    };
  }
}

/**
 * Get all compte-rendus for the current user
 */
export async function getComptesRendus(): Promise<{
  success: boolean;
  data?: CompteRendu[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/comptes-rendus", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching compte-rendus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch compte-rendus",
    };
  }
}

/**
 * Delete a compte-rendu by ID
 */
export async function deleteCompteRendu(
  rapportId: number | string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/comptes-rendus/${rapportId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting compte-rendu:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete compte-rendu",
    };
  }
}
