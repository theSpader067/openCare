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

// This base array is used for configuration only
// Actual labels and hints are provided by translation function in the component
export const statsSummaryConfig = [
  {
    labelKey: "dashboard.stats.scheduledConsultations",
    hintKey: "dashboard.stats.syncData",
    icon: UsersRound,
    theme: {
      card: "bg-gradient-to-br from-[#e0f2ff] via-[#ecf3ff] to-white",
      icon: "bg-white text-[#0f62fe]",
      accent: "text-[#0f62fe]",
      text: "text-[#09356f]",
    },
  },
  {
    labelKey: "dashboard.stats.operatingRoomInterventions",
    hintKey: "dashboard.stats.syncData",
    icon: HeartPulse,
    theme: {
      card: "bg-gradient-to-br from-[#fee2f2] via-[#fff1f7] to-white",
      icon: "bg-white text-[#d61f69]",
      accent: "text-[#d61f69]",
      text: "text-[#8a1547]",
    },
  },
  {
    labelKey: "dashboard.stats.criticalAnalyses",
    hintKey: "dashboard.stats.syncData",
    icon: ClipboardList,
    theme: {
      card: "bg-gradient-to-br from-[#f7f3ff] via-[#f1f5ff] to-white",
      icon: "bg-white text-[#7c3aed]",
      accent: "text-[#7c3aed]",
      text: "text-[#43338b]",
    },
  },
  {
    labelKey: "dashboard.stats.patientFollowUp",
    hintKey: "dashboard.stats.syncData",
    icon: Activity,
    theme: {
      card: "bg-gradient-to-br from-[#dcfce7] via-[#f1fff5] to-white",
      icon: "bg-white text-[#059669]",
      accent: "text-[#059669]",
      text: "text-[#0f5132]",
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
