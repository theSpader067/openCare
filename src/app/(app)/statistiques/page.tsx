"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  TrendingUp,
  PieChart,
  Users,
  Clock4,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

interface Metric {
  id: number;
  title: string;
  value: string;
  delta: string;
  detail: string;
}

const metricSeed: Metric[] = [
  {
    id: 1,
    title: "Temps moyen au bloc",
    value: "72 min",
    delta: "-6%",
    detail: "Versus 77 min la semaine dernière",
  },
  {
    id: 2,
    title: "Satisfaction patient",
    value: "94%",
    delta: "+3 pts",
    detail: "Enquête post-sortie sur 58 patients",
  },
  {
    id: 3,
    title: "Taux de réadmission",
    value: "4,8%",
    delta: "-1,2%",
    detail: "Sur les 30 derniers jours",
  },
];

const occupancySeed = [
  { label: "Chirurgie digestive", value: 78 },
  { label: "Traumatologie", value: 65 },
  { label: "Gynécologie", value: 54 },
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

export default function StatistiquesPage() {
  const { data: metrics, isLoading } = useDelayedArray(metricSeed, 600);
  const { data: occupancy, isLoading: occupancyLoading } = useDelayedArray(occupancySeed, 900);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">
            Visualisez les performances du service et identifiez les axes d’amélioration.
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <TrendingUp className="mr-2 h-4 w-4" />
          Télécharger le rapport
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full">
            <LoadingState label="Préparation des indicateurs" />
          </Card>
        ) : metrics.length > 0 ? (
          metrics.map((metric) => (
            <Card key={metric.id} className="space-y-2 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {metric.title}
                </CardTitle>
                <Badge variant="secondary">{metric.delta}</Badge>
              </div>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.detail}</p>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <EmptyState
              title="Aucune donnée statistique"
              description="Les graphiques s'afficheront automatiquement dès que les données seront importées."
              icon={<Activity className="h-6 w-6" />}
            />
          </Card>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Occupation des unités</CardTitle>
            <CardDescription>
              Répartition du taux d’occupation moyen sur les 7 derniers jours.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {occupancyLoading ? (
              <LoadingState label="Chargement des taux d’occupation" />
            ) : occupancy.length > 0 ? (
              <div className="space-y-4">
                {occupancy.map((unit) => (
                  <div key={unit.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{unit.label}</span>
                      <span className="text-muted-foreground">{unit.value}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${unit.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune unité suivie"
                description="Ajoutez vos unités de service pour suivre l’occupation en temps réel."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Qualité & sécurité</CardTitle>
            <CardDescription>
              Synthèse des indicateurs de vigilance au bloc opératoire.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
              <PieChart className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                0 incident de check-list signalé cette semaine
              </p>
              <p className="text-xs text-muted-foreground">
                Les incidents de sécurité seront listés ici pour un suivi immédiat.
              </p>
              <Button size="sm" variant="outline" className="mt-4">
                Accéder au registre qualité
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Performance des équipes</CardTitle>
          <CardDescription>
            Vue consolidée des équipes médicales et paramédicales.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border/70 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Equipe de jour</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                12 interventions réalisées · 98% de dossiers complétés
              </p>
            </div>
            <div className="rounded-lg border border-border/70 p-4">
              <div className="flex items-center gap-2">
                <Clock4 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Temps de passage</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                32 min en moyenne aux urgences · objectif 28 min
              </p>
            </div>
            <div className="rounded-lg border border-border/70 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Efficacité bloc</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                87% d’utilisation · 4 créneaux encore disponibles
              </p>
            </div>
            <div className="rounded-lg border border-border/70 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Complications</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                2 complications mineures · 0 réintervention urgente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
