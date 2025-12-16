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
  User as UserIcon,
  Users as UsersIcon,
  MoreVertical,
} from "lucide-react";
import type { ActivityItem, ActivityFormState, ActivityType } from "@/types/tasks";
import { activityTypeMeta } from "@/data/dashboard/dashboard-metadata";
import { getActivities } from "@/lib/api/activities";
import { useLanguage } from "@/contexts/LanguageContext";

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


const getCreatorDisplay = (creator: any): string => {
  return creator.username || (creator.firstName && creator.lastName ? `${creator.firstName} ${creator.lastName}` : creator.email);
};

const formLabelClass = "text-sm font-semibold text-[#111322]";

const formInputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-[#111322] shadow-[inset_0_1px_2px_rgba(15,15,15,0.05)] focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15 focus:outline-none";

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
    const { t } = useLanguage();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const completedActivities = activities.filter(
    (act) => act.status === "done"
  ).length;
  const activitiesCount = activities.length;

  return (
    <>
      <Card className="flex min-h-0 flex-1 flex-col rounded-[10px] border border-slate-200/80 bg-white shadow-[0px_18px_45px_rgba(15,23,42,0.04)]">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-5">
          <div>
            <CardTitle>{t('dashboard.activities.title')}</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {selectedDateLabel}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="muted"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-700"
            >
              {activitiesCount} {t('dashboard.activities.activitiesCount')}
              {activitiesCount !== 1 && '(s)'}
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
              <div className="space-y-2 text-center">
                <div className="mx-auto h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
                <p className="text-sm text-slate-500">{t('dashboard.activities.loading')}</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('dashboard.activities.noActivities')}
              description={t('dashboard.activities.noActivitiesDesc')}
              action={
                <Button
                  variant="primary"
                  onClick={onAddClick}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('dashboard.activities.addActivity')}
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
                          "relative flex flex-col gap-4 rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0px_12px_35px_rgba(15,23,42,0.04)] transition-all duration-200 sm:flex-row sm:items-start sm:justify-between",
                          done
                            ? "border-slate-300 bg-slate-50 text-slate-500"
                            : "hover:-translate-y-1 hover:border-slate-300"
                        )}
                        style={{
                          transform: swipedActivityId === activity.id ? "translateX(-96px)" : "translateX(0)",
                        }}
                      >
                        {/* Dropdown menu button */}
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === activity.id ? null : activity.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                            type="button"
                            title="Menu"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                          </button>

                          {/* Dropdown menu */}
                          {openMenuId === activity.id && (
                            <div className="absolute right-0 top-10 z-50 mt-1 w-48 rounded-2xl border border-slate-200/80 bg-white shadow-[0px_20px_45px_rgba(15,23,42,0.08)]">
                              <button
                                onClick={() => {
                                  onDeleteClick(activity);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t('dashboard.activities.deleteActivity')}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                          <button
                            onClick={() => onToggleClick(activity.id)}
                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 transition hover:-translate-y-1"
                            type="button"
                          >
                            <span
                              className={cn(
                                "flex h-full w-full items-center justify-center rounded-2xl text-white",
                                meta.badgeClass,
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
                                    "text-sm font-semibold text-[#111322]",
                                    done && "line-through opacity-70"
                                  )}
                                >
                                  {activity.title}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {activity.description}
                                </p>
                              </div>
                              <Badge
                                variant="muted"
                                className="mr-6 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-slate-600"
                              >
                                {activity.time}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
                              {activity.creator ? (
                                <span className="flex items-center gap-1">
                                  <UserIcon className="h-3.5 w-3.5" />
                                  {getCreatorDisplay(activity.creator)}
                                </span>
                              ) : null}
                            </div>
                            {activity.participants && activity.participants.length > 0 ? (
                              <div className="flex flex-wrap items-start gap-3 border-t border-slate-200/70 pt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1 basis-full sm:basis-auto">
                                  <UsersIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="font-medium">{t('dashboard.activities.participants')} ({activity.participants.length}):</span>
                                </span>
                                <div className="flex flex-wrap gap-2 basis-full">
                                  {activity.participants}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Swipe action buttons */}
                      <div
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 transition-all duration-300 ease-out",
                          swipedActivityId === activity.id
                            ? "pointer-events-auto opacity-100"
                            : "pointer-events-none opacity-0"
                        )}
                      >
                        <button
                          onClick={() => onEditClick(activity)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5"
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(activity)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 transition hover:-translate-y-0.5"
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
        title={t('dashboard.activities.addActivityModal')}
        description={t('dashboard.activities.addActivityModalDesc')}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsAddActivityModalOpen(false)}
            >
              {t('dashboard.activities.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={onSaveActivity}
              disabled={!activityForm.title.trim()}
            >
              {t('dashboard.activities.save')}
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
        title={t('dashboard.activities.editActivityModal')}
        description={t('dashboard.activities.editActivityModalDesc')}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsEditActivityModalOpen(false)}
            >
              {t('dashboard.activities.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={onSaveActivity}
              disabled={!activityForm.title.trim()}
            >
              {t('dashboard.activities.save')}
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
        title={t('dashboard.activities.deleteActivityModal')}
        description={t('dashboard.activities.deleteActivityModalDesc')}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteActivityModalOpen(false)}
            >
              {t('dashboard.activities.cancel')}
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300"
              onClick={onConfirmDelete}
            >
              {t('dashboard.activities.deleteActivity')}
            </Button>
          </>
        }
      >
        {activityToDelete ? (
          <p className="text-sm text-slate-500">
            {t('dashboard.activities.deleteActivityConfirm').replace('{{title}}', activityToDelete.title)}
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
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className={formLabelClass}>
          {t('dashboard.activities.formLabels.title')}
        </label>
        <input
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          placeholder={t('dashboard.activities.formLabels.titleExample')}
          className={formInputClass}
        />
      </div>
      <div className="grid gap-2">
        <label className={formLabelClass}>
          {t('dashboard.activities.formLabels.description')}
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
          placeholder={t('dashboard.activities.formLabels.descriptionExample')}
          className={cn(formInputClass, "min-h-[90px]")}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className={formLabelClass}>
            {t('dashboard.activities.formLabels.activityDay')}
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
            className={formInputClass}
          />
        </div>
        <div className="grid gap-2">
          <label className={formLabelClass}>
            {t('dashboard.activities.formLabels.time')}
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
            className={formInputClass}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={formLabelClass}>
          {t('dashboard.activities.formLabels.activityType')}
        </label>
        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value as ActivityType,
            })
          }
          className={formInputClass}
        >
          {Object.entries(activityTypeMeta).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className={formLabelClass}>
            {t('dashboard.activities.formLabels.location')}
          </label>
          <input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            placeholder={t('dashboard.activities.formLabels.locationExample')}
            className={formInputClass}
          />
        </div>
        <div className="grid gap-2">
          <label className={formLabelClass}>
            {t('dashboard.activities.formLabels.team')}
          </label>
          <input
            value={form.team}
            onChange={(e) =>
              setForm({ ...form, team: e.target.value })
            }
            placeholder={t('dashboard.activities.formLabels.teamExample')}
            className={formInputClass}
          />
        </div>
      </div>
    </div>
  );
}
