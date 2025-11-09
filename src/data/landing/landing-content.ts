import { type ComponentType } from "react";
import {
  Activity,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  Users,
  CheckCircle2,
  Circle,
  Beaker,
  FileText,
} from "lucide-react";
import type { TaskItem } from "@/types/tasks";

export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: "#features", label: "Modules" },
  { href: "#stats", label: "Engagements" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export interface HeroHighlight {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}

export const heroHighlights: HeroHighlight[] = [
  { label: "Déploiement moyen", value: "3 jours", icon: CalendarDays },
  { label: "Conformité & sécurité", value: "100%", icon: ShieldCheck },
  { label: "Gain de temps constaté", value: "+32%", icon: Activity },
];

export interface FeatureTab {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  badge: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  insights: Array<{ label: string; value: string }>;
}

export const featureTabs: FeatureTab[] = [
  {
    id: "planning",
    title: "Planning opératoire assisté",
    description:
      "Anticipez vos blocs avec une vue consolidée : disponibilité des salles, checklists pré-op et alertes critiques alignées en temps réel.",
    highlights: [
      "Synchronisation automatique bloc / imagerie",
      "Rappels équipe anesthésie et IBODE",
      "Détection proactive des conflits de ressources",
    ],
    badge: "Bloc opératoire augmenté",
    icon: CalendarDays,
    accent: "from-[#4c6ef5] via-[#8b5cf6] to-[#0ea5e9]",
    insights: [
      { label: "Score préparation", value: "98%" },
      { label: "Alertes critiques", value: "-37%" },
    ],
  },
  {
    id: "patients",
    title: "Dossiers patients augmentés",
    description:
      "Accédez à une synthèse intelligente des parcours : diagnostics, suivi post-op, consentements et communication inter-disciplinaire.",
    highlights: [
      "Fiches patient personnalisables",
      "Timeline des évènements majeurs",
      "Messagerie sécurisée multidisciplinaire",
    ],
    badge: "Parcours patient connecté",
    icon: Stethoscope,
    accent: "from-[#ec4899] via-[#8b5cf6] to-[#14b8a6]",
    insights: [
      { label: "Temps de lecture", value: "-45%" },
      { label: "Satisfaction patient", value: "4.8 / 5" },
    ],
  },
  {
    id: "analytics",
    title: "Analytique métier instantanée",
    description:
      "Suivez vos indicateurs clés : activité opératoire, délais, qualité perçue. Comparez-vous au référentiel national pour ajuster vos pratiques.",
    highlights: [
      "Tableau de bord paramétrable",
      "Rapports exportables en 1 clic",
      "Alertes automatisées sur les tendances",
    ],
    badge: "Pilotage temps réel",
    icon: Activity,
    accent: "from-[#38bdf8] via-[#6366f1] to-[#f59e0b]",
    insights: [
      { label: "Rapports générés", value: "x12" },
      { label: "Décisions accélérées", value: "72h → 8h" },
    ],
  },
];

export interface Stat {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}

export const stats: Stat[] = [
  { label: "Centres utilisateurs", value: "120+", icon: ShieldCheck },
  { label: "Patient·e·s suivis chaque jour", value: "14 500", icon: Stethoscope },
  { label: "Gain moyen de temps opérateur", value: "32%", icon: Activity },
  { label: "Satisfaction praticiens", value: "4.8 / 5", icon: Users },
];

export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: "OpenCare est-il conforme aux standards de sécurité hospitaliers ?",
    answer:
      "Oui. OpenCare est hébergé sur une infrastructure certifiée HDS, applique le chiffrement des données au repos & en transit et respecte les exigences RGPD pour le secteur médical.",
  },
  {
    question: "Comment se déroule l'intégration avec nos systèmes existants ?",
    answer:
      "Nos équipes vous accompagnent sur un audit technique et déploient des connecteurs HL7/FHIR vers votre DPI, LIS et systèmes de planification. La mise en production s'effectue en moins de 4 semaines.",
  },
  {
    question: "Les praticiens peuvent-ils personnaliser leurs tableaux de bord ?",
    answer:
      "Chaque praticien bénéficie d'un espace personnalisable : filtres patients, tuiles statistiques, préférences de notifications et exports adaptés à sa spécialité.",
  },
  {
    question: "Proposez-vous une application mobile ?",
    answer:
      "Une Progressive Web App est disponible pour consulter vos listes de patients, accéder aux protocoles et répondre rapidement aux notifications critiques.",
  },
  {
    question: "Quelles équipes peuvent utiliser OpenCare ?",
    answer:
      "Chirurgiens, anesthésistes, IADE, cadres de bloc, coordonnateurs de parcours et services d'imagerie/laboratoire : la plateforme facilite la collaboration inter-disciplinaire.",
  },
  {
    question: "OpenCare permet-il de mesurer la satisfaction patient ?",
    answer:
      "Nous intégrons des enquêtes post-séjour, calculons des scores NPS et fournissons des insights pour améliorer les processus de prise en charge.",
  },
  {
    question: "Peut-on tester la solution avant déploiement ?",
    answer:
      "Un environnement pilote vous est proposé pour évaluer les workflows avec un échantillon de services. Nos équipes vous accompagnent sur la configuration et la formation.",
  },
  {
    question: "Comment fonctionne l'assistance ?",
    answer:
      "Support 24/7, référent projet dédié et bibliothèque de tutoriels interactifs. Vous pouvez contacter nos experts via chat sécurisé ou hotline dédiée.",
  },
];

// Mockup data for component showcases
export const mockTasksData: TaskItem[] = [
  {
    id: "task-1",
    title: "Vérifier l'analgésie post-opératoire",
    details: "Contrôle des médicaments administrés et évaluation du confort patient",
    done: false,
    taskType: "team",
  },
  {
    id: "task-2",
    title: "Changer le pansement stérile",
    details: "Remplacement du pansement selon le protocole de l'unité",
    done: true,
    taskType: "team",
  },
  {
    id: "task-3",
    title: "Mobilisation passive du patient",
    details: "Exercices de kinésithérapie pour prévention des thromboses",
    done: false,
    taskType: "team",
  },
];

export const mockPatientData = {
  id: "PAT-001",
  name: "Fatou Diop",
  age: 58,
  service: "Chirurgie digestive",
  diagnosis: "Colectomie laparoscopique · J+7",
  status: "Post-op",
  doctor: "Dr. Paul Martin",
  admissionDate: "2025-11-02",
  surgeryType: "Chirurgie digestive",
  lastVitals: {
    temperature: 37.2,
    heartRate: 72,
    bloodPressure: "125/80",
    oxygenSaturation: 98,
  },
  labs: {
    status: "completed" as const,
    note: "CRP 12 mg/L (stable)",
  },
};

export const mockAnalysisData = [
  {
    id: "ANA-001",
    type: "Imagerie",
    date: "2025-11-08",
    description: "Radiographie thoracique post-opératoire",
    status: "Reviewed",
  },
  {
    id: "ANA-002",
    type: "Bilan sanguin",
    date: "2025-11-07",
    description: "Hémoglobine, hématocrite, plaquettes",
    status: "Pending",
  },
  {
    id: "ANA-003",
    type: "Bactériologie",
    date: "2025-11-06",
    description: "Résultats de culture - Stérile",
    status: "Reviewed",
  },
];

export const mockCompteRenduData = [
  {
    id: "CR-001",
    title: "Colectomie laparoscopique partielle",
    date: "2025-11-02",
    patient: "Fatou Diop",
    surgeon: "Dr. Paul Martin",
    duration: "120 min",
    status: "Finalisé",
  },
  {
    id: "CR-002",
    title: "Herniorraphie inguinale unilatérale",
    date: "2025-11-01",
    patient: "Jean Dupont",
    surgeon: "Dr. Sophie Bernard",
    duration: "45 min",
    status: "En cours",
  },
  {
    id: "CR-003",
    title: "Appendicectomie d'urgence",
    date: "2025-10-31",
    patient: "Marie Martin",
    surgeon: "Dr. Paul Martin",
    duration: "60 min",
    status: "Finalisé",
  },
];
