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
  { label: "Déploiement moyen", value: "4 jours", icon: CalendarDays },
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
    title: "Tâches & Activités",
    description:
      "Créez et gérez vos tâches quotidiennes et consignes du service directement après vos visites. Coordonnez avec vos collègues en temps réel et assurez-vous qu'aucune action clinique n'est oubliée.",
    highlights: [
      "Créer et assigner des tâches à votre équipe",
      "Consignes du service pré/post-visite",
      "Coordination en temps réel avec vos collègues",
    ],
    badge: "Gestion collaborative",
    icon: CalendarDays,
    accent: "from-[#4c6ef5] via-[#8b5cf6] to-[#0ea5e9]",
    insights: [
      { label: "Tâches complétées", value: "98%" },
      { label: "Temps sauvegardé", value: "-2h/jour" },
    ],
  },
  {
    id: "patients",
    title: "Patients",
    description:
      "Construisez et consultez votre base de données patients avec des aperçus rapides et détaillés. Revisitez les dossiers, modifiez les informations et ajoutez vos observations cliniques en quelques clics.",
    highlights: [
      "Aperçus rapides et synthétiques des patients",
      "Vue détaillée complète du dossier",
      "Enregistrement des observations cliniques",
      "Édition facile des informations patient",
    ],
    badge: "Gestion patient intégrée",
    icon: Stethoscope,
    accent: "from-[#ec4899] via-[#8b5cf6] to-[#14b8a6]",
    insights: [
      { label: "Temps de consultation", value: "-45%" },
      { label: "Observation complètes", value: "+89%" },
    ],
  },
  {
    id: "editor",
    title: "Éditeur Intelligent",
    description:
      "Laissez notre éditeur intelligent vous suggérer ce que vous devez écrire. Il analyse les données patient, les valeurs de laboratoire et les métadonnées pour auto-remplir ordonnances et observations cliniques.",
    highlights: [
      "Auto-suggestions basées sur les données patient",
      "Remplissage intelligent des ordonnances",
      "Synthèse automatique des observations",
      "Métadonnées et valeurs de lab analysées",
    ],
    badge: "IA pour la documentation",
    icon: Activity,
    accent: "from-[#38bdf8] via-[#6366f1] to-[#f59e0b]",
    insights: [
      { label: "Temps d'écriture réduit", value: "-60%" },
      { label: "Erreurs de saisie", value: "-92%" },
    ],
  },
  {
    id: "analytics",
    title: "Analyses",
    description:
      "Consultez, créez et partagez les analyses biologiques, d'imagerie et d'anatomopathologie de votre équipe. Recherchez par type de bilan, nom du patient ou période, et capturez les résultats de lab directement en photo pour un remplissage automatique.",
    highlights: [
      "Gestion des analyses biologiques, imagerie et anapath",
      "Recherche par type de bilan, patient ou période",
      "Capture photo des résultats de lab",
      "Remplissage automatique des valeurs",
      "Partage en équipe et historique complet",
    ],
    badge: "Analyses intégrées",
    icon: Beaker,
    accent: "from-[#f59e0b] via-[#ef4444] to-[#ec4899]",
    insights: [
      { label: "Temps de saisie", value: "-85%" },
      { label: "Analyses consultées", value: "+150%" },
    ],
  },
  {
    id: "documents",
    title: "Documents & Modèles",
    description:
      "Arrêtez de rédiger vos documents à partir de zéro. Accédez à une suite complète de modèles pré-remplis pour ordonnances et comptes rendues. Adaptez, finalisez et signez en quelques secondes sans perdre de temps.",
    highlights: [
      "Modèles pré-remplis pour ordonnances",
      "Comptes rendues avec structure et contenu suggérés",
      "Personnalisation rapide selon vos besoins",
      "Signature numérique intégrée",
      "Archivage automatique et traçabilité",
    ],
    badge: "Gestion documentaire optimisée",
    icon: FileText,
    accent: "from-[#10b981] via-[#06b6d4] to-[#8b5cf6]",
    insights: [
      { label: "Documents générés", value: "x5" },
      { label: "Temps par document", value: "-85%" },
    ],
  },
];

export interface Stat {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}

export const stats: Stat[] = [
  { label: "Gain moyen de temps", value: "32%", icon: Activity },
  { label: "Spécialités supportées", value: "+50", icon: CheckCircle2 },
  { label: "Support", value: "24/7", icon: Users },
  { label: "Mise en place", value: "4 jours", icon: CalendarDays },
];

export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: "Mes données patients sont-elles sécurisées ?",
    answer:
      "Oui. OpenCare utilise le chiffrement end-to-end et une infrastructure sécurisée conforme aux standards hospitaliers. Vos données restent sous votre contrôle.",
  },
  {
    question: "Les praticiens peuvent-ils personnaliser leurs tableaux de bord ?",
    answer:
      "Chaque praticien bénéficie d'un espace personnalisable : filtres patients, tuiles statistiques, préférences de notifications et exports adaptés à sa spécialité.",
  },
  {
    question: "Proposez-vous une application mobile ?",
    answer:
      "Une Web App Prgressive est disponible pour consulter vos listes de patients, accéder aux protocoles et répondre rapidement aux notifications critiques. Une application mobile est en cours de développment",
  },
  {
    question: "Quelles équipes peuvent utiliser OpenCare ?",
    answer:
      "Internes, Résidents, Spécialistes, anesthésistes, IADE, cadres de bloc, coordonnateurs de parcours et services d'imagerie/laboratoire : la plateforme facilite la collaboration inter-disciplinaire.",
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
