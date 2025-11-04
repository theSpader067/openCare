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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Patient, PatientStatus, patientsSeed } from "./data";
import { ObservationTimeline } from "./observation-timeline";

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
  "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:ring-slate-600/60",
  "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/40",
  "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-500/40",
  "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/40",
  "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-100 dark:ring-rose-400/40",
  "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-100 dark:ring-indigo-400/40",
  "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-100 dark:ring-violet-400/40",
];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);

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

  const totalPages = Math.max(
    1,
    Math.ceil(patientsData.length / PAGE_SIZE) || 1,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return patientsData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, patientsData]);

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

  const startItem =
    patientsData.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem =
    patientsData.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, patientsData.length);

  return (
    <div className="space-y-6">
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

      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-md">
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
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Patient
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Service
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Statut
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        CIM
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Prochain contact
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
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={cn(
                          "cursor-pointer transition hover:bg-indigo-50/60",
                          selectedPatientId === patient.id && "bg-indigo-50/80",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {patient.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {patient.age} ans · {patient.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.service}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              patient.status === "Hospitalisé"
                                ? "warning"
                                : patient.status === "Suivi"
                                ? "success"
                                : "muted"
                            }
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
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.nextVisit}
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
                    : `Affichage ${startItem}–${endItem} sur ${patientsData.length} dossiers`}
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
                    Page {patientsData.length === 0 ? 0 : currentPage} /{" "}
                    {patientsData.length === 0 ? 0 : totalPages}
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

        <Card className="h-full">
          <CardContent className="flex h-full flex-col gap-6 pt-6">
            {patientsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner label="Analyse du dossier patient..." />
              </div>
            ) : patientsData.length === 0 ? (
              <EmptyState
                icon={UserRound}
                title="Aucun profil disponible"
                description="Importez ou créez un dossier patient pour afficher les informations détaillées."
                action={
                  <Button
                    variant="primary"
                    onClick={() => router.push("/patients/dossier?mode=create")}
                  >
                    Créer un patient
                  </Button>
                }
              />
            ) : !selectedPatient ? (
              <EmptyState
                icon={UserRound}
                title="Sélectionnez un patient"
                description="Cliquez sur une ligne du tableau pour prévisualiser le dossier détaillé."
              />
            ) : (
              <>
                <div className="flex flex-col gap-8">
                  <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/40 sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-inner shadow-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-100">
                          <UserRound className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                            {selectedPatient.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <span>
                              {formatFullDate(selectedPatient.birthDate)} · {selectedPatient.age} ans
                            </span>
                            <Badge
                              variant="muted"
                              className="border border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-100"
                            >
                              {selectedPatient.id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:gap-4 lg:items-end lg:text-right">
                        <div className="flex flex-col gap-1 sm:text-right">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Prochain contact
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {selectedPatient.nextVisit}
                          </span>
                        </div>
                        <span className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              selectedPatient.status === "Hospitalisé"
                                ? "warning"
                                : selectedPatient.status === "Suivi"
                                ? "success"
                                : "muted"
                            }
                          >
                            {selectedPatient.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
                            onClick={() =>
                              router.push(`/patients/dossier?id=${selectedPatient.id}`)
                            }
                          >
                            Visiter dossier
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 dark:border-slate-700/60 dark:bg-slate-900/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-200">
                          Diagnostic principal
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-100">
                            {selectedPatient.diagnosis.code}
                          </Badge>
                          <span className="text-base text-slate-700 dark:text-slate-200">
                            {selectedPatient.diagnosis.label}
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-sm text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Service référent
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {selectedPatient.service}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Niveau de risque
                            </p>
                            <p className="mt-2 inline-flex items-center gap-2 font-medium">
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">
                                {selectedPatient.riskLevel}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Identifiant
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {selectedPatient.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Statut clinique
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {selectedPatient.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <HistorySection
                      title="ATCDs médicaux"
                      tags={selectedPatient.histories.medical}
                    />
                    <HistorySection
                      title="ATCDs chirurgicaux"
                      tags={selectedPatient.histories.surgical}
                    />
                    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/40">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Autres éléments
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {selectedPatient.histories.other.map((group) => (
                          <div key={group.label} className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {group.label}
                            </p>
                            <TagGroup tags={group.values} emptyLabel="Non renseigné" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/40">
                      <header className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          <CalendarDays className="h-4 w-4 text-indigo-500 dark:text-indigo-200" />
                          Observations
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-300">
                          {sortedObservations.length} entrée(s)
                        </span>
                      </header>
                      {latestObservation ? (
                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-700 shadow-inner dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-slate-200">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-200">
                            <span>{formatObservationDate(latestObservation.timestamp)}</span>
                            <span className="text-indigo-400 dark:text-indigo-200/80">
                              {formatRelativeTimeFromNow(latestObservation.timestamp)}
                            </span>
                          </div>
                          <p className="mt-3 whitespace-pre-line leading-relaxed">
                            {latestObservation.note}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                          Aucune observation enregistrée pour ce patient.
                        </p>
                      )}
                      {otherObservations.length > 0 ? (
                        <div className="mt-4">
                          <ObservationTimeline
                            entries={otherObservations}
                            className="max-h-52 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/50"
                            emptyMessage="Pas d'autres observations."
                          />
                        </div>
                      ) : null}
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/40">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Consignes et actions
                      </h3>
                      {selectedPatient.instructions.length > 0 ? (
                        <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                          {selectedPatient.instructions.map((instruction) => (
                            <li
                              key={instruction}
                              className="flex items-start gap-3 rounded-lg bg-slate-50/80 px-3.5 py-2.5 leading-relaxed dark:bg-slate-800/50"
                            >
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-300" />
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                          Aucune consigne particulière pour le moment.
                        </p>
                      )}
                    </section>
                  </div>
                </div>
              </>
            )}
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
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <label
                  htmlFor="edit-next-visit"
                  className="text-sm font-medium text-[#221b5b]"
                >
                  Prochain contact
                </label>
                <input
                  id="edit-next-visit"
                  className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
                  value={editForm.nextVisit}
                  onChange={(event) =>
                    setEditForm((previous) =>
                      previous
                        ? { ...previous, nextVisit: event.target.value }
                        : previous,
                    )
                  }
                />
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
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/40">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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
        <Badge
          key={tag}
          className={cn(
            "ring-1 ring-inset px-2.5 py-1 text-xs font-medium",
            TAG_COLOR_CLASSES[index % TAG_COLOR_CLASSES.length],
          )}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
