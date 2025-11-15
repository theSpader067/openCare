"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useSession } from "next-auth/react";
import { Activity, Beaker, Download, FlaskConical, List, Search, ClipboardList, X, Plus, Loader } from "lucide-react";
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
  bilanStructure,
  analyseDetails,
  mockPatientsAnalyses,
} from "@/data/analyses/analyses-data";

import { HistoryFilters } from "./history-filters";
import { PendingAnalyseCard } from "./pending-analyse-card";
import { PatientCreate } from "@/components/document/PatientCreate";
import { createAnalyse, fetchAnalyses } from "@/lib/api/analyses";

export type Analyse = {
  id: string;
  apiId?: number; // Numeric ID from API for PATCH requests
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
  labEntries?: Array<{
    id?: number;
    name?: string | null;
    value?: string | null;
    interpretation?: string | null;
    analyseId?: number;
    [key: string]: any;
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

export default function AnalysesPage() {
  const { data: session } = useSession();
  const [pendingAnalyses, setPendingAnalyses] = useState<Analyse[]>([]);
  const [historyAnalyses, setHistoryAnalyses] = useState<Analyse[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isSavingAnalyse, setIsSavingAnalyse] = useState(false);

  // Load pending analyses from API (status = "En cours")
  useEffect(() => {
    const loadPendingAnalyses = async () => {
      setPendingLoading(true);
      try {
        const apiAnalyses = await fetchAnalyses();
        console.log("All analyses from API:", apiAnalyses);

        // Filter to pending analyses (status = "En cours") and convert
        const convertedAnalyses = apiAnalyses
          .filter((analyse) => !analyse.status || analyse.status === "En cours")
          .map((analyse) => ({
            id: analyse.labId || analyse.id.toString(),
            apiId: analyse.id,
            patient: analyse.patient?.fullName || analyse.patientName || "",
            type: analyse.title || "",
            requestedAt: "Aujourd'hui",
            requestedDate: analyse.createdAt,
            requester: "Current User",
            status: ("En cours" as "En cours" | "Terminée" | "Urgent"),
            bilanCategory: (analyse.category as "bilan" | "imagerie" | "anapath" | "autres") || "bilan",
            labEntries: analyse.labEntries || [],
          }));

        setPendingAnalyses(convertedAnalyses);
      } catch (error) {
        console.error("Error loading pending analyses:", error);
        // Show empty state on error instead of seed data
        setPendingAnalyses([]);
      } finally {
        setPendingLoading(false);
      }
    };

    if (session?.user) {
      loadPendingAnalyses();
    } else {
      setPendingLoading(false);
    }
  }, [session?.user]);

  // Load history analyses from API
  useEffect(() => {
    const loadHistoryAnalyses = async () => {
      setHistoryLoading(true);
      try {
        const apiAnalyses = await fetchAnalyses();
        // Filter to completed/history analyses and convert
        const convertedAnalyses = apiAnalyses
          .filter((analyse) => analyse.status === "Terminée")
          .map((analyse) => ({
            id: analyse.labId || analyse.id.toString(),
            apiId: analyse.id,
            patient: analyse.patient?.fullName || analyse.patientName || "",
            type: analyse.title || "",
            requestedAt: "Aujourd'hui",
            requestedDate: analyse.createdAt,
            requester: "Current User",
            status: (analyse.status as "En cours" | "Terminée" | "Urgent") || "Terminée",
            bilanCategory: (analyse.category as "bilan" | "imagerie" | "anapath" | "autres") || "bilan",
            labEntries: analyse.labEntries || [],
          }));
        setHistoryAnalyses(convertedAnalyses);
      } catch (error) {
        console.error("Error loading history analyses:", error);
        setHistoryAnalyses([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (session?.user) {
      loadHistoryAnalyses();
    } else {
      setHistoryLoading(false);
    }
  }, [session?.user]);

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
    selectedBilans: [] as string[],
    customBilans: "",
  });
  const [editedLabValues, setEditedLabValues] = useState<Record<number, string>>({});
  const [isSavingLabValues, setIsSavingLabValues] = useState(false);

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

  const handleCreateNewPatient = async (formData: Record<string, string>) => {
    if (!formData.fullName?.trim()) {
      return;
    }
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      fullName: formData.fullName,
      histoire: formData.histoire || formData.histoire,
      age: formData.age ? parseInt(formData.age) : undefined,
    };
    setSelectedPatient(newPatient);
    setNewRequestForm((prev) => ({ ...prev, patient: newPatient.fullName }));
    setNewPatientForm({ fullName: "", histoire: "" });
    setPatientMode("select");
  };

  const handleSaveNewDemande = async () => {
    // Validate category and patient
    if (!newRequestForm.category || !newRequestForm.patient) {
      return;
    }

    // Validate name based on category
    let analysisName = newRequestForm.name;
    let selectedBilans: string[] = [];
    let customBilans = "";

    if (newRequestForm.category === "bilan") {
      if (newRequestForm.selectedBilans.length === 0) {
        return;
      }
      selectedBilans = newRequestForm.selectedBilans;
      customBilans = newRequestForm.customBilans;
      // Create analysis name from selected bilans
      const allBilans = [...newRequestForm.selectedBilans];
      if (newRequestForm.customBilans.trim()) {
        const customItems = newRequestForm.customBilans
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        allBilans.push(...customItems);
      }
      analysisName = allBilans.join(", ");
    } else {
      if (!newRequestForm.name) {
        return;
      }
    }

    setIsSavingAnalyse(true);

    try {
      // Call API to create analyse
      const createdAnalyse = await createAnalyse({
        category: newRequestForm.category as "bilan" | "imagerie" | "anapath" | "autres",
        title: analysisName,
        patientName: selectedPatient?.fullName || newPatientForm.fullName,
        patientAge: (selectedPatient as any)?.age || undefined,
        patientHistory: (selectedPatient as any)?.histoire || newPatientForm.histoire,
        details: newRequestForm.comment,
        comment: newRequestForm.comment,
        selectedBilans: selectedBilans,
        customBilans: customBilans,
      });

      // Create new analysis record for UI
      const newAnalyse: Analyse = {
        id: createdAnalyse.labId || createdAnalyse.id.toString(),
        apiId: createdAnalyse.id,
        patient: createdAnalyse.patient?.fullName || createdAnalyse.patientName || "",
        type: createdAnalyse.title || "",
        requestedAt: "Aujourd'hui",
        requestedDate: createdAnalyse.createdAt,
        requester: "Current User",
        status: (createdAnalyse.status as "En cours" | "Terminée" | "Urgent") || "En cours",
        bilanCategory: (createdAnalyse.category as "bilan" | "imagerie" | "anapath" | "autres") || "bilan",
        labEntries: createdAnalyse.labEntries || [],
      };

      // Add to pending analyses at top
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
        selectedBilans: [],
        customBilans: "",
      });

      setIsSavingAnalyse(false);
    } catch (error) {
      console.error("Error saving analyse:", error);
      setIsSavingAnalyse(false);
      // Handle error - could show toast notification
    }
  };

  const handleSaveLabValues = async () => {
    if (!selectedBilan || !selectedBilan.apiId || !selectedBilan.labEntries || selectedBilan.labEntries.length === 0) {
      return;
    }

    setIsSavingLabValues(true);

    try {
      // Prepare lab entries to update - only include entries with non-empty values
      const labEntriesToUpdate = selectedBilan.labEntries
        .filter((entry: any) => {
          const editedValue = editedLabValues[entry.id];
          return entry.id && editedValue !== undefined && editedValue.trim().length > 0;
        })
        .map((entry: any) => ({
          id: entry.id,
          value: editedLabValues[entry.id].trim(),
          interpretation: entry.interpretation || undefined,
        }));

      // Validate that at least one value is provided
      if (labEntriesToUpdate.length === 0) {
        console.warn("No non-empty lab values to save");
        setIsSavingLabValues(false);
        return;
      }

      // Call the API to update lab entries and mark analysis as complete
      const response = await fetch(`/api/analyses/${selectedBilan.apiId}/labentries`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labEntries: labEntriesToUpdate,
          status: "Terminée", // Mark analysis as complete
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save lab values");
      }

      const result = await response.json();
      console.log("Lab values saved successfully:", result);

      if (!result.analyse) {
        throw new Error("Analysis status not updated");
      }

      // Update lab entries with the returned data
      const labEntriesMap = new Map(
        (result.data || []).map((entry: any) => [entry.id, entry])
      );

      // Create updated analysis with new status and updated lab entries
      const updatedAnalysis: Analyse = {
        ...selectedBilan,
        status: "Terminée",
        labEntries: selectedBilan.labEntries.map((entry: any) => {
          return labEntriesMap.get(entry.id) || entry;
        }),
      };

      console.log("Updated analysis:", updatedAnalysis);

      // Remove from pending analyses
      setPendingAnalyses((prev) => prev.filter((a) => a.id !== selectedBilan.id));

      // Add to history analyses at the top
      setHistoryAnalyses((prev) => [updatedAnalysis, ...prev]);

      // Clear edited values
      setEditedLabValues({});

      // Close the modal
      setSelectedBilan(null);

      console.log("✓ Analysis marked as complete and moved to history");
      setIsSavingLabValues(false);
    } catch (error) {
      console.error("Error saving lab values:", error);
      setIsSavingLabValues(false);
      // Could show error toast notification here
    }
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
              <CardTitle>Historique des Bilans</CardTitle>
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
                          Titre du bilan
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-500">
                          Type
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
              Priorisation des analyses non traitées.
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
        onClose={() => {
          setSelectedBilan(null);
          setEditedLabValues({});
        }}
        title={selectedBilan ? `Bilan ${selectedBilan.id}` : undefined}
        description={
          selectedBilan
            ? `${selectedBilan.type} · ${selectedBilan.patient}`
            : undefined
        }
        footer={
          <Button variant="outline" onClick={() => {
            setSelectedBilan(null);
            setEditedLabValues({});
          }}>
            Fermer
          </Button>
        }
      >
        {selectedBilan ? (
          <div className="space-y-4 h-[45vh] overflow-y-auto flex flex-col">
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-800">Demande :</span>{" "}
                {formatAnalyseDateTime(selectedBilan.requestedDate)}
              </p>
            </div>

            {/* Content adapted by type */}
            {selectedBilan.bilanCategory === "bilan" ? (
              <>
                {/* BILAN: Results input form */}
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    Saisie des résultats
                  </h3>
                  {(selectedBilan as any).labEntries && (selectedBilan as any).labEntries.length > 0 ? (
                    <div className="space-y-3">
                      {(selectedBilan as any).labEntries.map((entry: any) => (
                        <div
                          key={`${selectedBilan.id}-${entry.id}`}
                          className="flex items-center gap-3 rounded-xl bg-indigo-50/40 px-3 py-2"
                        >
                          <span className="font-medium text-slate-800 min-w-fit">
                            {entry.name}
                          </span>
                          <input
                            type="text"
                            placeholder="Entrez la valeur"
                            value={editedLabValues[entry.id] !== undefined ? editedLabValues[entry.id] : (entry.value || "")}
                            onChange={(e) =>
                              setEditedLabValues((prev) => ({
                                ...prev,
                                [entry.id]: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-1 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      ))}
                      <Button
                        variant="primary"
                        onClick={handleSaveLabValues}
                        disabled={
                          isSavingLabValues ||
                          !Object.values(editedLabValues).some((val) => val && val.trim().length > 0)
                        }
                        className="mt-4 w-full"
                      >
                        {isSavingLabValues ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          "Sauvegarder les résultats"
                        )}
                      </Button>
                    </div>
                  ) : selectedDetails ? (
                    <ul className="mt-3 space-y-1 text-sm text-slate-700">
                      {selectedDetails.results.map((item) => (
                        <li
                          key={`${selectedBilan.id}-${item.label}`}
                          className="flex items-center justify-between rounded-xl bg-indigo-50/40 px-3 py-1"
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
            selectedBilans: [],
            customBilans: "",
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
                selectedBilans: [],
                customBilans: "",
              });
            }}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewDemande}
              disabled={
                isSavingAnalyse ||
                !newRequestForm.category ||
                !newRequestForm.patient ||
                (newRequestForm.category === "bilan"
                  ? newRequestForm.selectedBilans.length === 0
                  : !newRequestForm.name
                )
              }
              className="flex items-center gap-2"
            >
              {isSavingAnalyse ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer la demande"
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
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

          {/* Name d'analyse or Bilan Selector */}
          {newRequestForm.category === "bilan" ? (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#221b5b]">
                Bilan
              </label>

              {/* Bilan Categories as Badges */}
              <div className="flex flex-wrap gap-2">
                {bilanStructure.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Toggle category selection
                      const categoryItems = category.items;
                      const allSelected = categoryItems.every(item =>
                        newRequestForm.selectedBilans.includes(item)
                      );

                      if (allSelected) {
                        // Deselect all items in category
                        setNewRequestForm((prev) => ({
                          ...prev,
                          selectedBilans: prev.selectedBilans.filter(
                            item => !categoryItems.includes(item)
                          ),
                        }));
                      } else {
                        // Select all items in category
                        setNewRequestForm((prev) => ({
                          ...prev,
                          selectedBilans: Array.from(
                            new Set([...prev.selectedBilans, ...categoryItems])
                          ),
                        }));
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      bilanStructure.categories.find(c => c.id === category.id)?.items.every(item =>
                        newRequestForm.selectedBilans.includes(item)
                      )
                        ? "bg-violet-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Detailed Bilan Items Grid */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {bilanStructure.allItems.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={newRequestForm.selectedBilans.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRequestForm((prev) => ({
                            ...prev,
                            selectedBilans: [...prev.selectedBilans, item],
                          }));
                        } else {
                          setNewRequestForm((prev) => ({
                            ...prev,
                            selectedBilans: prev.selectedBilans.filter(
                              (b) => b !== item
                            ),
                          }));
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>

              {/* Custom Bilans Field */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label
                  htmlFor="custom-bilans"
                  className="text-sm font-semibold text-[#221b5b]"
                >
                  Autres analyses
                </label>
                <input
                  id="custom-bilans"
                  type="text"
                  className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                  value={newRequestForm.customBilans}
                  onChange={(e) =>
                    setNewRequestForm((prev) => ({
                      ...prev,
                      customBilans: e.target.value,
                    }))
                  }
                  placeholder="Entrez d'autres bilans séparés par des virgules..."
                />
              </div>
            </div>
          ) : (
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
          )}

          {/* Patient Selection */}
          <div className="space-y-3">
            {!newRequestForm.patient ? (
              // Show PatientCreate when no patient selected
              <PatientCreate
                patients={[]}
                onSelectPatient={handleSelectPatient}
                onCreatePatient={handleCreateNewPatient}
                newPatientFields={["fullName", "age", "histoire"]}
                showTabs={true}
                skipSuccessDisplay={true}
              />
            ) : (
              // Show selected patient info with change button
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#221b5b]">
                  Patient sélectionné
                </label>

                {/* Patient Info Fields Display */}
                <div className="space-y-2">
                  {/* Patient Name */}
                  <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-violet-600 font-semibold mb-1">
                      Nom
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedPatient?.fullName || newPatientForm.fullName}
                    </p>
                  </div>

                  {/* Patient Age */}
                  {selectedPatient || newPatientForm.histoire ? (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                      <p className="text-xs uppercase tracking-wide text-violet-600 font-semibold mb-1">
                        Âge
                      </p>
                      <p className="text-sm text-slate-700">
                        {(selectedPatient as any)?.age || newPatientForm.histoire
                          ? "Non spécifié"
                          : ""}
                      </p>
                    </div>
                  ) : null}

                  {/* Patient History */}
                  {(selectedPatient as any)?.histoire || newPatientForm.histoire ? (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                      <p className="text-xs uppercase tracking-wide text-violet-600 font-semibold mb-1">
                        Antécédents
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {(selectedPatient as any)?.histoire || newPatientForm.histoire}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Change Patient Button */}
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setNewRequestForm((prev) => ({
                      ...prev,
                      patient: "",
                    }));
                    setNewPatientForm({ fullName: "", histoire: "" });
                    setPatientMode("select");
                  }}
                  className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  Changer de patient
                </button>
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
