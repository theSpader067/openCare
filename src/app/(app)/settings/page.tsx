"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  Shield,
  Smartphone,
  UserCog,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

type Preference = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const preferencesSeed: Preference[] = [
  {
    id: "pref-01",
    title: "Alertes critiques immédiates",
    description: "Recevoir une notification en cas de résultat critique (labos, bloc).",
    enabled: true,
  },
  {
    id: "pref-02",
    title: "Résumé quotidien 7h00",
    description: "Un condensé des tâches, alertes et patients à risque au début de la journée.",
    enabled: true,
  },
  {
    id: "pref-03",
    title: "Messages du bloc opératoire",
    description: "Alertes en temps réel lorsque le bloc demande un avis ou une validation.",
    enabled: false,
  },
];

function useSectionData<T>(seed: T[], delay = 650) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(seed);
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, seed]);

  return { data, isLoading };
}

export default function SettingsPage() {
  const { data: preferences, isLoading } = useSectionData(preferencesSeed);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Paramètres
          </h1>
          <p className="text-sm text-slate-500">
            Personnalisez vos notifications, votre profil et la sécurité de votre compte.
          </p>
        </div>
        <Button variant="primary">
          <UserCog className="mr-2 h-4 w-4" />
          Mettre à jour le profil
        </Button>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Profil professionnel</CardTitle>
            <CardDescription>
              Informations visibles par les autres équipes et sur le bloc opératoire.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">
                Dr. Camille Dupont
              </p>
              <p className="text-xs text-slate-500">
                Chirurgienne viscérale · Centre Hospitalier Universitaire
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="muted">Bloc 5</Badge>
                <Badge variant="muted">Consultations mardi/jeudi</Badge>
                <Badge variant="muted">RCP digestif</Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                Modifier les informations
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Sécurité du compte</CardTitle>
            <CardDescription>
              Contrôles d&apos;accès, authentification forte et appareils connectés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Authentification multi-facteurs (MFA)
                  </p>
                  <p className="text-xs text-slate-500">
                    Par SMS, application mobile ou clé physique FIDO2.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">
                Appareils connectés
              </p>
              <p className="text-xs text-slate-500">
                iPhone 15 (application mobile) · Macbook Pro (navigateur)
              </p>
              <Button variant="ghost" size="sm" className="mt-2">
                Gérer les accès
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Sélectionnez les alertes à recevoir sur desktop et mobile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner label="Chargement des préférences..." />
            </div>
          ) : preferences.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="Aucune préférence définie"
              description="Personnalisez les alertes pour rester informé tout en évitant la surcharge."
              action={<Button variant="primary">Créer une préférence</Button>}
            />
          ) : (
            preferences.map((preference) => (
              <div
                key={preference.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {preference.title}
                  </p>
                  <p className="text-sm text-slate-600">
                    {preference.description}
                  </p>
                </div>
                <Button variant={preference.enabled ? "outline" : "primary"} size="sm">
                  {preference.enabled ? "Désactiver" : "Activer"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Intégrations avancées</CardTitle>
          <CardDescription>
            Connectez vos systèmes pour synchroniser calendrier, bloc et laboratoire.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              API établissement
            </p>
            <p className="text-xs text-slate-500">
              Synchroniser les plannings et les ressources du bloc opératoire.
            </p>
            <Button variant="ghost" size="sm" className="mt-3">
              Connecter
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Application mobile
            </p>
            <p className="text-xs text-slate-500">
              Recevoir les alertes critiques et résumer la journée en mobilité.
            </p>
            <Button variant="ghost" size="sm" className="mt-3">
              Télécharger
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              conformité RGPD
            </p>
            <p className="text-xs text-slate-500">
              Paramètres de conservation et journalisation des accès.
            </p>
            <Button variant="ghost" size="sm" className="mt-3">
              Gérer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
