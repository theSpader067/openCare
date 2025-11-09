import type { Patient } from "@/types/document";

export type Operation = {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  operators: Operator[];
  details: string;
  postNotes: string;
  patient?: Patient;
  createdAt: string;
  createdBy: string;
};

export type Operator = {
  id: string;
  name: string;
  role: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
};

export const operationTypes = [
  "Chirurgie générale",
  "Chirurgie digestive",
  "Chirurgie vasculaire",
  "Urologie",
  "Orthopédie",
  "Cardiologie interventionnelle",
  "Neurochirurgie",
  "Chirurgie thoracique",
];

export const teamMembers: TeamMember[] = [
  { id: "TM1", name: "Dr. Marie Dupont", role: "Chirurgien" },
  { id: "TM2", name: "Dr. Jean Martin", role: "Chirurgien" },
  { id: "TM3", name: "IDE Sarah Laurent", role: "Infirmière" },
  { id: "TM4", name: "IDE Claire Moreau", role: "Infirmière" },
  { id: "TM5", name: "Dr. Pierre Lefebvre", role: "Anesthésiste" },
  { id: "TM6", name: "IDE Marc Bertrand", role: "Infirmier" },
];

export const mockPatients: Patient[] = [
  {
    id: "P-001",
    fullName: "Awa Ndiaye",
    histoire: "Patiente hospitalisée pour obésité morbide. Antécédents de diabète type 2. Allergie à la pénicilline.",
  },
  {
    id: "P-002",
    fullName: "Lamia Saïd",
    histoire: "Patiente suivie pour cholangiocarcinome. Chimiothérapie FOLFIRINOX en cours. Bonne tolérance générale.",
  },
  {
    id: "P-003",
    fullName: "Mamadou Carter",
    histoire: "Patient présentant des métastases osseuses. Suivi en oncologie. Performance status ECOG 1.",
  },
];

export const mockOperations: Operation[] = [
  {
    id: "OP-001",
    title: "Cholécystectomie laparoscopique",
    type: "Chirurgie digestive",
    date: "2024-03-15",
    duration: 120,
    operators: [
      { id: "TM1", name: "Dr. Marie Dupont", role: "Chirurgien" },
      { id: "TM3", name: "IDE Sarah Laurent", role: "Infirmière" },
    ],
    patient: mockPatients[0],
    details:
      "Cholécystectomie laparoscopique. Intervention sans incident. Patient stable tout au long de la procédure. Hémostase complète. Sutures réalisées sans complication.",
    postNotes:
      "1. Antibiothérapie prophylactique : Cefazolin 1g × 3/jour pendant 24h\n2. Analgésie : Paracétamol 1g × 4/jour + Tramadol 100mg si besoin\n3. Mobilisation progressive à partir du jour 1\n4. Drain abdominal à surveiller, retrait prévu J2 si débit < 20ml/24h\n5. Suivi cicatriciel et ablation des fils J7",
    createdAt: "2024-03-15T14:30:00",
    createdBy: "Dr. Marie Dupont",
  },
  {
    id: "OP-002",
    title: "Bypass fémoro-poplité",
    type: "Chirurgie vasculaire",
    date: "2024-03-14",
    duration: 180,
    operators: [
      { id: "TM2", name: "Dr. Jean Martin", role: "Chirurgien" },
      { id: "TM5", name: "Dr. Pierre Lefebvre", role: "Anesthésiste" },
      { id: "TM4", name: "IDE Claire Moreau", role: "Infirmière" },
    ],
    patient: mockPatients[1],
    details:
      "Bypass fémoro-poplité. Sutures vasculaires réalisées avec succès. Hémostase complète. Patient stable en post-opératoire.",
    postNotes:
      "1. Surveillance vasculaire : pouls distaux et perfusion à J0, J1, J3\n2. Antithrombose : Héparine HBPM 0.4ml/jour pendant 7 jours\n3. Anti-agrégant : Aspirine 75mg/jour à débuter J1\n4. Compression progressive du membre opéré (classe II)\n5. Rééducation vasculaire et mobilisation active J1\n6. Écho-doppler de contrôle à J3 ou J4",
    createdAt: "2024-03-14T11:00:00",
    createdBy: "Dr. Jean Martin",
  },
  {
    id: "OP-003",
    title: "Hernioplastie inguinale unilatérale",
    type: "Chirurgie générale",
    date: "2024-03-13",
    duration: 90,
    operators: [
      { id: "TM1", name: "Dr. Marie Dupont", role: "Chirurgien" },
      { id: "TM6", name: "IDE Marc Bertrand", role: "Infirmier" },
    ],
    patient: mockPatients[2],
    details:
      "Hernioplastie inguinale unilatérale. Pose de prothèse sans complication. Intervention classique, patient en bon état.",
    postNotes:
      "1. Analgésie : Paracétamol 1g × 4/jour + AINS (Ibuprofène) si douleur\n2. Repos relatif 3-4 semaines, pas d'effort physique\n3. Portage suspensoir pendant 2 semaines\n4. Douche autorisée J3, bain déconseillé J7\n5. Ablation des points J10-12\n6. Travail de bureau repris J10, activité physique J21",
    createdAt: "2024-03-13T09:15:00",
    createdBy: "Dr. Marie Dupont",
  },
];
