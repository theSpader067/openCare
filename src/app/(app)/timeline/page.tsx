"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PatientTimeline, TimelineEvent } from "@/components/timeline/patient-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function TimelineContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [patientName, setPatientName] = useState<string>("Patient");

  useEffect(() => {
    const loadTimelineData = async () => {
      if (!patientId) {
        setError("Aucun identifiant patient fourni");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/timeline`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors du chargement de la timeline");
        }

        if (data.success) {
          setEvents(data.data.events);
          setPatientName(data.data.patientName);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (err) {
        console.error("Error loading timeline:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    loadTimelineData();
  }, [patientId]);

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-900">
              Timeline patient
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Vue chronologique complète du parcours de soins et des événements médicaux.
          </p>
        </section>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="h-12 w-12 mb-3 text-red-400" />
              <p className="text-sm font-medium text-slate-700 mb-2">Erreur de chargement</p>
              <p className="text-xs text-slate-500 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">
            Timeline patient
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Vue chronologique complète du parcours de soins et des événements médicaux.
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
                ? "Aucun événement enregistré"
                : `${events.length} événement${events.length > 1 ? "s" : ""} enregistré${events.length > 1 ? "s" : ""} dans le parcours de soins`}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Parcours de soins</CardTitle>
          <CardDescription>
            {events.length > 0 && !isLoading
              ? "Cliquez sur un événement pour afficher les détails complets"
              : "L'historique des événements médicaux s'affichera ici"}
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
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-900">
              Timeline patient
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Vue chronologique complète du parcours de soins et des événements médicaux.
          </p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500">Chargement de la timeline...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <TimelineContent />
    </Suspense>
  );
}
