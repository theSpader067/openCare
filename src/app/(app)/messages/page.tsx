"use client";

import { useEffect, useState } from "react";
import {
  Send,
  MessageCircle,
  CalendarDays,
  PhoneCall,
  BellRing,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

interface Conversation {
  id: number;
  sender: string;
  role: string;
  preview: string;
  timestamp: string;
  unread: boolean;
}

const conversationSeed: Conversation[] = [
  {
    id: 1,
    sender: "Dr Martin",
    role: "Anesthésiste",
    preview: "Patient Lambert : protocole douleur validé. Souhaite confirmation bloc.",
    timestamp: "Il y a 10 min",
    unread: true,
  },
  {
    id: 2,
    sender: "Cadre infirmier",
    role: "Unité chirurgie",
    preview: "Tour du soir : vérifier pansement chambre 315 et bilan hydrique 318.",
    timestamp: "Il y a 35 min",
    unread: false,
  },
  {
    id: 3,
    sender: "Dr Nguyen",
    role: "Radiologie",
    preview: "Scanner post-op de M. Diallo disponible sur le PACS.",
    timestamp: "Hier",
    unread: false,
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

export default function MessagesPage() {
  const { data: conversations, isLoading } = useDelayedArray(conversationSeed, 600);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Messagerie clinique</h1>
          <p className="text-muted-foreground">
            Échangez avec le bloc, le laboratoire et les équipes de service en temps réel.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto">
            <PhoneCall className="mr-2 h-4 w-4" />
            Appeler le bloc
          </Button>
          <Button className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" />
            Nouveau message
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Conversations récentes</CardTitle>
          <CardDescription>
            Messages échangés avec les équipes de soins pour la journée en cours.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState label="Récupération des conversations" />
          ) : conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{conversation.role}</Badge>
                      {conversation.unread && <Badge variant="warning">Non lu</Badge>}
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {conversation.sender}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {conversation.preview}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Ouvrir
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        Archiver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune conversation"
              description="Les nouveaux messages apparaîtront ici dès qu'une équipe vous contacte."
              icon={<MessageCircle className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Planification</CardTitle>
            <CardDescription>
              Coordonnez-vous rapidement autour des prochaines opérations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
              <CalendarDays className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Confirmez votre présence au staff de 12h30.
              </p>
              <p className="text-xs text-muted-foreground">
                L’ordre du jour inclut la revue des patients en chirurgie digestive.
              </p>
              <Button size="sm" className="mt-4">
                Ouvrir le staff
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Notifications système</CardTitle>
            <CardDescription>
              Alertes envoyées par la plateforme concernant les dossiers critiques.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
              <BellRing className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Aucun incident signalé
              </p>
              <p className="text-xs text-muted-foreground">
                Vous serez alerté automatiquement en cas de mise à jour critique.
              </p>
              <Button size="sm" variant="outline" className="mt-4">
                Consulter les logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
