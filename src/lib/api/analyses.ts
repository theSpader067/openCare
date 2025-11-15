export interface CreateAnalyseData {
  category: "bilan" | "imagerie" | "anapath" | "autres";
  title?: string;
  patientId?: number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  details?: string;
  comment?: string;
  selectedBilans?: string[];
  customBilans?: string;
}

export interface AnalyseResponse {
  id: number;
  labId: string;
  category: string;
  title: string;
  patientId: number | null;
  patientName: string | null;
  patientAge: string | null;
  patientHistory: string | null;
  details: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    fullName: string;
  };
  labEntries?: Array<{
    id: number;
    name: string | null;
    value: string | null;
    interpretation: string | null;
  }>;
}

export async function createAnalyse(
  data: CreateAnalyseData
): Promise<AnalyseResponse> {
  const response = await fetch("/api/analyses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create analyse");
  }

  const result = await response.json();
  return result.data;
}

export async function fetchAnalyses(): Promise<AnalyseResponse[]> {
  const response = await fetch("/api/analyses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch analyses");
  }

  const result = await response.json();
  console.log('RESULTS||||||||||||||||||||||-')
  console.log(result)
  return result.data;
}
