"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PatientTimeline, TimelineEvent } from "@/components/timeline/patient-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

function TimelineContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [patientName, setPatientName] = useState<string>("Patient");
  const [patientDbId, setPatientDbId] = useState<string>("");

  useEffect(() => {
    const loadTimelineData = async () => {
      if (!patientId) {
        setError(t("pages.timeline.noPatientId"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/timeline`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t("pages.timeline.loadError"));
        }

        if (data.success) {
          setEvents(data.data.events);
          setPatientName(data.data.patientName);
          setPatientDbId(data.data.patientId);
        } else {
          throw new Error(t("pages.timeline.invalidResponse"));
        }
      } catch (err) {
        console.error("Error loading timeline:", err);
        setError(err instanceof Error ? err.message : t("pages.timeline.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    loadTimelineData();
  }, [patientId, t]);

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/patients/dossier?id=${patientDbId}`)}
            className="gap-1"
            disabled={!patientDbId}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("pages.timeline.backToDossier")}
          </Button>
        </div>

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("pages.timeline.title")}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {t("pages.timeline.subtitle")}
          </p>
        </section>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="h-12 w-12 mb-3 text-red-400" />
              <p className="text-sm font-medium text-slate-700 mb-2">{t("pages.timeline.loadError")}</p>
              <p className="text-xs text-slate-500 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t("pages.timeline.retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/patients/dossier?id=${patientDbId}`)}
          className="gap-1"
          disabled={!patientDbId}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("pages.timeline.backToDossier")}
        </Button>
      </div>

      {/* Header Section */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("pages.timeline.title")}
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          {t("pages.timeline.subtitle")}
        </p>
      </section>

      {/* Patient Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            {isLoading ? (
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            ) : (
              <CardTitle className="text-lg">{patientName}</CardTitle>
            )}
          </div>
          {isLoading ? (
            <div className="h-4 w-64 mt-2 bg-slate-200 rounded animate-pulse" />
          ) : (
            <CardDescription>
              {events.length === 0
                ? t("pages.timeline.noEvents")
                : t("pages.timeline.eventsRecorded_other", { count: events.length })}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("pages.timeline.careJourney")}</CardTitle>
          <CardDescription>
            {events.length > 0 && !isLoading
              ? t("pages.timeline.clickForDetails")
              : t("pages.timeline.historyWillAppear")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientTimeline events={events} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function TimelinePage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("pages.timeline.title")}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {t("pages.timeline.subtitle")}
          </p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500">{t("pages.timeline.loading")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <TimelineContent />
    </Suspense>
  );
}
