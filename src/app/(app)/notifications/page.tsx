"use client";

import { type ComponentType } from "react";
import { useRouter } from "next/navigation";
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
  NOTIFICATIONS_SEED,
} from "@/data/notifications/notifications-metadata";

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = NOTIFICATIONS_SEED;
  const unreadCount = notifications.length;

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
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1f184f] sm:text-3xl">
                Notifications
              </h1>
              <p className="text-sm text-[#6a66b1]">
                Flux d&apos;équipe en direct
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[#4338ca]">
            <Sparkles className="h-4 w-4" />
            Temps réel
          </span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-violet-200/70 bg-white/80 px-4 py-12 text-center sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80">
                <Bell className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f184f]">
                  Aucune notification
                </p>
                <p className="text-xs text-slate-500">
                  Tout est sous contrôle pour le moment.
                </p>
              </div>
            </div>
          ) : (
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
        {notifications.length > 0 && (
          <div className="mt-8 border-t border-violet-200/70 pt-6 sm:mt-10 sm:pt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="text-sm text-[#6a66b1]">
                {unreadCount} notification{unreadCount > 1 ? "s" : ""}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Mark all as read
                  }}
                  className="w-full sm:w-auto"
                >
                  Marquer tout comme lu
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
