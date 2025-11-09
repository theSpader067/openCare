"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  Activity,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ClipboardList,
  HeartPulse,
  ListChecks,
  MapPin,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  Users,
  UsersRound,
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
import { statsSummary } from "@/data/dashboard/dashboard-stats";
import type { Stat } from "@/data/dashboard/dashboard-stats";
import type { SimplePatient } from "@/data/dashboard/dashboard-patients";
import type { PatientItem } from "@/data/dashboard/dashboard-patients";
import {
  activityTypeMeta,
  patientStatusMeta,
  labStatusMeta,
  type ActivityType,
} from "@/data/dashboard/dashboard-metadata";
import {
  generateTasksForDate,
  getInitialScheduleSeeds,
  type ActivityItem,
  type DayData,
} from "@/data/dashboard/dashboard-schedule";
import { mockFavoriteTasks, mockPatients } from "../tasks/page";
import {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} from "@/lib/api/activities";
import { useSession } from "next-auth/react";

type ActivityStatus = "done" | "todo";

type SectionKey = "activities" | "tasks" | "patients";
type ActivityTabKey = "activites" | "bloc" | "divers";


interface ActivityFormState {
  title: string;
  time: string;
  type: ActivityType;
  activityDay: Date;
  description: string;
  location: string;
  team: string;
}


interface PatientFormState {
  name: string;
  service: string;
  diagnosis: string;
  status: PatientItem["status"];
  labsStatus: PatientItem["labs"]["status"];
  labsNote: string;
}


const activityToTab = (activity: ActivityItem): ActivityTabKey => {
  if (activity.type === "chirurgie") {
    return "bloc";
  }
  if (activity.type === "consultation" || activity.type === "tournee") {
    return "activites";
  }
  return "divers";
};


const createEmptyDay = (): DayData => ({
  activities: [],
  tasks: [],
  patients: [],
});

const createEmptyActivityForm = (): ActivityFormState => ({
  title: "",
  time: "",
  type: "consultation",
  activityDay: new Date(),
  description: "",
  location: "",
  team: "",
});

const createEmptyPatientForm = (): PatientFormState => ({
  name: "",
  service: "",
  diagnosis: "",
  status: "Pré-op",
  labsStatus: "pending",
  labsNote: "",
});

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const removeTrailingDot = (value: string) => value.replace(/\.$/, "");

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseKeyToDate = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const patientStatusOptions: PatientItem["status"][] = [
  "Pré-op",
  "Post-op",
  "Surveillance",
  "Rééducation",
];

const labStatusOptions: PatientItem["labs"]["status"][] = ["pending", "completed", "na"];


export default function DashboardPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const userId = sessionUser?.id ? parseInt(sessionUser.id as string) : null;

  const baseDate = useMemo(() => startOfDay(new Date()), []);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
  );

  const scheduleSeeds = useMemo(() => {
    return getInitialScheduleSeeds(baseDate);
  }, [baseDate]);

  const [scheduleData, setScheduleData] =
    useState<Record<string, DayData>>({} as Record<string,DayData>);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(baseDate));
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [servicePatients, setServicePatients] =
    useState<PatientItem[]>([]);
  const [isServicePatientsLoading, setIsServicePatientsLoading] =
    useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(() =>
    createEmptyActivityForm(),
  );
  const [activityDetail, setActivityDetail] = useState<ActivityItem | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientFormState>(() =>
    createEmptyPatientForm(),
  );
  const [activityTab, setActivityTab] = useState<ActivityTabKey>("activites");
  const [isMobileToolkitOpen, setIsMobileToolkitOpen] = useState(false);
  const [isStatsInteracting, setIsStatsInteracting] = useState(false);

  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const statsInteractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (statsInteractionTimeoutRef.current) {
        clearTimeout(statsInteractionTimeoutRef.current);
        statsInteractionTimeoutRef.current = null;
      }
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!isAddActivityModalOpen) {
      setActivityForm(createEmptyActivityForm());
    }
  }, [isAddActivityModalOpen]);

  useEffect(() => {
    if (!isAddPatientModalOpen) {
      setPatientForm(createEmptyPatientForm());
    }
  }, [isAddPatientModalOpen]);

  const loadActivitiesFromAPI = async () => {
    setIsActivitiesLoading(true);
    try {
      const result = await getActivities();
      if (result.success && result.data) {
        // Filter activities by selected date and populate into scheduleData
        const selectedDateObj = parseKeyToDate(selectedDate);
        const selectedDateStr = formatDateKey(selectedDateObj);

        const filteredActivities = result.data.filter((activity) => {
          if (!activity.activityDay) return false;
          const activityDate = new Date(activity.activityDay);
          const activityDateStr = formatDateKey(activityDate);
          return activityDateStr === selectedDateStr;
        });

        updateDayData(selectedDate, (day) => ({
          ...day,
          activities: filteredActivities,
        }));
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  // Load activities from API on mount
  useEffect(() => {
    if (userId) {
      loadActivitiesFromAPI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Reload activities when selected date changes
  useEffect(() => {
    if (userId) {
      loadActivitiesFromAPI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const selectedDayData = scheduleData? scheduleData[selectedDate] : createEmptyDay();
  const selectedDateObj = useMemo(() => parseKeyToDate(selectedDate), [selectedDate]);
  const selectedDayLabel = useMemo(() =>
    capitalize(
      removeTrailingDot(
        selectedDateObj.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      ),
    ),
  [selectedDateObj]);

  const setLoading = (section: SectionKey, value: boolean) => {
    switch (section) {
      case "activities":
        setIsActivitiesLoading(value);
        break;
      case "tasks":
        setIsTasksLoading(value);
        break;
      case "patients":
        setIsServicePatientsLoading(value);
        break;
      default:
        break;
    }
  };

  const runAsyncUpdate = (
    sections: SectionKey[],
    action: () => void,
    delay = 420,
  ) => {
    sections.forEach((section) => setLoading(section, true));
    const timer = window.setTimeout(() => {
      action();
      sections.forEach((section) => setLoading(section, false));
      timersRef.current = timersRef.current.filter((item) => item !== timer as unknown as ReturnType<typeof setTimeout>);
    }, delay);
    timersRef.current.push(timer as unknown as ReturnType<typeof setTimeout>);
  };

  const ensureDayExists = (dayKey: string) => {
    setScheduleData((prev) => {
      if (prev[dayKey]) {
        return prev;
      }
      const seededTasks = generateTasksForDate(parseKeyToDate(dayKey));
      return {
        ...prev,
        [dayKey]: {
          activities: [],
          tasks: seededTasks,
          patients: [],
        },
      };
    });
  };

  const updateDayData = (
    dayKey: string,
    updater: (day: DayData) => DayData,
  ) => {
    setScheduleData((prev) => {
      const current = prev[dayKey] ?? createEmptyDay();
      return {
        ...prev,
        [dayKey]: updater({
          activities: [...current.activities],
          tasks: [...current.tasks],
          patients: [...current.patients],
        }),
      };
    });
  };

  const handleStatsInteractionStart = () => {
    if (statsInteractionTimeoutRef.current) {
      clearTimeout(statsInteractionTimeoutRef.current);
      statsInteractionTimeoutRef.current = null;
    }
    if (!isStatsInteracting) {
      setIsStatsInteracting(true);
    }
  };

  const handleStatsInteractionEnd = (delay = 1400) => {
    if (statsInteractionTimeoutRef.current) {
      clearTimeout(statsInteractionTimeoutRef.current);
    }
    statsInteractionTimeoutRef.current = window.setTimeout(async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      setIsStatsInteracting(false);
      statsInteractionTimeoutRef.current = null;
    }, delay) as unknown as ReturnType<typeof setTimeout>;
  };

  const handleSelectDate = (date: Date) => {
    const normalized = startOfDay(date);
    const key = formatDateKey(normalized);
    ensureDayExists(key);
    setSelectedDate(key);
    setCalendarMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
    runAsyncUpdate(["activities", "tasks"], () => {
      /* simulation de chargement lors du changement de journée */
    }, 360);
  };

  const handleToggleActivity = (activityId: string) => {
    setScheduleData((prev) => {
      const current = prev[selectedDate] ?? createEmptyDay();
      return {
        ...prev,
        [selectedDate]: {
          ...current,
          activities: current.activities.map((activity) =>
            activity.id === activityId
              ? {
                  ...activity,
                  status: activity.status === "done" ? "todo" : "done",
                }
              : activity,
          ),
        },
      };
    });
  };

  const handleToggleTaskDone = (taskId: string) => {
    updateDayData(selectedDate, (day) => ({
      ...day,
      tasks: day.tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task,
      ),
    }));
  };

  const handleAddActivity = async () => {
    if (!activityForm.title.trim() || !activityForm.time.trim()) {
      return;
    }

    setIsActivitiesLoading(true);
    try {
      const result = await createActivity({
        title: activityForm.title.trim(),
        type: activityForm.type,
        description: activityForm.description.trim() || "Aucun détail supplémentaire pour cette activité.",
        time: activityForm.time,
        location: activityForm.location.trim() || undefined,
        activityDay: activityForm.activityDay,
      });

      if (result.success && result.data) {
        updateDayData(selectedDate, (day) => ({
          ...day,
          activities: [result.data!, ...day.activities],
        }));
        setIsAddActivityModalOpen(false);
        setActivityForm(createEmptyActivityForm());
      }
    } catch (error) {
      console.error("Error creating activity:", error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const handleAddPatient = () => {
    if (!patientForm.name.trim() || !patientForm.diagnosis.trim() || !patientForm.service.trim()) {
      return;
    }

    const newPatient: PatientItem = {
      id: `PAT-${Date.now()}`,
      name: patientForm.name.trim(),
      service: patientForm.service.trim(),
      diagnosis: patientForm.diagnosis.trim(),
      status: patientForm.status,
      labs: {
        status: patientForm.labsStatus,
        note: patientForm.labsNote.trim() || "À préciser",
      },
    };

    runAsyncUpdate(["patients"], () => {
      setServicePatients((prev) => [newPatient, ...prev]);
      setIsAddPatientModalOpen(false);
      setPatientForm(createEmptyPatientForm());
    }, 360);
  };

  const handleReloadTasks = () => {
    setIsTasksLoading(true);
    const timer = window.setTimeout(() => {
      setIsTasksLoading(false);
      timersRef.current = timersRef.current.filter((item) => item !== timer as unknown as ReturnType<typeof setTimeout>);
    }, 2000);
    timersRef.current.push(timer as unknown as ReturnType<typeof setTimeout>);
  };

  const tasks = selectedDayData?.tasks;
  const tasksCount = tasks?.length;
  const completedTasks = tasks?.filter((task) => task.done).length;
  const activityFormIsValid = Boolean(
    activityForm.title.trim() && activityForm.time.trim(),
  );
  const patientFormIsValid = Boolean(
    patientForm.name.trim() &&
      patientForm.diagnosis.trim() &&
      patientForm.service.trim(),
  );
  const statsList = statsSummary;
  const hasStats = statsList.length > 0;
  const marqueeStats = useMemo(
    () => (hasStats ? [...statsList, ...statsList, ...statsList, ...statsList, ...statsList, ...statsList] : []),
    [hasStats, statsList],
  );
  const activityGroups = useMemo(() => {
    const groups: Record<ActivityTabKey, ActivityItem[]> = {
      activites: [],
      bloc: [],
      divers: [],
    };
    selectedDayData?.activities.forEach((activity) => {
      const key = activityToTab(activity);
      groups[key].push(activity);
    });
    return groups;
  }, [selectedDayData?.activities]);
  const activityTabsConfig = useMemo(
    () => [
      {
        key: "activites" as ActivityTabKey,
        label: "Activités",
        count: activityGroups.activites.length,
      },
      {
        key: "bloc" as ActivityTabKey,
        label: "Bloc",
        count: activityGroups.bloc.length,
      },
      {
        key: "divers" as ActivityTabKey,
        label: "Divers",
        count: activityGroups.divers.length,
      },
    ],
    [activityGroups],
  );
  const filteredActivities = activityGroups[activityTab];
  const activeActivityTab =
    activityTabsConfig.find((tab) => tab.key === activityTab) ?? activityTabsConfig[0];

  const renderCalendarCard = (
    cardClassName?: string,
    contentClassName?: string,
  ) => (
    <Card className={cn("border-none bg-white/90", cardClassName)}>
      <CardContent className={cn("pt-4 px-4", contentClassName)}>
        <Calendar
          selected={selectedDateObj}
          onSelect={handleSelectDate}
          month={calendarMonth}
          onMonthChange={(date) =>
            setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
          }
        />
      </CardContent>
    </Card>
  );

  const renderTasksCard = (options?: {
    cardClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
  }) => (
    <TasksSection
      tasks={[]}
      isLoading={isTasksLoading}
      title="Consignes du jour"
      showReloadButton={true}
      onReload={handleReloadTasks}
      onTaskToggle={handleToggleTaskDone}
      onTaskAdd={async (formData) => {
        // Create mock tasks from form data
        const createdTasks = formData.titles.map((title) => ({
          id: `TASK-${Date.now()}-${Math.random()}`,
          title,
          details: "",
          done: false,
          patientName: formData.patientName,
          taskType: formData.taskType || "team",
        }));

        runAsyncUpdate(["tasks"], () => {
          updateDayData(selectedDate, (day) => ({
            ...day,
            tasks: [...createdTasks, ...day.tasks],
          }));
        });

        return createdTasks;
      }}
      onTaskEdit={(updatedTask) => {
        runAsyncUpdate(["tasks"], () => {
          updateDayData(selectedDate, (day) => ({
            ...day,
            tasks: day.tasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task,
            ),
          }));
        });
      }}
      onTaskDelete={(taskId) => {
        runAsyncUpdate(["tasks"], () => {
          updateDayData(selectedDate, (day) => ({
            ...day,
            tasks: day.tasks.filter((item) => item.id !== taskId),
          }));
        });
      }}
      patients={mockPatients}
      favoriteTasks={mockFavoriteTasks}
      cardClassName={cn(
        "flex min-h-0 flex-1 flex-col border-none bg-white/90 min-h-[500px]",
        options?.cardClassName
      )}
      headerClassName={cn(
        "flex flex-wrap items-center justify-between gap-3 pb-4",
        options?.headerClassName
      )}
      contentClassName={cn(
        "flex-1 min-h-0 overflow-hidden pt-0",
        options?.contentClassName
      )}
      enableSwipeActions={true}
    />
  );

  const renderStatCard = (
    stat: Stat,
    options?: { key?: string; className?: string },
  ) => {
    const Icon = stat.icon;
    const trendColor =
      stat.trend === "up"
        ? "text-emerald-600"
        : stat.trend === "down"
        ? "text-rose-600"
        : stat.theme.accent;
    const isEmpty = stat.value === "0" || stat.value.trim() === "";

    return (
      <Card
        key={options?.key ?? stat.label}
        className={cn("border-none", stat.theme.card, options?.className)}
      >
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="space-y-1">
            <CardDescription className="text-xs uppercase tracking-wide text-slate-500">
              {stat.label}
            </CardDescription>
            <CardTitle
              className={cn(
                "text-3xl font-semibold",
                isEmpty ? "text-slate-400" : stat.theme.text,
              )}
            >
              {isEmpty ? "—" : stat.value}
            </CardTitle>
            <p className={cn("text-sm", trendColor)}>
              {isEmpty ? "Pas de données pour cette période" : stat.variation}
            </p>
          </div>
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner",
              stat.theme.icon,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <p
            className={cn(
              "text-sm",
              isEmpty ? "text-slate-400" : "text-slate-600",
            )}
          >
            {isEmpty
              ? ""
              : stat.hint}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-20 lg:pb-0 overflow-x-hidden">
      <section className="shrink-0 hidden lg:flex">
        {!hasStats ? (
          <Card className="border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
            Aucun indicateur disponible pour le moment. Connectez vos flux opérationnels pour activer cette section.
          </Card>
        ) : (
          <div className="relative -mx-4 mt-1 pb-4 sm:-mx-6 sm:px-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />
            <div
              className="no-scrollbar overflow-x-auto pb-1 pl-1 pr-4 snap-x snap-mandatory"
              onPointerDown={handleStatsInteractionStart}
              onPointerUp={() => handleStatsInteractionEnd()}
              onPointerLeave={() => handleStatsInteractionEnd()}
              onPointerCancel={() => handleStatsInteractionEnd()}
              onScroll={() => {
                handleStatsInteractionStart();
                handleStatsInteractionEnd(1200);
              }}
              onWheel={() => {
                handleStatsInteractionStart();
                handleStatsInteractionEnd(1200);
              }}
            >
              <div
                className={cn(
                  "dashboard-marquee-track flex w-max gap-4 pb-0",
                  isStatsInteracting && "dashboard-marquee-track--paused",
                )}
                style={
                  {
                    "--marquee-duration": `${Math.max(
                      statsList.length * 12,
                      40,
                    )}s`,
                  } as CSSProperties
                }
              >
                {marqueeStats.map((stat, index) =>
                  renderStatCard(stat, {
                    key: `${stat.label}-${index}`,
                    className:
                      "min-w-[15rem] max-w-[15rem] snap-start sm:min-w-[18rem] sm:max-w-[18rem]",
                  }),
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 flex-1 min-h-0 lg:w-full">
        <div className="grid h-full min-h-0 grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="hidden h-full min-h-0 flex-col gap-6 xl:flex">
            {renderCalendarCard()}
            {renderTasksCard()}
          </div>

          <Card className="flex h-full min-h-0 flex-col border-none bg-white/90 xl:col-span-2">
            <CardHeader className="flex flex-col gap-4 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Historique des activités</CardTitle>
                  <CardDescription>{selectedDayLabel}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="muted"
                    className="bg-indigo-100 text-indigo-800"
                  >
                    {selectedDayData?.activities.length} activité(s)
                  </Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddActivityModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </div>
             
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
              {isActivitiesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner label="Chargement des activités..." />
                </div>
              ) : selectedDayData?.activities.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="Aucune activité pour cette journée"
                  description="Ajoutez vos consultations, passages au bloc ou tournées pour garder un historique complet."
                  action={
                    <Button variant="outline" onClick={() => setIsAddActivityModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Planifier une activité
                    </Button>
                  }
                />
              ) : filteredActivities.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="Pas d'activité dans cette catégorie"
                  description={`Aucune donnée pour l'onglet « ${activeActivityTab.label} ». Changez de filtre ou planifiez un nouvel élément.`}
                  action={
                    <Button variant="outline" onClick={() => setIsAddActivityModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une activité
                    </Button>
                  }
                />
              ) : (
                <div className="h-full min-h-0 overflow-y-auto pr-1">
                  <ul className="space-y-3">
                    {filteredActivities.map((activity) => {
                      const meta = activityTypeMeta[activity.type as ActivityType];
                      const Icon = meta.icon;
                      const done = activity.status === "done";

                      return (
                        <li key={activity.id}>
                          <div
                            className={cn(
                              "flex flex-col gap-4 rounded-2xl border bg-white/80 p-4 shadow-sm transition sm:flex-row sm:items-start sm:justify-between",
                              done
                                ? "border-emerald-200 bg-emerald-50/80 shadow-emerald-100/60"
                                : "border-transparent hover:-translate-y-[1px] hover:border-slate-200",
                            )}
                          >
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                              <span
                                className={cn(
                                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-inner shadow-white/60",
                                  meta.badgeClass,
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="flex flex-1 flex-col gap-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-1">
                                    <h3
                                      className={cn(
                                        "text-sm font-semibold text-[#1f184f]",
                                        done && "line-through opacity-70",
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
                            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                              <button
                                type="button"
                                onClick={() => handleToggleActivity(activity.id)}
                                className={cn(
                                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
                                  done
                                    ? "border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
                                )}
                              >
                                {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                {done ? "Terminé" : "À faire"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setActivityDetail(activity)}
                                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                              >
                                <Pencil className="h-4 w-4" />
                                Détails
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col border-none bg-white/90 hidden xl:block h-[100%]">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div>
                <CardTitle>Patients du Service</CardTitle>
                
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
              {isServicePatientsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner label="Chargement des patients..." />
                </div>
              ) : servicePatients.length === 0 ? (
                <EmptyState
                  icon={UsersRound}
                  title="Aucun patient attribué"
                  description="Les patients apparaîtront ici dès qu&apos;ils seront programmés pour cette journée."
                  action={
                    <Button variant="outline" onClick={() => setIsAddPatientModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un patient
                    </Button>
                  }
                />
              ) : (
                <div className="h-full min-h-0 overflow-y-auto overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Patient
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Diagnostic
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {servicePatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">
                                {patient.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {patient.diagnosis}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {patientStatusMeta[patient.status].label}
                            </span>
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
      </div>

      {!isMobileToolkitOpen ? (
        <button
          type="button"
          onClick={() => setIsMobileToolkitOpen(true)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-200/60 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 xl:hidden"
        >
          <ListChecks className="h-4 w-4" />
          Planning & consignes
        </button>
      ) : null}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 xl:hidden",
          isMobileToolkitOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMobileToolkitOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-x-4 bottom-4 top-20 z-50 flex flex-col rounded-3xl border border-violet-200/60 bg-white/95 shadow-2xl shadow-indigo-200/60 transition-transform duration-300 xl:hidden",
          isMobileToolkitOpen
            ? "translate-y-0"
            : "pointer-events-none translate-y-[120%]",
        )}
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-violet-100/70 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#352f72]">
            <ListChecks className="h-4 w-4 text-indigo-500" />
            Vos outils rapides
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            onClick={() => setIsMobileToolkitOpen(false)}
            aria-label="Fermer le panneau"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {renderCalendarCard(
              "border border-slate-200/70 bg-white/95 shadow-md shadow-indigo-100/50",
              "pt-0",
            )}
            {renderTasksCard({
              cardClassName:
                "border border-slate-200/70 bg-white/95 shadow-md shadow-indigo-100/50 min-h-0",
              contentClassName: "max-h-72 overflow-y-auto",
            })}
          </div>
        </div>
      </div>

      <Modal
        open={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        title="Ajouter une activité"
        description="Complétez les informations pour enrichir l&apos;historique de la journée."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddActivityModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddActivity}
              disabled={!activityFormIsValid}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Titre de l&apos;activité
            </label>
            <input
              value={activityForm.title}
              onChange={(event) =>
                setActivityForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              placeholder="Ex. Bloc opératoire - Appendicectomie"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Jour de l&apos;activité</label>
              <input
                type="date"
                value={activityForm.activityDay.toISOString().split('T')[0]}
                onChange={(event) =>
                  setActivityForm((prev) => ({
                    ...prev,
                    activityDay: new Date(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Horaire</label>
              <input
                type="time"
                value={activityForm.time}
                onChange={(event) =>
                  setActivityForm((prev) => ({
                    ...prev,
                    time: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">Type</label>
            <select
              value={activityForm.type}
              onChange={(event) =>
                setActivityForm((prev) => ({
                  ...prev,
                  type: event.target.value as ActivityType,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            >
              <option value="consultation">Consultation</option>
              <option value="chirurgie">Bloc opératoire</option>
              <option value="staff">Staff / réunion</option>
              <option value="tournee">Tournée</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">Description</label>
            <textarea
              rows={3}
              value={activityForm.description}
              onChange={(event) =>
                setActivityForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Détaillez le contenu de l&apos;activité, les points à surveiller, etc."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Lieu / service</label>
              <input
                value={activityForm.location}
                onChange={(event) =>
                  setActivityForm((prev) => ({
                    ...prev,
                    location: event.target.value,
                  }))
                }
                placeholder="Ex. Bloc 5, Salle de conférence 2"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Équipe / participants</label>
              <input
                value={activityForm.team}
                onChange={(event) =>
                  setActivityForm((prev) => ({
                    ...prev,
                    team: event.target.value,
                  }))
                }
                placeholder="Ex. Dr. Benali, IDE Claire"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>


      <Modal
        open={Boolean(activityDetail)}
        onClose={() => setActivityDetail(null)}
        title={activityDetail?.title}
        description={activityDetail?.time ? `Horaire : ${activityDetail.time}` : undefined}
        size="sm"
        footer={
          <Button variant="ghost" onClick={() => setActivityDetail(null)}>
            Fermer
          </Button>
        }
      >
        {activityDetail ? (
          <div className="space-y-4 text-sm text-[#5f5aa5]">
            <Badge
              variant="muted"
              className={cn(
                "bg-white/70",
                activityTypeMeta[activityDetail.type as ActivityType].badgeClass,
              )}
            >
              {activityTypeMeta[activityDetail.type as ActivityType].label}
            </Badge>
            <p className="leading-relaxed">{activityDetail.description}</p>
            {activityDetail.location ? (
              <p className="flex items-center gap-2 text-xs text-[#4338ca]">
                <MapPin className="h-4 w-4" />
                {activityDetail.location}
              </p>
            ) : null}
            {activityDetail.team ? (
              <p className="flex items-center gap-2 text-xs text-[#4338ca]">
                <ListChecks className="h-4 w-4" />
                {activityDetail.team}
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        title="Ajouter un patient"
        description="Renseignez les informations principales pour planifier le parcours du patient."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddPatientModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddPatient}
              disabled={!patientFormIsValid}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">Nom complet</label>
            <input
              value={patientForm.name}
              onChange={(event) =>
                setPatientForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder="Ex. Fatou Diop"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Service</label>
              <input
                value={patientForm.service}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    service: event.target.value,
                  }))
                }
                placeholder="Ex. Chirurgie digestive"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Diagnostic</label>
              <input
                value={patientForm.diagnosis}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    diagnosis: event.target.value,
                  }))
                }
                placeholder="Ex. Colectomie laparoscopique · J+7"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Statut</label>
              <select
                value={patientForm.status}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    status: event.target.value as PatientItem["status"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              >
                {patientStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {patientStatusMeta[option].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Statut laboratoire</label>
              <select
                value={patientForm.labsStatus}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    labsStatus: event.target.value as PatientItem["labs"]["status"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              >
                {labStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {labStatusMeta[option].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">Statut laboratoire</label>
              <select
                value={patientForm.labsStatus}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    labsStatus: event.target.value as PatientItem["labs"]["status"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              >
                {labStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {labStatusMeta[option].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Note laboratoire / commentaire
            </label>
            <input
              value={patientForm.labsNote}
              onChange={(event) =>
                setPatientForm((prev) => ({
                  ...prev,
                  labsNote: event.target.value,
                }))
              }
              placeholder="Ex. CRP 12 mg/L - stable"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
