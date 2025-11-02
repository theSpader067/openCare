"use client";

import { useEffect, useState } from "react";
import {
  Beaker,
  AlertTriangle,
  CheckCircle,
  Microscope,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

interface Analysis {
  id: string;
  patient: string;
  type: string;
  status: "critique" | "en attente" | "valide";
  requestedAt: string;
  assignedTo: string;
  note: string;
}

const analysisSeed: Analysis[] = [
  {
    id: "BIO-4567",
    patient: "Louise Lambert",
    type: "Gaz du sang",
    status: "critique",
    requestedAt: "Aujourd’hui · 07h45",
    assignedTo: "Dr Martin",
    note: "Potassium 6.0 mmol/L - relecture urgente",
  },
  {
    id: "BIO-4572",
    patient: "Moussa Diallo",
    type: "Hémogramme complet",
    status: "en attente",
    requestedAt: "Aujourd’hui · 09h30",
    assignedTo: "Laboratoire A",
    note: "Résultats en cours de validation",
  },
  {
    id: "BIO-4530",
    patient: "Agnès Caron",
    type: "CRP",
    status: "valide",
    requestedAt: "Hier · 18h10",
    assignedTo: "Dr Dupont",
    note: "CRP 28 mg/L - informer équipe de garde",
  },
];

const historySeed: Analysis[] = [
  {
    id: "BIO-4401",
    patient: "Jean Roussel",
    type: "Bilan pré-opératoire",
    status: "valide",
    requestedAt: "02/11 · 14h",
    assignedTo: "Laboratoire B",
    note: "Transmis au bloc opératoire",
  },
];

function useDelayedArray<T>(source: T[], delay = 650) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(source);
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [source, delay]);

  return { data, isLoading };
}

const statusConfig: Record<Analysis["status"], { label: string; variant: "warning" | "secondary" | "success" }> = {
  critique: { label: "Critique", variant: "warning" },
  "en attente": { label: "En attente", variant: "secondary" },
  valide: { label: "Validé", variant: "success" },
};

export default function AnalysesPage() {
  const { data: analyses, isLoading } = useDelayedArray(analysisSeed, 600);
  const { data: history, isLoading: historyLoading } = useDelayedArray(historySeed, 900);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analyses & bilans</h1>
          <p className="text-muted-foreground">
            Suivez la validation des bilans pré-opératoires et des analyses critiques.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button className="w-full sm:w-auto">
            <Microscope className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Analyses en cours</CardTitle>
          <CardDescription>
            Bilans prioritaires signalés par les laboratoires et le bloc opératoire.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState label="Analyse des dossiers en cours" />
          ) : analyses.length > 0 ? (
            <div className="space-y-4">
              {analyses.map((analysis) => {
                const status = statusConfig[analysis.status];
                return (
                  <div key={analysis.id} className="space-y-3 rounded-lg border border-border/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {analysis.type} · {analysis.patient}
                        </p>
                        <p className="text-xs text-muted-foreground">{analysis.id}</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis.note}</p>
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                      <span>Assigné à : {analysis.assignedTo}</span>
                      <span>Demandé : {analysis.requestedAt}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Consulter le détail
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        Notifier l’équipe
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Aucune analyse en attente"
              description="Les demandes validées disparaissent automatiquement de cette liste."
              icon={<Beaker className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Alertes critiques</CardTitle>
            <CardDescription>
              Les laboratoires signalent les valeurs urgentes nécessitant une action rapide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
              <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-semibold text-foreground">2 alertes en cours</p>
              <p className="text-xs text-muted-foreground">
                Les équipes de garde sont notifiées automatiquement en cas de nouvelle valeur critique.
              </p>
              <Button size="sm" className="mt-4">
                Ouvrir le tableau des alertes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Historique récent</CardTitle>
            <CardDescription>
              Derniers bilans validés et archivés dans le dossier patient.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {historyLoading ? (
              <LoadingState label="Chargement de l’historique" />
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.patient}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Validé</Badge>
                      <span className="text-xs text-muted-foreground">{item.requestedAt}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Télécharger le rapport
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Historique vide"
                description="Les bilans validés apparaîtront ici pour une consultation rapide."
                icon={<CheckCircle className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
