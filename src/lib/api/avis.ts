export interface AvisCreatePayload {
  answer_date: string;
  patientId?: number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  destination_specialty: string;
  opinion: string;
}

export interface AvisResponse {
  id: number;
  destination_specialty?: string;
  answer_date?: string;
  patientId?: number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  details?: string;
  answer?: string;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    fullName: string;
  };
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    specialty?: string;
  };
}

export async function createAvis(data: AvisCreatePayload): Promise<AvisResponse> {
  const response = await fetch("/api/avis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create avis");
  }

  const result = await response.json();
  return result.data;
}

export async function fetchAvis(): Promise<AvisResponse[]> {
  const response = await fetch("/api/avis");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch avis");
  }

  const result = await response.json();
  return result.data;
}

export async function updateAvisAnswer(avisId: number, answer: string): Promise<AvisResponse> {
  const response = await fetch("/api/avis", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      avisId,
      answer,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update avis answer");
  }

  const result = await response.json();
  return result.data;
}
