"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Separator } from "@/components/ui/separator";

interface StatCard {
  label: string;
  value: string;
  delta: string;
  badge: string;
}

interface ActivityItem {
  id: number;
  type: string;
  label: string;
  time: string;
  context: string;
}

interface TaskItem {
  id: number;
  title: string;
  time: string;
  tag: string;
}

interface AlertItem {
  id: number;
  title: string;
  detail: string;
  priority: "haute" | "moyenne" | "basse";
}

function useDelayedData<T>(source: T, delay = 650) {
  const [data, setData] = useState<T>(() => {
    if (Array.isArray(source)) {
      return [] as unknown as T;
    }
    return source;
  });
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

const statsSeed: StatCard[] = [
  {
    label: "Consultations du mois",
    value: "128",
    delta: "+12%",
    badge: "Consultations",
  },
  {
    label: "Interventions chirurgicales",
    value: "22",
    delta: "+4",
    badge: "Chirurgie",
  },
  {
    label: "Patients hospitalisés",
    value: "18",
    delta: "-3",
    badge: "Hospitalisation",
  },
  {
    label: "Satisfaction patient",
    value: "94%",
    delta: "+2 points",
    badge: "Qualité",
  },
];

const activitySeed: ActivityItem[] = [
  {
    id: 1,
    type: "chirurgie",
    label: "Chirurgie laparoscopique - Mme Caron",
    time: "08:30",
    context: "Bloc opératoire 2",
  },
  {
    id: 2,
    type: "consultation",
    label: "Consultation post-opératoire - M. Diallo",
    time: "10:15",
    context: "Cabinet 4",
  },
  {
    id: 3,
    type: "staff",
    label: "Staff pluridisciplinaire digestif",
    time: "12:30",
    context: "Salle de conférence A",
  },
  {
    id: 4,
    type: "tour",
    label: "Tour des patients en chirurgie viscérale",
    time: "16:00",
    context: "Service 3ème étage",
  },
];

const taskSeed: TaskItem[] = [
  {
    id: 1,
    title: "Valider l’imagerie pré-opératoire",
    time: "08:00",
    tag: "Bloc",
  },
  {
    id: 2,
    title: "Rédiger le compte rendu de chirurgie",
    time: "11:30",
    tag: "Documentation",
  },
  {
    id: 3,
    title: "Appeler Mme Lemoine pour résultats",
    time: "15:00",
    tag: "Suivi",
  },
];

const alertSeed: AlertItem[] = [
  {
    id: 1,
    title: "Bilans pré-op à récupérer",
    detail: "3 dossiers en attente de validation biologique.",
    priority: "haute",
  },
  {
    id: 2,
    title: "Analyses critiques à vérifier",
    detail: "Potassium élevé chez M. Durand, relecture nécessaire.",
    priority: "haute",
  },
  {
    id: 3,
    title: "Patients post-op à checker",
    detail: "4 patients nécessitent un contrôle de douleur ce soir.",
    priority: "moyenne",
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDelayedData(statsSeed, 500);
  const { data: activities, isLoading: activityLoading } = useDelayedData(activitySeed, 700);
  const { data: tasks, isLoading: tasksLoading } = useDelayedData(taskSeed, 900);
  const { data: alerts, isLoading: alertsLoading } = useDelayedData(alertSeed, 1100);

  const nextAlert = useMemo(() => {
    if (!Array.isArray(alerts) || alerts.length === 0) return null;
    return alerts[0];
  }, [alerts]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <Badge variant="secondary" className="w-fit">Bienvenue</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Bonjour Dr Dupont,
          </h1>
          <p className="text-muted-foreground">
            Visualisez l’activité clinique de votre service pour la journée.
          </p>
        </div>
        {nextAlert ? (
          <Button className="w-full sm:w-auto" variant="default">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Urgence : {nextAlert.title}
          </Button>
        ) : (
          <Button className="w-full sm:w-auto" variant="secondary">
            Aucun signal critique
          </Button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <Card className="col-span-full">
            <LoadingState label="Chargement des indicateurs" />
          </Card>
        ) : stats.length > 0 ? (
          stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardHeader className="space-y-0 pb-4">
                <CardDescription>{stat.badge}</CardDescription>
                <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-xs font-semibold text-emerald-600">
                  {stat.delta} vs. mois dernier
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <EmptyState
              title="Aucune statistique disponible"
              description="Les indicateurs seront visibles dès que des données seront synchronisées."
              icon={<Activity className="h-6 w-6" />}
            />
          </Card>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Historique des activités</CardTitle>
            <CardDescription>
              Surgeries, consultations, staffs et visites prévues aujourd’hui.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {activityLoading ? (
            <LoadingState label="Chargement de l’historique" />
            ) : Array.isArray(activities) && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.context}
                      </p>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-center">
                      {activity.time}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune activité planifiée"
                description="Ajoutez une consultation ou une réunion pour alimenter la journée."
                icon={<ClipboardList className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Tâches quotidiennes</CardTitle>
            <CardDescription>
              Suivi de vos actions priorisées par le service.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {tasksLoading ? (
              <LoadingState label="Préparation des tâches" />
            ) : Array.isArray(tasks) && tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.time}</p>
                    </div>
                    <Badge variant="secondary">{task.tag}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune tâche enregistrée"
                description="Ajoutez un suivi pour visualiser vos priorités quotidiennes."
                icon={<CalendarCheck className="h-6 w-6" />}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Planifier une tâche
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Calendrier clinique</CardTitle>
            <CardDescription>
              Vue synthétique des consultations et tours de service de la semaine.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-border/70 p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Consultations</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  8 créneaux disponibles cette semaine dont 3 réservés aux suivis post-opératoires.
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Gérer le planning
                </Button>
              </div>
              <div className="space-y-3 rounded-lg border border-border/70 p-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Tours de service</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tour du matin terminé, tour du soir prévu à 18h avec l’équipe des internes.
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Voir les affectations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Alertes critiques</CardTitle>
            <CardDescription>
              Bilans, analyses et patients en surveillance accrue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {alertsLoading ? (
              <LoadingState label="Analyse des alertes" />
            ) : Array.isArray(alerts) && alerts.length > 0 ? (
              <div className="space-y-5">
                {alerts.map((alert) => (
                  <div key={alert.id} className="space-y-2 rounded-lg border border-border/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {alert.title}
                      </p>
                      <Badge
                        variant={
                          alert.priority === "haute"
                            ? "warning"
                            : alert.priority === "moyenne"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {alert.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.detail}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Traiter maintenant
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune alerte"
                description="Les patients sous surveillance intensive apparaîtront ici."
                icon={<HeartPulse className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Focus du jour</CardTitle>
            <CardDescription>
              Mise en avant des points critiques de la salle d’opération.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-medium text-foreground">
                Réunion de débriefing bloc 2
              </p>
              <p className="text-xs text-muted-foreground">
                17:30 · Présence obligatoire du chef de service et des internes.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-medium text-foreground">
                Préparation anesthésique patient Lambert
              </p>
              <p className="text-xs text-muted-foreground">
                Vérifier protocole douleur et consentements avant 14:00.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Collaboration d’équipe</CardTitle>
            <CardDescription>
              Coordination quotidienne avec l’équipe infirmière et les résidents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-medium text-foreground">
                Point rapide avec les résidents
              </p>
              <p className="text-xs text-muted-foreground">
                Synthèse des dossiers chirurgicaux en attente de validation.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-medium text-foreground">
                Coordination avec le laboratoire
              </p>
              <p className="text-xs text-muted-foreground">
                Suivi en temps réel des analyses critiques à valider.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
