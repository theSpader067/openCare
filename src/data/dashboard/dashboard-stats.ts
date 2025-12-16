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
  bar: string;
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

// This base array is used for configuration only
// Actual labels and hints are provided by translation function in the component
export const statsSummaryConfig = [
  {
    labelKey: "dashboard.stats.scheduledConsultations",
    hintKey: "dashboard.stats.syncData",
    icon: UsersRound,
    theme: {
      card: "",
      icon: "bg-[#e7ecfb] text-[#1d3a8a]",
      accent: "text-[#1d3a8a]",
      text: "text-[#0f172a]",
      bar: "from-[#d4defb] via-transparent",
    },
  },
  {
    labelKey: "dashboard.stats.operatingRoomInterventions",
    hintKey: "dashboard.stats.syncData",
    icon: HeartPulse,
    theme: {
      card: "",
      icon: "bg-[#fdecec] text-[#912026]",
      accent: "text-[#912026]",
      text: "text-[#111827]",
      bar: "from-[#fcdcdc] via-transparent",
    },
  },
  {
    labelKey: "dashboard.stats.criticalAnalyses",
    hintKey: "dashboard.stats.syncData",
    icon: ClipboardList,
    theme: {
      card: "",
      icon: "bg-[#f2ecfd] text-[#5b21b6]",
      accent: "text-[#5b21b6]",
      text: "text-[#0f172a]",
      bar: "from-[#e8d9fb] via-transparent",
    },
  },
  {
    labelKey: "dashboard.stats.patientFollowUp",
    hintKey: "dashboard.stats.syncData",
    icon: Activity,
    theme: {
      card: "",
      icon: "bg-[#e5f6f1] text-[#0f766e]",
      accent: "text-[#0f766e]",
      text: "text-[#0f172a]",
      bar: "from-[#cfeee5] via-transparent",
    },
  },
];

// Legacy export for backwards compatibility
export const statsSummary: Stat[] = statsSummaryConfig.map((config: any) => ({
  label: config.labelKey,
  value: "",
  variation: "",
  trend: "neutral",
  icon: config.icon,
  hint: config.hintKey,
  theme: config.theme,
}));
