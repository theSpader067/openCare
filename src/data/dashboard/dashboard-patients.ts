export interface PatientItem {
  id: string;
  pid?: string;
  name: string;
  service: string;
  diagnosis: string;
  status: "Pré-op" | "Post-op" | "Surveillance" | "Rééducation";
  labs: {
    status: "pending" | "completed" | "na";
    note: string;
  };
}

export interface SimplePatient {
  id: string;
  name: string;
}

// Mock patient names for quick selection
export const mockPatients: SimplePatient[] = [
  { id: "PAT-001", name: "Fatou Diop" },
  { id: "PAT-002", name: "Jean Dupont" },
  { id: "PAT-003", name: "Marie Martin" },
  { id: "PAT-004", name: "Louis Mercier" },
  { id: "PAT-005", name: "Amina Sow" },
  { id: "PAT-006", name: "Pierre Leclerc" },
  { id: "PAT-007", name: "Sophie Renard" },
  { id: "PAT-008", name: "Ahmed Hassan" },
];

// Initial service patients data
export const initialServicePatients: PatientItem[] = [
  {
    id: "PAT-01",
    name: "Fatou Diop",
    service: "Chirurgie digestive",
    diagnosis: "Colectomie laparoscopique · J+7",
    status: "Post-op",
    labs: { status: "completed", note: "CRP 12 mg/L (stable)" },
  },
  {
    id: "PAT-02",
    name: "Louis Martin",
    service: "Chirurgie cardiaque",
    diagnosis: "Pontage coronarien planifié",
    status: "Pré-op",
    labs: { status: "pending", note: "Bilan coagulation 11h00" },
  },
  {
    id: "PAT-03",
    name: "Maria Alvarez",
    service: "Orthopédie",
    diagnosis: "Prothèse hanche droite · J+2",
    status: "Surveillance",
    labs: { status: "completed", note: "Hb 11.2 g/dL" },
  },
  {
    id: "PAT-04",
    name: "Jules Bernard",
    service: "Réanimation",
    diagnosis: "Traumatisme crânien · suivi neurologique",
    status: "Rééducation",
    labs: { status: "na", note: "Suivi kinésithérapie" },
  },
  {
    id: "PAT-05",
    name: "Sarah Lemoine",
    service: "Anesthésie",
    diagnosis: "Évaluation pré-anesthésie – cholécystectomie",
    status: "Pré-op",
    labs: { status: "pending", note: "Bilan coagulation 14h" },
  },
  {
    id: "PAT-06",
    name: "Moussa Diallo",
    service: "Hôpital de jour",
    diagnosis: "Préparation hospitalisation à domicile",
    status: "Surveillance",
    labs: { status: "completed", note: "Glycémie 1.02 g/L" },
  },
  {
    id: "PAT-07",
    name: "Nora Petit",
    service: "Chirurgie digestive",
    diagnosis: "Révision cicatrice · J+5",
    status: "Post-op",
    labs: { status: "na", note: "Contrôle clinique uniquement" },
  },
];
