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
import { ArrowLeft, Save, UserRound } from "lucide-react";
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
import { ObservationTimeline } from "../observation-timeline";
import { Patient, PatientStatus, RiskLevel, patientsSeed } from "../data";

type PatientFormState = {
  name: string;
  birthDate: string;
  identifier: string;
  service: string;
  status: PatientStatus;
  riskLevel: RiskLevel;
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
  const observationEntries = patient?.observations ?? [];

  const [formData, setFormData] = useState<PatientFormState>(() =>
    toFormState(isExistingPatient ? patient : null),
  );
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFormData(toFormState(isExistingPatient ? patient : null));
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
    setIsSaved(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaved(false);
      saveTimeoutRef.current = null;
    }, 2800);
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
          <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle>Observations & consignes</CardTitle>
          <CardDescription>
            Notez les observations cliniques et les actions à planifier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ObservationTimeline
            entries={observationEntries}
            className="max-h-72 rounded-2xl border border-slate-200 bg-indigo-50/40 px-4 py-4"
            emptyMessage={
              isExistingPatient
                ? "Aucune observation enregistrée pour le moment."
                : "Aucune observation saisie pour l'instant."
            }
          />
          <TextareaField
            label={
              isExistingPatient
                ? "Ajouter une observation"
                : "Observations initiales"
            }
            id="patient-observation-draft"
            value={formData.observationDraft}
            onChange={handleInputChange("observationDraft")}
            placeholder="Saisissez une observation, elle sera horodatée lors de l'enregistrement."
            rows={4}
          />
          <Separator />
          <TextareaField
            label="Consignes"
            id="patient-instructions"
            value={formData.instructions}
            onChange={handleInputChange("instructions")}
            placeholder="Séparez les consignes par un saut de ligne"
            rows={4}
          />
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
        <Button variant="primary" type="submit">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
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
