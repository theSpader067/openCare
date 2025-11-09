"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  MapPin,
  Calendar as CalendarIcon,
  ListChecks,
} from "lucide-react";
import type { ActivityItem, ActivityFormState, ActivityType } from "@/types/tasks";
import { activityTypeMeta } from "@/data/dashboard/dashboard-metadata";
import { getActivities } from "@/lib/api/activities";

export interface ActivitySectionRef {
  refresh: () => Promise<void>;
}

interface ActivitySectionProps {
  selectedDate: Date;
  selectedDateLabel: string;
  activityForm: ActivityFormState;
  setActivityForm: (form: ActivityFormState) => void;
  isAddActivityModalOpen: boolean;
  setIsAddActivityModalOpen: (open: boolean) => void;
  isEditActivityModalOpen: boolean;
  setIsEditActivityModalOpen: (open: boolean) => void;
  isDeleteActivityModalOpen: boolean;
  setIsDeleteActivityModalOpen: (open: boolean) => void;
  activityToEdit: ActivityItem | null;
  setActivityToEdit: (activity: ActivityItem | null) => void;
  activityToDelete: ActivityItem | null;
  setActivityToDelete: (activity: ActivityItem | null) => void;
  swipedActivityId: string | null;
  setSwipedActivityId: (id: string | null) => void;
  onAddClick: () => void;
  onToggleClick: (id: string) => void;
  onEditClick: (activity: ActivityItem) => void;
  onDeleteClick: (activity: ActivityItem) => void;
  onSaveActivity: () => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onActivityUpdate?: (activities: ActivityItem[]) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent, id: string) => void;
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const ActivitySection = forwardRef<ActivitySectionRef, ActivitySectionProps>(
  function ActivitySection({
    selectedDate,
    selectedDateLabel,
    activityForm,
    setActivityForm,
    isAddActivityModalOpen,
    setIsAddActivityModalOpen,
    isEditActivityModalOpen,
    setIsEditActivityModalOpen,
    isDeleteActivityModalOpen,
    setIsDeleteActivityModalOpen,
    activityToEdit,
    setActivityToEdit,
    activityToDelete,
    setActivityToDelete,
    swipedActivityId,
    setSwipedActivityId,
    onAddClick,
    onToggleClick,
    onEditClick,
    onDeleteClick,
    onSaveActivity,
    onConfirmDelete,
    onActivityUpdate,
    onTouchStart,
    onTouchEnd,
  }: ActivitySectionProps, ref) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadActivities = async () => {
    setIsLoading(true);
    try {
      const result = await getActivities();
      if (result.success && result.data) {
        // Filter activities by selected date
        const selectedDateStr = formatDateKey(selectedDate);
        const filteredActivities = result.data.filter((activity) => {
          if (!activity.activityDay) return false;
          const activityData = activity as any;
          const activityDateStr = formatDateKey(
            activityData.activityDay instanceof Date
              ? activityData.activityDay
              : new Date(activityData.activityDay)
          );
          return activityDateStr === selectedDateStr;
        });
        setActivities(filteredActivities);
        onActivityUpdate?.(filteredActivities);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Expose refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: loadActivities,
  }), [loadActivities]);

  // Fetch activities on mount and when selected date changes
  useEffect(() => {
    loadActivities();
  }, [selectedDate, onActivityUpdate]);

  const completedActivities = activities.filter(
    (act) => act.status === "done"
  ).length;
  const activitiesCount = activities.length;

  return (
    <>
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
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <div className="h-8 w-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto" />
                <p className="text-sm text-slate-500">Chargement des activités...</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune activité pour cette journée"
              description="Ajoutez vos consultations, passages au bloc ou tournées pour garder un historique complet."
              action={
                <Button
                  variant="primary"
                  onClick={onAddClick}
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
                      onTouchStart={onTouchStart}
                      onTouchEnd={(e) => onTouchEnd(e, activity.id)}
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
                            onClick={() => onToggleClick(activity.id)}
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
                          onClick={() => onEditClick(activity)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md"
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(activity)}
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
              onClick={onSaveActivity}
              disabled={!activityForm.title.trim()}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <ActivityFormContent
          form={activityForm}
          setForm={setActivityForm}
        />
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
              onClick={onSaveActivity}
              disabled={!activityForm.title.trim()}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <ActivityFormContent
          form={activityForm}
          setForm={setActivityForm}
        />
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
              onClick={onConfirmDelete}
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
    </>
  );
}
);

interface ActivityFormContentProps {
  form: ActivityFormState;
  setForm: (form: ActivityFormState) => void;
}

function ActivityFormContent({ form, setForm }: ActivityFormContentProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[#1f184f]">
          Titre
        </label>
        <input
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
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
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
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
            Jour de l'activité
          </label>
          <input
            type="date"
            value={form.activityDay.toISOString().split('T')[0]}
            onChange={(e) =>
              setForm({
                ...form,
                activityDay: new Date(e.target.value),
              })
            }
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#1f184f]">
            Heure
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[#1f184f]">
          Type
        </label>
        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
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
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#1f184f]">
            Lieu
          </label>
          <input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
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
            value={form.team}
            onChange={(e) =>
              setForm({ ...form, team: e.target.value })
            }
            placeholder="Ex. Dr. Benali, IDE Claire"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-[#1f184f] shadow-inner focus:border-[#7c3aed] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
