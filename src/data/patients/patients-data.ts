export type PatientStatus = "Hospitalisé" | "Consultation" | "Suivi";
export type PatientType = "privé" | "équipe";

export type HistoryGroup = {
  label: string;
  values: string[];
};

export type ObservationEntry = {
  id: string;
  timestamp: string;
  note: string;
};

export type Patient = {
  id: string;
  pid: string,
  name: string;
  birthDate: string;
  age: number | undefined;
  service: string;
  status: PatientStatus;
  nextVisit: string;
  type: PatientType;
  diagnosis: {
    code: string;
    label: string;
  };
  histories: {
    medical: string[];
    surgical: string[];
    other: String[];
  };
  observations: ObservationEntry[];
  motif?: string;
  atcdsGynObstetrique?: string;
  atcdsFamiliaux?: string;
  addressOrigin?: string;
  addressHabitat?: string;
  couvertureSociale?: string;
  situationFamiliale?: string;
  profession?: string;
};
