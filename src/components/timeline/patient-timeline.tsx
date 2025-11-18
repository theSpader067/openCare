"use client";

import { useState } from "react";
import {
  FileText,
  ActivityIcon,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LabEntry {
  id: number;
  name: string | null;
  value: string | null;
  interpretation: string | null;
}

interface HospitalizationDetails {
  fullName: string;
  username: string;
  specialty: string;
  hospital: string;
}

interface ObservationDetails {
  text: string;
}

interface PrescriptionDetails {
  details: string;
  renseignementClinique?: string | null;
}

interface ImagingDetails {
  interpretation: string;
  recommandations?: string | null;
}

interface LabDetails {
  labEntries: LabEntry[];
  interpretation?: string | null;
}

export interface TimelineEvent {
  id: string;
  type: "lab" | "imaging" | "observation" | "hospitalization" | "prescription";
  title: string;
  date: string;
  timestamp: string;
  summary: string;
  details?: HospitalizationDetails | ObservationDetails | PrescriptionDetails | ImagingDetails | LabDetails;
}

interface PatientTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const eventTypeConfig = {
  lab: {
    icon: FileText,
    label: "Analyses",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  imaging: {
    icon: FileText,
    label: "Imagerie",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  observation: {
    icon: ActivityIcon,
    label: "Observation",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
  },
  hospitalization: {
    icon: Building2,
    label: "Hospitalisation",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
  },
  prescription: {
    icon: FileText,
    label: "Ordonnance",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
};

export function PatientTimeline({ events, isLoading = false }: PatientTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderDetails = (event: TimelineEvent) => {
    if (!event.details) return null;

    switch (event.type) {
      case "hospitalization": {
        const details = event.details as HospitalizationDetails;
        return (
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 sm:min-w-[140px]">
                Médecin
              </span>
              <span className="text-sm text-slate-600 flex-1 break-words">
                {details.fullName}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 sm:min-w-[140px]">
                Username
              </span>
              <span className="text-sm text-slate-600 flex-1 break-words">
                @{details.username}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 sm:min-w-[140px]">
                Spécialité
              </span>
              <span className="text-sm text-slate-600 flex-1 break-words">
                {details.specialty}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 sm:min-w-[140px]">
                Hôpital
              </span>
              <span className="text-sm text-slate-600 flex-1 break-words">
                {details.hospital}
              </span>
            </div>
          </div>
        );
      }

      case "observation": {
        const details = event.details as ObservationDetails;
        return (
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {details.text}
            </p>
          </div>
        );
      }

      case "prescription": {
        const details = event.details as PrescriptionDetails;
        return (
          <div className="space-y-2.5">
            {details.renseignementClinique && (
              <div className="bg-white/60 rounded-lg p-2.5">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Renseignement clinique
                </span>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {details.renseignementClinique}
                </p>
              </div>
            )}
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Détails de l'ordonnance
              </span>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {details.details}
              </p>
            </div>
          </div>
        );
      }

      case "imaging": {
        const details = event.details as ImagingDetails;
        return (
          <div className="space-y-2.5">
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Interprétation
              </span>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {details.interpretation}
              </p>
            </div>
            {details.recommandations && (
              <div className="bg-white/60 rounded-lg p-2.5">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Recommandations
                </span>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {details.recommandations}
                </p>
              </div>
            )}
          </div>
        );
      }

      case "lab": {
        const details = event.details as LabDetails;
        return (
          <div className="space-y-2.5">
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Résultats des analyses
              </span>
              <div className="text-sm text-slate-600 leading-relaxed">
                {details.labEntries.map((entry, idx) => (
                  <span key={entry.id}>
                    <span className="font-semibold">{entry.name}</span>: {entry.value}
                    {entry.interpretation && (
                      <span className="text-slate-500 italic"> ({entry.interpretation})</span>
                    )}
                    {idx < details.labEntries.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </div>
            {details.interpretation && (
              <div className="bg-white/60 rounded-lg p-2.5">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Interprétation
                </span>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {details.interpretation}
                </p>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full">
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-300" />
        <ul className="space-y-6 w-full">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="relative pl-12 w-full animate-pulse">
              <div className="absolute left-0 top-0 h-9 w-9 bg-slate-200 rounded-full" />
              <div className="w-full space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-24 w-full bg-slate-200 rounded-xl" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <ActivityIcon className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Aucun événement dans la timeline</p>
        <p className="text-xs text-slate-400 mt-1">
          Les événements médicaux apparaîtront ici une fois ajoutés
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-300" />

      <ul className="space-y-6 w-full">
        {events.map((event) => {
          const config = eventTypeConfig[event.type];
          const Icon = config.icon;
          const isExpanded = expandedIds.has(event.id);

          return (
            <li key={event.id} className="relative pl-12 w-full">
              {/* Icon */}
              <div
                className={`absolute left-0 top-0 ${config.bgColor} ${config.borderColor} border-2 rounded-full p-2 shadow-sm z-10`}
              >
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="w-full">
                {/* Date and time */}
                <div className="mb-2">
                  <time className="font-mono text-xs text-slate-500 font-medium">
                    {formatDate(event.date)}
                  </time>
                  <span className="text-xs text-slate-400 ml-2">
                    {formatTime(event.timestamp)}
                  </span>
                </div>

                {/* Event card */}
                <div
                  className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-4 shadow-sm transition-all hover:shadow-md cursor-pointer w-full`}
                  onClick={() => toggleExpanded(event.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {event.summary}
                      </p>
                    </div>
                    {event.details && (
                      <button
                        className={`${config.color} hover:${config.bgColor} rounded-lg p-1.5 transition-all flex-shrink-0`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(event.id);
                        }}
                        aria-label={isExpanded ? "Réduire" : "Développer"}
                        type="button"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {isExpanded && event.details && (
                    <div className="mt-4 pt-4 border-t-2 border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                      {renderDetails(event)}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
