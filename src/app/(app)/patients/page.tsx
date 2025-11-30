"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  FileText,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { getPatients, deletePatient } from "@/lib/api/patients";
import { ObservationTimeline } from "./observation-timeline";
import { PatientFilters } from "./patient-filters";
import { Patient } from "@/types/document";
import { HistoryGroup, PatientStatus, PatientType } from "@/data/patients/patients-data";


const uniqueStatuses:PatientStatus[] = ['Hospitalisé', 'Consultation', 'Suivi']


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
  const { t } = useTranslation();

  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<Patient | null>(null);
  const [toDeletePatient, setToDeletePatient] = useState<Patient | null>(null);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    type: "all",
    from: "",
    to: "",
  });

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const result = await getPatients();
        if (result.success && result.data) {
          // Transform API patient data to Patient type
          const transformedPatients:Patient[] = result.data;
          console.log(result.data)
          setPatientsData(transformedPatients);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);

      }
    };

    fetchPatients();
  }, []);


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
      type: "all",
      from: "",
      to: "",
    });
    setCurrentPage(1);
  };

  const isFilterActive = useMemo(() => {
    return (
      filters.query !== "" ||
      filters.status !== "all" ||
      filters.type !== "all" ||
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

    if (filters.type !== "all") {
      result = result.filter((patient) => patient.type === filters.type);
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

  const handleDeleteConfirm = async () => {
    if (!toDeletePatient) {
      return;
    }

    try {
      // Call API to delete the patient
      const result = await deletePatient(parseInt(toDeletePatient.id));

      if (result.success) {
        // Only remove from local state if deletion was successful
        setPatientsData((previous) =>
          previous.filter((patient) => patient.id !== toDeletePatient.id),
        );

        if (selectedPatientId === toDeletePatient.id) {
          setSelectedPatientId(null);
        }

        setToDeletePatient(null);
      } else {
        console.error("Error deleting patient:", result.error);
        // Could optionally show error toast/notification here
      }
    } catch (error) {
      console.error("Error during patient deletion:", error);
      // Could optionally show error toast/notification here
    }
  };

  const renderPreviewContent = (variant: "desktop" | "mobile") => {
    if (patientsLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Spinner label={t("patients.labels.analyzingFile")} />
        </div>
      );
    }

    if (patientsData.length === 0) {
      return (
        <EmptyState
          icon={UserRound}
          title={t("patients.empty.noProfiles")}
          description={t("patients.empty.noProfilesDesc")}
          action={
            variant === "desktop" ? (
              <Button
                variant="primary"
                onClick={() => router.push("/patients/dossier?mode=create")}
              >
                {t("patients.buttons.createPatient")}
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
          title={t("patients.empty.selectPatient")}
          description={t("patients.empty.selectPatientDesc")}
        />
      );
    }

    const statusBadgeClass = STATUS_BADGE_CLASSES[selectedPatient.status as PatientStatus];

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
                    {selectedPatient.pid}
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
                {t("patients.buttons.visitFile")}
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
                      "px-3 py-1 text-xs font-semibold rounded-full",
                      selectedPatient.type === "privé"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {selectedPatient.type === "privé" ? t("patients.types.private") : t("patients.types.team")}
                  </span>

                </div>
              </div>
          </div>
        </section>

        {/* Care Pathway Text Button */}
        <div className="flex items-center justify-start">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/timeline?id=${selectedPatient.pid}`);
            }}
            className="text-sm text-indigo-600 font-medium hover:underline transition-all flex items-center gap-1 group"
          >
            {t("patients.buttons.carePathway")}
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                {t("patients.section.mainDiagnosis")}
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
                  {t("patients.labels.patientId")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPatient.pid}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t("patients.labels.nextFollowUp")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPatient.nextVisit}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-4">
            {t("patients.section.demographicInfo")}
          </p>
          <div className="space-y-3 text-sm">
            {selectedPatient.profession && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t("patients.dossier.profession")}</p>
                <p className="text-slate-700 font-medium">{selectedPatient.profession}</p>
              </div>
            )}
            {selectedPatient.situationFamiliale && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t("patients.dossier.situationFamiliale")}</p>
                <p className="text-slate-700 font-medium">{selectedPatient.situationFamiliale}</p>
              </div>
            )}
            {selectedPatient.couvertureSociale && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t("patients.dossier.couvertureSociale")}</p>
                <p className="text-slate-700 font-medium">{selectedPatient.couvertureSociale}</p>
              </div>
            )}
            {selectedPatient.addressHabitat && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t("patients.dossier.addressHabitat")}</p>
                <p className="text-slate-700 font-medium">{selectedPatient.addressHabitat}</p>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <HistorySection
            title={t("patients.section.medicalHistory")}
            tags={selectedPatient.histories.medical}
            emptyLabel={t("patients.empty.noHistory")}
          />
          <HistorySection
            title={t("patients.section.surgicalHistory")}
            tags={selectedPatient.histories.surgical}
            emptyLabel={t("patients.empty.noHistory")}
          />
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              {t("patients.section.otherInfo")}
            </h3>
            <div className="mt-4 space-y-4">
              {selectedPatient.histories.other}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                {t("patients.section.observations")}
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
                {sortedObservations.length} {t("patients.labels.entries")}
              </span>
            </header>

            {sortedObservations.length > 0 ? (
              <div className="mt-5 max-h-80 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {sortedObservations.map((observation, index) => (
                    <div key={observation.id ?? `${observation.timestamp}-${index}`} className="flex gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-300 bg-indigo-50 shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        </div>
                        {index < sortedObservations.length - 1 && (
                          <div className="my-1 h-8 w-px bg-gradient-to-b from-indigo-300 to-slate-200" />
                        )}
                      </div>

                      {/* Observation content */}
                      <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                            {formatObservationDate(observation.timestamp)}
                          </p>
                          <span className="text-xs text-slate-400">
                            {formatRelativeTimeFromNow(observation.timestamp)}
                          </span>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                            {observation.note.length > 150
                              ? `${observation.note.includes("<") ? (
                                <div
                                  className="text-sm text-slate-700 leading-relaxed [&_p]:m-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic [&_u]:underline"
                                  dangerouslySetInnerHTML={{ __html: observation.note.substring(0,150) }}
                                />
                              ) : (
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {observation.note.substring(0,150)}
                                </p>
                              )}}...`
                              :
                                observation.note.includes("<") ? (
                                  <div
                                    className="text-sm text-slate-700 leading-relaxed [&_p]:m-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic [&_u]:underline"
                                    dangerouslySetInnerHTML={{ __html: observation.note }}
                                  />
                                ) : (
                                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {observation.note}
                                  </p>
                                )}

                          {observation.note.length > 150 && (
                            <p className="text-xs text-indigo-600 font-medium mt-2">
                              {t("patients.buttons.showMore")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                {t("patients.empty.noObservations")}
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
            {t('patients.page.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
           {t('patients.buttons.exportReport')}
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/patients/dossier?mode=create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('patients.buttons.newPatient')}
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
          <p className="text-sm font-semibold text-[#352f72]">{t("patients.sidebar.patientFile")}</p>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            onClick={() => setIsMobilePreviewOpen(false)}
            aria-label={t("patients.aria.closePreview")}
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
              <Spinner label={t("patients.labels.loadingFiles")} />
            </div>
          ) : patientsData.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                icon={UserRound}
                title={t("patients.empty.noPatients")}
                description={t("patients.empty.noPatientsDesc")}
                action={
                  <Button
                    variant="primary"
                    onClick={() => router.push("/patients/dossier?mode=create")}
                  >
                    {t("patients.buttons.importFromEMR")}
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
                        {t("patients.table.headers.patient")}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        {t("patients.table.headers.patientId")}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        {t("patients.table.headers.status")}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        {t("patients.table.headers.type")}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        {t("patients.table.headers.cim")}
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">
                        {t("patients.table.headers.actions")}
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
                            {patient.pid}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "px-3 py-1 text-xs font-semibold",
                              STATUS_BADGE_CLASSES[patient.status as PatientStatus],
                            )}
                          >
                            {patient.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-3 py-1 text-xs font-semibold rounded-full",
                              patient.type === "privé"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700",
                            )}
                          >
                            {patient.type === "privé" ? t("patients.types.private") : t("patients.types.team")}
                          </span>
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
                              className="h-9 w-9 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={(event) => {
                                event.stopPropagation();
                                setToDeletePatient(patient);
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
                    ? t("patients.pagination.noFiles")
                    : t("patients.pagination.showing", { from: startItem, to: endItem, total: filteredPatients.length })}
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
                    {t("patients.buttons.previous")}
                  </Button>
                  <span className="text-xs text-slate-500">
                    {t("patients.pagination.pageOf", { current: filteredPatients.length === 0 ? 0 : currentPage, total: filteredPatients.length === 0 ? 0 : totalPages })}
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
                    {t("patients.buttons.next")}
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
          editPatient ? t("patients.modal.editPatient", { name: editPatient.name }) : undefined
        }
        description={t("patients.modal.editDesc")}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditPatient(null);
                setEditForm(null);
              }}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSave}
              disabled={!editForm}
            >
              {t("common.buttons.save")}
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
                {t("patients.form.serviceAssignment")}
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
                  {t("patients.table.headers.status")}
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
              <div className="space-y-2">
                <label
                  htmlFor="edit-type"
                  className="text-sm font-medium text-[#221b5b]"
                >
                  {t("patients.table.headers.type")}
                </label>
                <select
                  id="edit-type"
                  className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                  value={editForm.type}
                  onChange={(event) =>
                    setEditForm((previous) =>
                      previous
                        ? {
                            ...previous,
                            type: event.target.value as PatientType,
                          }
                        : previous,
                    )
                  }
                >
                  <option value="privé">{t("patients.types.private")}</option>
                  <option value="équipe">{t("patients.types.team")}</option>
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
        open={Boolean(toDeletePatient)}
        onClose={() => setToDeletePatient(null)}
        title={
          toDeletePatient
            ? t("patients.modal.deleteConfirm", { name: toDeletePatient.name })
            : t("patients.modal.deleteConfirmFallback")
        }
        description={t("patients.modal.deleteDesc")}
        footer={
          <>
            <Button variant="outline" onClick={() => setToDeletePatient(null)}>
              {t("common.buttons.cancel")}
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300"
              onClick={handleDeleteConfirm}
            >
              {t("common.buttons.delete")}
            </Button>
          </>
        }
      >
        {toDeletePatient ? (
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              {t("patients.modal.deleteMessage", { name: toDeletePatient.name, id: toDeletePatient.id })}
            </p>
            <p>
              {t("patients.modal.deleteWarning")}
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
  emptyLabel,
}: {
  title: string;
  tags: string[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <TagGroup tags={tags} emptyLabel={emptyLabel} />
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
