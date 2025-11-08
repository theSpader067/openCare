"use client";

import { Clock, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Analyse = {
  id: string;
  patient: string;
  type: string;
  requestedAt: string;
  requestedDate: string;
  requester: string;
  status: "En cours" | "Terminée" | "Urgent";
};

const statusConfig: Record<
  Analyse["status"],
  { badge: string; indicator: string; bg: string }
> = {
  "En cours": {
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    indicator: "bg-sky-500",
    bg: "bg-white hover:bg-sky-50/30",
  },
  Terminée: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    indicator: "bg-emerald-500",
    bg: "bg-white hover:bg-emerald-50/30",
  },
  Urgent: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    indicator: "bg-rose-500",
    bg: "bg-white hover:bg-rose-50/30",
  },
};

function formatAnalyseDateTime(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function PendingAnalyseCard({ analyse }: { analyse: Analyse }) {
  const config = statusConfig[analyse.status];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200",
        config.bg,
      )}
    >
      {/* Status Indicator Bar */}
      <div className={cn("absolute left-0 top-0 h-full w-1", config.indicator)} />

      <div className="pl-5 pr-4 py-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {analyse.patient}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">{analyse.type}</p>
              </div>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap",
              config.badge,
            )}
          >
            {analyse.status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-indigo-600">
              {analyse.id}
            </p>
            <p className="text-sm text-slate-600 truncate">
              {formatAnalyseDateTime(analyse.requestedDate)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/60 pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Voir détails
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
      </div>
    </div>
  );
}