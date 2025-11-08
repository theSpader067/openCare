"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Activity, Beaker, Download, FlaskConical, List, Search, ClipboardList, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import { HistoryFilters } from "./history-filters";
import { PendingAnalyseCard } from "./pending-analyse-card";

type Analyse = {
  id: string;
  patient: string;
  type: string;
  requestedAt: string;
  requestedDate: string;
  requester: string;
  status: "En cours" | "Terminée" | "Urgent";
};

type AnalyseDetail = {
  results: Array<{
    label: string;
    value: string;
    reference: string;
  }>;
  interpretation: string;
  historicalValues?: Array<{
    date: string;
    results: Array<{
      label: string;
      value: string;
    }>;
  }>;
};

const REFERENCE_REQUEST_DATE = new Date("2024-03-13T12:00:00+01:00");

function deriveRequestedDate(label: string): string {
  const parts = label.split("·").map((part) => part.trim());
  const dayPart = (parts[0] ?? "").toLowerCase();
  const timePart = parts[1] ?? "";
  const base = new Date(REFERENCE_REQUEST_DATE.getTime());

  if (timePart) {
    const [hours, minutes] = timePart.split(":").map((value) => Number.parseInt(value, 10));
    base.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  } else {
    base.setHours(8, 0, 0, 0);
  }

  if (dayPart.includes("avant")) {
    base.setDate(base.getDate() - 2);
  } else if (dayPart.includes("hier")) {
    base.setDate(base.getDate() - 1);
  }

  return base.toISOString();
}

function withRequestedDate(data: Omit<Analyse, "requestedDate">): Analyse {
  return {
    ...data,
    requestedDate: deriveRequestedDate(data.requestedAt),
  };
}

function formatAnalyseDateTime(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const statusBadgeMap: Record<Analyse["status"], string> = {
  "En cours": "bg-sky-500/15 text-sky-700",
  Terminée: "bg-emerald-500/15 text-emerald-700",
  Urgent: "bg-rose-500/15 text-rose-700",
};

const pendingSeed: Analyse[] = [
  withRequestedDate({
    id: "LAB-00093",
    patient: "Fatou Diop",
    type: "Gaz du sang artériel",
    requestedAt: "Aujourd'hui · 08:45",
    requester: "Dr. Dupont",
    status: "Urgent",
  }),
  withRequestedDate({
    id: "LAB-00094",
    patient: "Louis Martin",
    type: "Bilan de coagulation",
    requestedAt: "Aujourd'hui · 09:05",
    requester: "Dr. Lambert",
    status: "En cours",
  }),
  withRequestedDate({
    id: "LAB-00095",
    patient: "Maria Alvarez",
    type: "Groupage sanguin",
    requestedAt: "Aujourd'hui · 07:25",
    requester: "Bloc opératoire",
    status: "En cours",
  }),
  withRequestedDate({
    id: "LAB-00096",
    patient: "Jules Bernard",
    type: "Lactates sanguins",
    requestedAt: "Aujourd'hui · 09:40",
    requester: "Réanimation",
    status: "Urgent",
  }),
  withRequestedDate({
    id: "LAB-00097",
    patient: "Awa Ndiaye",
    type: "Dosage protéinurie",
    requestedAt: "Aujourd'hui · 06:55",
    requester: "Maternité",
    status: "En cours",
  }),
  withRequestedDate({
    id: "LAB-00098",
    patient: "Inès Boucher",
    type: "Fer sérique + Ferritine",
    requestedAt: "Hier · 23:15",
    requester: "Médecine interne",
    status: "En cours",
  }),
];

const historySeed: Analyse[] = [
  withRequestedDate({
    id: "LAB-00092",
    patient: "Thierry Morel",
    type: "Bilan hépatique",
    requestedAt: "Aujourd'hui · 07:55",
    requester: "Chirurgie thoracique",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00091",
    patient: "Nora Haddad",
    type: "HbA1c",
    requestedAt: "Aujourd'hui · 07:20",
    requester: "Endocrinologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00090",
    patient: "Ousmane Faye",
    type: "Bilan ionogramme",
    requestedAt: "Aujourd'hui · 06:40",
    requester: "Néphrologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00089",
    patient: "Sophie Laurent",
    type: "Test allergologique",
    requestedAt: "Aujourd'hui · 05:55",
    requester: "Pneumologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00088",
    patient: "Claire Dubois",
    type: "Bilan pré-chimiothérapie",
    requestedAt: "Hier · 21:10",
    requester: "Oncologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00087",
    patient: "Awa Ndiaye",
    type: "Numération plaquettaire",
    requestedAt: "Hier · 19:25",
    requester: "Maternité",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00086",
    patient: "Fatou Diop",
    type: "CRP",
    requestedAt: "Hier · 17:15",
    requester: "Chirurgie digestive",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00085",
    patient: "Louis Martin",
    type: "Dosage INR",
    requestedAt: "Hier · 16:05",
    requester: "Cardiologie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00084",
    patient: "Maria Alvarez",
    type: "Bilan pré-opératoire",
    requestedAt: "Hier · 15:40",
    requester: "Orthopédie",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00083",
    patient: "Inès Boucher",
    type: "Bilan martial",
    requestedAt: "Hier · 14:10",
    requester: "Médecine interne",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00082",
    patient: "Jules Bernard",
    type: "Bilan toxico",
    requestedAt: "Hier · 12:20",
    requester: "Urgences",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00081",
    patient: "Claire N'Guessan",
    type: "Troponines",
    requestedAt: "Hier · 11:35",
    requester: "Dr. Pereira",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00074",
    patient: "Jules Bernard",
    type: "PCR virale",
    requestedAt: "Hier · 15:20",
    requester: "Urgences",
    status: "Terminée",
  }),
  withRequestedDate({
    id: "LAB-00071",
    patient: "Claire N'Guessan",
    type: "Bilan pré-opératoire",
    requestedAt: "Hier · 09:10",
    requester: "Dr. Pereira",
    status: "Terminée",
  }),
];

const analyseDetails: Record<string, AnalyseDetail> = {
  "LAB-00092": {
    results: [
      { label: "ASAT", value: "32 U/L", reference: "15 – 37" },
      { label: "ALAT", value: "28 U/L", reference: "12 – 45" },
      { label: "Bilirubine totale", value: "11 µmol/L", reference: "< 21" },
    ],
    interpretation:
      "Bilan hépatique dans les valeurs usuelles. Poursuivre la surveillance post-opératoire quotidienne.",
    historicalValues: [
      {
        date: "2024-03-10T14:30:00+01:00",
        results: [
          { label: "ASAT", value: "38 U/L" },
          { label: "ALAT", value: "35 U/L" },
          { label: "Bilirubine totale", value: "15 µmol/L" },
        ],
      },
      {
        date: "2024-03-07T09:15:00+01:00",
        results: [
          { label: "ASAT", value: "52 U/L" },
          { label: "ALAT", value: "48 U/L" },
          { label: "Bilirubine totale", value: "18 µmol/L" },
        ],
      },
    ],
  },
  "LAB-00091": {
    results: [
      { label: "HbA1c", value: "7,8 %", reference: "< 7 %" },
      { label: "Glycémie à jeun", value: "1,20 g/L", reference: "0,70 – 1,00" },
    ],
    interpretation:
      "Equilibre glycémique insuffisant. Proposer un ajustement thérapeutique et renforcer l'éducation diététique.",
    historicalValues: [
      {
        date: "2024-02-13T10:00:00+01:00",
        results: [
          { label: "HbA1c", value: "8,2 %" },
          { label: "Glycémie à jeun", value: "1,35 g/L" },
        ],
      },
      {
        date: "2024-01-10T10:00:00+01:00",
        results: [
          { label: "HbA1c", value: "8,5 %" },
          { label: "Glycémie à jeun", value: "1,42 g/L" },
        ],
      },
    ],
  },
  "LAB-00090": {
    results: [
      { label: "Na+", value: "134 mmol/L", reference: "135 – 145" },
      { label: "K+", value: "4,9 mmol/L", reference: "3,5 – 5,0" },
      { label: "Cl-", value: "99 mmol/L", reference: "98 – 107" },
    ],
    interpretation:
      "Ionogramme compatible avec une légère hyponatrémie. Adapter le protocole de dialyse de ce soir.",
  },
  "LAB-00089": {
    results: [
      { label: "IgE spécifiques", value: "Elevées", reference: "< 0,7 kUA/L" },
      { label: "Test cutané", value: "Positif aux graminées", reference: "Négatif" },
    ],
    interpretation:
      "Allergie saisonnière confirmée. Mettre à jour le plan de traitement inhalé et prévoir désensibilisation.",
  },
  "LAB-00088": {
    results: [
      { label: "Hb", value: "11,4 g/dL", reference: "12 – 16" },
      { label: "GB", value: "6,2 G/L", reference: "4 – 10" },
      { label: "Plaquettes", value: "180 G/L", reference: "150 – 400" },
    ],
    interpretation:
      "Paramètres acceptables pour la poursuite de la chimiothérapie. Recommander supplémentation en fer.",
  },
  "LAB-00087": {
    results: [
      { label: "Plaquettes", value: "165 G/L", reference: "150 – 400" },
      { label: "Hb", value: "12,2 g/dL", reference: "11 – 15" },
    ],
    interpretation:
      "Tendance plaquettaire à surveiller chaque 48h. Aucun signe d'HELLP.",
  },
  "LAB-00086": {
    results: [
      { label: "CRP", value: "18 mg/L", reference: "< 5" },
      { label: "Leucocytes", value: "12,4 G/L", reference: "4 – 10" },
    ],
    interpretation:
      "Inflammation modérée persistante. Poursuivre l'antibiothérapie et contrôle CRP à J+2.",
  },
  "LAB-00085": {
    results: [
      { label: "INR", value: "3,2", reference: "2,0 – 3,0" },
      { label: "TP", value: "45 %", reference: "70 – 100" },
    ],
    interpretation:
      "Anticoagulation supra-thérapeutique. Discuter ajustement des doses de warfarine.",
  },
  "LAB-00084": {
    results: [
      { label: "Hémoglobine", value: "12,9 g/dL", reference: "12 – 16" },
      { label: "Plaquettes", value: "210 G/L", reference: "150 – 400" },
      { label: "INR", value: "1,1", reference: "0,9 – 1,1" },
    ],
    interpretation:
      "Bilan pré-op correct. Feu vert pour bloc opératoire lundi matin.",
  },
  "LAB-00083": {
    results: [
      { label: "Fer", value: "28 µmol/L", reference: "10 – 30" },
      { label: "Ferritine", value: "120 µg/L", reference: "15 – 150" },
    ],
    interpretation:
      "Réserves martiales satisfaisantes après perfusion. Prévoir contrôle dans 4 semaines.",
  },
  "LAB-00082": {
    results: [
      { label: "Ethanol", value: "Négatif", reference: "Négatif" },
      { label: "Opiacés", value: "Négatif", reference: "Négatif" },
      { label: "Benzodiazépines", value: "Présence", reference: "Négatif" },
    ],
    interpretation:
      "Usage ponctuel de benzodiazépines. Consigner dans le dossier et informer le médecin traitant.",
  },
  "LAB-00081": {
    results: [
      { label: "Troponine", value: "48 ng/L", reference: "< 14" },
      { label: "CK-MB", value: "22 U/L", reference: "< 25" },
    ],
    interpretation:
      "Biomarqueurs compatibles avec syndrome coronarien aigu. Patient admis en USIC.",
  },
  "LAB-00074": {
    results: [
      { label: "PCR SARS-CoV-2", value: "Négatif", reference: "Négatif" },
    ],
    interpretation:
      "Absence d'infection virale détectée. Lever les mesures d'isolement spécifiques.",
  },
  "LAB-00071": {
    results: [
      { label: "Créatinine", value: "82 µmol/L", reference: "60 – 110" },
      { label: "Glycémie", value: "0,96 g/L", reference: "0,7 – 1,0" },
    ],
    interpretation:
      "Paramètres stables. Prochain contrôle pré-op programmé demain matin.",
  },
};

function useSectionData<T>(seed: T[], delay = 600) {
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

export default function AnalysesPage() {
  const { data: pendingAnalyses, isLoading: pendingLoading } =
    useSectionData(pendingSeed, 700);
  const { data: historyAnalyses, isLoading: historyLoading } =
    useSectionData(historySeed, 900);

  const [currentPage, setCurrentPage] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({
    query: "",
    type: "all",
    from: "",
    to: "",
  });
  const PAGE_SIZE = 8;

  const uniqueHistoryTypes = useMemo(
    () => Array.from(new Set(historyAnalyses.map((analyse) => analyse.type))).sort(),
    [historyAnalyses],
  );

  const filteredHistoryAnalyses = useMemo(
    () =>
      historyAnalyses.filter((analyse) => {
        const query = historyFilters.query.trim().toLowerCase();
        if (
          query &&
          !analyse.patient.toLowerCase().includes(query) &&
          !analyse.id.toLowerCase().includes(query)
        ) {
          return false;
        }

        if (historyFilters.type !== "all" && analyse.type !== historyFilters.type) {
          return false;
        }

        const requestedTime = new Date(analyse.requestedDate).getTime();

        if (historyFilters.from) {
          const fromTime = new Date(historyFilters.from).setHours(0, 0, 0, 0);
          if (requestedTime < fromTime) {
            return false;
          }
        }

        if (historyFilters.to) {
          const toTime = new Date(historyFilters.to).setHours(23, 59, 59, 999);
          if (requestedTime > toTime) {
            return false;
          }
        }

        return true;
      }),
    [historyAnalyses, historyFilters],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHistoryAnalyses.length / PAGE_SIZE) || 1,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [historyFilters]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHistoryAnalyses.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredHistoryAnalyses]);

  const startItem =
    filteredHistoryAnalyses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem =
    filteredHistoryAnalyses.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, filteredHistoryAnalyses.length);

  const [selectedBilan, setSelectedBilan] = useState<Analyse | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isPendingPanelOpen, setIsPendingPanelOpen] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    type: "",
    patient: "",
    priority: "En cours" as Analyse["status"],
    requester: "",
    comment: "",
  });

  const selectedDetails = selectedBilan
    ? analyseDetails[selectedBilan.id]
    : undefined;

  const handleHistoryFilterChange = <K extends keyof typeof historyFilters>(
    key: K,
    value: string,
  ) => {
    setHistoryFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetHistoryFilters = () =>
    setHistoryFilters({
      query: "",
      type: "all",
      from: "",
      to: "",
    });

  const categorizeAnalyse = (analyse: Analyse): "bilan" | "imagerie" | "anapath" => {
    const label = analyse.type.toLowerCase();
    if (
      label.includes("scanner") ||
      label.includes("irm") ||
      label.includes("radio") ||
      label.includes("imagerie") ||
      label.includes("échographie")
    ) {
      return "imagerie";
    }
    if (
      label.includes("anapath") ||
      label.includes("anatomopath") ||
      label.includes("biopsie") ||
      label.includes("histologie") ||
      label.includes("cytologie")
    ) {
      return "anapath";
    }
    return "bilan";
  };

  const statsByCategory = useMemo(() => {
    const base: Record<
      "bilan" | "imagerie" | "anapath",
      { label: string; ongoing: number; completed: number; icon: ComponentType<{ className?: string }>; gradient: string; iconBg: string }
    > = {
      bilan: {
        label: "Bilans",
        ongoing: 0,
        completed: 0,
        icon: Beaker,
        gradient: "from-sky-400/15 via-sky-400/5 to-transparent",
        iconBg: "bg-sky-500/15 text-sky-600",
      },
      imagerie: {
        label: "Imagerie",
        ongoing: 0,
        completed: 0,
        icon: Activity,
        gradient: "from-amber-400/15 via-amber-400/5 to-transparent",
        iconBg: "bg-amber-500/15 text-amber-600",
      },
      anapath: {
        label: "Anapath",
        ongoing: 0,
        completed: 0,
        icon: List,
        gradient: "from-rose-400/15 via-rose-400/5 to-transparent",
        iconBg: "bg-rose-500/15 text-rose-600",
      },
    };

    pendingAnalyses.forEach((analyse) => {
      const category = categorizeAnalyse(analyse);
      base[category].ongoing += 1;
    });

    historyAnalyses.forEach((analyse) => {
      const category = categorizeAnalyse(analyse);
      base[category].completed += 1;
    });

    return Object.entries(base).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [pendingAnalyses, historyAnalyses]);

  const isHistoryFilterActive =
    Boolean(historyFilters.query.trim()) ||
    historyFilters.type !== "all" ||
    Boolean(historyFilters.from) ||
    Boolean(historyFilters.to);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analyses</h1>
          <p className="text-sm text-slate-500">
            Suivi des résultats biologiques et coordination avec le laboratoire.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter les résultats
          </Button>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Beaker className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {statsByCategory.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={cn(
                "relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white/95 p-3 sm:p-4 md:p-5 shadow-sm",
                "bg-gradient-to-br",
                card.gradient,
              )}
            >
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl shadow-inner flex-shrink-0",
                    card.iconBg,
                  )}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500 line-clamp-2">
                  {card.label}
                </div>
              </div>
              <div className="mt-3 sm:mt-4 md:mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                    {card.ongoing + card.completed}
                  </p>
                  <p className="text-xs text-slate-500 leading-snug mt-1 line-clamp-2">
                    {card.ongoing + card.completed === 0
                      ? "Aucune demande suivie actuellement."
                      : `${card.ongoing + card.completed} demandes suivies dans cette spécialité.`}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-semibold text-slate-500 flex-shrink-0">
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-700 whitespace-nowrap">
                    {card.ongoing} en cours
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 whitespace-nowrap">
                    {card.completed} récupérés
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[3fr_1fr]">
        <Card className="flex h-fit flex-col overflow-hidden">
          <CardHeader className="flex flex-col gap-2 border-b border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Bilans historiques</CardTitle>
              <CardDescription>
                Résultats validés et archivés avec suivi chronologique.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <HistoryFilters
              filters={historyFilters}
              onFilterChange={handleHistoryFilterChange}
              uniqueHistoryTypes={uniqueHistoryTypes}
              isHistoryFilterActive={isHistoryFilterActive}
              resetHistoryFilters={resetHistoryFilters}
            />
            {historyLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner label="Récupération de l'historique..." />
              </div>
            ) : filteredHistoryAnalyses.length === 0 ? (
              historyAnalyses.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="Aucun bilan disponible"
                  description="Une fois les analyses validées par le laboratoire, elles apparaîtront automatiquement dans cette liste."
                  action={
                    <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                      Créer une demande
                    </Button>
                  }
                />
              ) : (
                <div className="flex h-48 items-center justify-center px-6 py-10 text-sm text-slate-500">
                  <div className="text-center">
                    <p>Aucun résultat ne correspond à ces critères.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      onClick={resetHistoryFilters}
                    >
                      Effacer les filtres
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500">
                          N° analyse
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-500">
                          Patient
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-500">
                          Type
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-500">
                          Demande
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedHistory.map((analyse) => (
                        <tr
                          key={analyse.id}
                          className="cursor-pointer transition hover:bg-slate-50/70"
                          onClick={() => setSelectedBilan(analyse)}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {analyse.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {analyse.patient}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {analyse.type}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {formatAnalyseDateTime(analyse.requestedDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {startItem === 0
                      ? "Aucune analyse à afficher"
                      : `Affichage ${startItem}–${endItem} sur ${filteredHistoryAnalyses.length} analyses`}
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                    >
                      Précédent
                    </Button>
                    <span className="text-xs text-slate-500">
                      Page {filteredHistoryAnalyses.length === 0 ? 0 : currentPage} /{" "}
                      {filteredHistoryAnalyses.length === 0 ? 0 : totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      disabled={currentPage === totalPages || endItem === 0}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1),
                        )
                      }
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hidden h-full flex-col xl:flex overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>Ordres en attente</CardTitle>
            <CardDescription>
              Priorisation des analyses non traitées et contacts laboratoire.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            {pendingLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner label="Connexion au laboratoire..." />
              </div>
            ) : pendingAnalyses.length === 0 ? (
              <EmptyState
                icon={FlaskConical}
                title="Aucune demande en attente"
                description="Créez une nouvelle demande pour lancer un ordre d'analyse."
                action={
                  <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                    Nouvel ordre
                  </Button>
                }
              />
            ) : (
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {pendingAnalyses.map((analyse) => (
                    <PendingAnalyseCard key={analyse.id} analyse={analyse} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Floating button for mobile */}
      <button
        onClick={() => setIsPendingPanelOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl xl:hidden"
        aria-label="Ouvrir les ordres en attente"
      >
        <ClipboardList className="h-6 w-6" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden",
          isPendingPanelOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsPendingPanelOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col rounded-r-3xl border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 xl:hidden",
          isPendingPanelOpen
            ? "translate-x-0"
            : "pointer-events-none -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ordres en attente</h2>
            <p className="text-sm text-slate-500">
              Analyses non traitées
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            onClick={() => setIsPendingPanelOpen(false)}
            aria-label="Fermer le panneau"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {pendingLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner label="Connexion au laboratoire..." />
            </div>
          ) : pendingAnalyses.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="Aucune demande en attente"
              description="Créez une nouvelle demande pour lancer un ordre d'analyse."
              action={
                <Button variant="primary" onClick={() => {
                  setCreateModalOpen(true);
                  setIsPendingPanelOpen(false);
                }}>
                  Nouvel ordre
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {pendingAnalyses.map((analyse) => (
                <PendingAnalyseCard key={analyse.id} analyse={analyse} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(selectedBilan)}
        onClose={() => setSelectedBilan(null)}
        title={selectedBilan ? `Bilan ${selectedBilan.id}` : undefined}
        description={
          selectedBilan
            ? `${selectedBilan.type} · ${selectedBilan.patient}`
            : undefined
        }
        footer={
          <Button variant="outline" onClick={() => setSelectedBilan(null)}>
            Fermer
          </Button>
        }
      >
        {selectedBilan ? (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-800">Demande :</span>{" "}
                {formatAnalyseDateTime(selectedBilan.requestedDate)}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Médecin :</span>{" "}
                {selectedBilan.requester}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Statut :</span>{" "}
                {selectedBilan.status}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Résultats
              </h3>
              {selectedDetails ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {selectedDetails.results.map((item) => (
                    <li
                      key={`${selectedBilan.id}-${item.label}`}
                      className="flex items-center justify-between rounded-xl bg-indigo-50/40 px-3 py-2"
                    >
                      <span className="font-medium text-slate-800">
                        {item.label}
                      </span>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-indigo-700">
                          {item.value}
                        </p>
                        <p className="text-xs text-slate-500">
                          Référence : {item.reference}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Les résultats détaillés ne sont pas disponibles pour ce bilan.
                </p>
              )}
            </div>
            {selectedDetails ? (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-sm text-slate-700">
                <h4 className="text-sm font-semibold text-indigo-700">
                  Interprétation
                </h4>
                <p className="mt-2 leading-relaxed">
                  {selectedDetails.interpretation}
                </p>
              </div>
            ) : null}
            {selectedDetails?.historicalValues && selectedDetails.historicalValues.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Anciens résultats
                </h3>
                <div className="mt-3 space-y-3">
                  {selectedDetails.historicalValues.map((history, index) => (
                    <div
                      key={`history-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        {formatAnalyseDateTime(history.date)}
                      </p>
                      <ul className="space-y-1 text-xs">
                        {history.results.map((item) => (
                          <li
                            key={`${index}-${item.label}`}
                            className="flex items-center justify-between text-slate-700"
                          >
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-medium text-slate-800">
                              {item.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Nouvelle demande d'analyse"
        description="Renseignez les informations nécessaires pour envoyer l'échantillon au laboratoire."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCreateModalOpen(false);
                setNewRequestForm({
                  type: "",
                  patient: "",
                  priority: "En cours",
                  requester: "",
                  comment: "",
                });
              }}
              disabled={!newRequestForm.type || !newRequestForm.patient}
            >
              Enregistrer la demande
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="new-request-type"
                className="text-sm font-semibold text-[#221b5b]"
              >
                Type d&apos;analyse
              </label>
              <input
                id="new-request-type"
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={newRequestForm.type}
                onChange={(event) =>
                  setNewRequestForm((previous) => ({
                    ...previous,
                    type: event.target.value,
                  }))
                }
                placeholder="Ex. Gaz du sang artériel"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-request-patient"
                className="text-sm font-semibold text-[#221b5b]"
              >
                Patient
              </label>
              <input
                id="new-request-patient"
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={newRequestForm.patient}
                onChange={(event) =>
                  setNewRequestForm((previous) => ({
                    ...previous,
                    patient: event.target.value,
                  }))
                }
                placeholder="Nom et prénom"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="new-request-priority"
                className="text-sm font-semibold text-[#221b5b]"
              >
                Priorité
              </label>
              <select
                id="new-request-priority"
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={newRequestForm.priority}
                onChange={(event) =>
                  setNewRequestForm((previous) => ({
                    ...previous,
                    priority: event.target.value as Analyse["status"],
                  }))
                }
              >
                <option value="En cours">Standard</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-request-owner"
                className="text-sm font-semibold text-[#221b5b]"
              >
                Prescripteur
              </label>
              <input
                id="new-request-owner"
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={newRequestForm.requester}
                onChange={(event) =>
                  setNewRequestForm((previous) => ({
                    ...previous,
                    requester: event.target.value,
                  }))
                }
                placeholder="Service ou médecin"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-request-comment"
              className="text-sm font-semibold text-[#221b5b]"
            >
              Commentaire / instruction
            </label>
            <textarea
              id="new-request-comment"
              rows={4}
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
              value={newRequestForm.comment}
              onChange={(event) =>
                setNewRequestForm((previous) => ({
                  ...previous,
                  comment: event.target.value,
                }))
              }
              placeholder="Indiquez les éléments cliniques utiles..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
