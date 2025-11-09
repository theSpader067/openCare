"use client";

import { useRef, useState } from "react";
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
  X,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { TaskItem, TaskFormState } from "@/types/tasks";

interface Patient {
  id: string;
  name: string;
}

interface TasksSectionProps {
  tasks: TaskItem[];
  isLoading?: boolean;
  title?: string;
  dateLabel?: string;
  showDateLabel?: boolean;

  // Callbacks
  onTaskToggle: (taskId: string) => void;
  onTaskAdd: (task: TaskItem) => void;
  onTaskEdit: (task: TaskItem) => void;
  onTaskDelete: (taskId: string) => void;

  // Optional features
  showReloadButton?: boolean;
  onReload?: () => void;

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

export function TasksSection({
  tasks,
  isLoading = false,
  title = "Consignes du jour",
  dateLabel,
  showDateLabel = false,
  onTaskToggle,
  onTaskAdd,
  onTaskEdit,
  onTaskDelete,
  showReloadButton = false,
  onReload,
  patients = [],
  favoriteTasks = [],
  onFavoriteTasksChange,
  enableSwipeActions = false,
  cardClassName,
  headerClassName,
  contentClassName,
}: TasksSectionProps) {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>({
    titles: [""],
    patientId: undefined,
    patientName: "",
    taskType: "team",
  });
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isAddingFavoriteTask, setIsAddingFavoriteTask] = useState(false);
  const [newFavoriteTask, setNewFavoriteTask] = useState("");
  const [localFavoriteTasks, setLocalFavoriteTasks] = useState(favoriteTasks);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const completedTasks = tasks.filter((task) => task.done).length;
  const tasksCount = tasks.length;

  // Filter patients based on search
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Task handlers
  const handleOpenAddTaskModal = () => {
    setTaskForm({
      titles: [""],
      patientId: undefined,
      patientName: "",
      taskType: "team",
    });
    setTaskToEdit(null);
    setPatientSearch("");
    setShowPatientDropdown(false);
    setIsAddingFavoriteTask(false);
    setNewFavoriteTask("");
    setIsAddTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: TaskItem) => {
    setTaskForm({
      titles: [task.title],
      patientId: undefined,
      patientName: task.patientName,
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

  const handleSaveTask = () => {
    // Filter out empty titles
    const validTitles = taskForm.titles.filter((t) => t.trim());
    if (validTitles.length === 0) return;

    if (taskToEdit) {
      // Edit existing task - use first title
      onTaskEdit({
        ...taskToEdit,
        title: validTitles[0],
        patientName: taskForm.patientName,
        taskType: taskForm.taskType || "team",
      });
      setIsEditTaskModalOpen(false);
    } else {
      // Add new tasks - create one for each title
      validTitles.forEach((title) => {
        const newTask: TaskItem = {
          id: `TASK-${Date.now()}-${Math.random()}`,
          title,
          details: "",
          done: false,
          patientName: taskForm.patientName,
          taskType: taskForm.taskType || "team",
        };
        onTaskAdd(newTask);
      });
      setIsAddTaskModalOpen(false);
    }
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      onTaskDelete(taskToDelete.id);
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    }
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
                onClick={onReload}
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
            "flex-1 h-fit overflow-hidden pt-0",
            contentClassName
          )}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner label="Chargement des consignes..." />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune consigne enregistrée"
              description="Ajoutez vos actions quotidiennes pour garder un suivi partagé avec votre équipe."
              action={
                <Button variant="outline" onClick={handleOpenAddTaskModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une consigne
                </Button>
              }
            />
          ) : (
            <div className="h-full min-h-0 overflow-y-auto pr-1">
              <div className="space-y-3">
                {tasks.map((task) => {
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
                            onClick={() => onTaskToggle(task.id)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition hover:bg-slate-100"
                            type="button"
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
                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                  👤 {task.patientName}
                                </span>
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
                                      Équipe
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-3 w-3" />
                                      Privée
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-row items-center justify-end sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 rounded-full border-indigo-200 text-indigo-600 transition hover:bg-indigo-50/80"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEditTaskModal(task);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-full text-rose-600 transition hover:bg-rose-50/80"
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
        title="Ajouter une consigne"
        description="Définissez une action à partager avec votre équipe."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsAddTaskModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTask}
              disabled={taskForm.titles.every((t) => !t.trim())}
            >
              Enregistrer
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
              Équipe
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
              Privée
            </button>
          </div>

          {/* Patient Selection */}
          {patients.length > 0 && (
            <div className="grid gap-2 relative">
              <label className="text-sm font-semibold text-[#1f184f]">
                Patient <span className="text-xs font-normal text-slate-500">(optional)</span>
              </label>
              <input
                value={taskForm.patientName || patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setTaskForm({ ...taskForm, patientName: e.target.value, patientId: undefined });
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Sélectionner ou taper le nom du patient..."
                className={cn(
                  "w-full rounded-2xl border px-4 py-2 text-sm shadow-inner focus:border-[#7c3aed] focus:outline-none",
                  taskForm.patientId
                    ? "border-indigo-300 bg-indigo-50/80 text-[#1f184f]"
                    : "border-slate-200 bg-white/80 text-[#1f184f]"
                )}
              />
              {/* Patient Dropdown */}
              {showPatientDropdown && patientSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg z-10 max-h-56 overflow-y-auto">
                  {/* Matching patients */}
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setTaskForm({
                          ...taskForm,
                          patientId: patient.id,
                          patientName: patient.name,
                        });
                        setPatientSearch(patient.name);
                        setShowPatientDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition border-b border-slate-100 last:border-b-0",
                        taskForm.patientId === patient.id
                          ? "bg-indigo-100 hover:bg-indigo-150"
                          : "hover:bg-slate-100"
                      )}
                    >
                      {patient.name}
                    </button>
                  ))}

                  {/* Add new patient option */}
                  <button
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        patientId: undefined,
                        patientName: patientSearch,
                      });
                      setShowPatientDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm bg-slate-50 hover:bg-slate-100 transition border-t border-slate-200 text-slate-700 font-medium"
                  >
                    + Ajouter nouveau: {patientSearch}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Multiple Intitulés */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#1f184f]">
                Intitulés
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
                    placeholder="Ex. Vérifier l'analgésie secteur 5"
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
              Ajouter une tâche
            </button>

            {/* Favorite Tasks List */}
            {localFavoriteTasks.length > 0 && (
              <div className="mt-4 space-y-2 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 font-semibold">Tâches favorites:</p>
                  <button
                    onClick={() => setIsAddingFavoriteTask(!isAddingFavoriteTask)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    type="button"
                  >
                    <Plus className="h-3 w-3" />
                    Ajouter
                  </button>
                </div>

                {/* Add New Favorite Task UI */}
                {isAddingFavoriteTask && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <input
                      autoFocus
                      value={newFavoriteTask}
                      onChange={(e) => setNewFavoriteTask(e.target.value)}
                      placeholder="Nouveau favori..."
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
        title="Modifier la consigne"
        description="Mettez à jour les informations."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsEditTaskModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTask}
              disabled={taskForm.titles.every((t) => !t.trim())}
            >
              Enregistrer
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
              Équipe
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
              Privée
            </button>
          </div>

          {/* Patient Selection */}
          {patients.length > 0 && (
            <div className="grid gap-2 relative">
              <label className="text-sm font-semibold text-[#1f184f]">
                Patient <span className="text-xs font-normal text-slate-500">(optional)</span>
              </label>
              <input
                value={taskForm.patientName || patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setTaskForm({ ...taskForm, patientName: e.target.value, patientId: undefined });
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Sélectionner ou taper le nom du patient..."
                className={cn(
                  "w-full rounded-2xl border px-4 py-2 text-sm shadow-inner focus:border-[#7c3aed] focus:outline-none",
                  taskForm.patientId
                    ? "border-indigo-300 bg-indigo-50/80 text-[#1f184f]"
                    : "border-slate-200 bg-white/80 text-[#1f184f]"
                )}
              />
              {/* Patient Dropdown */}
              {showPatientDropdown && patientSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg z-10 max-h-56 overflow-y-auto">
                  {/* Matching patients */}
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setTaskForm({
                          ...taskForm,
                          patientId: patient.id,
                          patientName: patient.name,
                        });
                        setPatientSearch(patient.name);
                        setShowPatientDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition border-b border-slate-100 last:border-b-0",
                        taskForm.patientId === patient.id
                          ? "bg-indigo-100 hover:bg-indigo-150"
                          : "hover:bg-slate-100"
                      )}
                    >
                      {patient.name}
                    </button>
                  ))}

                  {/* Add new patient option */}
                  <button
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        patientId: undefined,
                        patientName: patientSearch,
                      });
                      setShowPatientDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm bg-slate-50 hover:bg-slate-100 transition border-t border-slate-200 text-slate-700 font-medium"
                  >
                    + Ajouter nouveau: {patientSearch}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Intitulé */}
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#1f184f]">
              Intitulé
            </label>
            <input
              value={taskForm.titles[0] || ""}
              onChange={(e) => {
                const newTitles = [...taskForm.titles];
                newTitles[0] = e.target.value;
                setTaskForm({ ...taskForm, titles: newTitles });
              }}
              placeholder="Ex. Vérifier l'analgésie secteur 5"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isDeleteTaskModalOpen}
        onClose={() => setIsDeleteTaskModalOpen(false)}
        title="Supprimer la consigne ?"
        description="Cette action retirera la consigne de votre liste."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteTaskModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300"
              onClick={handleConfirmDeleteTask}
            >
              Supprimer
            </Button>
          </>
        }
      >
        {taskToDelete ? (
          <p className="text-sm text-[#5f5aa5]">
            Confirmez-vous la suppression de la consigne « {taskToDelete.title}{" "}
            » ?
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
