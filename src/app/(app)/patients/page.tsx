"use client";

import { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  CalendarClock,
  NotebookPen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  status: "hospitalise" | "ambulatoire" | "urgence";
  nextVisit: string;
  lastNote: string;
}

interface FollowUp {
  id: number;
  name: string;
  specialty: string;
  scheduledAt: string;
  context: string;
}

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

const patientsSeed: Patient[] = [
  {
    id: "P-1587",
    name: "Agnès Caron",
    age: 64,
    phone: "06 11 87 45 30",
    email: "a.caron@exemple.fr",
    status: "hospitalise",
    nextVisit: "Visite 18h - contrôle douleur",
    lastNote: "Post-op J2 - évolution favorable",
  },
  {
    id: "P-1630",
    name: "Moussa Diallo",
    age: 42,
    phone: "06 22 98 74 12",
    email: "m.diallo@exemple.fr",
    status: "ambulatoire",
    nextVisit: "Consultation 10/11 - suivi cicatrice",
    lastNote: "Chirurgie ambulatoire - pansement à refaire",
  },
  {
    id: "P-1712",
    name: "Louise Lambert",
    age: 57,
    phone: "06 88 21 44 62",
    email: "l.lambert@exemple.fr",
    status: "urgence",
    nextVisit: "Bloc programmé à 14h",
    lastNote: "Préparation anesthésique en cours",
  },
];

const followUpSeed: FollowUp[] = [
  {
    id: 1,
    name: "Tour post-opératoire",
    specialty: "Chirurgie viscérale",
    scheduledAt: "Aujourd’hui · 18h",
    context: "Patients chambres 312 à 318",
  },
  {
    id: 2,
    name: "Consultation pré-op",
    specialty: "Gynécologie",
    scheduledAt: "Demain · 09h",
    context: "Préparation dossier Mme Roussel",
  },
];

export default function PatientsPage() {
  const { data: patients, isLoading } = useDelayedArray(patientsSeed, 600);
  const { data: followUps, isLoading: followLoading } = useDelayedArray(followUpSeed, 900);

  const statusLabel = (status: Patient["status"]) => {
    switch (status) {
      case "hospitalise":
        return { label: "Hospitalisé", variant: "secondary" as const };
      case "ambulatoire":
        return { label: "Ambulatoire", variant: "default" as const };
      case "urgence":
        return { label: "Urgence", variant: "warning" as const };
      default:
        return { label: "Suivi", variant: "secondary" as const };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Gestion des patients</h1>
          <p className="text-muted-foreground">
            Centralisez les informations, préparez les visites et coordonnez le suivi post-opératoire.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto">
            <NotebookPen className="mr-2 h-4 w-4" />
            Importer un compte rendu
          </Button>
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Liste des patients hospitalisés</CardTitle>
          <CardDescription>
            Filtrez par statut et accédez rapidement aux coordonnées des patients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher un patient, un dossier, une chambre..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
            <Button variant="secondary" className="w-full sm:w-auto">
              Exporter la liste
            </Button>
          </div>

          {isLoading ? (
            <LoadingState label="Chargement des dossiers patients" />
          ) : patients.length > 0 ? (
            <div className="space-y-3">
              {patients.map((patient) => {
                const status = statusLabel(patient.status);
                return (
                  <div
                    key={patient.id}
                    className="flex flex-col gap-4 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        initials={patient.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                        className="h-12 w-12"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {patient.id} · {patient.age} ans
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {patient.lastNote}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {patient.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> {patient.email}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <p className="text-xs text-muted-foreground">
                        {patient.nextVisit}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Ouvrir le dossier
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Aucun patient hospitalisé"
              description="Les admissions apparaîtront automatiquement dès qu'elles seront synchronisées."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Suivis programmés</CardTitle>
            <CardDescription>
              Consultations de contrôle et tours infirmiers planifiés.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {followLoading ? (
              <LoadingState label="Synchronisation des suivis" />
            ) : followUps.length > 0 ? (
              <div className="space-y-4">
                {followUps.map((followUp) => (
                  <div key={followUp.id} className="space-y-2 rounded-lg border border-border/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {followUp.name}
                      </p>
                      <Badge variant="secondary">{followUp.specialty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{followUp.scheduledAt}</p>
                    <p className="text-sm text-muted-foreground">{followUp.context}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Ouvrir la checklist
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucun suivi prévu"
                description="Planifiez un suivi post-opératoire pour le voir apparaître ici."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Notifications patient</CardTitle>
            <CardDescription>
              Alertes issues des équipes et du dossier patient informatisé.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
              <CalendarClock className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Aucune alerte critique en attente
              </p>
              <p className="text-xs text-muted-foreground">
                Vous serez notifié dès qu’une équipe soumettra une mise à jour urgente.
              </p>
              <Button size="sm" className="mt-4">
                Consulter l’historique
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
