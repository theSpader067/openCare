"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useSession } from "next-auth/react";
import {
  Activity,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ClipboardList,
  ListChecks,
  MapPin,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TasksSection } from "@/components/tasks/TasksSection";
import { ActivitySection } from "@/components/activities/ActivitySection";
import type { TaskItem } from "@/types/tasks";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTasks,
} from "@/lib/api/tasks";
import {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} from "@/lib/api/activities";

function SimpleDatePicker({
  date,
  onDateChange,
}: {
  date: Date;
  onDateChange: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date(date));
  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/50 transition"
      >
        <CalendarIcon className="h-4 w-4 text-slate-500" />
        <span>{dateLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg p-3">
          <Calendar
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                onDateChange(selectedDate);
                setIsOpen(false);
              }
            }}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-2 text-xs font-medium text-slate-500 hover:text-slate-700 py-1"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}

type ActivityType = "consultation" | "chirurgie" | "staff" | "tournee";
type ActivityStatus = "done" | "todo";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  location?: string;
  team?: string;
  status: ActivityStatus;
  activityDay?: string | Date;
}


type ActivityTabKey = "activites" | "bloc" | "divers";

interface ActivityTypeMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeClass: string;
}

const activityTypeMeta: Record<ActivityType, ActivityTypeMeta> = {
  consultation: {
    label: "Consultation",
    icon: Activity,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  chirurgie: {
    label: "Bloc opératoire",
    icon: Activity,
    badgeClass: "bg-rose-100 text-rose-700",
  },
  staff: {
    label: "Staff / réunion",
    icon: ListChecks,
    badgeClass: "bg-amber-100 text-amber-700",
  },
  tournee: {
    label: "Tournée",
    icon: Users,
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
};

const generateTasksForDate = (date: Date): TaskItem[] => {
  const dateKey = date.toISOString().split("T")[0];

  // Get today and yesterday keys for comparison
  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  const taskSeeds: Record<string, TaskItem[]> = {
    [todayKey]: [
      {
        id: "TASK-001",
        title: "Vérifier l'analgésie secteur 5",
        details: "Vérifier les pansements et l'état des patients post-op. Attention particulière à la patiente du lit 12.",
        done: false,
      },
      {
        id: "TASK-002",
        title: "Commander le matériel de bloc",
        details: "Renouveler les stocks de compresses et sutures avant intervention de demain. Contacter le fournisseur.",
        done: true,
      },
      {
        id: "TASK-003",
        title: "Réunion d'équipe",
        details: "12h30 salle de conférence - prévoir l'ordre du jour sur les protocoles post-op",
        done: false,
      },
      {
        id: "TASK-004",
        title: "Transmettre rapports au service",
        details: "Envoyer les comptes-rendus de la journée à la direction et l'équipe médicale",
        done: false,
      },
      {
        id: "TASK-005",
        title: "Suivi patient Costa",
        details: "Vérifier les résultats d'analyses et ajuster le traitement si nécessaire",
        done: false,
      },
    ],
    [yesterdayKey]: [
      {
        id: "TASK-006",
        title: "Préparation salles d'opération",
        details: "Stérilisation et préparation des 3 salles pour les interventions de la journée",
        done: true,
      },
      {
        id: "TASK-007",
        title: "Visite médicale secteur 3",
        details: "Consultation des patients admis hier pour évaluation post-opératoire",
        done: true,
      },
      {
        id: "TASK-008",
        title: "Validation des commandes",
        details: "Vérifier les commandes de médicaments et matériel reçues",
        done: true,
      },
      {
        id: "TASK-009",
        title: "Documentation patient Diop",
        details: "Compléter le dossier médical avec les derniers examens et notes cliniques",
        done: false,
      },
    ],
  };
  return taskSeeds[dateKey] || [];
};

const generateActivitiesForDate = (date: Date): ActivityItem[] => {
  const dateKey = date.toISOString().split("T")[0];

  // Get today and yesterday keys for comparison
  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  const activitySeeds: Record<string, ActivityItem[]> = {
    [todayKey]: [
      {
        id: "ACT-001",
        type: "consultation",
        title: "Consultation Fatou Diop",
        description: "Suivi post-opératoire suite à appendicectomie - Évaluation de la cicatrisation",
        time: "08:45",
        location: "Secteur 5 - Bureau consultation",
        team: "Dr. Benali, IDE Claire",
        status: "done",
      },
      {
        id: "ACT-002",
        type: "chirurgie",
        title: "Bloc opératoire 5 - Colectomie",
        description: "Intervention programmée avec équipe complète. Patient préparé, anesthésie prête.",
        time: "10:30",
        location: "Bloc 5",
        team: "Dr. Dupont, Dr. Martin, Anesthésiste Lefevre",
        status: "done",
      },
      {
        id: "ACT-003",
        type: "staff",
        title: "Staff d'équipe - Protocoles post-op",
        description: "Réunion hebdomadaire de coordination et discussion des cas cliniques",
        time: "12:30",
        location: "Salle de conférence 2",
        team: "Toute l'équipe chirurgicale",
        status: "todo",
      },
      {
        id: "ACT-004",
        type: "tournee",
        title: "Tournée patients secteur 3",
        description: "Visite de suivi des patients admis cette semaine",
        time: "15:00",
        location: "Secteur 3",
        team: "Dr. Benali, IDE Marc",
        status: "todo",
      },
      {
        id: "ACT-005",
        type: "consultation",
        title: "Consultation pré-opératoire",
        description: "Évaluation et préparation pour intervention de demain",
        time: "16:30",
        location: "Secteur 1 - Bureau consultation",
        team: "Dr. Martin",
        status: "todo",
      },
    ],
    [yesterdayKey]: [
      {
        id: "ACT-006",
        type: "chirurgie",
        title: "Bloc opératoire 3 - Hernioplastie",
        description: "Intervention réussie sans complications",
        time: "09:00",
        location: "Bloc 3",
        team: "Dr. Dupont, Dr. Evans, IDE Sarah",
        status: "done",
      },
      {
        id: "ACT-007",
        type: "consultation",
        title: "Consultation Louis Martin",
        description: "Suivi pré-opératoire avant intervention prévue aujourd'hui",
        time: "10:15",
        location: "Secteur 1 - Bureau consultation",
        team: "Dr. Benali",
        status: "done",
      },
      {
        id: "ACT-008",
        type: "tournee",
        title: "Tournée générale secteurs 1-3",
        description: "Visite de routine des patients hospitalisés",
        time: "14:00",
        location: "Secteurs 1, 2, 3",
        team: "Dr. Martin, IDE Claire, IDE Marc",
        status: "done",
      },
      {
        id: "ACT-009",
        type: "staff",
        title: "Réunion coordination infirmières",
        description: "Discussion des effectifs et planification des rotations",
        time: "17:30",
        location: "Salle réunion infirmeries",
        team: "Chef IDE, Responsables secteurs",
        status: "done",
      },
      {
        id: "ACT-010",
        type: "consultation",
        title: "Consultation urgence - Patient Costa",
        description: "Suivi patient en urgence suite à complication post-opératoire",
        time: "18:45",
        location: "Secteur urgences",
        team: "Dr. Evans, Anesthésiste Lefevre",
        status: "done",
      },
    ],
  };
  return activitySeeds[dateKey] || [];
};

type TaskFormState = {
  title: string;
  details: string;
};

type ActivityFormState = {
  title: string;
  description: string;
  type: ActivityType;
  activityDay: Date;
  time: string;
  location: string;
  team: string;
};

// Mock data for patients
export const mockPatients = [
  { id: "PAT-001", name: "Fatou Diop" },
  { id: "PAT-002", name: "Jean Dupont" },
  { id: "PAT-003", name: "Marie Martin" },
  { id: "PAT-004", name: "Louis Mercier" },
  { id: "PAT-005", name: "Amina Sow" },
  { id: "PAT-006", name: "Pierre Leclerc" },
  { id: "PAT-007", name: "Sophie Renard" },
  { id: "PAT-008", name: "Ahmed Hassan" },
];

// Mock favorite tasks for quick selection
export const mockFavoriteTasks = [
  "Vérifier l'analgésie",
  "Changer le pansement",
  "Évaluer les signes vitaux",
  "Mobilisation passive",
  "Suivi tension artérielle",
  "Contrôle drains",
  "Évaluation cicatrisation",
  "Bilan de sortie",
];

export default function TasksPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const userId = sessionUser?.id ? parseInt(sessionUser.id as string) : null;

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTab, setSelectedTab] = useState<"activites" | "taches">(
    "taches"
  );
  const [activitiesCount, setActivitiesCount] = useState(0);

  // Refs for section components to trigger refreshes
  const activitySectionRef = useRef<any>(null);
  const tasksSectionRef = useRef<any>(null);

  // Task management - simplified since TasksSection handles modals

  // Activity management
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
  const [isDeleteActivityModalOpen, setIsDeleteActivityModalOpen] =
    useState(false);
  const [activityForm, setActivityForm] = useState<ActivityFormState>({
    title: "",
    description: "",
    type: "consultation",
    activityDay: new Date(),
    time: "",
    location: "",
    team: "",
  });
  const [activityToEdit, setActivityToEdit] = useState<ActivityItem | null>(
    null
  );
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(
    null
  );
  const [swipedActivityId, setSwipedActivityId] = useState<string | null>(null);

  // Touch handling for swipe (for activities)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const selectedDateLabel = selectedDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Date change handler
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setSwipedActivityId(null);
  };

  // Task handlers - delegated to TasksSection component
  const handleTaskToggle = async (taskId: string) => {
    try {
      const taskIdNum = parseInt(taskId);
      await toggleTaskCompletion(taskIdNum);
      await tasksSectionRef.current?.refresh();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleTaskAdd = async (formData: { titles: string[]; taskType?: "team" | "private"; patientName?: string }) => {
    const createdTasks: TaskItem[] = [];
    try {
      // Create a task for each title
      for (const title of formData.titles) {
        const result = await createTask({
          title: title.trim(),
          isPrivate: formData.taskType === "private",
        });
        if (result.success && result.data) {
          createdTasks.push(result.data);
        }
      }

      // Refresh tasks list after creation
      await tasksSectionRef.current?.refresh();
      return createdTasks.length > 0 ? createdTasks : null;
    } catch (error) {
      console.error("Error adding tasks:", error);
      return null;
    }
  };

  const handleTaskEdit = async (updatedTask: TaskItem) => {
    try {
      const taskIdNum = parseInt(updatedTask.id);
      await updateTask({
        taskId: taskIdNum,
        title: updatedTask.title,
        isPrivate: updatedTask.taskType === "private",
      });
      await tasksSectionRef.current?.refresh();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const taskIdNum = parseInt(taskId);
      await deleteTask(taskIdNum);
      await tasksSectionRef.current?.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleReloadTasks = async () => {
    await tasksSectionRef.current?.refresh();
  };

  // Activity handlers
  const handleOpenAddActivityModal = () => {
    setActivityForm({
      title: "",
      description: "",
      type: "consultation",
      activityDay: selectedDate,
      time: "",
      location: "",
      team: "",
    });
    setActivityToEdit(null);
    setIsAddActivityModalOpen(true);
  };

  const handleOpenEditActivityModal = (activity: ActivityItem) => {
    setActivityForm({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      activityDay: activity.activityDay ? new Date(activity.activityDay) : selectedDate,
      time: activity.time,
      location: activity.location || "",
      team: activity.team || "",
    });
    setActivityToEdit(activity);
    setIsEditActivityModalOpen(true);
    setSwipedActivityId(null);
  };

  const handleOpenDeleteActivityModal = (activity: ActivityItem) => {
    setActivityToDelete(activity);
    setIsDeleteActivityModalOpen(true);
    setSwipedActivityId(null);
  };

  const handleSaveActivity = async () => {
    if (!activityForm.title.trim()) return;

    try {
      if (activityToEdit) {
        // Edit existing activity
        const result = await updateActivity({
          activityId: parseInt(activityToEdit.id),
          title: activityForm.title,
          type: activityForm.type,
          description: activityForm.description,
          time: activityForm.time,
          location: activityForm.location,
          activityDay: activityForm.activityDay,
        });

        if (result.success) {
          setIsEditActivityModalOpen(false);
          await activitySectionRef.current?.refresh();
        }
      } else {
        // Add new activity
        const result = await createActivity({
          title: activityForm.title,
          type: activityForm.type,
          description: activityForm.description,
          time: activityForm.time,
          location: activityForm.location,
          activityDay: activityForm.activityDay,
        });

        if (result.success) {
          setIsAddActivityModalOpen(false);
          await activitySectionRef.current?.refresh();
        }
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleConfirmDeleteActivity = async () => {
    if (!activityToDelete) return;

    try {
      const result = await deleteActivity(parseInt(activityToDelete.id));
      if (result.success) {
        setIsDeleteActivityModalOpen(false);
        setActivityToDelete(null);
        await activitySectionRef.current?.refresh();
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleToggleActivity = (activityId: string) => {
    // Toggle is handled optimistically in the ActivitySection UI
    // No API call needed - just refresh to sync with latest data
  };

  // Touch handlers for swipe (activities only)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    // Swipe left detection (right to left, negative deltaX) - only if vertical movement is minimal
    if (deltaX < -50 && deltaY < 30) {
      setSwipedActivityId(id);
    } else {
      // Click anywhere else to hide buttons
      setSwipedActivityId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tâches et Activités
          </h1>
          <p className="text-sm text-slate-500">
            Organisez votre journée avec vos consignes et activités planifiées.
          </p>
        </div>
        <SimpleDatePicker date={selectedDate} onDateChange={handleDateChange} />
      </section>

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setSelectedTab("taches")}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition",
              selectedTab === "taches"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            )}
          >
            Tâches
          </button>
          <button
            onClick={() => setSelectedTab("activites")}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition",
              selectedTab === "activites"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            )}
          >
            Activités ({activitiesCount})
          </button>
        </div>

        {/* Tasks Tab */}
        {selectedTab === "taches" && (
          <TasksSection
            ref={tasksSectionRef}
            title="Consignes du jour"
            dateLabel={selectedDateLabel}
            showDateLabel={true}
            showReloadButton={true}
            onReload={handleReloadTasks}
            onTaskToggle={handleTaskToggle}
            onTaskAdd={handleTaskAdd}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            enableSwipeActions={true}
            patients={mockPatients}
            favoriteTasks={mockFavoriteTasks}
            cardClassName="flex min-h-0 flex-1 flex-col border-none bg-white/90 min-h-[500px]"
            headerClassName="flex flex-wrap items-center justify-between gap-3 pb-4"
            contentClassName="flex-1 min-h-0 overflow-hidden pt-0"
          />
        )}

        {/* Activities Tab */}
        {selectedTab === "activites" && (
          <ActivitySection
            ref={activitySectionRef}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            activityForm={activityForm}
            setActivityForm={setActivityForm}
            isAddActivityModalOpen={isAddActivityModalOpen}
            setIsAddActivityModalOpen={setIsAddActivityModalOpen}
            isEditActivityModalOpen={isEditActivityModalOpen}
            setIsEditActivityModalOpen={setIsEditActivityModalOpen}
            isDeleteActivityModalOpen={isDeleteActivityModalOpen}
            setIsDeleteActivityModalOpen={setIsDeleteActivityModalOpen}
            activityToEdit={activityToEdit}
            setActivityToEdit={setActivityToEdit}
            activityToDelete={activityToDelete}
            setActivityToDelete={setActivityToDelete}
            swipedActivityId={swipedActivityId}
            setSwipedActivityId={setSwipedActivityId}
            onAddClick={handleOpenAddActivityModal}
            onToggleClick={handleToggleActivity}
            onEditClick={handleOpenEditActivityModal}
            onDeleteClick={handleOpenDeleteActivityModal}
            onSaveActivity={handleSaveActivity}
            onConfirmDelete={handleConfirmDeleteActivity}
            onActivityUpdate={(activities) => setActivitiesCount(activities?.length || 0)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        )}
      </div>
    </div>
  );
}
