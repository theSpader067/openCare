"use client";

import { type ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bell, Sparkles } from "lucide-react";
import {
  Beaker,
  ListChecks,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type NotificationType,
  type NotificationItem,
  NOTIFICATION_META,
} from "@/data/notifications/notifications-metadata";

// Helper function to format relative time
function formatRelativeTime(date: Date, t: (key: string, options?: any) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("notifications.time.justNow");
  if (diffMins < 60) return t("notifications.time.minutesAgo", { count: diffMins });
  if (diffHours < 24) return t("notifications.time.hoursAgo", { count: diffHours });
  if (diffDays < 7) return t("notifications.time.daysAgo", { count: diffDays });

  return new Date(date).toLocaleDateString("fr-FR");
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = notifications.length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/notifications");

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();

        // Transform database notifications to UI format
        const transformedNotifications: NotificationItem[] = data.notifications.map(
          (notif: any) => ({
            id: notif.id.toString(),
            type: (notif.category || "task") as NotificationType,
            title: notif.title,
            description: notif.description || "",
            time: formatRelativeTime(new Date(notif.createdAt), t),
            source: notif.source || "Système",
          })
        );

        setNotifications(transformedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafaf9] to-[#f5f3ff] px-4 py-6 pb-24 sm:px-6 md:px-8 md:pb-20 lg:pb-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-[#5f5aa5] hover:bg-indigo-50/80"
              aria-label={t("notifications.buttons.back")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1f184f] sm:text-3xl">
                {t("notifications.page.title")}
              </h1>
              <p className="text-sm text-[#6a66b1]">
                {t("notifications.page.subtitle")}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[#4338ca]">
            <Sparkles className="h-4 w-4" />
            {t("notifications.badge")}
          </span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            // Loading State
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-violet-100/70 bg-white/90 p-4 shadow-sm shadow-indigo-100/40 sm:gap-4 sm:p-5 animate-pulse"
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 sm:h-14 sm:w-14" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="h-5 w-48 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 sm:h-6" />
                      <div className="h-5 w-12 rounded-full bg-gradient-to-r from-slate-200 to-slate-100" />
                    </div>
                    <div className="h-4 w-full rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 sm:h-5" />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <div className="h-3 w-20 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100" />
                      <div className="h-3 w-24 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200/70 bg-red-50/50 px-4 py-12 text-center sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100/80">
                <Bell className="h-7 w-7 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">
                  {t("notifications.emptyStates.error")}
                </p>
                <p className="text-xs text-red-600">
                  {error}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                {t("notifications.buttons.retry")}
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-violet-200/70 bg-white/80 px-4 py-12 text-center sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80">
                <Bell className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f184f]">
                  {t("notifications.emptyStates.noNotifications")}
                </p>
                <p className="text-xs text-slate-500">
                  {t("notifications.emptyStates.noNotificationsDesc")}
                </p>
              </div>
            </div>
          ) : (
            // Notifications List
            <ul className="space-y-3 sm:space-y-4">
              {notifications.map((notification) => {
                const meta = NOTIFICATION_META[notification.type];
                const Icon = meta.icon;
                return (
                  <li key={notification.id}>
                    <div className="flex items-start gap-3 rounded-2xl border border-violet-100/70 bg-white/90 p-4 shadow-sm shadow-indigo-100/40 transition sm:gap-4 sm:p-5 hover:border-violet-200 hover:shadow-indigo-100/60">
                      <span
                        className={cn(
                          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14",
                          meta.iconClass,
                        )}
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      </span>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="text-sm font-semibold text-[#1f184f] sm:text-base">
                            {notification.title}
                          </p>
                          <span
                            className={cn(
                              "w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                              meta.badgeClass,
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#5f5aa5] sm:text-base">
                          {notification.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#8a81d6] sm:gap-y-2">
                          <span>{notification.time}</span>
                          <span className="flex items-center gap-1 text-[#6157b0]">
                            <Sparkles className="h-3.5 w-3.5" />
                            {notification.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Action Bar */}
        {!isLoading && !error && notifications.length > 0 && (
          <div className="mt-8 border-t border-violet-200/70 pt-6 sm:mt-10 sm:pt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="text-sm text-[#6a66b1]">
                {t("notifications.counter", { count: unreadCount })}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Mark all as read
                  }}
                  className="w-full sm:w-auto"
                >
                  {t("notifications.buttons.markAllAsRead")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  {t("notifications.buttons.close")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
