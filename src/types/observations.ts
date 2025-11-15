export interface ObservationItem {
  id: number;
  patientId: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObservationEntry {
  id: string;
  timestamp: string;
  note: string;
}

export interface CreateObservationRequest {
  patientId: number;
  text: string;
}

export interface UpdateObservationRequest {
  text: string;
}
