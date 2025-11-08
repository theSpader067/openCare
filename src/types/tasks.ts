import type { ComponentType } from "react";

export type ActivityType = "consultation" | "chirurgie" | "staff" | "tournee";
export type ActivityStatus = "done" | "todo";
export type TaskType = "team" | "private";

export interface TaskItem {
  id: string;
  title: string;
  details: string;
  done: boolean;
  delegatedTo?: string;
  patientName?: string;
  taskType?: TaskType;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  location?: string;
  team?: string;
  status: ActivityStatus;
}

export interface TaskFormState {
  titles: string[];
  patientId?: string;
  patientName?: string;
  taskType?: TaskType;
}

export interface ActivityFormState {
  title: string;
  description: string;
  type: ActivityType;
  time: string;
  location: string;
  team: string;
}

export interface ActivityTypeMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeClass: string;
}
