"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeftRight,
  ClipboardList,
  MailPlus,
  Paperclip,
  Search,
  Send,
  Stethoscope,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type AvisStatus = "unseen" | "in-progress" | "answered";
type AvisDirection = "incoming" | "outgoing";

type AvisItem = {
  id: string;
  service: string;
  direction: AvisDirection;
  requestedBy: string;
  requestedAt: string;
  status: AvisStatus;
  summary: string;
  patient: {
    id: string;
    name: string;
    age: number;
    service: string;
    diagnosis: string;
  };
  request: string;
  context: string;
  seenAt?: string;
};

type AvisMessage = {
  id: string;
  author: string;
  role: string;
  content: string;
  sentAt: string;
  direction: "incoming" | "outgoing";
};

const avisSeed: AvisItem[] = [
  {
    id: "AV-001",
    service: "Cardiologie",
    direction: "incoming",
    requestedBy: "Dr. Evans",
    requestedAt: "2024-03-13T09:12:00+01:00",
    seenAt: undefined,
    status: "unseen",
    summary: "Evaluation du risque anesthésique pour patient coronarien.",
    patient: {
      id: "P-2024-0185",
      name: "Mamadou Carter",
      age: 64,
      service: "Chirurgie digestive",
      diagnosis: "Colectomie programmée · antécédents coronariens",
    },
    request:
      "Pouvez-vous confirmer la conduite à tenir pour l'anticoagulation per-opératoire et valider la stratégie de surveillance en SSPI ?",
    context:
      "Patient coronarien stabilisé avec stents actifs (2019) sous double antiagrégation. Dernier contrôle cardiologique datant de 3 mois. Bloc prévu demain 15h. L'équipe souhaiterait un avis sur la fenêtre d'arrêt et la reprise des traitements ainsi que sur l'indication éventuelle d'une surveillance continue post-op immédiate.",
  },
  {
    id: "AV-002",
    service: "Anatomo-pathologie",
    direction: "outgoing",
    requestedBy: "Notre service",
    requestedAt: "2024-03-12T16:40:00+01:00",
    seenAt: "2024-03-12T17:10:00+01:00",
    status: "in-progress",
    summary: "Confirmation histologique marges de résection pancréatique.",
    patient: {
      id: "P-2024-0142",
      name: "Lamia Saïd",
      age: 58,
      service: "Chirurgie viscérale",
      diagnosis: "Pancréatectomie céphalique · cholangiocarcinome suspecté",
    },
    request:
      "Merci de confirmer la nature exacte de la lésion et la présence d'éventuelles marges positives sur les prélèvements envoyés ce matin.",
    context:
      "Bloc réalisé ce jour avec envoi de 3 prélèvements sur marges (tête pancréas et canal cholédoque). Nous avons besoin de votre retour avant RCP de demain matin afin de préparer l'arbre décisionnel thérapeutique.",
  },
  {
    id: "AV-003",
    service: "Radiologie interventionnelle",
    direction: "incoming",
    requestedBy: "Dr. Koffi",
    requestedAt: "2024-03-11T11:05:00+01:00",
    seenAt: "2024-03-11T11:20:00+01:00",
    status: "answered",
    summary: "Demande de relais pour drainage biliaire post-CPRE.",
    patient: {
      id: "P-2024-0103",
      name: "Nadine Morel",
      age: 72,
      service: "Hépato-gastro-entérologie",
      diagnosis: "Sténose biliaire · prise en charge palliative",
    },
    request:
      "Souhaitez-vous que nous programmons une dérivation biliaire interne/externe ? Merci de préciser les modalités et le calendrier souhaité.",
    context:
      "Patiente prise en charge pour ictère obstructif. CPRE réalisée hier avec mise en place de prothèse plastique transitoire. Evolution clinique modérément favorable. L'équipe souhaite connaître votre avis sur un drainage percutané complémentaire.",
  },
];

const initialMessages: Record<string, AvisMessage[]> = {
  "AV-001": [
    {
      id: "MSG-001",
      author: "Dr. Evans",
      role: "Cardiologue",
      content:
        "Le patient Carter présente des signes discrets d'ischémie antérieure. Une surveillance rapprochée post-op est recommandée avec ECG quotidien.",
      sentAt: "2024-03-13T09:10:00+01:00",
      direction: "incoming",
    },
  ],
  "AV-002": [
    {
      id: "MSG-002",
      author: "Laboratoire Anatomo-pathologie",
      role: "Equipe APA",
      content:
        "Prélèvements bien reçus. Validation macroscopique en cours, premier retour prévu dans l'après-midi.",
      sentAt: "2024-03-12T17:10:00+01:00",
      direction: "incoming",
    },
  ],
  "AV-003": [
    {
      id: "MSG-003",
      author: "Dr. Koffi",
      role: "Radiologue interventionnel",
      content:
        "Si vous êtes d'accord, nous planifions un drainage percutané demain matin. Merci de confirmer la disponibilité post-op.",
      sentAt: "2024-03-11T11:05:00+01:00",
      direction: "incoming",
    },
    {
      id: "MSG-004",
      author: "Vous",
      role: "Chef de clinique",
      content:
        "Accord pour drainage percutané. Patiente actuellement en stabilité hémodynamique, réserve en lit de surveillance validée.",
      sentAt: "2024-03-11T11:25:00+01:00",
      direction: "outgoing",
    },
  ],
};

const patientsDirectory = [
  {
    id: "P-2024-0185",
    name: "Mamadou Carter",
    age: 64,
    service: "Chirurgie digestive",
    diagnosis: "Colectomie programmée · antécédents coronariens",
  },
  {
    id: "P-2024-0142",
    name: "Lamia Saïd",
    age: 58,
    service: "Chirurgie viscérale",
    diagnosis: "Pancréatectomie céphalique · cholangiocarcinome suspecté",
  },
  {
    id: "P-2024-0103",
    name: "Nadine Morel",
    age: 72,
    service: "Hépato-gastro-entérologie",
    diagnosis: "Sténose biliaire · prise en charge palliative",
  },
  {
    id: "P-2024-0201",
    name: "Awa Ndiaye",
    age: 47,
    service: "Oncologie",
    diagnosis: "Cancer du sein métastatique · bilan d'extension",
  },
  {
    id: "P-2024-0210",
    name: "Jean Martin",
    age: 69,
    service: "Médecine interne",
    diagnosis: "Insuffisance rénale aiguë sur infection",
  },
];

const serviceOptions = [
  "Cardiologie",
  "Anesthésie",
  "Oncologie",
  "Radiologie interventionnelle",
  "Anatomo-pathologie",
  "Néphrologie",
  "Urgences",
];

type TabFilter = "all" | "incoming" | "outgoing";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AvisPage() {
  const router = useRouter();
  const [avisItems, setAvisItems] = useState<AvisItem[]>(avisSeed);
  const [avisMessages, setAvisMessages] = useState<Record<string, AvisMessage[]>>(
    initialMessages,
  );
  const [activeAvisId, setActiveAvisId] = useState<string | null>(avisSeed[0]?.id ?? null);
  const [filter, setFilter] = useState<TabFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(null);
  const [createForm, setCreateForm] = useState({
    patientId: "",
    service: serviceOptions[0] ?? "",
    context: "",
    request: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const filteredAvis = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return avisItems.filter((avis) => {
      const matchesTab = filter === "all" || avis.direction === filter;
      const matchesQuery =
        !query ||
        avis.service.toLowerCase().includes(query) ||
        avis.patient.name.toLowerCase().includes(query) ||
        avis.patient.id.toLowerCase().includes(query) ||
        avis.patient.diagnosis.toLowerCase().includes(query);
      return matchesTab && matchesQuery;
    });
  }, [avisItems, filter, searchTerm]);

  useEffect(() => {
    if (!activeAvisId && filteredAvis.length > 0) {
      setActiveAvisId(filteredAvis[0].id);
    }
  }, [activeAvisId, filteredAvis]);

  const activeAvis = useMemo(() => {
    if (!activeAvisId) {
      return null;
    }
    return avisItems.find((avis) => avis.id === activeAvisId) ?? null;
  }, [activeAvisId, avisItems]);

  const activeThread = useMemo(() => {
    if (!activeAvis) {
      return [] as AvisMessage[];
    }
    return avisMessages[activeAvis.id] ?? [];
  }, [activeAvis, avisMessages]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeThread]);

  useEffect(() => {
    if (activeAvis && activeAvis.status === "unseen") {
      setAvisItems((prev) =>
        prev.map((item) =>
          item.id === activeAvis.id
            ? {
                ...item,
                status: "in-progress",
                seenAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    }
  }, [activeAvis]);

  const handleSubmitReply = () => {
    if (!activeAvis || !replyDraft.trim()) {
      return;
    }
    const content = replyDraft.trim();
    const newMessage: AvisMessage = {
      id: `MSG-${Date.now()}`,
      author: "Vous",
      role: "Chef de clinique",
      content,
      sentAt: new Date().toISOString(),
      direction: "outgoing",
    };
    setAvisMessages((previous) => {
      const thread = previous[activeAvis.id] ?? [];
      return {
        ...previous,
        [activeAvis.id]: [...thread, newMessage],
      };
    });
    setAvisItems((previous) =>
      previous.map((item) =>
        item.id === activeAvis.id
          ? {
              ...item,
              status: "answered",
              seenAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    setReplyDraft("");
  };

  const handleReplyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmitReply();
    }
  };

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectAvis = (avisId: string) => {
    setActiveAvisId(avisId);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreateModal = () => {
    setCreateForm({ patientId: "", service: serviceOptions[0] ?? "", context: "", request: "" });
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("create");
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateAvis = () => {
    if (!createForm.patientId || !createForm.request.trim()) {
      return;
    }
    const patient = patientsDirectory.find((item) => item.id === createForm.patientId);
    if (!patient) {
      return;
    }
    setIsSubmitting(true);
    const newAvis: AvisItem = {
      id: `AV-${Date.now()}`,
      service: createForm.service,
      direction: "outgoing",
      requestedBy: "Notre service",
      requestedAt: new Date().toISOString(),
      status: "in-progress",
      summary: createForm.request.slice(0, 120).concat(createForm.request.length > 120 ? "…" : ""),
      patient,
      request: createForm.request,
      context: createForm.context || "Contexte en attente de complétion.",
    };
    setTimeout(() => {
      setAvisItems((previous) => [newAvis, ...previous]);
      setAvisMessages((previous) => ({ ...previous, [newAvis.id]: [] }));
      if (typeof window !== "undefined" && window.innerWidth < 1280) {
        setMobilePanelMode("view");
        setIsMobilePanelOpen(true);
      }
      setActiveAvisId(newAvis.id);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
    }, 350);
  };

  const renderCreateFormContent = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Patient
        </label>
        <select
          value={createForm.patientId}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, patientId: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Sélectionner un patient…</option>
          {patientsDirectory.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} · {patient.id}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Service sollicité
        </label>
        <select
          value={createForm.service}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, service: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Contexte clinique
        </label>
        <textarea
          value={createForm.context}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, context: event.target.value }))
          }
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Résumer les éléments clés du dossier : chronologie, examens déjà réalisés, points d'alerte…"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Question formulée
        </label>
        <textarea
          value={createForm.request}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, request: event.target.value }))
          }
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Précisez l'avis attendu : option opératoire, adaptation thérapeutique, coordination avec un plateau technique, etc."
        />
      </div>
    </div>
  );

  const detailView = !activeAvis ? (
    <CardContent className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={Stethoscope}
        title="Sélectionnez un avis"
        description="Choisissez une demande d'avis pour afficher le dossier associé et répondre."
      />
    </CardContent>
  ) : (
    <>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {activeAvis.patient.name} · {activeAvis.patient.id}
            </CardTitle>
            <CardDescription>
              {activeAvis.service} — {formatDateTime(activeAvis.requestedAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/patients/dossier?id=${activeAvis.patient.id}`)}
            >
              Voir dossier
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5 pt-0">
        <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ArrowLeftRight className="h-4 w-4" />
            Informations patient
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Service référent
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeAvis.patient.service}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Diagnostic
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeAvis.patient.diagnosis}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Sollicité par
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeAvis.direction === "incoming" ? activeAvis.requestedBy : "Notre service"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Dernière mise à jour
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {formatDateTime(activeAvis.seenAt ?? activeAvis.requestedAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contexte clinique
          </header>
          <p className="text-sm leading-relaxed text-slate-700">
            {activeAvis.context}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Demande
          </header>
          <p className="text-sm leading-relaxed text-slate-700">
            {activeAvis.request}
          </p>
        </section>

        <section className="flex flex-1 flex-col rounded-2xl bg-amber-50/60 p-4 shadow-inner">
          <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Réponse
          </header>
          {activeThread.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-amber-200/80 bg-white/70 px-4 py-6 text-sm text-amber-700">
              Aucun échange enregistré pour l&apos;instant.
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {activeThread.map((message) => {
                const isOutgoing = message.direction === "outgoing";
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                      isOutgoing
                        ? "ml-auto bg-indigo-600 text-white"
                        : "mr-auto bg-white text-slate-700",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold">
                        {message.author}
                      </span>
                      <span className={cn(isOutgoing ? "text-indigo-100" : "text-slate-400")}>
                        {formatDateTime(message.sentAt)}
                      </span>
                    </div>
                    <p className={cn("mt-1", isOutgoing ? "text-indigo-100" : "text-slate-700")}>
                      {message.content}
                    </p>
                  </div>
                );
              })}
              <div ref={threadEndRef} />
            </div>
          )}
        </section>

        <div className="mt-auto space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
          <textarea
            value={replyDraft}
            onChange={(event) => setReplyDraft(event.target.value)}
            onKeyDown={handleReplyKeyDown}
            className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Répondez à la demande : examens complémentaires, conduite à tenir, points de vigilance…"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="mr-2 h-4 w-4" />
              Joindre un document
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitReply} disabled={!replyDraft.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer la réponse
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Avis interservices</h1>
          <p className="text-sm text-slate-500">
            Consultez les demandes d&apos;avis des autres services et partagez vos recommandations en retour.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto"
          onClick={handleOpenCreateModal}
        >
          <MailPlus className="mr-2 h-4 w-4" />
          Demander un avis
        </Button>
      </section>

      <section className="grid flex-1 gap-6 xl:grid-cols-[1.3fr_2fr]">
        <Card className="flex h-full flex-col border-none bg-white/95">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "incoming", "outgoing"] as TabFilter[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
                      filter === tab
                        ? "bg-indigo-600 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200",
                    )}
                  >
                    {tab === "all" ? "Tous" : tab === "incoming" ? "Reçus" : "Émis"}
                  </button>
                ))}
              </div>
              <Badge variant="muted" className="bg-slate-100 text-slate-600">
                {filteredAvis.length} avis
              </Badge>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un service, un patient ou un diagnostic"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 px-6 pb-6">
            {filteredAvis.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Aucun avis à afficher"
                description="Modifiez les filtres ou enregistrez un nouvel avis pour le partager avec un service."
              />
            ) : (
              <div className="flex h-full flex-col overflow-y-auto pt-4">
                <ul className="flex flex-col gap-3">
                  {filteredAvis.map((avis) => {
                    const isActive = avis.id === activeAvisId;
                    const directionLabel =
                      avis.direction === "incoming" ? "Demandé par" : "Demandé par nous";

                    return (
                      <li key={avis.id}>
                        <button
                          type="button"
                          onClick={() => setActiveAvisId(avis.id)}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition",
                            "hover:-translate-y-[1px] hover:shadow-md",
                            isActive
                              ? "border-indigo-200 bg-indigo-50/80"
                              : "border-slate-200 bg-white",
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {avis.service}
                              </p>
                              <p className="text-xs text-slate-500">
                                {directionLabel} {avis.direction === "incoming" ? avis.requestedBy : ""}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatDateTime(avis.requestedAt)}
                            </span>
                          </div>
                          <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <p className="font-semibold text-slate-700">
                              {avis.patient.name} · {avis.patient.id}
                            </p>
                            <p className="text-xs text-slate-500">
                              {avis.patient.diagnosis}
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            {avis.summary}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col border-none bg-white/95">
          {!activeAvis ? (
            <CardContent className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={Stethoscope}
                title="Sélectionnez un avis"
                description="Choisissez une demande d'avis pour afficher le dossier associé et répondre."
              />
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      {activeAvis.patient.name} · {activeAvis.patient.id}
                    </CardTitle>
                    <CardDescription>
                      {activeAvis.service} — {formatDateTime(activeAvis.requestedAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/patients/dossier?id=${activeAvis.patient.id}`)}
                    >
                      Voir dossier
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5 pt-0">
                <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                  <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ArrowLeftRight className="h-4 w-4" />
                    Informations patient
                  </header>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Service référent
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {activeAvis.patient.service}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Diagnostic
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {activeAvis.patient.diagnosis}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Sollicité par
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {activeAvis.direction === "incoming" ? activeAvis.requestedBy : "Notre service"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Dernière mise à jour
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDateTime(activeAvis.seenAt ?? activeAvis.requestedAt)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-4 shadow-sm">
                  <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contexte clinique
                  </header>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {activeAvis.context}
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Demande
                  </header>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {activeAvis.request}
                  </p>
                </section>

                <section className="flex flex-1 flex-col rounded-2xl bg-amber-50/60 p-4 shadow-inner">
                  <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Réponse
                  </header>
                  {activeThread.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-amber-200/80 bg-white/70 px-4 py-6 text-sm text-amber-700">
                      Aucun échange enregistré pour l&apos;instant.
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {activeThread.map((message) => {
                        const isOutgoing = message.direction === "outgoing";
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                              isOutgoing
                                ? "ml-auto bg-indigo-600 text-white"
                                : "mr-auto bg-white text-slate-700",
                            )}
                          >
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold">
                                {message.author}
                              </span>
                              <span className={cn(isOutgoing ? "text-indigo-100" : "text-slate-400")}>
                                {formatDateTime(message.sentAt)}
                              </span>
                            </div>
                            <p className={cn("mt-1", isOutgoing ? "text-indigo-100" : "text-slate-700")}>{message.content}</p>
                          </div>
                        );
                      })}
                      <div ref={threadEndRef} />
                    </div>
                  )}
                </section>

                <div className="mt-auto space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                  <textarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Répondez à la demande : examens complémentaires, conduite à tenir, points de vigilance…"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Joindre un document
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSubmitReply} disabled={!replyDraft.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer la réponse
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </section>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Demander un avis interservice"
        description="Partagez le contexte clinique et la question posée au service sollicité."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAvis}
              disabled={!createForm.patientId || !createForm.request.trim() || isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Envoi en cours…" : "Envoyer la demande"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient
            </label>
            <select
              value={createForm.patientId}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, patientId: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Sélectionner un patient…</option>
              {patientsDirectory.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · {patient.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Service sollicité
            </label>
            <select
              value={createForm.service}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, service: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contexte clinique
            </label>
            <textarea
              value={createForm.context}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, context: event.target.value }))
              }
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Résumer les éléments clés du dossier : chronologie, examens déjà réalisés, points d'alerte…"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Question formulée
            </label>
            <textarea
              value={createForm.request}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, request: event.target.value }))
              }
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Précisez l&apos;avis attendu : option opératoire, adaptation thérapeutique, coordination avec un plateau technique, etc."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
