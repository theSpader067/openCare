import type { Patient } from "@/types/document";

export type Analyse = {
  id: string;
  patient: string;
  type: string;
  requestedAt: string;
  requestedDate: string;
  requester: string;
  status: "En cours" | "Terminée" | "Urgent";
  bilanCategory: "bilan" | "imagerie" | "anapath" | "autres";
  pendingTests?: Array<{
    id: string;
    label: string;
    value?: string;
  }>;
};

export type AnalyseDetail = {
  results: Array<{
    label: string;
    value: string;
    reference: string;
  }>;
  interpretation: string;
  historicalValues?: Array<{
    date: string;
    results: Array<{
      label: string;
      value: string;
    }>;
  }>;
};

export const REFERENCE_REQUEST_DATE = new Date("2024-03-13T12:00:00+01:00");

export const statusBadgeMap: Record<Analyse["status"], string> = {
  "En cours": "bg-sky-500/15 text-sky-700",
  Terminée: "bg-emerald-500/15 text-emerald-700",
  Urgent: "bg-rose-500/15 text-rose-700",
};

export const bilanTypeMap: Record<string, "bilan" | "imagerie" | "anapath"> = {
  // Bilans - Blood tests
  "Gaz du sang artériel": "bilan",
  "Bilan de coagulation": "bilan",
  "Groupage sanguin": "bilan",
  "Lactates sanguins": "bilan",
  "Dosage protéinurie": "bilan",
  "Fer sérique + Ferritine": "bilan",
  "Bilan hépatique": "bilan",
  "HbA1c": "bilan",
  "Bilan ionogramme": "bilan",
  "NFS": "bilan",
  "CRP": "bilan",
  "Dosage INR": "bilan",
  "Test allergologique": "bilan",
  "Bilan pré-chimiothérapie": "bilan",
  "Numération plaquettaire": "bilan",
  // Imagerie - Imaging
  "TDM TAP": "imagerie",
  "TDM abdominopelvien": "imagerie",
  "Rx thorax": "imagerie",
  "Échographie abdominale": "imagerie",
  "Radiographie": "imagerie",
  // Anapath - Anatomical pathology
  "Biopsie": "anapath",
  "Cytoponction": "anapath",
  "Analyse histologique": "anapath",
};

export const bilanCategoryBadgeMap: Record<"bilan" | "imagerie" | "anapath" | "autres", { label: string; color: string }> = {
  bilan: { label: "Bilan", color: "bg-violet-500/15 text-violet-700" },
  imagerie: { label: "Imagerie", color: "bg-blue-500/15 text-blue-700" },
  anapath: { label: "Anapath", color: "bg-pink-500/15 text-pink-700" },
  autres: { label: "Autres", color: "bg-slate-500/15 text-slate-700" },
};

// Bilan structure with categories and detailed items
export const bilanStructure = {
  categories: [
    {
      id: "crase",
      label: "Bilan de crase",
      items: ["Hémoglobine", "Hématocrite", "VGM", "TCMH", "CCMH", "GB", "Plaquettes"]
    },
    {
      id: "ionogramme-sanguin",
      label: "Ionogramme sanguin",
      items: ["Na+", "K+", "Cl-", "CO2", "Osmolalité", "Densité urinaire"]
    },
    {
      id: "ionogramme-urinaire",
      label: "Ionogramme urinaire",
      items: ["Urée urinaire", "Créatinine urinaire", "Sodium urinaire", "Potassium urinaire"]
    },
    {
      id: "bilan-infectieux",
      label: "Bilan infectieux standard",
      items: ["CRP", "PCT", "Fibrinogène", "Globulines", "VSH", "Leucocytes"]
    },
    {
      id: "fonction-renale",
      label: "Fonction rénale",
      items: ["Urée", "Créatinine"]
    },
    {
      id: "cholestase",
      label: "Cholestase",
      items: ["GGT", "PAL", "Bilirubine totale"]
    },
    {
      id: "cytolyse",
      label: "Cytolyse",
      items: ["GOT", "GPT"]
    },
    {
      id: "bilan-hepatique",
      label: "Bilan hépatique",
      items: ["ALAT", "ASAT", "GGT", "Phosphatase alcaline", "Bilirubine", "Albumine"]
    },
    {
      id: "bilan-renal",
      label: "Bilan rénal",
      items: ["Créatinine", "Urée", "Clearance créatinine", "Potassium", "Acide urique"]
    }
  ],
  allItems: [
    "CRP", "PCT", "NFS", "TP", "TCA", "INR", "Fibrinogène",
    "Créatinine", "Urée", "Na+", "K+", "Cl-", "Glucose", "Triglycérides",
    "Cholestérol", "ALAT", "ASAT", "GGT", "Bilirubine", "Bilirubine totale", "Albumine",
    "Hémoglobine", "Hématocrite", "VGM", "TCMH", "Plaquettes", "GB",
    "Acide urique", "Phosphate", "Magnésium", "Calcium", "Protéine totale",
    "PAL", "GOT", "GPT"
  ]
};

function deriveRequestedDate(label: string): string {
  const parts = label.split("·").map((part) => part.trim());
  const dayPart = (parts[0] ?? "").toLowerCase();
  const timePart = parts[1] ?? "";
  const base = new Date(REFERENCE_REQUEST_DATE.getTime());

  if (timePart) {
    const [hours, minutes] = timePart.split(":").map((value) => Number.parseInt(value, 10));
    base.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  } else {
    base.setHours(8, 0, 0, 0);
  }

  if (dayPart.includes("avant")) {
    base.setDate(base.getDate() - 2);
  } else if (dayPart.includes("hier")) {
    base.setDate(base.getDate() - 1);
  }

  return base.toISOString();
}

function withRequestedDate(data: Omit<Analyse, "requestedDate" | "bilanCategory">): Analyse {
  return {
    ...data,
    requestedDate: deriveRequestedDate(data.requestedAt),
    bilanCategory: bilanTypeMap[data.type] || "bilan",
  };
}

export const pendingSeed: Analyse[] = [
  withRequestedDate({
    id: "LAB-00093",
    patient: "Fatou Diop",
    type: "Gaz du sang artériel",
    requestedAt: "Aujourd'hui · 08:45",
    requester: "Dr. Dupont",
    status: "Urgent",
    pendingTests: [
      { id: "test-1", label: "pH" },
      { id: "test-2", label: "pO2" },
      { id: "test-3", label: "pCO2" },
      { id: "test-4", label: "HCO3-" },
    ],
  }),
  withRequestedDate({
    id: "LAB-00094",
    patient: "Louis Martin",
    type: "Bilan de coagulation",
    requestedAt: "Aujourd'hui · 09:05",
    requester: "Dr. Lambert",
    status: "En cours",
    pendingTests: [
      { id: "test-5", label: "TP/INR" },
      { id: "test-6", label: "TCA" },
      { id: "test-7", label: "Fibrinogène" },
    ],
  }),
  withRequestedDate({
    id: "LAB-00095",
    patient: "Maria Alvarez",
    type: "Groupage sanguin",
    requestedAt: "Aujourd'hui · 07:25",
    requester: "Bloc opératoire",
    status: "En cours",
    pendingTests: [
      { id: "test-8", label: "Groupe ABO" },
      { id: "test-9", label: "Rhésus D" },
      { id: "test-10", label: "Anticorps irréguliers" },
    ],
  }),
  withRequestedDate({
    id: "LAB-00096",
    patient: "Jules Bernard",
    type: "Lactates sanguins",
    requestedAt: "Aujourd'hui · 09:40",
    requester: "Réanimation",
    status: "Urgent",
    pendingTests: [
      { id: "test-11", label: "Lactate" },
      { id: "test-12", label: "Pyruvate" },
    ],
  }),
  withRequestedDate({
    id: "LAB-00097",
    patient: "Awa Ndiaye",
    type: "Dosage protéinurie",
    requestedAt: "Aujourd'hui · 06:55",
    requester: "Maternité",
    status: "En cours",
    pendingTests: [
      { id: "test-13", label: "Protéinurie 24h" },
      { id: "test-14", label: "Créatinine urinaire" },
      { id: "test-15", label: "Rapport protéines/créatinine" },
    ],
  }),
  withRequestedDate({
    id: "LAB-00098",
    patient: "Inès Boucher",
    type: "Fer sérique + Ferritine",
    requestedAt: "Hier · 23:15",
    requester: "Médecine interne",
    status: "En cours",
    pendingTests: [
      { id: "test-16", label: "Fer sérique" },
      { id: "test-17", label: "Ferritine" },
      { id: "test-18", label: "Transferrine" },
      { id: "test-19", label: "Coefficient de saturation" },
    ],
  }),
];

export const completedSeed: Analyse[] = [
  withRequestedDate({
    id: "LAB-00092",
    patient: "Thierry Morel",
    type: "Bilan hépatique",
    requestedAt: "Aujourd'hui · 07:55",
    requester: "Chirurgie thoracique",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00091",
    patient: "Nora Haddad",
    type: "HbA1c",
    requestedAt: "Aujourd'hui · 07:20",
    requester: "Endocrinologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00090",
    patient: "Ousmane Faye",
    type: "Bilan ionogramme",
    requestedAt: "Aujourd'hui · 06:40",
    requester: "Néphrologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00089",
    patient: "Sophie Laurent",
    type: "Test allergologique",
    requestedAt: "Aujourd'hui · 05:55",
    requester: "Pneumologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00088",
    patient: "Claire Dubois",
    type: "Bilan pré-chimiothérapie",
    requestedAt: "Hier · 21:10",
    requester: "Oncologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00087",
    patient: "Awa Ndiaye",
    type: "Numération plaquettaire",
    requestedAt: "Hier · 19:25",
    requester: "Maternité",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00086",
    patient: "Fatou Diop",
    type: "CRP",
    requestedAt: "Hier · 17:15",
    requester: "Chirurgie digestive",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00085",
    patient: "Louis Martin",
    type: "Dosage INR",
    requestedAt: "Hier · 16:05",
    requester: "Cardiologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00084",
    patient: "Maria Alvarez",
    type: "Bilan pré-opératoire",
    requestedAt: "Hier · 15:40",
    requester: "Orthopédie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00083",
    patient: "Inès Boucher",
    type: "Bilan martial",
    requestedAt: "Hier · 14:10",
    requester: "Médecine interne",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00082",
    patient: "Jules Bernard",
    type: "Bilan toxico",
    requestedAt: "Hier · 12:20",
    requester: "Urgences",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00081",
    patient: "Claire N'Guessan",
    type: "Troponines",
    requestedAt: "Hier · 11:35",
    requester: "Dr. Pereira",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00074",
    patient: "Jules Bernard",
    type: "PCR virale",
    requestedAt: "Hier · 15:20",
    requester: "Urgences",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00071",
    patient: "Claire N'Guessan",
    type: "Bilan pré-opératoire",
    requestedAt: "Hier · 09:10",
    requester: "Dr. Pereira",
    status: "Terminée",
  }),
];

export const analyseDetails: Record<string, AnalyseDetail> = {
  "LAB-00092": {
    results: [
      { label: "ASAT", value: "32 U/L", reference: "15 – 37" },
      { label: "ALAT", value: "28 U/L", reference: "12 – 45" },
      { label: "Bilirubine totale", value: "11 µmol/L", reference: "< 21" },
    ],
    interpretation:
      "Bilan hépatique dans les valeurs usuelles. Poursuivre la surveillance post-opératoire quotidienne.",
    historicalValues: [
      {
        date: "2024-03-10T14:30:00+01:00",
        results: [
          { label: "ASAT", value: "38 U/L" },
          { label: "ALAT", value: "35 U/L" },
          { label: "Bilirubine totale", value: "15 µmol/L" },
        ],
      },
      {
        date: "2024-03-07T09:15:00+01:00",
        results: [
          { label: "ASAT", value: "52 U/L" },
          { label: "ALAT", value: "48 U/L" },
          { label: "Bilirubine totale", value: "18 µmol/L" },
        ],
      },
    ],
  },
  "LAB-00091": {
    results: [
      { label: "HbA1c", value: "7,8 %", reference: "< 7 %" },
      { label: "Glycémie à jeun", value: "1,20 g/L", reference: "0,70 – 1,00" },
    ],
    interpretation:
      "Equilibre glycémique insuffisant. Proposer un ajustement thérapeutique et renforcer l'éducation diététique.",
    historicalValues: [
      {
        date: "2024-02-13T10:00:00+01:00",
        results: [
          { label: "HbA1c", value: "8,2 %" },
          { label: "Glycémie à jeun", value: "1,35 g/L" },
        ],
      },
      {
        date: "2024-01-10T10:00:00+01:00",
        results: [
          { label: "HbA1c", value: "8,5 %" },
          { label: "Glycémie à jeun", value: "1,42 g/L" },
        ],
      },
    ],
  },
  "LAB-00090": {
    results: [
      { label: "Na+", value: "134 mmol/L", reference: "135 – 145" },
      { label: "K+", value: "4,9 mmol/L", reference: "3,5 – 5,0" },
      { label: "Cl-", value: "99 mmol/L", reference: "98 – 107" },
    ],
    interpretation:
      "Ionogramme compatible avec une légère hyponatrémie. Adapter le protocole de dialyse de ce soir.",
  },
  "LAB-00089": {
    results: [
      { label: "IgE spécifiques", value: "Elevées", reference: "< 0,7 kUA/L" },
      { label: "Test cutané", value: "Positif aux graminées", reference: "Négatif" },
    ],
    interpretation:
      "Allergie saisonnière confirmée. Mettre à jour le plan de traitement inhalé et prévoir désensibilisation.",
  },
  "LAB-00088": {
    results: [
      { label: "Hb", value: "11,4 g/dL", reference: "12 – 16" },
      { label: "GB", value: "6,2 G/L", reference: "4 – 10" },
      { label: "Plaquettes", value: "180 G/L", reference: "150 – 400" },
    ],
    interpretation:
      "Paramètres acceptables pour la poursuite de la chimiothérapie. Recommander supplémentation en fer.",
  },
  "LAB-00087": {
    results: [
      { label: "Plaquettes", value: "165 G/L", reference: "150 – 400" },
      { label: "Hb", value: "12,2 g/dL", reference: "11 – 15" },
    ],
    interpretation:
      "Tendance plaquettaire à surveiller chaque 48h. Aucun signe d'HELLP.",
  },
  "LAB-00086": {
    results: [
      { label: "CRP", value: "18 mg/L", reference: "< 5" },
      { label: "Leucocytes", value: "12,4 G/L", reference: "4 – 10" },
    ],
    interpretation:
      "Inflammation modérée persistante. Poursuivre l'antibiothérapie et contrôle CRP à J+2.",
  },
  "LAB-00085": {
    results: [
      { label: "INR", value: "3,2", reference: "2,0 – 3,0" },
      { label: "TP", value: "45 %", reference: "70 – 100" },
    ],
    interpretation:
      "Anticoagulation supra-thérapeutique. Discuter ajustement des doses de warfarine.",
  },
  "LAB-00084": {
    results: [
      { label: "Hémoglobine", value: "12,9 g/dL", reference: "12 – 16" },
      { label: "Plaquettes", value: "210 G/L", reference: "150 – 400" },
      { label: "INR", value: "1,1", reference: "0,9 – 1,1" },
    ],
    interpretation:
      "Bilan pré-op correct. Feu vert pour bloc opératoire lundi matin.",
  },
  "LAB-00083": {
    results: [
      { label: "Fer", value: "28 µmol/L", reference: "10 – 30" },
      { label: "Ferritine", value: "120 µg/L", reference: "15 – 150" },
    ],
    interpretation:
      "Réserves martiales satisfaisantes après perfusion. Prévoir contrôle dans 4 semaines.",
  },
  "LAB-00082": {
    results: [
      { label: "Ethanol", value: "Négatif", reference: "Négatif" },
      { label: "Opiacés", value: "Négatif", reference: "Négatif" },
      { label: "Benzodiazépines", value: "Présence", reference: "Négatif" },
    ],
    interpretation:
      "Usage ponctuel de benzodiazépines. Consigner dans le dossier et informer le médecin traitant.",
  },
  "LAB-00081": {
    results: [
      { label: "Troponine", value: "48 ng/L", reference: "< 14" },
      { label: "CK-MB", value: "22 U/L", reference: "< 25" },
    ],
    interpretation:
      "Biomarqueurs compatibles avec syndrome coronarien aigu. Patient admis en USIC.",
  },
  "LAB-00074": {
    results: [
      { label: "PCR SARS-CoV-2", value: "Négatif", reference: "Négatif" },
    ],
    interpretation:
      "Absence d'infection virale détectée. Lever les mesures d'isolement spécifiques.",
  },
  "LAB-00071": {
    results: [
      { label: "Créatinine", value: "82 µmol/L", reference: "60 – 110" },
      { label: "Glycémie", value: "0,96 g/L", reference: "0,7 – 1,0" },
    ],
    interpretation:
      "Paramètres stables. Prochain contrôle pré-op programmé demain matin.",
  },
};

// Mock patient data for analyses
export const mockPatientsAnalyses: Patient[] = [
  { id: "P-001", fullName: "Fatou Diop", histoire: "Patiente hospitalisée pour obésité morbide." },
  { id: "P-002", fullName: "Louis Martin", histoire: "Patient suivi pour diabète type 2." },
  { id: "P-003", fullName: "Maria Alvarez", histoire: "Patiente en suivi cardiaque régulier." },
  { id: "P-004", fullName: "Jules Bernard", histoire: "Patient en réanimation, critères SOFA élevés." },
  { id: "P-005", fullName: "Awa Ndiaye", histoire: "Patiente enceinte, suivi régulier." },
  { id: "P-006", fullName: "Inès Boucher", histoire: "Patiente avec anémie ferriprive." },
];
