import { type ComponentType } from "react";
import {
  ClipboardList,
  HeartPulse,
  ListChecks,
  UsersRound,
} from "lucide-react";

export type ActivityType = "consultation" | "chirurgie" | "staff" | "tournee";

export interface ActivityTypeMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeClass: string;
}

export const activityTypeMeta: Record<ActivityType, ActivityTypeMeta> = {
  consultation: {
    label: "Consultation",
    icon: UsersRound,
    badgeClass:
      "bg-gradient-to-br from-[#93c5fd] via-[#60a5fa] to-[#3b82f6] text-white shadow-inner shadow-blue-200/60",
  },
  chirurgie: {
    label: "Bloc opératoire",
    icon: HeartPulse,
    badgeClass:
      "bg-gradient-to-br from-[#fda4af] via-[#fb7185] to-[#f43f5e] text-white shadow-inner shadow-rose-200/60",
  },
  staff: {
    label: "Staff multidisciplinaire",
    icon: ClipboardList,
    badgeClass:
      "bg-gradient-to-br from-[#bae6fd] via-[#67e8f9] to-[#22d3ee] text-[#0c4a6e] shadow-inner shadow-sky-200/60",
  },
  tournee: {
    label: "Tournée secteur",
    icon: ListChecks,
    badgeClass:
      "bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#f97316] text-[#78350f] shadow-inner shadow-amber-200/60",
  },
};

export type PatientStatus = "Pré-op" | "Post-op" | "Surveillance" | "Rééducation";

export interface StatusMeta {
  badgeClass: string;
  label: string;
}

export const patientStatusMeta: Record<PatientStatus, StatusMeta> = {
  "Pré-op": {
    badgeClass:
      "bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f97316] text-[#7c2d12] shadow-inner shadow-amber-200/60",
    label: "Pré-op",
  },
  "Post-op": {
    badgeClass:
      "bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#14b8a6] text-white shadow-inner shadow-emerald-200/60",
    label: "Post-op",
  },
  Surveillance: {
    badgeClass:
      "bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#2563eb] text-white shadow-inner shadow-sky-200/60",
    label: "Surveillance",
  },
  Rééducation: {
    badgeClass:
      "bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#7c3aed] text-white shadow-inner shadow-violet-200/60",
    label: "Rééducation",
  },
};

export type LabStatus = "pending" | "completed" | "na";

export const labStatusMeta: Record<LabStatus, StatusMeta> = {
  pending: {
    badgeClass:
      "bg-gradient-to-r from-[#f97316]/90 to-[#f59e0b]/90 text-white shadow-inner shadow-amber-200/60",
    label: "En attente",
  },
  completed: {
    badgeClass:
      "bg-gradient-to-r from-[#34d399]/90 to-[#22c55e]/90 text-white shadow-inner shadow-emerald-200/60",
    label: "Dernier résultat",
  },
  na: {
    badgeClass:
      "bg-gradient-to-r from-[#e2e8f0]/90 to-[#cbd5f5]/90 text-[#1e293b] shadow-inner shadow-slate-200/60",
    label: "N/A",
  },
};
