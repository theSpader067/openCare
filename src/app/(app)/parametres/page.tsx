"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Bell, Globe, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

interface SettingsData {
  locale: string;
  timezone: string;
  alerts: boolean;
  sms: boolean;
  doubleAuth: boolean;
}

const initialSettings: SettingsData = {
  locale: "fr-FR",
  timezone: "Europe/Paris",
  alerts: true,
  sms: false,
  doubleAuth: true,
};

export default function ParametresPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettings(initialSettings);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Personnalisez votre espace de travail, les notifications et la sécurité de votre compte.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Préférences générales</CardTitle>
            <CardDescription>
              Choisissez vos paramètres régionaux et votre fuseau horaire.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {settings ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="locale">
                    Langue de l’interface
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      id="locale"
                      value={settings.locale}
                      onChange={(event) =>
                        setSettings((prev) =>
                          prev ? { ...prev, locale: event.target.value } : prev
                        )
                      }
                      className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                    >
                      <option value="fr-FR">Français (France)</option>
                      <option value="fr-CA">Français (Canada)</option>
                      <option value="en-GB">Anglais (Royaume-Uni)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="timezone">
                    Fuseau horaire
                  </label>
                  <input
                    id="timezone"
                    type="text"
                    value={settings.timezone}
                    onChange={(event) =>
                      setSettings((prev) =>
                        prev ? { ...prev, timezone: event.target.value } : prev
                      )
                    }
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>
            ) : (
              <LoadingState label="Chargement des préférences" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Déterminez les alertes cliniques que vous souhaitez recevoir.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {settings ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Alertes critiques</p>
                    <p className="text-xs text-muted-foreground">
                      Bilans à récupérer, analyses critiques et patients post-op.
                    </p>
                  </div>
                  <label className="relative inline-flex h-6 w-11 items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.alerts}
                      onChange={(event) =>
                        setSettings((prev) =>
                          prev ? { ...prev, alerts: event.target.checked } : prev
                        )
                      }
                    />
                    <span className="absolute inset-0 rounded-full bg-muted peer-checked:bg-primary/80"></span>
                    <span className="absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background transition peer-checked:translate-x-5"></span>
                  </label>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">SMS de garde</p>
                    <p className="text-xs text-muted-foreground">
                      Recevez un SMS lorsqu’une équipe vous mentionne sur une alerte urgente.
                    </p>
                  </div>
                  <label className="relative inline-flex h-6 w-11 items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.sms}
                      onChange={(event) =>
                        setSettings((prev) =>
                          prev ? { ...prev, sms: event.target.checked } : prev
                        )
                      }
                    />
                    <span className="absolute inset-0 rounded-full bg-muted peer-checked:bg-primary/80"></span>
                    <span className="absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background transition peer-checked:translate-x-5"></span>
                  </label>
                </div>
              </div>
            ) : (
              <LoadingState label="Chargement des notifications" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Renforcez la sécurité de votre compte professionnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {settings ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Double authentification</p>
                  <p className="text-xs text-muted-foreground">
                    Une application OTP est requise pour vous connecter sur un nouvel appareil.
                  </p>
                </div>
                <label className="relative inline-flex h-6 w-11 items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={settings.doubleAuth}
                    onChange={(event) =>
                      setSettings((prev) =>
                        prev ? { ...prev, doubleAuth: event.target.checked } : prev
                      )
                    }
                  />
                  <span className="absolute inset-0 rounded-full bg-muted peer-checked:bg-primary/80"></span>
                  <span className="absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background transition peer-checked:translate-x-5"></span>
                </label>
              </div>
              <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
                <ShieldCheck className="mx-auto mb-3 h-6 w-6 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Aucun incident de sécurité signalé
                </p>
                <p className="text-xs text-muted-foreground">
                  Consultez l’historique pour vérifier les connexions récentes.
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Voir l’historique
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="En attente des paramètres"
              description="Les options de sécurité s'afficheront après la synchronisation."
              icon={<Bell className="h-6 w-6" />}
            />
          )}
        </CardContent>
        <div className="border-t border-border/70" />
        <CardContent className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            Les modifications sont appliquées à l’ensemble de vos appareils connectés.
          </p>
          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Enregistrement..." : "Enregistrer les changements"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
