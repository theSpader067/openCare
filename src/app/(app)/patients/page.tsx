"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Patient, PatientStatus, RiskLevel, patientsSeed } from "./data";
import { ObservationTimeline } from "./observation-timeline";
import { PatientFilters } from "./patient-filters";

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

const PAGE_SIZE = 10;

const TAG_COLOR_CLASSES = [
  "bg-rose-100 text-rose-700 ring-rose-200",
  "bg-sky-100 text-sky-700 ring-sky-200",
  "bg-lime-100 text-lime-700 ring-lime-200",
  "bg-amber-100 text-amber-800 ring-amber-200",
  "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200",
  "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "bg-violet-100 text-violet-700 ring-violet-200",
];

const STATUS_BADGE_CLASSES: Record<PatientStatus, string> = {
  Hospitalisé:
    "bg-gradient-to-r from-[#fecaca] via-[#fda4af] to-[#fb7185] text-[#7f1d1d] shadow-sm shadow-rose-200/60",
  Consultation:
    "bg-gradient-to-r from-[#bfdbfe] via-[#93c5fd] to-[#60a5fa] text-[#1d4ed8] shadow-sm shadow-sky-200/60",
  Suivi:
    "bg-gradient-to-r from-[#bbf7d0] via-[#86efac] to-[#4ade80] text-[#166534] shadow-sm shadow-emerald-200/60",
};

const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  Élevé:
    "bg-gradient-to-r from-[#fed7aa] via-[#fb923c] to-[#f97316] text-[#7c2d12]",
  Modéré:
    "bg-gradient-to-r from-[#fde68a] via-[#facc15] to-[#fbbf24] text-[#78350f]",
  Standard:
    "bg-gradient-to-r from-[#bfdbfe] via-[#93c5fd] to-[#60a5fa] text-[#1d4ed8]",
};

const SERVICE_BADGE_CLASS =
  "border border-sky-200 bg-sky-100 text-sky-700 shadow-sm shadow-sky-200/60";
const PATIENT_ID_BADGE_CLASS =
  "border border-slate-300 bg-slate-100 text-slate-700 shadow-sm shadow-slate-200/60";

function formatFullDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatObservationDate(timestamp: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

const relativeFormatter = new Intl.RelativeTimeFormat("fr-FR", {
  numeric: "auto",
});

function formatRelativeTimeFromNow(timestamp: string) {
  const target = new Date(timestamp).getTime();
  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return relativeFormatter.format(-diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMs / 3600000);
  if (Math.abs(diffHours) < 48) {
    return relativeFormatter.format(-diffHours, "hour");
  }

  const diffDays = Math.round(diffMs / 86400000);
  return relativeFormatter.format(-diffDays, "day");
}

export default function PatientsPage() {
  const router = useRouter();
  const {
    data: seededPatients,
    isLoading: patientsLoading,
  } = useSectionData(patientsSeed);
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    from: "",
    to: "",
  });

  useEffect(() => {
    if (!patientsLoading && patientsData.length === 0) {
      setPatientsData(seededPatients);
    }
  }, [patientsLoading, seededPatients, patientsData.length]);

  useEffect(() => {
    if (
      selectedPatientId &&
      !patientsData.some((patient) => patient.id === selectedPatientId)
    ) {
      setSelectedPatientId(null);
    }
  }, [patientsData, selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId) {
      setIsMobilePreviewOpen(false);
    }
  }, [selectedPatientId]);

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      query: "",
      status: "all",
      from: "",
      to: "",
    });
    setCurrentPage(1);
  };

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(seededPatients.map((p) => p.status)));
  }, [seededPatients]);

  const isFilterActive = useMemo(() => {
    return (
      filters.query !== "" ||
      filters.status !== "all" ||
      filters.from !== "" ||
      filters.to !== ""
    );
  }, [filters]);

  const filteredPatients = useMemo(() => {
    let result = [...patientsData];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query),
      );
    }

    if (filters.status !== "all") {
      result = result.filter((patient) => patient.status === filters.status);
    }

    if (filters.from || filters.to) {
      result = result.filter((patient) => {
        const patientDate = new Date(patient.birthDate);
        const fromDate = filters.from ? new Date(filters.from) : null;
        const toDate = filters.to ? new Date(filters.to) : null;

        if (fromDate && patientDate < fromDate) return false;
        if (toDate && patientDate > toDate) return false;

        return true;
      });
    }

    return result;
  }, [patientsData, filters]);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredPatients.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredPatients]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / PAGE_SIZE) || 1,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const selectedPatient =
    patientsData.find((patient) => patient.id === selectedPatientId) ?? null;

  const sortedObservations = useMemo(() => {
    if (!selectedPatient) {
      return [];
    }
    return [...selectedPatient.observations].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [selectedPatient]);

  const latestObservation = sortedObservations[0] ?? null;
  const otherObservations =
    sortedObservations.length > 1 ? sortedObservations.slice(1) : [];

  const startItem =
    filteredPatients.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem =
    filteredPatients.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, filteredPatients.length);

  const handleOpenEdit = (patient: Patient) => {
    setEditPatient(patient);
    setEditForm({ ...patient });
  };

  const handleEditSave = () => {
    if (!editForm) return;

    setPatientsData((previous) =>
      previous.map((patient) =>
        patient.id === editForm.id ? { ...editForm } : patient,
      ),
    );

    setSelectedPatientId(editForm.id);
    setEditPatient(null);
    setEditForm(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletePatient) {
      return;
    }

    setPatientsData((previous) =>
      previous.filter((patient) => patient.id !== deletePatient.id),
    );

    if (selectedPatientId === deletePatient.id) {
      setSelectedPatientId(null);
    }

    setDeletePatient(null);
  };

  const renderPreviewContent = (variant: "desktop" | "mobile") => {
    if (patientsLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Spinner label="Analyse du dossier patient..." />
        </div>
      );
    }

    if (patientsData.length === 0) {
      return (
        <EmptyState
          icon={UserRound}
          title="Aucun profil disponible"
          description="Importez ou créez un dossier patient pour afficher les informations détaillées."
          action={
            variant === "desktop" ? (
              <Button
                variant="primary"
                onClick={() => router.push("/patients/dossier?mode=create")}
              >
                Créer un patient
              </Button>
            ) : null
          }
        />
      );
    }

    if (!selectedPatient) {
      return (
        <EmptyState
          icon={UserRound}
          title="Sélectionnez un patient"
          description="Choisissez un dossier dans la liste pour afficher sa synthèse."
        />
      );
    }

    const statusBadgeClass = STATUS_BADGE_CLASSES[selectedPatient.status];
    const riskBadgeClass = RISK_BADGE_CLASSES[selectedPatient.riskLevel];

    return (
      <div className="flex flex-col gap-6 pb-6">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex w-full gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#22d3ee] text-white shadow-lg shadow-indigo-200/60">
                <UserRound className="h-8 w-8" />
              
              </div>
              <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-slate-900">
                    {selectedPatient.name}
                  </h2>
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedPatient.id}
                  </span>
                  <p className="text-xs text-slate-600">
                    {formatFullDate(selectedPatient.birthDate)} · {selectedPatient.age} ans
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap w-full justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                onClick={() =>
                  router.push(`/patients/dossier?id=${selectedPatient.id}`)
                }
              >
                Visiter dossier
              </Button>
            </div>
            
            </div>
            <div className="flex flex-col gap-2">
               
                <div className="flex flex-wrap gap-2">
                  
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-semibold",
                      "bg-slate-100 text-slate-700",
                    )}
                  >
                    {selectedPatient.service}
                  </span>
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-semibold",
                      "bg-slate-100 text-slate-700",
                    )}
                  >
                    {selectedPatient.status}
                  </span>
                    <span
                    className={cn(
                      "px-3 py-1 text-xs font-semibold",
                      "bg-slate-100 text-slate-700",
                    )}
                  >
                    Risque {selectedPatient.riskLevel}
                  </span>
                </div>
              </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Diagnostic principal
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">
                  {selectedPatient.diagnosis.code}
                </span>
                <span className="text-base text-slate-700">
                  {selectedPatient.diagnosis.label}
                </span>
              </div>
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Identifiant patient
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPatient.id}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Suivi prévu
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPatient.nextVisit}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <HistorySection
            title="ATCDs médicaux"
            tags={selectedPatient.histories.medical}
          />
          <HistorySection
            title="ATCDs chirurgicaux"
            tags={selectedPatient.histories.surgical}
          />
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Autres éléments
            </h3>
            <div className="mt-4 space-y-4">
              {selectedPatient.histories.other.map((group) => (
                <div key={group.label} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <TagGroup tags={group.values} emptyLabel="Non renseigné" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                Observations
              </div>
              <span className="text-xs text-slate-500">
                {sortedObservations.length} entrée(s)
              </span>
            </header>
            {latestObservation ? (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-700 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  <span>{formatObservationDate(latestObservation.timestamp)}</span>
                  <span className="text-indigo-400">
                    {formatRelativeTimeFromNow(latestObservation.timestamp)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line leading-relaxed">
                  {latestObservation.note}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Aucune observation enregistrée pour ce patient.
              </p>
            )}
            {otherObservations.length > 0 ? (
              <div className="mt-4">
                <ObservationTimeline
                  entries={otherObservations}
                  className="max-h-52 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-4"
                  emptyMessage="Pas d'autres observations."
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Consignes et actions
            </h3>
            {selectedPatient.instructions.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {selectedPatient.instructions.map((instruction) => (
                  <li
                    key={instruction}
                    className="flex items-start gap-3 rounded-lg bg-slate-50/80 px-3.5 py-2.5 leading-relaxed"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Aucune consigne particulière pour le moment.
              </p>
            )}
          </section>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Patients
          </h1>
          <p className="text-sm text-slate-500">
            Gestion des dossiers, parcours de soins et suivis post-opératoires.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exporter un rapport
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/patients/dossier?mode=create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Button>
        </div>
      </section>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 xl:hidden",
          isMobilePreviewOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMobilePreviewOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col rounded-r-3xl border border-violet-200/60 bg-white shadow-2xl shadow-indigo-200/60 transition-transform duration-300 xl:hidden",
          isMobilePreviewOpen
            ? "translate-x-0"
            : "pointer-events-none -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-violet-100/70 px-5 py-4">
          <p className="text-sm font-semibold text-[#352f72]">Dossier patient</p>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            onClick={() => setIsMobilePreviewOpen(false)}
            aria-label="Fermer l&apos;aperçu patient"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {renderPreviewContent("mobile")}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-md">
          {patientsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner label="Chargement des dossiers patients..." />
            </div>
          ) : patientsData.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                icon={UserRound}
                title="Aucun patient attribué"
                description="Une fois les patients assignés à votre service, ils apparaîtront ici."
                action={
                  <Button
                    variant="primary"
                    onClick={() => router.push("/patients/dossier?mode=create")}
                  >
                    Importer depuis le DPI
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <PatientFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                uniqueStatuses={uniqueStatuses}
                isFilterActive={isFilterActive}
                resetFilters={resetFilters}
              />
              <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Patient
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        ID patient
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Statut
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        CIM
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          if (typeof window !== "undefined" && window.innerWidth < 1280) {
                            setIsMobilePreviewOpen(true);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition hover:bg-indigo-50/60",
                          selectedPatientId === patient.id && "bg-indigo-50/80",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <span className="font-medium text-slate-800">
                              {patient.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{patient.age} ans</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700"
                          >
                            {patient.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "px-3 py-1 text-xs font-semibold",
                              STATUS_BADGE_CLASSES[patient.status],
                            )}
                          >
                            {patient.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              {patient.diagnosis.code}
                            </span>
                            <span className="text-xs text-slate-500">
                              {patient.diagnosis.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-full p-0 text-slate-600 hover:text-indigo-600"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenEdit(patient);
                              }}
                              aria-label={`Modifier ${patient.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeletePatient(patient);
                              }}
                              aria-label={`Supprimer ${patient.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {startItem === 0
                    ? "Aucun dossier à afficher"
                    : `Affichage ${startItem}–${endItem} sur ${filteredPatients.length} dossiers`}
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
                    Page {filteredPatients.length === 0 ? 0 : currentPage} /{" "}
                    {filteredPatients.length === 0 ? 0 : totalPages}
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
            </>
          )}
        </div>

        <Card className="hidden h-full xl:block">
          <CardContent className="h-full overflow-y-auto pt-6">
            {renderPreviewContent("desktop")}
          </CardContent>
        </Card>
      </section>

      <Modal
        open={Boolean(editPatient)}
        onClose={() => {
          setEditPatient(null);
          setEditForm(null);
        }}
        title={
          editPatient ? `Modifier le dossier de ${editPatient.name}` : undefined
        }
        description="Ajustez les informations principales du patient pour garder la vue à jour."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditPatient(null);
                setEditForm(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSave}
              disabled={!editForm}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        {editForm ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="edit-service"
                className="text-sm font-medium text-[#221b5b]"
              >
                Service d&apos;affectation
              </label>
              <input
                id="edit-service"
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={editForm.service}
                onChange={(event) =>
                  setEditForm((previous) =>
                    previous
                      ? { ...previous, service: event.target.value }
                      : previous,
                  )
                }
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="edit-status"
                  className="text-sm font-medium text-[#221b5b]"
                >
                  Statut
                </label>
                <select
                  id="edit-status"
                  className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((previous) =>
                      previous
                        ? {
                            ...previous,
                            status: event.target.value as PatientStatus,
                          }
                        : previous,
                    )
                  }
                >
                  <option value="Hospitalisé">Hospitalisé</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Suivi">Suivi</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="edit-diagnosis-code"
                className="text-sm font-medium text-[#221b5b]"
              >
                Code CIM
              </label>
              <input
                id="edit-diagnosis-code"
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={editForm.diagnosis.code}
                onChange={(event) =>
                  setEditForm((previous) =>
                    previous
                      ? {
                          ...previous,
                          diagnosis: {
                            ...previous.diagnosis,
                            code: event.target.value,
                          },
                        }
                      : previous,
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="edit-diagnosis-label"
                className="text-sm font-medium text-[#221b5b]"
              >
                Diagnostic
              </label>
              <textarea
                id="edit-diagnosis-label"
                className="h-24 w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                value={editForm.diagnosis.label}
                onChange={(event) =>
                  setEditForm((previous) =>
                    previous
                      ? {
                          ...previous,
                          diagnosis: {
                            ...previous.diagnosis,
                            label: event.target.value,
                          },
                        }
                      : previous,
                  )
                }
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deletePatient)}
        onClose={() => setDeletePatient(null)}
        title={
          deletePatient
            ? `Supprimer ${deletePatient.name} ?`
            : "Confirmer la suppression"
        }
        description="Cette action retirera le dossier de la liste. Vous pourrez le retrouver dans l’historique si nécessaire."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletePatient(null)}>
              Annuler
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300"
              onClick={handleDeleteConfirm}
            >
              Supprimer
            </Button>
          </>
        }
      >
        {deletePatient ? (
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Êtes-vous sûr de vouloir supprimer le dossier patient{" "}
              <span className="font-semibold text-rose-600">
                {deletePatient.name}
              </span>{" "}
              ({deletePatient.id}) ?
            </p>
            <p>
              Cette action ne peut pas être annulée immédiatement et nécessite
              une restauration manuelle.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function HistorySection({
  title,
  tags,
}: {
  title: string;
  tags: string[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <TagGroup tags={tags} emptyLabel="Aucun antécédent déclaré" />
    </section>
  );
}

function TagGroup({
  tags,
  emptyLabel,
}: {
  tags: string[];
  emptyLabel: string;
}) {
  if (tags.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className="px-3 py-1 text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );  
}
