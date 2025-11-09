import { type ComponentType } from "react";
import {
  Activity,
  ClipboardList,
  HeartPulse,
  UsersRound,
} from "lucide-react";

interface StatTheme {
  card: string;
  icon: string;
  accent: string;
  text: string;
}

export interface Stat {
  label: string;
  value: string;
  variation: string;
  trend: "up" | "down" | "neutral";
  icon: ComponentType<{ className?: string }>;
  hint: string;
  theme: StatTheme;
}

export const statsSummary: Stat[] = [
  {
    label: "Consultations planifiées",
    value: "18",
    variation: "+3 vs hier",
    trend: "up",
    icon: UsersRound,
    hint: "Cabinet et téléconsultations",
    theme: {
      card: "bg-gradient-to-br from-[#e0f2ff] via-[#ecf3ff] to-white",
      icon: "bg-white text-[#0f62fe]",
      accent: "text-[#0f62fe]",
      text: "text-[#09356f]",
    },
  },
  {
    label: "Interventions au bloc",
    value: "4",
    variation: "+1 équipe mobilisée",
    trend: "up",
    icon: HeartPulse,
    hint: "Blocs 2 · 5 · 7 · 8",
    theme: {
      card: "bg-gradient-to-br from-[#fee2f2] via-[#fff1f7] to-white",
      icon: "bg-white text-[#d61f69]",
      accent: "text-[#d61f69]",
      text: "text-[#8a1547]",
    },
  },
  {
    label: "Analyses critiques",
    value: "5",
    variation: "2 en attente",
    trend: "neutral",
    icon: ClipboardList,
    hint: "Laboratoire central",
    theme: {
      card: "bg-gradient-to-br from-[#f7f3ff] via-[#f1f5ff] to-white",
      icon: "bg-white text-[#7c3aed]",
      accent: "text-[#7c3aed]",
      text: "text-[#43338b]",
    },
  },
  {
    label: "Patients à suivre",
    value: "9",
    variation: "-2 vs hier",
    trend: "down",
    icon: Activity,
    hint: "Post-op + surveillance",
    theme: {
      card: "bg-gradient-to-br from-[#dcfce7] via-[#f1fff5] to-white",
      icon: "bg-white text-[#059669]",
      accent: "text-[#059669]",
      text: "text-[#0f5132]",
    },
  },
];
