"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
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
import type { TaskItem } from "@/types/tasks";

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
  time: string;
  location: string;
  team: string;
};

// Mock data for patients
const mockPatients = [
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
const mockFavoriteTasks = [
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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTab, setSelectedTab] = useState<"activites" | "taches">(
    "taches"
  );
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);

  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    generateTasksForDate(new Date())
  );
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    generateActivitiesForDate(new Date())
  );

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

  // Activity stats
  const completedActivities = activities.filter(
    (act) => act.status === "done"
  ).length;
  const activitiesCount = activities.length;

  const selectedDateLabel = selectedDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Date change handler
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    const newTasks = generateTasksForDate(newDate);
    const newActivities = generateActivitiesForDate(newDate);
    setTasks(newTasks);
    setActivities(newActivities);
    setSwipedActivityId(null);
  };

  // Task handlers - delegated to TasksSection component
  const handleTaskToggle = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const handleTaskAdd = (newTask: TaskItem) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleTaskEdit = (updatedTask: TaskItem) => {
    setTasks(
      tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleReloadTasks = () => {
    setIsTasksLoading(true);
    setTimeout(() => {
      setIsTasksLoading(false);
    }, 2000);
  };

  // Activity handlers
  const handleOpenAddActivityModal = () => {
    setActivityForm({
      title: "",
      description: "",
      type: "consultation",
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

  const handleSaveActivity = () => {
    if (!activityForm.title.trim()) return;

    if (activityToEdit) {
      // Edit existing activity
      setActivities(
        activities.map((a) =>
          a.id === activityToEdit.id
            ? {
                ...a,
                title: activityForm.title,
                description: activityForm.description,
                type: activityForm.type,
                time: activityForm.time,
                location: activityForm.location,
                team: activityForm.team,
              }
            : a
        )
      );
      setIsEditActivityModalOpen(false);
    } else {
      // Add new activity
      const newActivity: ActivityItem = {
        id: `ACT-${Date.now()}`,
        title: activityForm.title,
        description: activityForm.description,
        type: activityForm.type,
        time: activityForm.time,
        location: activityForm.location,
        team: activityForm.team,
        status: "todo",
      };
      setActivities([...activities, newActivity]);
      setIsAddActivityModalOpen(false);
    }
  };

  const handleConfirmDeleteActivity = () => {
    if (activityToDelete) {
      setActivities(activities.filter((a) => a.id !== activityToDelete.id));
      setIsDeleteActivityModalOpen(false);
      setActivityToDelete(null);
    }
  };

  const handleToggleActivity = (activityId: string) => {
    setActivities(
      activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              status: a.status === "done" ? "todo" : "done",
            }
          : a
      )
    );
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
            Tâches ({tasks.length})
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
            Activités ({activities.length})
          </button>
        </div>

        {/* Tasks Tab */}
        {selectedTab === "taches" && (
          <TasksSection
            tasks={tasks}
            isLoading={isTasksLoading}
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
          <Card className="flex min-h-0 flex-1 flex-col border-none bg-white/90">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div>
                <CardTitle>Historique des activités</CardTitle>
                <CardDescription>{selectedDateLabel}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted" className="bg-indigo-100 text-indigo-800">
                  {activitiesCount} activité(s)
                </Badge>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0"
                  onClick={handleOpenAddActivityModal}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
              {activities.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="Aucune activité pour cette journée"
                  description="Ajoutez vos consultations, passages au bloc ou tournées pour garder un historique complet."
                  action={
                    <Button
                      variant="primary"
                      onClick={handleOpenAddActivityModal}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une activité
                    </Button>
                  }
                />
              ) : (
                <div className="h-full min-h-0 overflow-y-auto pr-1">
                  <ul className="space-y-3">
                    {activities.map((activity) => {
                      const meta = activityTypeMeta[activity.type];
                      const Icon = meta.icon;
                      const done = activity.status === "done";

                      return (
                        <li
                          key={activity.id}
                          className="relative"
                          onTouchStart={handleTouchStart}
                          onTouchEnd={(e) =>
                            handleTouchEnd(e, activity.id)
                          }
                        >
                          <div
                            className={cn(
                              "flex flex-col gap-4 rounded-2xl border bg-white/80 p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between transition-transform duration-300 ease-out",
                              done
                                ? "border-emerald-200 bg-emerald-50/80"
                                : "border-transparent hover:-translate-y-[1px] hover:border-slate-200"
                            )}
                            style={{
                              transform: swipedActivityId === activity.id ? "translateX(-96px)" : "translateX(0)",
                            }}
                          >
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                              <button
                                onClick={() =>
                                  handleToggleActivity(activity.id)
                                }
                                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition hover:opacity-80"
                                type="button"
                              >
                                <span
                                  className={cn(
                                    "flex h-full w-full items-center justify-center rounded-2xl shadow-inner",
                                    meta.badgeClass
                                  )}
                                >
                                  <Icon className="h-5 w-5" />
                                </span>
                              </button>
                              <div className="flex flex-1 flex-col gap-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-1">
                                    <h3
                                      className={cn(
                                        "text-sm font-semibold text-[#1f184f]",
                                        done && "line-through opacity-70"
                                      )}
                                    >
                                      {activity.title}
                                    </h3>
                                    <p className="text-xs text-[#5f5aa5]">
                                      {activity.description}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="muted"
                                    className="self-start bg-[#f1f0ff] text-[#4338ca]"
                                  >
                                    {activity.time}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6f66c4]">
                                  {activity.location ? (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {activity.location}
                                    </span>
                                  ) : null}
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    {meta.label}
                                  </span>
                                  {activity.team ? (
                                    <span className="flex items-center gap-1">
                                      <ListChecks className="h-3.5 w-3.5" />
                                      {activity.team}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Swipe action buttons */}
                          <div
                            className={cn(
                              "absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 transition-all duration-300 ease-out",
                              swipedActivityId === activity.id
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            )}
                          >
                            <button
                              onClick={() =>
                                handleOpenEditActivityModal(activity)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md"
                              type="button"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleOpenDeleteActivityModal(activity)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition shadow-md"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Modals */}
      <Modal
        open={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        title="Ajouter une activité"
        description="Enregistrez une consultation, une opération ou une réunion."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsAddActivityModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveActivity}
              disabled={!activityForm.title.trim()}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Titre
            </label>
            <input
              value={activityForm.title}
              onChange={(e) =>
                setActivityForm({ ...activityForm, title: e.target.value })
              }
              placeholder="Ex. Consultation Fatou Diop"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Description
            </label>
            <textarea
              rows={2}
              value={activityForm.description}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  description: e.target.value,
                })
              }
              placeholder="Détails de l'activité"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Type
              </label>
              <select
                value={activityForm.type}
                onChange={(e) =>
                  setActivityForm({
                    ...activityForm,
                    type: e.target.value as ActivityType,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              >
                <option value="consultation">Consultation</option>
                <option value="chirurgie">Bloc opératoire</option>
                <option value="staff">Staff / réunion</option>
                <option value="tournee">Tournée</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Heure
              </label>
              <input
                type="time"
                value={activityForm.time}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, time: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Lieu
              </label>
              <input
                value={activityForm.location}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, location: e.target.value })
                }
                placeholder="Ex. Bloc 5, Secteur 3"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Équipe
              </label>
              <input
                value={activityForm.team}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, team: e.target.value })
                }
                placeholder="Ex. Dr. Benali, IDE Claire"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isEditActivityModalOpen}
        onClose={() => setIsEditActivityModalOpen(false)}
        title="Modifier l'activité"
        description="Mettez à jour les informations."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsEditActivityModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveActivity}
              disabled={!activityForm.title.trim()}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Titre
            </label>
            <input
              value={activityForm.title}
              onChange={(e) =>
                setActivityForm({ ...activityForm, title: e.target.value })
              }
              placeholder="Ex. Consultation Fatou Diop"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Description
            </label>
            <textarea
              rows={2}
              value={activityForm.description}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  description: e.target.value,
                })
              }
              placeholder="Détails de l'activité"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Type
              </label>
              <select
                value={activityForm.type}
                onChange={(e) =>
                  setActivityForm({
                    ...activityForm,
                    type: e.target.value as ActivityType,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              >
                <option value="consultation">Consultation</option>
                <option value="chirurgie">Bloc opératoire</option>
                <option value="staff">Staff / réunion</option>
                <option value="tournee">Tournée</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Heure
              </label>
              <input
                type="time"
                value={activityForm.time}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, time: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Lieu
              </label>
              <input
                value={activityForm.location}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, location: e.target.value })
                }
                placeholder="Ex. Bloc 5, Secteur 3"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">
                Équipe
              </label>
              <input
                value={activityForm.team}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, team: e.target.value })
                }
                placeholder="Ex. Dr. Benali, IDE Claire"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isDeleteActivityModalOpen}
        onClose={() => setIsDeleteActivityModalOpen(false)}
        title="Supprimer l'activité ?"
        description="Cette action retirera l'activité de votre liste."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteActivityModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300"
              onClick={handleConfirmDeleteActivity}
            >
              Supprimer
            </Button>
          </>
        }
      >
        {activityToDelete ? (
          <p className="text-sm text-[#5f5aa5]">
            Confirmez-vous la suppression de l'activité « {activityToDelete.title} » ?
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
