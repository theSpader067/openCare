export type RiskLevel = "Élevé" | "Modéré" | "Standard";
export type PatientStatus = "Hospitalisé" | "Consultation" | "Suivi";

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
  name: string;
  birthDate: string;
  age: number;
  service: string;
  status: PatientStatus;
  nextVisit: string;
  riskLevel: RiskLevel;
  diagnosis: {
    code: string;
    label: string;
  };
  histories: {
    medical: string[];
    surgical: string[];
    other: HistoryGroup[];
  };
  observations: ObservationEntry[];
  instructions: string[];
};

export const patientsSeed: Patient[] = [
  {
    id: "P-2024-001",
    name: "Fatou Diop",
    birthDate: "1972-03-14",
    age: 52,
    service: "Chirurgie digestive",
    status: "Hospitalisé",
    nextVisit: "Tournée 14h",
    riskLevel: "Élevé",
    diagnosis: {
      code: "K57.3",
      label: "Diverticulite du côlon sans perforation",
    },
    histories: {
      medical: ["Hypertension artérielle", "Diabète de type 2"],
      surgical: ["Appendicectomie (2002)"],
      other: [
        { label: "Allergies", values: ["Aucune connue"] },
        { label: "Médicaments", values: ["IEC 5 mg/jour"] },
      ],
    },
    observations: [
      {
        id: "P-2024-001-obs-1",
        timestamp: "2024-03-12T09:15:00Z",
        note: "Douleurs abdominales modérées, bilan inflammatoire en cours.",
      },
      {
        id: "P-2024-001-obs-2",
        timestamp: "2024-03-12T14:50:00Z",
        note: "Bonne mobilisation post-op mais fatigue en fin de journée.",
      },
    ],
    instructions: [
      "Surveiller la température toutes les 4h",
      "Introduire réalimentation progressive selon protocole",
    ],
  },
  {
    id: "P-2024-002",
    name: "Louis Martin",
    birthDate: "1957-11-08",
    age: 67,
    service: "Cardiologie",
    status: "Suivi",
    nextVisit: "Consultation 15h30",
    riskLevel: "Modéré",
    diagnosis: {
      code: "I50.9",
      label: "Insuffisance cardiaque congestive",
    },
    histories: {
      medical: ["Fibrillation auriculaire", "HTA"],
      surgical: ["Pontage coronarien (2015)"],
      other: [
        { label: "Médicaments", values: ["Warfarine", "Bêtabloquant"] },
        { label: "Allergies", values: ["Contraste iodé"] },
      ],
    },
    observations: [
      {
        id: "P-2024-002-obs-1",
        timestamp: "2024-03-11T08:30:00Z",
        note: "Dyspnée d'effort modérée, poids stable. INR à surveiller.",
      },
      {
        id: "P-2024-002-obs-2",
        timestamp: "2024-03-11T12:10:00Z",
        note: "Tension bien contrôlée sous traitement actuel.",
      },
    ],
    instructions: [
      "Vérifier INR jeudi matin",
      "Programmer éducation thérapeutique anticoagulants",
    ],
  },
  {
    id: "P-2024-003",
    name: "Maria Alvarez",
    birthDate: "1983-05-21",
    age: 41,
    service: "Orthopédie",
    status: "Consultation",
    nextVisit: "Pré-op 11h45",
    riskLevel: "Standard",
    diagnosis: {
      code: "M16.0",
      label: "Coxarthrose bilatérale",
    },
    histories: {
      medical: ["Hypothyroïdie"],
      surgical: ["Arthroscopie genou gauche (2019)"],
      other: [
        { label: "Médicaments", values: ["Lévothyroxine"] },
        { label: "Allergies", values: ["Latex"] },
      ],
    },
    observations: [
      {
        id: "P-2024-003-obs-1",
        timestamp: "2024-03-10T09:20:00Z",
        note: "Douleurs bien contrôlées, préparation pré-opératoire complète.",
      },
      {
        id: "P-2024-003-obs-2",
        timestamp: "2024-03-10T16:45:00Z",
        note: "Prévoir adaptation du domicile post-prothèse.",
      },
    ],
    instructions: [
      "Confirmer disponibilité du matériel de rééducation",
      "Programmer évaluation kiné à J+7",
    ],
  },
  {
    id: "P-2024-004",
    name: "Jules Bernard",
    birthDate: "1996-01-04",
    age: 28,
    service: "Urgences",
    status: "Hospitalisé",
    nextVisit: "Contrôle hémostase 18h",
    riskLevel: "Élevé",
    diagnosis: {
      code: "S06.5",
      label: "Traumatisme crânien avec hémorragie intracrânienne",
    },
    histories: {
      medical: ["Asthme intermittent"],
      surgical: [],
      other: [
        { label: "Allergies", values: ["AINS"] },
        { label: "Médicaments", values: ["Salbutamol inhalé"] },
      ],
    },
    observations: [
      {
        id: "P-2024-004-obs-1",
        timestamp: "2024-03-13T07:50:00Z",
        note: "Surveillance neuro stable, scanner de contrôle à programmer.",
      },
      {
        id: "P-2024-004-obs-2",
        timestamp: "2024-03-13T11:35:00Z",
        note: "Présence de céphalées persistantes, efficacité antalgique correcte.",
      },
    ],
    instructions: [
      "Neuro check toutes les 2h",
      "Programmer scanner de contrôle demain 9h",
    ],
  },
  {
    id: "P-2024-005",
    name: "Awa Ndiaye",
    birthDate: "1990-07-12",
    age: 34,
    service: "Gynécologie",
    status: "Hospitalisé",
    nextVisit: "Staff pluridisciplinaire 16h",
    riskLevel: "Modéré",
    diagnosis: {
      code: "O14.2",
      label: "Prééclampsie sévère",
    },
    histories: {
      medical: ["Grossesse gémellaire"],
      surgical: ["Césarienne (2018)"],
      other: [
        { label: "Allergies", values: ["Pénicilline"] },
        { label: "Gyneco", values: ["G3P1", "Grossesse 32 SA"] },
      ],
    },
    observations: [
      {
        id: "P-2024-005-obs-1",
        timestamp: "2024-03-09T10:05:00Z",
        note: "TA stabilisée sous traitement, protéinurie en décroissance.",
      },
      {
        id: "P-2024-005-obs-2",
        timestamp: "2024-03-09T18:30:00Z",
        note: "Bilan hépatique à recontrôler demain matin.",
      },
    ],
    instructions: [
      "Surveiller TA toutes les 2h",
      "Préparer dossier néonatologie",
    ],
  },
  {
    id: "P-2024-006",
    name: "Claire Dubois",
    birthDate: "1975-02-18",
    age: 49,
    service: "Oncologie",
    status: "Suivi",
    nextVisit: "Chimiothérapie J4",
    riskLevel: "Modéré",
    diagnosis: {
      code: "C50.9",
      label: "Carcinome mammaire infiltrant",
    },
    histories: {
      medical: ["Hypothyroïdie", "Hyperlipidémie"],
      surgical: ["Tumorectomie (2023)"],
      other: [
        { label: "Médicaments", values: ["Levothyrox", "Statine"] },
        { label: "Allergies", values: ["Amoxicilline"] },
      ],
    },
    observations: [
      {
        id: "P-2024-006-obs-1",
        timestamp: "2024-03-08T09:40:00Z",
        note: "Gestion des nausées satisfaisante, hydratation à renforcer.",
      },
      {
        id: "P-2024-006-obs-2",
        timestamp: "2024-03-08T15:25:00Z",
        note: "Fatigue grade 2, prévoir soutien psychologique.",
      },
    ],
    instructions: [
      "Planifier consultation psycho-oncologue",
      "Assurer suivi nutritionnel hebdo",
    ],
  },
  {
    id: "P-2024-007",
    name: "Ousmane Faye",
    birthDate: "1968-09-30",
    age: 56,
    service: "Néphrologie",
    status: "Hospitalisé",
    nextVisit: "Dialyse 19h",
    riskLevel: "Élevé",
    diagnosis: {
      code: "N18.6",
      label: "Insuffisance rénale chronique terminale",
    },
    histories: {
      medical: ["Diabète type 2", "Neuropathie périphérique"],
      surgical: ["Fistule artério-veineuse (2021)"],
      other: [
        {
          label: "Médicaments",
          values: ["Insuline basale", "Chélateur phosphate"],
        },
        { label: "Allergies", values: ["Iode"] },
      ],
    },
    observations: [
      {
        id: "P-2024-007-obs-1",
        timestamp: "2024-03-12T08:15:00Z",
        note: "Œdèmes des membres inférieurs persistants, surveiller poids sec.",
      },
      {
        id: "P-2024-007-obs-2",
        timestamp: "2024-03-12T17:05:00Z",
        note: "Appétit diminué, conseiller enrichissements protéiques.",
      },
    ],
    instructions: [
      "Contrôler bilan biologique post-dialyse",
      "Évaluer besoins diététiques spécifiques",
    ],
  },
  {
    id: "P-2024-008",
    name: "Sophie Laurent",
    birthDate: "1988-12-03",
    age: 35,
    service: "Pneumologie",
    status: "Consultation",
    nextVisit: "Exploration fonctionnelle 10h",
    riskLevel: "Standard",
    diagnosis: {
      code: "J45.9",
      label: "Asthme modéré persistant",
    },
    histories: {
      medical: ["Allergie saisonnière"],
      surgical: [],
      other: [
        { label: "Allergies", values: ["Pollens graminées"] },
        { label: "Médicaments", values: ["Corticoïde inhalé", "Salbutamol"] },
      ],
    },
    observations: [
      {
        id: "P-2024-008-obs-1",
        timestamp: "2024-03-07T08:50:00Z",
        note: "Test de contrôle ACT à 20/25, plan d'action à réviser.",
      },
      {
        id: "P-2024-008-obs-2",
        timestamp: "2024-03-07T13:45:00Z",
        note: "Bonne observance déclarée, reste anxieuse lors des crises.",
      },
    ],
    instructions: [
      "Mettre à jour plan d'action écrit",
      "Programmer atelier éducation respiratoire",
    ],
  },
  {
    id: "P-2024-009",
    name: "Hassan Belkacem",
    birthDate: "1949-04-27",
    age: 75,
    service: "Gériatrie",
    status: "Suivi",
    nextVisit: "Visite infirmière quotidienne",
    riskLevel: "Modéré",
    diagnosis: {
      code: "G30.1",
      label: "Maladie d'Alzheimer à début tardif",
    },
    histories: {
      medical: ["Hypertension", "Hypothyroïdie"],
      surgical: ["Remplacement valvulaire (2008)"],
      other: [
        { label: "Allergies", values: ["Sulfonamides"] },
        { label: "Médicaments", values: ["Donepezil", "Thyroxine"] },
      ],
    },
    observations: [
      {
        id: "P-2024-009-obs-1",
        timestamp: "2024-03-06T09:30:00Z",
        note: "Troubles mnésiques stables, humeur labile.",
      },
      {
        id: "P-2024-009-obs-2",
        timestamp: "2024-03-06T19:00:00Z",
        note: "Sommeil fragmenté, renforcer hygiène de sommeil.",
      },
    ],
    instructions: [
      "Coordonner rendez-vous gériatre et neurologue",
      "Informer famille du programme de stimulation cognitive",
    ],
  },
  {
    id: "P-2024-010",
    name: "Inès Boucher",
    birthDate: "2001-06-16",
    age: 23,
    service: "Médecine interne",
    status: "Hospitalisé",
    nextVisit: "Bilan sanguin 13h",
    riskLevel: "Standard",
    diagnosis: {
      code: "D50.9",
      label: "Anémie ferriprive",
    },
    histories: {
      medical: ["Maladie cœliaque"],
      surgical: [],
      other: [
        { label: "Allergies", values: ["Gluten"] },
        { label: "Médicaments", values: ["Supplément fer oral"] },
      ],
    },
    observations: [
      {
        id: "P-2024-010-obs-1",
        timestamp: "2024-03-05T10:25:00Z",
        note: "Asthénie persistante, injection Venofer tolérée.",
      },
      {
        id: "P-2024-010-obs-2",
        timestamp: "2024-03-05T16:20:00Z",
        note: "Appétit correct, bonne adhésion au régime sans gluten.",
      },
    ],
    instructions: [
      "Programmer éducation diététique ciblée",
      "Suivre ferritine dans 4 semaines",
    ],
  },
  {
    id: "P-2024-011",
    name: "Nora Haddad",
    birthDate: "1981-09-09",
    age: 43,
    service: "Endocrinologie",
    status: "Consultation",
    nextVisit: "Bilan diabétologique 17h",
    riskLevel: "Modéré",
    diagnosis: {
      code: "E11.65",
      label: "Diabète type 2 avec hyperglycémie",
    },
    histories: {
      medical: ["SOPK", "Dyslipidémie"],
      surgical: ["Curetage utérin (2016)"],
      other: [
        { label: "Médicaments", values: ["Metformine", "GLP-1 hebdomadaire"] },
        { label: "Allergies", values: ["Latex"] },
      ],
    },
    observations: [
      {
        id: "P-2024-011-obs-1",
        timestamp: "2024-03-04T09:45:00Z",
        note: "HbA1c à 8,2 %, plan d'ajustement thérapeutique en discussion.",
      },
      {
        id: "P-2024-011-obs-2",
        timestamp: "2024-03-04T14:15:00Z",
        note: "Report perte de poids ressentie comme difficile.",
      },
    ],
    instructions: [
      "Programmer atelier diététique collectif",
      "Prévoir suivi infirmier téléphonique dans 2 semaines",
    ],
  },
  {
    id: "P-2024-012",
    name: "Thierry Morel",
    birthDate: "1955-10-22",
    age: 69,
    service: "Chirurgie thoracique",
    status: "Hospitalisé",
    nextVisit: "Visite chirurgicale 08h",
    riskLevel: "Élevé",
    diagnosis: {
      code: "C34.3",
      label: "Carcinome bronchique lobe inférieur droit",
    },
    histories: {
      medical: ["BPCO", "Tabagisme actif"],
      surgical: ["By-pass gastrique (2012)"],
      other: [
        { label: "Allergies", values: ["Aucune connue"] },
        {
          label: "Médicaments",
          values: ["Corticoïde inhalé", "Bronchodilatateur"],
        },
      ],
    },
    observations: [
      {
        id: "P-2024-012-obs-1",
        timestamp: "2024-03-03T07:30:00Z",
        note: "Post-op J1 lobectomie, drainage satisfaisant.",
      },
      {
        id: "P-2024-012-obs-2",
        timestamp: "2024-03-03T11:55:00Z",
        note: "Oxygénothérapie 2 L/min, kiné respi à poursuivre.",
      },
    ],
    instructions: [
      "Surveiller douleur et spirométrie incitative",
      "Planifier consultation tabacologue",
    ],
  },
];
