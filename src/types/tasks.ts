import type { ComponentType } from "react";

export type ActivityType = "consultation" | "chirurgie" | "staff" | "tournee";
export type ActivityStatus = "done" | "todo";
export type TaskType = "team" | "private";

export interface Team {
  id: number;
  name: string;
}

export interface TaskItem {
  id: string;
  title: string;
  details: string;
  done: boolean;
  patientId?: number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  taskType?: TaskType;
  teams?: Team[];
  participants?: User[];
}

export interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  username?: string | null;
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
  createdAt?: string | Date;
  activityDay?: string | Date;
  creator?: User;
  participants?: String[];
}

export interface TaskFormState {
  titles: string[];
  patientId?: string;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  taskType?: TaskType;
}

export interface ActivityFormState {
  title: string;
  description: string;
  type: ActivityType;
  activityDay: Date;
  time: string;
  location: string;
  team: string;
}

export interface ActivityTypeMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeClass: string;
}
