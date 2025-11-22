"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { getTasks } from "@/lib/api/tasks";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Lock,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  Users,
  User as UserIcon,
  X,
  Star,
  MoreVertical,
  Search,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { TaskItem, TaskFormState } from "@/types/tasks";
import { PatientCreate, type PatientCreateRef } from "@/components/document/PatientCreate";
import { useLanguage } from "@/contexts/LanguageContext";

interface Patient {
  id: string | number;
  name?: string;
  fullName?: string;
}

interface TaskFormData {
  titles: string[];
  taskType?: "team" | "private";
  patientId?: string;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
}

export interface TasksSectionRef {
  refresh: () => Promise<void>;
  addTasks: (newTasks: TaskItem[]) => void;
}

interface TasksSectionProps {
  title?: string;
  dateLabel?: string;
  showDateLabel?: boolean;

  // Callbacks (can be async)
  onTaskToggle: (taskId: string) => void | Promise<void>;
  onTaskAdd: (formData: TaskFormData) => Promise<TaskItem[] | null>;
  onTaskEdit: (task: TaskItem) => void | Promise<void>;
  onTaskDelete: (taskId: string) => void | Promise<void>;

  // Optional features
  showReloadButton?: boolean;

  // Patient and tasks support
  patients?: Patient[];
  favoriteTasks?: string[];
  onFavoriteTasksChange?: (tasks: string[]) => void;

  // Swipe actions support
  enableSwipeActions?: boolean;

  // Styling
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}


export const TasksSection = forwardRef<TasksSectionRef, TasksSectionProps>(
  function TasksSection({
    title,
    dateLabel,
    showDateLabel = false,
    onTaskToggle,
    onTaskAdd,
    onTaskEdit,
    onTaskDelete,
    showReloadButton = false,
    patients = [],
    favoriteTasks = [],
    onFavoriteTasksChange,
    enableSwipeActions = false,
    cardClassName,
    headerClassName,
    contentClassName,
  }: TasksSectionProps, ref) {
    const { t } = useLanguage();
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [patientSearch,setPatientSearch] = useState('');
    const [patientMode,setPatientMode] = useState('select');
    const [newPatientForm,setNewPatientForm] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
    const [taskForm, setTaskForm] = useState<TaskFormState>({
      titles: [""],
      patientId: undefined,
      patientName: "",
      patientAge: "",
      patientHistory: "",
      taskType: "team",
    });
    const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
    const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
    const [isAddingFavoriteTask, setIsAddingFavoriteTask] = useState(false);
    const [newFavoriteTask, setNewFavoriteTask] = useState("");
    const [localFavoriteTasks, setLocalFavoriteTasks] = useState(favoriteTasks);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Refs for PatientCreate in add and edit modals
    const patientCreateAddRef = useRef<PatientCreateRef>(null);
    const patientCreateEditRef = useRef<PatientCreateRef>(null);

    // Fetch tasks on mount
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const result = await getTasks();
        if (result.success && result.data) {
          setTasks(result.data);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Expose refresh and addTasks methods to parent components
    useImperativeHandle(ref, () => ({
      refresh: loadTasks,
      addTasks: (newTasks: TaskItem[]) => {
        setTasks((prevTasks) => [...newTasks, ...prevTasks]);
      },
    }), []);

    // Load tasks on mount
    useEffect(() => {
      loadTasks();
    }, []);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const completedTasks = tasks?.filter((task) => task.done).length;
  const tasksCount = tasks?.length;

  // Task handlers
  const handleOpenAddTaskModal = () => {
    setTaskForm({
      titles: [""],
      patientId: undefined,
      patientName: "",
      patientAge: "",
      patientHistory: "",
      taskType: "team",
    });
    setTaskToEdit(null);
    setPatientMode("select");
    setPatientSearch("");
    setNewPatientForm({ fullName: "" });
    setIsAddingFavoriteTask(false);
    setNewFavoriteTask("");
    setIsAddTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: TaskItem) => {
    setTaskForm({
      titles: [task.title],
      patientId: task.patientId?.toString(),
      patientName: task.patientName,
      patientAge: task.patientAge,
      patientHistory: task.patientHistory,
      taskType: task.taskType,
    });
    setTaskToEdit(task);
    setIsEditTaskModalOpen(true);
    setSwipedTaskId(null);
  };

  const handleOpenDeleteTaskModal = (task: TaskItem) => {
    setTaskToDelete(task);
    setIsDeleteTaskModalOpen(true);
    setSwipedTaskId(null);
  };

  const handleSaveTask = async () => {
    // Filter out empty titles
    const validTitles = taskForm.titles.filter((t) => t.trim());
    if (validTitles.length === 0) return;
    setIsSaving(true);
    try {
      if (taskToEdit) {
        // Edit existing task - use first title
        // Check if PatientCreate is in "Nouveau" mode and get form data from ref
        let patientName = taskForm.patientName;
        let patientAge = taskForm.patientAge;
        let patientHistory = taskForm.patientHistory;
        let patientId = taskForm.patientId;

        const patientCreateMode = patientCreateEditRef.current?.getMode();
        if (patientCreateMode === "new") {
          // Get the new patient form data from PatientCreate
          const newPatientData = patientCreateEditRef.current?.getNewPatientFormData() || {};
          patientName = newPatientData.fullName || "";
          patientAge = newPatientData.age || "";
          patientHistory = newPatientData.histoire || newPatientData.history || "";
          patientId = undefined; // Clear patientId for new patients
        }

        await onTaskEdit({
          ...taskToEdit,
          title: validTitles[0],
          patientId: patientId ? parseInt(patientId) : undefined,
          patientName,
          patientAge,
          patientHistory,
          taskType: taskForm.taskType || "team",
        });
        setIsEditTaskModalOpen(false);
        // Reset form
        setTaskForm({
          titles: [""],
          patientId: undefined,
          patientName: "",
          patientAge: "",
          patientHistory: "",
          taskType: "team",
        });
        // Trigger tasks reload to refresh all tasks from server
        await loadTasks();
      } else {
        // Add new tasks - pass form data to parent handler
        // Check if PatientCreate is in "Nouveau" mode and get form data from ref
        let patientName = taskForm.patientName;
        let patientAge = taskForm.patientAge;
        let patientHistory = taskForm.patientHistory;
        let patientId = taskForm.patientId;

        const patientCreateMode = patientCreateAddRef.current?.getMode();
        if (patientCreateMode === "new") {
          // Get the new patient form data from PatientCreate
          const newPatientData = patientCreateAddRef.current?.getNewPatientFormData() || {};
          patientName = newPatientData.fullName || "";
          patientAge = newPatientData.age || "";
          patientHistory = newPatientData.histoire || newPatientData.history || "";
          patientId = undefined; // Clear patientId for new patients
        }

        const taskData = {
          titles: validTitles,
          taskType: taskForm.taskType || "team",
          patientId,
          patientName,
          patientAge,
          patientHistory,
        };

        console.log("Saving task with patient data:", taskData);

        const createdTasks = await onTaskAdd(taskData);

        // If tasks were successfully created, close modal and reset form
        if (createdTasks && createdTasks.length > 0) {
          setIsAddTaskModalOpen(false);
          // Reset form
          setTaskForm({
            titles: [""],
            patientId: undefined,
            patientName: "",
            patientAge: "",
            patientHistory: "",
            taskType: "team",
          });

          // Trigger tasks reload to refresh all tasks from server
          await loadTasks();
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (taskToDelete) {
      setIsDeleting(true);
      try {
        // Call the parent's delete handler
        await onTaskDelete(taskToDelete.id);

        // Remove task from local state
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete.id));

        // Close modal and reset state
        setIsDeleteTaskModalOpen(false);
        setTaskToDelete(null);

        console.log("Task deleted successfully:", taskToDelete.id);
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setTaskForm({
      ...taskForm,
      patientId: String(patient.id),
      patientName: patient.fullName || patient.name,
      patientAge: "",
      patientHistory: "",
    });
  };

  const handleCreateNewPatient = (formData: Record<string, string>) => {
    if (!formData.fullName?.trim()) {
      return;
    }
    // When creating a new patient, we set patientName, patientAge, and patientHistory
    // patientId is intentionally not set for new patients
    const age = String(formData.age || "").trim();
    const history = String(formData.histoire || formData.history || "").trim();

    console.log("handleCreateNewPatient called with:", {
      fullName: formData.fullName,
      age,
      history,
      allFormData: formData
    });

    setTaskForm({
      ...taskForm,
      patientId: undefined,
      patientName: formData.fullName.trim(),
      patientAge: age,
      patientHistory: history,
    });
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    if (deltaX < -50 && deltaY < 30) {
      setSwipedTaskId(id);
    } else {
      setSwipedTaskId(null);
    }
  };

  return (
    <div className="">
      <Card
        className={cn(
          "flex max-h-fit flex-1 flex-col border-none bg-white/90",
          cardClassName
        )}
      >
        <CardHeader
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 pb-4",
            headerClassName
          )}
        >
          <div>
            <CardTitle>{title}</CardTitle>
            {showDateLabel && dateLabel && (
              <p className="text-sm text-slate-500">{dateLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted" className="bg-indigo-100 text-indigo-700">
              Terminé : {completedTasks}/{tasksCount}
            </Badge>
            {showReloadButton && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-full p-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                onClick={() => loadTasks()}
                disabled={isLoading}
              >
                <RotateCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
              onClick={handleOpenAddTaskModal}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            "flex-1 h-fit overflow-x-hidden pt-0",
            contentClassName
          )}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner label="Chargement des consignes..." />
            </div>
          ) : tasks?.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t("dashboard.tasks.noTasksRecorded")}
              description={t("tasks.labels.noTasksDesc")}
              action={
                <Button variant="outline" onClick={handleOpenAddTaskModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("dashboard.tasks.addTask")}
                </Button>
              }
            />
          ) : (
            <div className="h-full min-h-0 overflow-y-auto pr-1">
              <div className="space-y-3">
                {tasks?.map((task) => {
                  const isDone = task.done;

                  return (
                    <div
                      key={task.id}
                      className="relative"
                      onTouchStart={
                        enableSwipeActions ? handleTouchStart : undefined
                      }
                      onTouchEnd={
                        enableSwipeActions
                          ? (e) => handleTouchEnd(e, task.id)
                          : undefined
                      }
                    >
                      {/* Task item */}
                      <div
                        className={cn(
                          "flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-sm sm:flex-row sm:items-start sm:gap-4 transition-transform duration-300 ease-out",
                          isDone
                            ? "border-emerald-200/80 bg-emerald-50/70"
                            : "border-slate-200 bg-white/85 hover:border-indigo-200"
                        )}
                        style={{
                          transform: enableSwipeActions && swipedTaskId === task.id ? "translateX(-96px)" : "translateX(0)",
                        }}
                      >
                        <div className="flex items-start gap-3 sm:flex-1">
                          <button
                            onClick={() => void onTaskToggle(task.id)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition hover:bg-slate-100"
                            type="button"
                            disabled={isLoading}
                          >
                            <span
                              className={cn(
                                "flex h-full w-full items-center justify-center rounded-full",
                                isDone
                                  ? "border-emerald-300 bg-emerald-500/20 text-emerald-600"
                                  : "border-indigo-200 bg-white text-indigo-500"
                              )}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </span>
                          </button>
                          <div className="flex flex-1 flex-col gap-2 my-auto">
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                isDone
                                  ? "text-emerald-700 line-through"
                                  : "text-slate-800"
                              )}
                            >
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {task.patientName && (
                                <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                  <div className="flex gap-1 justify-center items-center"><UserIcon className="h-2 w-2"/> {task.patientName}</div>
                                   </div>
                              )}
                              {task.taskType && (
                                <span
                                  className={cn(
                                    "text-xs font-medium px-2 py-1 rounded flex items-center gap-1",
                                    task.taskType === "team"
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-slate-800 text-white"
                                  )}
                                >
                                  {task.taskType === "team" ? (
                                    <>
                                      <Users className="h-3 w-3" />
                                      {t("tasks.form.teamType")}
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-3 w-3" />
                                      {t("tasks.form.privateType")}
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-col items-center justify-center sm:w-auto">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEditTaskModal(task);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-md text-rose-600 hover:bg-rose-50 transition"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenDeleteTaskModal(task);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Swipe action buttons */}
                      {enableSwipeActions && (
                        <div
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 transition-all duration-300 ease-out",
                            swipedTaskId === task.id
                              ? "opacity-100 pointer-events-auto"
                              : "opacity-0 pointer-events-none"
                          )}
                        >
                          <button
                            onClick={() => handleOpenEditTaskModal(task)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md"
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteTaskModal(task)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition shadow-md"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title={t("dashboard.tasks.addTask")}
        description={t("tasks.form.addTaskDesc")}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsAddTaskModalOpen(false)}
              disabled={isSaving}
            >
              {t("tasks.form.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTask}
              disabled={taskForm.titles.every((t) => !t.trim()) || isSaving}
              className={isSaving ? "opacity-70" : ""}
            >
              {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {t("tasks.form.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Task Type Toggle - At the top */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTaskForm({ ...taskForm, taskType: "team" })
              }
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition",
                taskForm.taskType === "team"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
            >
              <Users className="h-4 w-4" />
              {t("tasks.form.teamType")}
            </button>
            <button
              onClick={() =>
                setTaskForm({ ...taskForm, taskType: "private" })
              }
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition",
                taskForm.taskType === "private"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
            >
              <Lock className="h-4 w-4" />
              {t("tasks.form.privateType")}
            </button>
          </div>

          {/* Patient Selection */}
          <div className="grid gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-sm font-semibold text-[#1f184f]">
              {t("tasks.form.patient")}
            </label>
            <PatientCreate
              ref={patientCreateAddRef}
              patients={[]}
              onSelectPatient={handleSelectPatient}
              onCreatePatient={handleCreateNewPatient}
              newPatientFields={["fullName", "age", "histoire"]}
              newPatientDefaults={{}}
              searchPlaceholder="Rechercher un patient..."
              noResultsText="Aucun patient trouvé"
              showTabs={true}
            />
          </div>


          {/* Multiple Intitulés */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#1f184f]">
                {t("dashboard.tasks.tasks")}
              </label>
            </div>

            {/* Intitulé Input Fields */}
            <div className="space-y-2">
              {taskForm.titles.map((title, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={title}
                    onChange={(e) => {
                      const newTitles = [...taskForm.titles];
                      newTitles[index] = e.target.value;
                      setTaskForm({ ...taskForm, titles: newTitles });
                    }}
                    placeholder={t("tasks.form.taskPlaceholder")}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
                  />
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newTitles = taskForm.titles.filter((_, i) => i !== index);
                        setTaskForm({ ...taskForm, titles: newTitles });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add More Intitulés Button */}
            <button
              onClick={() => {
                setTaskForm({ ...taskForm, titles: [...taskForm.titles, ""] });
              }}
              className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-1"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("dashboard.tasks.addTask")}
            </button>

            {/* Favorite Tasks List */}
            {localFavoriteTasks.length > 0 && (
              <div className="mt-4 space-y-2 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 font-semibold">{t("dashboard.tasks.favoriteTasks")}</p>
                  <button
                    onClick={() => setIsAddingFavoriteTask(!isAddingFavoriteTask)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    type="button"
                  >
                    <Plus className="h-3 w-3" />
                    {t("dashboard.tasks.addTaskFavorite")}
                  </button>
                </div>

                {/* Add New Favorite Task UI */}
                {isAddingFavoriteTask && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <input
                      autoFocus
                      value={newFavoriteTask}
                      onChange={(e) => setNewFavoriteTask(e.target.value)}
                      placeholder={t("tasks.labels.newFavorite")}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-[#1f184f] focus:border-indigo-300 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newFavoriteTask.trim()) {
                          const updated = [...localFavoriteTasks, newFavoriteTask.trim()];
                          setLocalFavoriteTasks(updated);
                          onFavoriteTasksChange?.(updated);
                          setNewFavoriteTask("");
                          setIsAddingFavoriteTask(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newFavoriteTask.trim()) {
                          const updated = [...localFavoriteTasks, newFavoriteTask.trim()];
                          setLocalFavoriteTasks(updated);
                          onFavoriteTasksChange?.(updated);
                          setNewFavoriteTask("");
                          setIsAddingFavoriteTask(false);
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      type="button"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingFavoriteTask(false);
                        setNewFavoriteTask("");
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Favorite Tasks Buttons */}
                <div className="flex flex-wrap gap-2">
                  {localFavoriteTasks.map((task) => (
                    <button
                      key={task}
                      onClick={() => {
                        const newTitles = [...taskForm.titles];
                        newTitles[newTitles.length - 1] = task;
                        setTaskForm({ ...taskForm, titles: newTitles });
                      }}
                      type="button"
                      className="px-3 py-2 text-xs bg-slate-300 text-slate-800 rounded-none hover:bg-slate-400 active:bg-slate-500 transition font-medium"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        title={t("dashboard.tasks.editTask")}
        description={t("tasks.form.editTaskDesc")}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsEditTaskModalOpen(false)}
              disabled={isSaving}
            >
              {t("tasks.form.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTask}
              disabled={taskForm.titles.every((t) => !t.trim()) || isSaving}
              className={isSaving ? "opacity-70" : ""}
            >
              {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {t("tasks.form.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Task Type Toggle - At the top */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTaskForm({ ...taskForm, taskType: "team" })
              }
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition",
                taskForm.taskType === "team"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
            >
              <Users className="h-4 w-4" />
              {t("tasks.form.teamType")}
            </button>
            <button
              onClick={() =>
                setTaskForm({ ...taskForm, taskType: "private" })
              }
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition",
                taskForm.taskType === "private"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
            >
              <Lock className="h-4 w-4" />
              {t("tasks.form.privateType")}
            </button>
          </div>

          {/* Patient Selection */}
          <div className="grid gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-sm font-semibold text-[#1f184f]">
              {t("tasks.form.patient")}
            </label>
            <PatientCreate
              ref={patientCreateEditRef}
              patients={[]}
              onSelectPatient={handleSelectPatient}
              onCreatePatient={handleCreateNewPatient}
              newPatientFields={["fullName", "age", "histoire"]}
              newPatientDefaults={{}}
              searchPlaceholder="Rechercher un patient..."
              noResultsText="Aucun patient trouvé"
              showTabs={true}
            />
          </div>


          {/* Intitulé */}
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              {t("tasks.form.taskLabel")}
            </label>
            <input
              value={taskForm.titles[0] || ""}
              onChange={(e) => {
                const newTitles = [...taskForm.titles];
                newTitles[0] = e.target.value;
                setTaskForm({ ...taskForm, titles: newTitles });
              }}
              placeholder={t("tasks.form.taskPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isDeleteTaskModalOpen}
        onClose={() => setIsDeleteTaskModalOpen(false)}
        title={t("dashboard.tasks.deleteTask")}
        description={t("tasks.form.deleteTaskDesc")}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteTaskModalOpen(false)}
              disabled={isDeleting}
            >
              {t("tasks.form.cancel")}
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300 disabled:opacity-70"
              onClick={handleConfirmDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {t("tasks.form.delete")}
            </Button>
          </>
        }
      >
        {taskToDelete ? (
          <p className="text-sm text-[#5f5aa5]">
            {t("tasks.form.deleteTaskConfirm", { title: taskToDelete.title })}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
);
