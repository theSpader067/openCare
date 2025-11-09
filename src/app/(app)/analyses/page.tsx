"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Activity, Beaker, Download, FlaskConical, List, Search, ClipboardList, X, Plus } from "lucide-react";
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
import type { Patient } from "@/types/document";
import {
  REFERENCE_REQUEST_DATE,
  statusBadgeMap,
  bilanTypeMap,
  bilanCategoryBadgeMap,
  pendingSeed,
  completedSeed,
  analyseDetails,
  mockPatientsAnalyses,
} from "@/data/analyses/analyses-data";

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
  bilanCategory: "bilan" | "imagerie" | "anapath" | "autres";
  pendingTests?: Array<{
    id: string;
    label: string;
    value?: string;
  }>;
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

function withRequestedDate(data: Omit<Analyse, "requestedDate" | "bilanCategory">): Analyse {
  return {
    ...data,
    requestedDate: deriveRequestedDate(data.requestedAt),
    bilanCategory: bilanTypeMap[data.type] || "bilan",
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

const historySeed: Analyse[] = completedSeed;


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
  const [pendingAnalyses, setPendingAnalyses] = useState<Analyse[]>([]);
  const [historyAnalyses, setHistoryAnalyses] = useState<Analyse[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const pendingTimer = setTimeout(() => {
      setPendingAnalyses(pendingSeed);
      setPendingLoading(false);
    }, 700);

    const historyTimer = setTimeout(() => {
      setHistoryAnalyses(historySeed);
      setHistoryLoading(false);
    }, 900);

    return () => {
      clearTimeout(pendingTimer);
      clearTimeout(historyTimer);
    };
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({
    query: "",
    type: "all",
    from: "",
    to: "",
  });
  const PAGE_SIZE = 8;

  const handleAnalysisCompleted = (analyse: Analyse, testValues: Record<string, string>) => {
    // Move from pending to history with Terminée status
    const completedAnalysis: Analyse = {
      ...analyse,
      status: "Terminée",
      pendingTests: analyse.pendingTests?.map((test) => ({
        ...test,
        value: testValues[test.id],
      })),
    };

    // Remove from pending
    setPendingAnalyses((prev) => prev.filter((a) => a.id !== analyse.id));

    // Add to history
    setHistoryAnalyses((prev) => [completedAnalysis, ...prev]);
  };

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
  const [patientMode, setPatientMode] = useState<"select" | "new">("select");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: "",
    histoire: "",
  });
  const [newRequestForm, setNewRequestForm] = useState({
    category: "" as "bilan" | "imagerie" | "anapath" | "autres" | "",
    name: "",
    patient: "",
    comment: "",
  });

  const mockPatients: Patient[] = mockPatientsAnalyses;

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) {
      return mockPatients;
    }
    return mockPatients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(query) ||
        patient.histoire.toLowerCase().includes(query)
      );
    });
  }, [patientSearch]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setNewRequestForm((prev) => ({ ...prev, patient: patient.fullName }));
    setPatientMode("select");
    setPatientSearch("");
  };

  const handleCreateNewPatient = () => {
    if (!newPatientForm.fullName.trim()) {
      return;
    }
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      fullName: newPatientForm.fullName,
      histoire: newPatientForm.histoire,
    };
    setSelectedPatient(newPatient);
    setNewRequestForm((prev) => ({ ...prev, patient: newPatient.fullName }));
    setNewPatientForm({ fullName: "", histoire: "" });
    setPatientMode("select");
  };

  const handleSaveNewDemande = () => {
    if (!newRequestForm.category || !newRequestForm.name || !newRequestForm.patient) {
      return;
    }

    // Create new analysis record
    const newAnalyse: Analyse = {
      id: `LAB-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      patient: newRequestForm.patient,
      type: newRequestForm.name,
      requestedAt: "Aujourd'hui",
      requestedDate: new Date().toISOString(),
      requester: "Current User",
      status: "En cours",
      bilanCategory: newRequestForm.category as "bilan" | "imagerie" | "anapath" | "autres",
      pendingTests: newRequestForm.category === "bilan"
        ? [
            { id: "test-1", label: "Test 1" },
            { id: "test-2", label: "Test 2" },
          ]
        : undefined,
    };

    // Add to pending analyses
    setPendingAnalyses((prev) => [newAnalyse, ...prev]);

    // Close modal and reset form
    setCreateModalOpen(false);
    setPatientMode("select");
    setPatientSearch("");
    setNewPatientForm({ fullName: "", histoire: "" });
    setSelectedPatient(null);
    setNewRequestForm({
      category: "",
      name: "",
      patient: "",
      comment: "",
    });
  };

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
                          Type de bilan
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-500">
                          Date
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
                            <span className={cn(
                              "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold",
                              bilanCategoryBadgeMap[analyse.bilanCategory].color,
                            )}>
                              {bilanCategoryBadgeMap[analyse.bilanCategory].label}
                            </span>
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
                    <PendingAnalyseCard
                      key={analyse.id}
                      analyse={analyse}
                      onCompleted={handleAnalysisCompleted}
                    />
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
          isPendingPanelOpen ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsPendingPanelOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col rounded-r-3xl border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 xl:hidden pointer-events-auto",
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
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
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
                <PendingAnalyseCard
                  key={analyse.id}
                  analyse={analyse}
                  onCompleted={handleAnalysisCompleted}
                />
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
          <div className="space-y-4 h-[65vh] overflow-y-auto flex flex-col">
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-800">Demande :</span>{" "}
                {formatAnalyseDateTime(selectedBilan.requestedDate)}
              </p>
            </div>

            {/* Content adapted by type */}
            {selectedBilan.bilanCategory === "bilan" ? (
              <>
                {/* BILAN: Results table view */}
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
              </>
            ) : (
              <>
                {/* IMAGERIE/ANAPATH/AUTRES: Report textarea view */}
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-slate-800 mb-2">
                    Rapport d'analyse
                  </label>
                  <textarea
                    disabled
                    value={selectedDetails?.interpretation || "Aucun rapport disponible pour le moment."}
                    className="flex-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 resize-none focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setPatientMode("select");
          setPatientSearch("");
          setNewPatientForm({ fullName: "", histoire: "" });
          setSelectedPatient(null);
          setNewRequestForm({
            category: "",
            name: "",
            patient: "",
            comment: "",
          });
        }}
        title="Nouvelle demande d'analyse"
        description="Renseignez les informations nécessaires pour envoyer l'échantillon au laboratoire."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
              setCreateModalOpen(false);
              setPatientMode("select");
              setPatientSearch("");
              setNewPatientForm({ fullName: "", histoire: "" });
              setSelectedPatient(null);
              setNewRequestForm({
                category: "",
                name: "",
                patient: "",
                comment: "",
              });
            }}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewDemande}
              disabled={!newRequestForm.category || !newRequestForm.name || !newRequestForm.patient}
            >
              Enregistrer la demande
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <label
              htmlFor="new-request-category"
              className="text-sm font-semibold text-[#221b5b]"
            >
              Type d&apos;analyse
            </label>
            <select
              id="new-request-category"
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
              value={newRequestForm.category}
              onChange={(event) =>
                setNewRequestForm((previous) => ({
                  ...previous,
                  category: event.target.value as "bilan" | "imagerie" | "anapath" | "autres" | "",
                }))
              }
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="bilan">Bilan</option>
              <option value="imagerie">Imagerie</option>
              <option value="anapath">Anapath</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          {/* Name d'analyse */}
          <div className="space-y-2">
            <label
              htmlFor="new-request-name"
              className="text-sm font-semibold text-[#221b5b]"
            >
              Nom de l&apos;analyse
            </label>
            <input
              id="new-request-name"
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
              value={newRequestForm.name}
              onChange={(event) =>
                setNewRequestForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              placeholder="Ex. Gaz du sang artériel"
            />
          </div>

          {/* Patient Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#221b5b]">
              Patient
            </label>

            {/* Mode Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setPatientMode("select")}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition",
                  patientMode === "select"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600"
                )}
              >
                Existants
              </button>
              <button
                type="button"
                onClick={() => setPatientMode("new")}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition",
                  patientMode === "new"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600"
                )}
              >
                Nouveau
              </button>
            </div>

            {/* Patient Mode Content */}
            {patientMode === "select" ? (
              <div className="space-y-3">
                {/* Search Input */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un patient..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                  />
                </div>
                {/* Patients List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                      >
                        <p className="font-medium text-slate-900">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {patient.histoire}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-slate-500 py-4">
                      Aucun patient trouvé
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    Nom et prénom
                  </label>
                  <input
                    type="text"
                    value={newPatientForm.fullName}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Entrez le nom et prénom..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    Historique / Notes
                  </label>
                  <textarea
                    value={newPatientForm.histoire}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        histoire: e.target.value,
                      }))
                    }
                    placeholder="Entrez l'historique..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <Button
                  onClick={handleCreateNewPatient}
                  disabled={!newPatientForm.fullName?.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer et sélectionner
                </Button>
              </div>
            )}

            {/* Selected Patient Display */}
            {selectedPatient && (
              <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50">
                <p className="text-sm font-medium text-indigo-900">
                  ✓ {selectedPatient.fullName}
                </p>
              </div>
            )}
          </div>

          {/* Comment */}
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
