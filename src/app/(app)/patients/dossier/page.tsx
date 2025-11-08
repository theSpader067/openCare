"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, UserRound, X, ChevronLeft, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { Patient, PatientStatus, RiskLevel, PatientType, patientsSeed, ObservationEntry } from "../data";
import { WYSIWYGEditor } from "@/components/wysiwyg-editor";

type PatientFormState = {
  name: string;
  birthDate: string;
  identifier: string;
  service: string;
  status: PatientStatus;
  riskLevel: RiskLevel;
  type: PatientType;
  nextVisit: string;
  diagnosisCode: string;
  diagnosisLabel: string;
  medicalHistory: string;
  surgicalHistory: string;
  otherHistory: string;
  observationDraft: string;
  instructions: string;
};

const emptyForm: PatientFormState = {
  name: "",
  birthDate: "",
  identifier: "",
  service: "",
  status: "Hospitalisé",
  riskLevel: "Standard",
  type: "équipe",
  nextVisit: "",
  diagnosisCode: "",
  diagnosisLabel: "",
  medicalHistory: "",
  surgicalHistory: "",
  otherHistory: "",
  observationDraft: "",
  instructions: "",
};

function toFormState(patient?: Patient | null): PatientFormState {
  if (!patient) {
    return { ...emptyForm };
  }

  return {
    name: patient.name,
    birthDate: patient.birthDate,
    identifier: patient.id,
    service: patient.service,
    status: patient.status,
    riskLevel: patient.riskLevel,
    type: patient.type,
    nextVisit: patient.nextVisit,
    diagnosisCode: patient.diagnosis.code,
    diagnosisLabel: patient.diagnosis.label,
    medicalHistory: patient.histories.medical.join("\n"),
    surgicalHistory: patient.histories.surgical.join("\n"),
    otherHistory: patient.histories.other
      .map((group) => `${group.label}: ${group.values.join(", ")}`)
      .join("\n"),
    observationDraft: "",
    instructions: patient.instructions.join("\n"),
  };
}

export default function PatientDossierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const mode = searchParams.get("mode");

  const patient = useMemo(
    () => patientsSeed.find((item) => item.id === patientId) ?? null,
    [patientId],
  );

  const isExistingPatient = Boolean(patient);

  const [formData, setFormData] = useState<PatientFormState>(() =>
    toFormState(isExistingPatient ? patient : null),
  );
  const [observations, setObservations] = useState<ObservationEntry[]>(() =>
    patient?.observations ?? [],
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedObservationIndex, setSelectedObservationIndex] = useState<number | null>(null);
  const [isObservationPanelOpen, setIsObservationPanelOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFormData(toFormState(isExistingPatient ? patient : null));
    setObservations(patient?.observations ?? []);
  }, [isExistingPatient, patient]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const pageTitle = isExistingPatient
    ? `Dossier patient · ${patient?.name ?? ""}`
    : "Créer un patient";
  const pageDescription = isExistingPatient
    ? "Visualisez et mettez à jour le dossier médical complet du patient sélectionné."
    : "Renseignez l'ensemble des informations nécessaires pour créer un nouveau dossier patient.";

  const sortedObservations = useMemo(() => {
    return [...observations].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [observations]);

  const selectedObservation =
    selectedObservationIndex !== null ? sortedObservations[selectedObservationIndex] : null;

  const formatObservationTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const handleInputChange =
    (field: keyof PatientFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormData((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if there's a new observation to add
    if (formData.observationDraft.trim()) {
      setIsSaving(true);

      // Show loading state for 1 second
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        // Create new observation entry
        const newObservation: ObservationEntry = {
          id: `obs-${Date.now()}`,
          timestamp: new Date().toISOString(),
          note: formData.observationDraft,
        };

        // Add to observations list
        const updatedObservations = [newObservation, ...observations];
        setObservations(updatedObservations);

        // Clear the observation draft
        setFormData((prev) => ({
          ...prev,
          observationDraft: "",
        }));

        // Select the newly added observation
        setSelectedObservationIndex(0);

        // Stop loading state
        setIsSaving(false);

        // Show saved feedback
        setIsSaved(true);
        setTimeout(() => {
          setIsSaved(false);
        }, 2000);

        saveTimeoutRef.current = null;
      }, 1000);
    } else {
      // If no new observation, just show save feedback
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }
  };

  if (patientId && !isExistingPatient && mode !== "create") {
    return (
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Dossier patient
          </h1>
          <p className="text-sm text-slate-500">
            Aucune information disponible pour le dossier demandé.
          </p>
        </section>
        <EmptyState
          icon={UserRound}
          title="Dossier introuvable"
          description="Le patient recherché n'existe pas ou a été archivé."
          action={
            <Button variant="primary" onClick={() => router.push("/patients")}>
              Retour à la liste des patients
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{pageDescription}</p>
          {isSaved ? (
            <p className="mt-2 text-sm font-medium text-emerald-600">
              Modifications enregistrées localement.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/patients")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
          <Button variant="primary" type="submit">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Informations patient</CardTitle>
          <CardDescription>
            Identité, affectation et coordonnées principales du dossier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Nom complet"
              id="patient-name"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder="Ex. Fatou Diop"
              required
            />
            <InputField
              label="Date de naissance"
              id="patient-birth"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange("birthDate")}
              required
            />
            <InputField
              label="Identifiant dossier"
              id="patient-id"
              value={formData.identifier}
              onChange={handleInputChange("identifier")}
              placeholder="Ex. P-2024-013"
              required
            />
            <InputField
              label="Service d'affectation"
              id="patient-service"
              value={formData.service}
              onChange={handleInputChange("service")}
              placeholder="Ex. Chirurgie digestive"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Statut"
              id="patient-status"
              value={formData.status}
              onChange={handleInputChange("status")}
              options={[
                { label: "Hospitalisé", value: "Hospitalisé" },
                { label: "Consultation", value: "Consultation" },
                { label: "Suivi", value: "Suivi" },
              ]}
            />
            <SelectField
              label="Niveau de risque"
              id="patient-risk"
              value={formData.riskLevel}
              onChange={handleInputChange("riskLevel")}
              options={[
                { label: "Élevé", value: "Élevé" },
                { label: "Modéré", value: "Modéré" },
                { label: "Standard", value: "Standard" },
              ]}
            />
            <SelectField
              label="Type"
              id="patient-type"
              value={formData.type}
              onChange={handleInputChange("type")}
              options={[
                { label: "Privé", value: "privé" },
                { label: "Équipe", value: "équipe" },
              ]}
            />
            <InputField
              label="Prochain contact"
              id="patient-next-visit"
              value={formData.nextVisit}
              onChange={handleInputChange("nextVisit")}
              placeholder="Ex. Tournée 14h"
            />
          </div>
          {isExistingPatient ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Badge variant="muted">{formData.identifier}</Badge>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                Dernière mise à jour : il y a quelques minutes
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Diagnostic principal</CardTitle>
          <CardDescription>
            Renseignez le code CIM ainsi que le diagnostic associé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <InputField
              label="Code CIM"
              id="patient-diagnosis-code"
              value={formData.diagnosisCode}
              onChange={handleInputChange("diagnosisCode")}
              placeholder="Ex. K57.3"
            />
            <TextareaField
              label="Diagnostic"
              id="patient-diagnosis-label"
              value={formData.diagnosisLabel}
              onChange={handleInputChange("diagnosisLabel")}
              placeholder="Résumé du diagnostic principal"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Antécédents & éléments complémentaires</CardTitle>
          <CardDescription>
            Listez les antécédents médicaux, chirurgicaux et autres informations
            pertinentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextareaField
            label="ATCDs médicaux"
            id="patient-medical-history"
            value={formData.medicalHistory}
            onChange={handleInputChange("medicalHistory")}
            placeholder="Séparez les éléments par un saut de ligne"
          />
          <TextareaField
            label="ATCDs chirurgicaux"
            id="patient-surgical-history"
            value={formData.surgicalHistory}
            onChange={handleInputChange("surgicalHistory")}
            placeholder="Séparez les éléments par un saut de ligne"
          />
          <TextareaField
            label="Autres informations (allergies, traitements, etc.)"
            id="patient-other-history"
            value={formData.otherHistory}
            onChange={handleInputChange("otherHistory")}
            placeholder="Ex. Allergies: Pénicilline"
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Observations</CardTitle>
          <CardDescription>
            Notez les observations cliniques.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Observations Section */}
          {sortedObservations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Historique des observations ({sortedObservations.length})
              </h3>

              {/* XL Screen: Two-column layout */}
              <div className="hidden xl:grid xl:grid-cols-3 xl:gap-4 xl:border xl:border-slate-200 xl:rounded-2xl xl:p-4 xl:bg-slate-50/40">
                {/* Left: Dates List */}
                <div className="xl:border-r xl:border-slate-200 xl:pr-4">
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {sortedObservations.map((observation, index) => {
                      const obsDate = new Date(observation.timestamp);
                      const formattedDate = new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      }).format(obsDate);
                      const formattedTime = new Intl.DateTimeFormat("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(obsDate);

                      return (
                        <button
                          key={observation.id ?? `${observation.timestamp}-${index}`}
                          onClick={() => setSelectedObservationIndex(index)}
                          className={`w-full text-left px-2 py-1.5 transition ${
                            selectedObservationIndex === index
                              ? "text-indigo-600 underline font-semibold"
                              : "text-slate-600 hover:text-indigo-600 hover:underline"
                          }`}
                        >
                          <p className="text-xs font-medium">
                            {formattedDate}
                          </p>
                          <p className="text-xs text-slate-500">{formattedTime}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Observation Details */}
                <div className="xl:col-span-2 flex flex-col">
                  {selectedObservation ? (
                    <div className="space-y-3 flex flex-col h-full">
                      <div>
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                          {formatObservationTimestamp(selectedObservation.timestamp)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Observation {sortedObservations.findIndex(o => o.id === selectedObservation.id) + 1} sur {sortedObservations.length}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-200 p-4 flex-1 overflow-y-auto prose prose-sm max-w-none">
                        {selectedObservation.note.includes("<") ? (
                          <div
                            className="text-sm text-slate-700 leading-relaxed [&_p]:m-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic [&_u]:underline"
                            dangerouslySetInnerHTML={{ __html: selectedObservation.note }}
                          />
                        ) : (
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {selectedObservation.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <p className="text-sm">Sélectionnez une date pour voir les détails</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Smaller Screens: Dates List with Sliding Panel */}
              <div className="xl:hidden">
                <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-1 max-h-60 overflow-y-auto">
                  {sortedObservations.map((observation, index) => {
                    const obsDate = new Date(observation.timestamp);
                    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    }).format(obsDate);
                    const formattedTime = new Intl.DateTimeFormat("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(obsDate);

                    return (
                      <button
                        key={observation.id ?? `${observation.timestamp}-${index}`}
                        onClick={() => {
                          setSelectedObservationIndex(index);
                          setIsObservationPanelOpen(true);
                        }}
                        className="w-full text-left px-2 py-1.5 transition text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                      >
                        <p className="text-xs font-medium">
                          {formattedDate}
                        </p>
                        <p className="text-xs text-slate-500">{formattedTime}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Sliding Panel for Mobile/Tablet */}
                <div
                  className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isObservationPanelOpen
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                  onClick={() => setIsObservationPanelOpen(false)}
                />
                <div
                  className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col rounded-l-3xl border border-indigo-200/60 bg-white shadow-2xl shadow-indigo-200/60 transition-transform duration-300 ${
                    isObservationPanelOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-indigo-100/70 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">Détail de l&apos;observation</p>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                      onClick={() => setIsObservationPanelOpen(false)}
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col pb-24">
                    {selectedObservation ? (
                      <div className="space-y-4 flex flex-col h-full">
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                            {formatObservationTimestamp(selectedObservation.timestamp)}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Observation {sortedObservations.findIndex(o => o.id === selectedObservation.id) + 1} sur {sortedObservations.length}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex-1 overflow-y-auto prose prose-sm max-w-none">
                          {selectedObservation.note.includes("<") ? (
                            <div
                              className="text-sm text-slate-700 leading-relaxed [&_p]:m-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic [&_u]:underline"
                              dangerouslySetInnerHTML={{ __html: selectedObservation.note }}
                            />
                          ) : (
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {selectedObservation.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* New Observation Input - WYSIWYG Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#221b5b]">
              {isExistingPatient
                ? "Ajouter une observation"
                : "Observations initiales"}
            </label>
            <WYSIWYGEditor
              value={formData.observationDraft}
              onChange={(value) =>
                setFormData((previous) => ({
                  ...previous,
                  observationDraft: value,
                }))
              }
              placeholder="Saisissez une observation, elle sera horodatée lors de l'enregistrement."
              className="min-h-64"
            />
            <p className="text-xs text-slate-500">
              Utilisez les outils de formatage pour structurer votre observation (gras, italique, titres, listes, etc.)
            </p>
          </div>

          <Separator />

        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/patients")}
        >
          Annuler
        </Button>
        <Button variant="primary" type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function InputField({
  id,
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-[#221b5b]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-[#221b5b]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-[#221b5b]">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
      />
    </div>
  );
}
