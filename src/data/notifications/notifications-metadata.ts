import type { ComponentType } from "react";
import {
  Beaker,
  ListChecks,
  Stethoscope,
} from "lucide-react";

export type NotificationType = "avis" | "task" | "bilan";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  source: string;
}

export const NOTIFICATION_META: Record<
  NotificationType,
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
    badgeClass: string;
    iconClass: string;
  }
> = {
  avis: {
    label: "Avis",
    icon: Stethoscope,
    badgeClass: "bg-emerald-100 text-emerald-700",
    iconClass: "bg-emerald-500/15 text-emerald-600",
  },
  task: {
    label: "Tâche",
    icon: ListChecks,
    badgeClass: "bg-indigo-100 text-indigo-700",
    iconClass: "bg-indigo-500/15 text-indigo-600",
  },
  bilan: {
    label: "Bilan",
    icon: Beaker,
    badgeClass: "bg-amber-100 text-amber-700",
    iconClass: "bg-amber-500/15 text-amber-600",
  },
};

export const NOTIFICATIONS_SEED: NotificationItem[] = [
  {
    id: "notif-avis-01",
    type: "avis",
    title: "Avis cardiologie validé",
    description: "Dr. Rahmani confirme l'ajustement du bêtabloquant pour Mme Messaoui.",
    time: "Il y a 8 minutes",
    source: "Service cardiologie",
  },
  {
    id: "notif-task-01",
    type: "task",
    title: "Nouvelle consigne déléguée",
    description: "Résident bloc B a assigné la préparation du staff du soir.",
    time: "Il y a 21 minutes",
    source: "Bloc opératoire B",
  },
  {
    id: "notif-bilan-01",
    type: "bilan",
    title: "Bilan biologique complet",
    description: "Les résultats de Mme Laurier sont synchronisés et prêts à valider.",
    time: "Il y a 1 heure",
    source: "Laboratoire central",
  },
  {
    id: "notif-avis-02",
    type: "avis",
    title: "Avis infectiologie en attente",
    description: "Prise en charge antibiotique demandée pour Mr. Zouhair (lit 512).",
    time: "Il y a 2 heures",
    source: "Service infectiologie",
  },
];
