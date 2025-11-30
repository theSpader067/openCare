import type { Patient } from "@/types/document";

/**
 * Create a new patient with optional initial observation
 */
export async function createPatient({
  pid,
  fullName,
  birthdate,
  histoire,
  service,
  diagnostic,
  cim,
  motif,
  atcdsMedical,
  atcdsChirurgical,
  atcdsExtra,
  atcdsGynObstetrique,
  atcdsFamiliaux,
  addressOrigin,
  addressHabitat,
  couvertureSociale,
  situationFamiliale,
  profession,
  status,
  nextContact,
  isPrivate,
  initialObservation,
}: {
  pid:string,
  fullName: string;
  birthdate?: string;
  histoire?: string;
  service?: string;
  diagnostic?: string;
  cim?: string;
  motif?: string;
  atcdsMedical?:string,
  atcdsChirurgical?: string;
  atcdsExtra?: string;
  atcdsGynObstetrique?: string;
  atcdsFamiliaux?: string;
  addressOrigin?: string;
  addressHabitat?: string;
  couvertureSociale?: string;
  situationFamiliale?: string;
  profession?: string;
  status?: string;
  nextContact?: string;
  isPrivate?: String;
  initialObservation?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pid,
        fullName,
        birthdate,
        histoire,
        service,
        diagnostic,
        cim,
        motif,
        atcdsMedical,
        atcdsChirurgical,
        atcdsExtra,
        atcdsGynObstetrique,
        atcdsFamiliaux,
        addressOrigin,
        addressHabitat,
        couvertureSociale,
        situationFamiliale,
        profession,
        status,
        nextContact,
        isPrivate,
        initialObservation,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create patient",
    };
  }
}

/**
 * Get all patients for current user
 */
export async function getPatients(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/patients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch patients",
    };
  }
}

/**
 * Get a single patient by pid
 */
export async function getPatientByPid(patientId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/patients/${patientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log('PATIENT@@@@@@@@@')
    console.log(result)
    return result;
  } catch (error) {
    console.error("Error fetching patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch patient",
    };
  }
}

/**
 * Update an existing patient
 */
export async function updatePatient(
  patientId: number,
  {
    fullName,
    pid,
    birthdate,
    service,
    diagnostic,
    cim,
    motif,
    atcdsMedical,
    atcdsChirurgical,
    atcdsExtra,
    atcdsGynObstetrique,
    atcdsFamiliaux,
    addressOrigin,
    addressHabitat,
    couvertureSociale,
    situationFamiliale,
    profession,
    status,
    nextContact,
    isPrivate,
  }: {
    fullName?: string;
    pid?:string,
    birthdate?: string;
    service?: string;
    diagnostic?: string;
    cim?: string;
    motif?: string;
    atcdsMedical?: string;
    atcdsChirurgical?: string;
    atcdsExtra?: string;
    atcdsGynObstetrique?: string;
    atcdsFamiliaux?: string;
    addressOrigin?: string;
    addressHabitat?: string;
    couvertureSociale?: string;
    situationFamiliale?: string;
    profession?: string;
    status?: string;
    nextContact?: string;
    isPrivate?: string | boolean;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`/api/patients/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        pid,
        birthdate,
        service,
        diagnostic,
        cim,
        motif,
        atcdsMedical,
        atcdsChirurgical,
        atcdsExtra,
        atcdsGynObstetrique,
        atcdsFamiliaux,
        addressOrigin,
        addressHabitat,
        couvertureSociale,
        situationFamiliale,
        profession,
        status,
        nextContact,
        isPrivate,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update patient",
    };
  }
}

/**
 * Delete a patient by ID
 */
export async function deletePatient(patientId: number): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/patients/${patientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete patient",
    };
  }
}

/**
 * Save an observation for a patient
 */
export async function saveObservation(
  patientId: number,
  text: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch("/api/observations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId,
        text,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving observation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save observation",
    };
  }
}
