import type { TaskItem } from "@/types/tasks";
import type { ActivityType } from "@/data/dashboard/dashboard-metadata";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  location?: string;
  team?: string;
  status: "done" | "todo";
}

export interface DayData {
  activities: ActivityItem[];
  tasks: TaskItem[];
  patients: any[];
}

// Helper functions for date/string manipulation
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

// Generate tasks for a specific date
export const generateTasksForDate = (date: Date): TaskItem[] => {
  const key = formatDateKey(date);
  const dayName = capitalize(
    date.toLocaleDateString("fr-FR", { weekday: "long" }),
  );

  if (date.getDay() === 0) {
    return [
      {
        id: `${key}-TASK-RECUP`,
        title: "Préparer la reprise du lundi",
        details:
          "Mettre à jour la check-list bloc, vérifier les commandes de dispositifs médicaux et confirmer les premières consultations du matin.",
        done: false,
      },
    ];
  }

  return [
    {
      id: `${key}-TASK-01`,
      title: `Brief infirmier ${dayName}`,
      details:
        "Partager les nouvelles consignes post-op avec l'équipe IDE du secteur 5 et planifier les évaluations EVA de la matinée.",
      done: false,
    },
    {
      id: `${key}-TASK-02`,
      title: "Validation protocoles antibiotiques",
      details:
        "Confirmer avec la pharmacie la disponibilité des traitements IV prévus et vérifier les ordonnances pour les patients sortants.",
      done: false,
    },
    {
      id: `${key}-TASK-03`,
      title: "Coordonner imagerie post-op",
      details:
        "Réserver un créneau scanner pour Mme Laurier avant 16h et informer l'équipe anesthésie des résultats attendus.",
      done: false,
    },
  ];
};

// Generate initial schedule seeds based on baseDate
export const getInitialScheduleSeeds = (baseDate: Date): Record<string, DayData> => {
  return {
    [formatDateKey(baseDate)]: {
      activities: [
        {
          id: "ACT-01",
          type: "consultation",
          title: "Consultation - Mme. Leroy",
          description:
            "Suivi post-opératoire J+7 : contrôle du pansement, évaluation de la douleur et réglage du traitement.",
          time: "08:30",
          location: "Salle 3 · Chirurgie",
          team: "IDE Claire N. · Interne M. Lenoir",
          status: "todo",
        },
        {
          id: "ACT-02",
          type: "chirurgie",
          title: "Bloc opératoire - Colectomie",
          description:
            "Intervention laparoscopique patient Martin B. Prévoir check-list et briefing anesthésie.",
          time: "10:15",
          location: "Bloc 5 (équipe A)",
          team: "Anesth. Dr. Benali · IADE Luc O.",
          status: "todo",
        },
        {
          id: "ACT-03",
          type: "staff",
          title: "Staff digestif pluridisciplinaire",
          description:
            "Présentation des dossiers RCP digestif et planification des suites de traitement.",
          time: "12:30",
          location: "Salle de conférence 2",
          team: "Chirurgie · Gastro · Oncologie",
          status: "done",
        },
        {
          id: "ACT-04",
          type: "tournee",
          title: "Tournée post-opératoire (étage 5)",
          description:
            "Contrôle des patients chambres 512 à 520, évaluation douleur et mobilisation.",
          time: "16:00",
          location: "Service hospitalisation · Étage 5",
          team: "Interne Léa M. · IDE de garde",
          status: "todo",
        },
      ],
      tasks: [
        {
          id: "TASK-01",
          title: "Brief infirmier secteur 5",
          details:
            "Partager les consignes post-op et vérifier les protocoles analgésiques pour les chambres 512 à 520.",
          done: false,
        },
        {
          id: "TASK-02",
          title: "Revue bilans critiques",
          details:
            "Analyser les résultats hémostase Mme Nguen et bilan hépatique M. Fadel avant la tournée de 15h.",
          done: false,
        },
        {
          id: "TASK-03",
          title: "Coordination sortie HAD",
          details:
            "Préparer la transition de M. Diallo avec l'équipe HAD : matériel, prescription et rendez-vous de suivi.",
          done: false,
        },
      ],
      patients: [],
    },
    [formatDateKey(addDays(baseDate, 1))]: {
      activities: [
        {
          id: "TMR-ACT-01",
          type: "consultation",
          title: "Consultation d'urgence - M. Renard",
          description:
            "Douleurs abdominales aiguës · imagerie prévue après examen clinique.",
          time: "08:00",
          location: "Salle 1 · Urgences programmées",
          team: "IDE Sonia P.",
          status: "todo",
        },
        {
          id: "TMR-ACT-02",
          type: "chirurgie",
          title: "Bloc laparoscopie - Cholécystectomie",
          description:
            "Patient L. Carpentier · Prévoir renfort instrumentiste et contrôle check-list.",
          time: "11:00",
          location: "Bloc 3 (équipe B)",
          team: "Anesth. Dr. Kader · IADE Justine D.",
          status: "todo",
        },
        {
          id: "TMR-ACT-03",
          type: "staff",
          title: "Briefing anesthésie",
          description:
            "Validation fasting et protocole analgésie pour les interventions de l&apos;après-midi.",
          time: "14:00",
          location: "Salle staff anesthésie",
          team: "Dr. Benali · IADE équipe",
          status: "todo",
        },
      ],
      tasks: [
        {
          id: "TMR-TASK-01",
          title: "Réaffecter les créneaux bloc 3",
          details:
            "Maintenance partielle en cours : coordonner avec le service biomédical et ajuster la planification des équipes.",
          done: false,
        },
        {
          id: "TMR-TASK-02",
          title: "Répondre au message cardiologie",
          details:
            "Analyser le retour du Dr Evans sur l'ECG du patient Carter et adapter la prise en charge.",
          done: false,
        },
      ],
      patients: [],
    },
    [formatDateKey(addDays(baseDate, 2))]: {
      activities: [
        {
          id: "D2-ACT-01",
          type: "consultation",
          title: "Consultation de suivi - Mme. Laurier",
          description:
            "Contrôle cicatrice et lecture des résultats d&apos;imagerie post-op.",
          time: "09:15",
          location: "Salle 4 · Chirurgie",
          team: "Interne Hugo T.",
          status: "todo",
        },
        {
          id: "D2-ACT-02",
          type: "tournee",
          title: "Visite coordination HAD",
          description:
            "Préparation sortie anticipée de M. Diallo et organisation des soins à domicile.",
          time: "15:30",
          location: "Service hôpital de jour",
          team: "Coordinatrice Amélie B.",
          status: "todo",
        },
      ],
      tasks: [
        {
          id: "D2-TASK-01",
          title: "Suivi EVA patient Diallo",
          details:
            "Programmer un passage IDE pour évaluer la douleur et réévaluer le schéma analgésique.",
          done: false,
        },
      ],
      patients: [],
    },
  };
};
