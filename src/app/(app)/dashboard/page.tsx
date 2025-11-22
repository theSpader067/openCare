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
import { ActivitySection } from "@/components/activities/ActivitySection";
import type { TaskItem } from "@/types/tasks";
import { statsSummaryConfig } from "@/data/dashboard/dashboard-stats";
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
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from "@/lib/api/tasks";
import { getPatients } from "@/lib/api/patients";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOpenPanel } from '@openpanel/nextjs';


type ActivityStatus = "done" | "todo";

type SectionKey = "activities" | "tasks" | "patients";


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

  const op = useOpenPanel();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const userId = sessionUser?.id ? parseInt(sessionUser.id as string) : null;
  const { t, language } = useLanguage();

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

  // Ref for ActivitySection to trigger refreshes
  const activitySectionRef = useRef<any>(null);

  // Ref for TasksSection to trigger refreshes
  const tasksSectionRef = useRef<any>(null);
  const [servicePatients, setServicePatients] =
    useState<PatientItem[]>([]);
  const [isServicePatientsLoading, setIsServicePatientsLoading] =
    useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
  const [isDeleteActivityModalOpen, setIsDeleteActivityModalOpen] = useState(false);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(() =>
    createEmptyActivityForm(),
  );
  const [activityToEdit, setActivityToEdit] = useState<ActivityItem | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null);
  const [swipedActivityId, setSwipedActivityId] = useState<string | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientFormState>(() =>
    createEmptyPatientForm(),
  );
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

      op.track('my_event', { foo: 'bar' })
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

  // Helper function to map API status to dashboard status
  const mapPatientStatus = (apiStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      "Hospitalisé": "Post-op",
      "Consultation": "Surveillance",
      "Suivi": "Surveillance",
    };
    return statusMap[apiStatus] || "Surveillance";
  };

  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      setIsServicePatientsLoading(true);
      try {
        const result = await getPatients();
        if (result.success && result.data) {
          // Transform API patient data to PatientItem format
          const transformedPatients: PatientItem[] = result.data.map((patient: any) => ({
            id: String(patient.id),
            name: patient.name,
            service: patient.service || "",
            diagnosis: patient.diagnosis?.label || "",
            // Map API status to PatientItem status values
            status: mapPatientStatus(patient.status) as "Pré-op" | "Post-op" | "Surveillance" | "Rééducation",
            labs: {
              status: "na" as const,
              note: "",
            },
          }));
          setServicePatients(transformedPatients);
        }
      } catch (error) {
        console.error("Error loading patients:", error);
        setServicePatients([]);
      } finally {
        setIsServicePatientsLoading(false);
      }
    };

    loadPatients();
  }, []);

  const selectedDayData = scheduleData? scheduleData[selectedDate] : createEmptyDay();
  const selectedDateObj = useMemo(() => parseKeyToDate(selectedDate), [selectedDate]);
  const selectedDayLabel = useMemo(() =>
    capitalize(
      removeTrailingDot(
        selectedDateObj.toLocaleDateString(language === 'fr' ? "fr-FR" : "en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      ),
    ),
  [selectedDateObj, language]);

  const setLoading = (section: SectionKey, value: boolean) => {
    switch (section) {
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
    // Activities are now handled by ActivitySection component
    runAsyncUpdate(["tasks"], () => {
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

  const handleToggleTaskDone = async (taskId: string) => {
    try {
      const taskIdNum = parseInt(taskId);
      await toggleTaskCompletion(taskIdNum);
      await tasksSectionRef.current?.refresh();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleTaskAdd = async (formData: { titles: string[]; taskType?: "team" | "private"; patientId?: string | number; patientName?: string; patientAge?: string; patientHistory?: string }) => {
    const createdTasks: TaskItem[] = [];
    try {
      // Create a task for each title
      for (const title of formData.titles) {
        const result = await createTask({
          title: title.trim(),
          isPrivate: formData.taskType === "private",
          patientId: formData.patientId,
          patientName: formData.patientName,
          patientAge: formData.patientAge,
          patientHistory: formData.patientHistory,
        });
        if (result.success && result.data) {
          createdTasks.push(result.data);
        }
      }

      // Add newly created tasks directly to the UI without reloading
      if (createdTasks.length > 0) {
        tasksSectionRef.current?.addTasks(createdTasks);
      }
      return createdTasks.length > 0 ? createdTasks : null;
    } catch (error) {
      console.error("Error adding tasks:", error);
      return null;
    }
  };

  const handleTaskEdit = async (updatedTask: TaskItem) => {
    try {
      const taskIdNum = parseInt(updatedTask.id);
      const result = await updateTask({
        taskId: taskIdNum,
        title: updatedTask.title,
        isPrivate: updatedTask.taskType === "private",
        patientId: updatedTask.patientId,
        patientName: updatedTask.patientName,
        patientAge: updatedTask.patientAge,
        patientHistory: updatedTask.patientHistory,
      });

      // Refresh tasks to ensure UI is in sync with backend
      if (result.success) {
        await tasksSectionRef.current?.refresh();
      } else {
        console.error("Failed to update task:", result.error);
      }
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

  const handleAddActivity = async () => {
    if (!activityForm.title.trim()) {
      return;
    }

    try {
      const result = await createActivity({
        title: activityForm.title.trim(),
        type: activityForm.type,
        description: activityForm.description.trim() || "Aucun détail supplémentaire pour cette activité.",
        time: activityForm.time,
        location: activityForm.location.trim() || undefined,
        activityDay: activityForm.activityDay,
        team: activityForm.team.trim() || undefined,
      });

      if (result.success) {
        setIsAddActivityModalOpen(false);
        setActivityForm(createEmptyActivityForm());
        await activitySectionRef.current?.refresh();
      }
    } catch (error) {
      console.error("Error creating activity:", error);
    }
  };

  const handleEditActivity = (activity: ActivityItem) => {
    setActivityToEdit(activity);
    const activityData = activity as any;
    setActivityForm({
      title: activity.title,
      time: activity.time,
      type: activity.type as ActivityType,
      activityDay: activityData.activityDay instanceof Date ? activityData.activityDay : new Date(activityData.activityDay || selectedDateObj),
      description: activity.description,
      location: activity.location || "",
      team: activity.team || "",
    });
    setIsEditActivityModalOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!activityForm.title.trim()) {
      return;
    }

    try {
      if (activityToEdit) {
        // Update existing activity
        const result = await updateActivity({
          activityId: parseInt(activityToEdit.id),
          title: activityForm.title.trim(),
          type: activityForm.type,
          description: activityForm.description.trim() || "Aucun détail supplémentaire pour cette activité.",
          time: activityForm.time,
          location: activityForm.location.trim() || undefined,
          activityDay: activityForm.activityDay,
          team: activityForm.team.trim() || undefined,
        });

        if (result.success) {
          setIsEditActivityModalOpen(false);
          setActivityToEdit(null);
          setActivityForm(createEmptyActivityForm());
          await activitySectionRef.current?.refresh();
        }
      } else {
        // Create new activity
        await handleAddActivity();
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleDeleteClick = (activity: ActivityItem) => {
    setActivityToDelete(activity);
    setIsDeleteActivityModalOpen(true);
  };

  const handleConfirmDelete = async () => {
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
        note: patientForm.labsNote.trim() || t('dashboard.dashboardPage.toSpecify'),
      },
    };

    runAsyncUpdate(["patients"], () => {
      setServicePatients((prev) => [newPatient, ...prev]);
      setIsAddPatientModalOpen(false);
      setPatientForm(createEmptyPatientForm());
    }, 360);
  };

  const tasks = selectedDayData?.tasks;
  const tasksCount = tasks?.length;
  const completedTasks = tasks?.filter((task) => task.done).length;
  const activityFormIsValid = Boolean(
    activityForm.title.trim(),
  );
  const patientFormIsValid = Boolean(
    patientForm.name.trim() &&
      patientForm.diagnosis.trim() &&
      patientForm.service.trim(),
  );
  const statsList = useMemo(() => {
    return statsSummaryConfig.map((config: any) => ({
      label: t(`${config.labelKey}`),
      value: "",
      variation: "",
      trend: "neutral" as const,
      icon: config.icon,
      hint: t(`${config.hintKey}`),
      theme: config.theme,
    }));
  }, [t]);
  const hasStats = statsList.length > 0;
  const marqueeStats = useMemo(
    () => (hasStats ? [...statsList, ...statsList, ...statsList, ...statsList, ...statsList, ...statsList] : []),
    [hasStats, statsList],
  );

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
            {t('dashboard.dashboardPage.noDataForPeriod')}
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
            <TasksSection
              ref={tasksSectionRef}
              title={t('dashboard.dashboardPage.dailyInstructions')}
              showReloadButton={true}
              onTaskToggle={handleToggleTaskDone}
              onTaskAdd={handleTaskAdd}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              patients={mockPatients}
              favoriteTasks={mockFavoriteTasks}
              cardClassName="flex min-h-0 flex-1 flex-col border-none bg-white/90 min-h-[500px]"
              headerClassName="flex flex-wrap items-center justify-between gap-3 pb-4"
              contentClassName="flex-1 min-h-0 overflow-hidden pt-0"
              enableSwipeActions={true}
            />
          </div>

          <div className="flex xl:col-span-2">
          <ActivitySection
            ref={activitySectionRef}
            selectedDate={selectedDateObj}
            selectedDateLabel={selectedDayLabel}
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
            onAddClick={() => {
              setActivityForm(createEmptyActivityForm());
              setActivityToEdit(null);
              setIsAddActivityModalOpen(true);
            }}
            onToggleClick={handleToggleActivity}
            onEditClick={handleEditActivity}
            onDeleteClick={handleDeleteClick}
            onSaveActivity={handleSaveActivity}
            onConfirmDelete={handleConfirmDelete}
            onActivityUpdate={(activities) => {
              // Update scheduleData with the latest activities
              if (activities.length > 0) {
                updateDayData(selectedDate, (day) => ({
                  ...day,
                  activities: activities,
                }));
              }
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (touch) {
                (e.currentTarget as any).__touchStart = touch.clientX;
              }
            }}
            onTouchEnd={(e, id) => {
              const touch = e.changedTouches[0];
              const start = (e.currentTarget as any).__touchStart || 0;
              const distance = start - touch.clientX;
              if (distance > 50) {
                setSwipedActivityId(id);
              } else if (distance < -50) {
                setSwipedActivityId(null);
              }
            }}
          />
          </div>

          <Card className="flex h-full flex-col border-none bg-white/90 hidden xl:block h-[100%]">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div>
                <CardTitle>{t('dashboard.dashboardPage.servicePatients')}</CardTitle>

              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
              {isServicePatientsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner label={t('dashboard.dashboardPage.loadingPatients')} />
                </div>
              ) : servicePatients.length === 0 ? (
                <EmptyState
                  icon={UsersRound}
                  title={t('dashboard.dashboardPage.noPatients')}
                  description={t('dashboard.dashboardPage.patientsWillAppear')}
                  action={
                    <></>
                  }
                />
              ) : (
                <div className="h-full min-h-0 overflow-y-auto overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-500">
                          {t('dashboard.dashboardPage.patientTablePatient')}
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-500">
                          {t('dashboard.dashboardPage.patientTableDiagnosis')}
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-500">
                          {t('dashboard.dashboardPage.patientTableStatus')}
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
          {t('dashboard.dashboardPage.mobileToolkitButton')}
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
            {t('dashboard.dashboardPage.quickTools')}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            onClick={() => setIsMobileToolkitOpen(false)}
            aria-label={t('dashboard.dashboardPage.closePanel')}
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
            <TasksSection
              ref={tasksSectionRef}
              title={t('dashboard.dashboardPage.dailyInstructions')}
              showReloadButton={true}
              onTaskToggle={handleToggleTaskDone}
              onTaskAdd={handleTaskAdd}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              patients={mockPatients}
              favoriteTasks={mockFavoriteTasks}
              cardClassName="border border-slate-200/70 bg-white/95 shadow-md shadow-indigo-100/50 min-h-0"
              headerClassName="flex flex-wrap items-center justify-between gap-3 pb-4"
              contentClassName="max-h-72 overflow-y-auto"
              enableSwipeActions={true}
            />
          </div>
        </div>
      </div>


      <Modal
        open={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        title={t('dashboard.dashboardPage.addPatient')}
        description={t('dashboard.dashboardPage.patientFormDescription')}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddPatientModalOpen(false)}>
              {t('dashboard.dashboardPage.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddPatient}
              disabled={!patientFormIsValid}
            >
              {t('dashboard.dashboardPage.save')}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">{t('dashboard.dashboardPage.fullName')}</label>
            <input
              value={patientForm.name}
              onChange={(event) =>
                setPatientForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder={t('dashboard.dashboardPage.fullNamePlaceholder')}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">{t('dashboard.dashboardPage.service')}</label>
              <input
                value={patientForm.service}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    service: event.target.value,
                  }))
                }
                placeholder={t('dashboard.dashboardPage.servicePlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">{t('dashboard.dashboardPage.diagnosis')}</label>
              <input
                value={patientForm.diagnosis}
                onChange={(event) =>
                  setPatientForm((prev) => ({
                    ...prev,
                    diagnosis: event.target.value,
                  }))
                }
                placeholder={t('dashboard.dashboardPage.diagnosisPlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#1f184f]">{t('dashboard.dashboardPage.status')}</label>
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
              <label className="text-sm font-semibold text-[#1f184f]">{t('dashboard.dashboardPage.labStatus')}</label>
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
              <label className="text-sm font-semibold text-[#1f184f]">{t('dashboard.dashboardPage.labStatus')}</label>
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
              {t('dashboard.dashboardPage.labNote')}
            </label>
            <input
              value={patientForm.labsNote}
              onChange={(event) =>
                setPatientForm((prev) => ({
                  ...prev,
                  labsNote: event.target.value,
                }))
              }
              placeholder={t('dashboard.dashboardPage.labNotePlaceholder')}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
