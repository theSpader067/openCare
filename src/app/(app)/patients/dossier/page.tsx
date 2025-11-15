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
import { ArrowLeft, Save, UserRound, X, ChevronLeft, Loader2, Sparkles, Dices } from "lucide-react";
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
import { Patient, PatientStatus, PatientType, ObservationEntry } from "@/data/patients/patients-data";
import { WYSIWYGEditor } from "@/components/wysiwyg-editor";
import { createPatient, getPatientByPid, updatePatient, saveObservation } from "@/lib/api/patients";

type PatientFormState = {
  id:number,
  pid:string,
  name: string;
  birthDate: string;
  identifier: string;
  service: string;
  status: PatientStatus;
  type: PatientType;
  nextVisit: string;
  diagnosisCode:string,
  diagnosisLabel:string,
  medicalHistory: string;
  surgicalHistory: string;
  otherHistory: string;
  initialObservation?: string;
};

const emptyForm: PatientFormState = {
  id:0,
  pid:"",
  name: "",
  birthDate: "",
  identifier: "",
  service: "",
  status: "Hospitalisé",
  type: "équipe",
  nextVisit: "",
  diagnosisCode:"",
  diagnosisLabel:"",
  medicalHistory: "",
  surgicalHistory: "",
  otherHistory: "",
  initialObservation: "",
};

function toFormState(patient?: Patient | null): PatientFormState {
  if (!patient) {
    return { ...emptyForm };
  }

  return {
    id:0,
    pid:patient.pid,
    name: patient.name,
    birthDate: patient.birthDate,
    identifier: patient.id,
    service: patient.service,
    status: patient.status,
    type: patient.type,
    nextVisit: patient.nextVisit,
    diagnosisCode: patient.diagnosis.code,
    diagnosisLabel:patient.diagnosis.label,
    medicalHistory: patient.histories.medical.join("\n"),
    surgicalHistory: patient.histories.surgical.join("\n"),
    otherHistory: patient.histories.other.join('\n')
  };
}

export default function PatientDossierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const mode = searchParams.get("mode");


  const [isExistingPatient,setIsExistingPatient] = useState(false);
  let patient: Patient = {
    id:'',
    pid:'',
    name:'',
    birthDate:'',
    age:0,
    service:'',
    status:'Suivi',
    nextVisit:'',
    type:'privé',
    diagnosis:{code:'', label:''},
    histories:{
        medical:[],
        surgical:[],
        other:[]
    },
    observations: []
  }

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
  const [observationDraft, setObservationDraft] = useState("");
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [observationSaved, setObservationSaved] = useState(false);
  const observationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoadingObservations,setIsLoadingObservations] = useState(false)

  // Load patient data from API if patientId exists but patient is not in seeded data
  useEffect(() => {
    setIsSaving(true)
    setIsLoadingObservations(true)
    const loadPatientFromAPI = async () => {
      if (patientId && !isExistingPatient) {
        try {
          console.log('loading patient from api by id')
          const result = await getPatientByPid(patientId);
          if (result.success && result.data) {
            const apiPatient = result.data;
            console.log(result.data)
            // Transform API patient data to Patient interface
            const transformedPatient: Patient = {
              id: apiPatient.id,
              pid: apiPatient.pid,
              name: apiPatient.name,
              birthDate: apiPatient.birthDate ? apiPatient.birthDate.split('T')[0] : '',
              age: apiPatient.dateOfBirth ? (() => {
                const today = new Date();
                const birthDate = new Date(apiPatient.dateOfBirth);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return age;
              })() : 0,
              service: apiPatient.service || '',
              status: (apiPatient.status || 'Consultation') as PatientStatus,
              nextVisit: apiPatient.nextVisit,
              type: (apiPatient.type as PatientType),
              diagnosis: {
                code: apiPatient.diagnosis.code || '',
                label: apiPatient.diagnosis.label || '',
              },
              histories: {
                medical: apiPatient.histories.medical ? [apiPatient.histories.medical] : [],
                surgical: apiPatient.histories.surgical ? [apiPatient.histories.surgical] : [],
                other: apiPatient.histories.other ? [apiPatient.histories.other] : [],
              },
              observations: apiPatient.observations,
            };

            // Update formData with loaded patient data
            setFormData({
              id:parseInt(transformedPatient.id),
              name: transformedPatient.name,
              pid:transformedPatient.pid,
              birthDate: transformedPatient.birthDate,
              identifier: transformedPatient.pid,
              service: transformedPatient.service,
              status: transformedPatient.status,
              type: transformedPatient.type,
              nextVisit: transformedPatient.nextVisit,
              diagnosisCode: transformedPatient.diagnosis.code,
              diagnosisLabel:transformedPatient.diagnosis.label,
              medicalHistory: transformedPatient.histories.medical.join("\n"),
              surgicalHistory: transformedPatient.histories.surgical.join("\n"),
              otherHistory: transformedPatient.histories.other.join("\n"),
            });
            setObservations(apiPatient.observations)
            setIsLoadingObservations(false)
            setIsExistingPatient(true)
          }
        } catch (error) {
          console.error("Error loading patient from API:", error);
        }
      }
    };

    loadPatientFromAPI();
    setIsSaving(false)
  }, [patientId]);

  
  const pageTitle = isExistingPatient
    ? `Dossier patient · ${patient?.name ?? ""}`
    : "Créer un patient";
  const pageDescription = isExistingPatient
    ? "Visualisez et mettez à jour le dossier médical complet du patient sélectionné."
    : "Renseignez l'ensemble des informations nécessaires pour créer un nouveau dossier patient.";



  const selectedObservation =
    selectedObservationIndex !== null ? observations[selectedObservationIndex] : null;

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

  const generateRandomPatientId = () => {
    // Get current time in seconds
    const timeInSeconds = Math.floor(Date.now() / 1000);

    // Generate random 4-character hex string
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();

    // Format as P-{timestamp}-{randomHex}
    const patientId = `P-${timeInSeconds}-${randomHex}`;

    // Update the form data with the generated ID
    setFormData((previous) => ({
      ...previous,
      pid: patientId,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (isExistingPatient) {
        // Update existing patient
        const result = await updatePatient(formData.id, {
          fullName: formData.name.trim(),
          pid:formData.pid,
          birthdate: formData.birthDate,
          service: formData.service?.trim(),
          diagnostic: formData.diagnosisLabel?.trim(),
          cim: formData.diagnosisCode?.trim(),
          atcdsMedical:formData.medicalHistory?.trim(),
          atcdsChirurgical: formData.surgicalHistory?.trim(),
          atcdsExtra: formData.otherHistory?.trim(),
          status: formData.status?.trim(),
          nextContact: formData.nextVisit ? String(formData.nextVisit).trim() : undefined,
          isPrivate: formData.type,
        });

        if (result.success) {
          setIsSaved(true);
          // Show success feedback for 2 seconds
          setTimeout(() => {
            setIsSaved(false);
          }, 2000);
        } else {
          console.error("Error updating patient:", result.error);
          setIsSaved(false);
        }
      } else {
        // Create new patient
        const result = await createPatient({
          pid : formData.pid,
          fullName: formData.name.trim(),
          birthdate: formData.birthDate,
          service: formData.service?.trim(),
          diagnostic: formData.diagnosisLabel?.trim(),
          histoire: formData.medicalHistory?.trim(),
          cim: formData.diagnosisCode?.trim(),
          atcdsMedical: formData.medicalHistory?.trim(),
          atcdsChirurgical: formData.surgicalHistory?.trim(),
          atcdsExtra: formData.otherHistory?.trim(),
          status: formData.status?.trim(),
          nextContact: formData.nextVisit ? String(formData.nextVisit).trim() : undefined,
          isPrivate: formData.type,
          initialObservation: observationDraft,
        });

        if (result.success) {
          // Show saved feedback
          setIsSaved(true);

          // Redirect to patients list after 2 seconds
          setTimeout(() => {
            router.push("/patients");
          }, 2000);
        } else {
          console.error("Error creating patient:", result.error);
          setIsSaved(false);
        }
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      setIsSaved(false);
    } finally {
      setIsSaving(false);
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="patient-id" className="text-sm font-medium text-[#221b5b]">
                  Identifiant dossier
                </label>
                
              </div>
              <div className="flex items-center justify-between">
              <button
                  type="button"
                  onClick={generateRandomPatientId}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
                  title="Générer un identifiant aléatoire"
                  aria-label="Générer un identifiant aléatoire"
                >
                  <Dices className="h-4 w-4" />
                </button>
              <input
                id="patient-id"
                type="text"
                value={formData.pid}
                onChange={handleInputChange("pid")}
                placeholder="Ex. P-2024-013"
                required
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
              />
              </div>
            </div>
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
          {observations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Historique des observations ({observations.length})
              </h3>

              {/* XL Screen: Two-column layout */}
              <div className="hidden xl:grid xl:grid-cols-3 xl:gap-4 xl:border xl:border-slate-200 xl:rounded-2xl xl:p-4 xl:bg-slate-50/40">
                {/* Left: Dates List */}
                <div className="xl:border-r xl:border-slate-200 xl:pr-4">
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {observations.map((observation, index) => {
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
                          Observation {observations.findIndex(o => o.id === selectedObservation.id) + 1} sur {observations.length}
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
                  {observations.map((observation, index) => {
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
                            Observation {observations.findIndex(o => o.id === selectedObservation.id) + 1} sur {observations.length}
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
              value={observationDraft}
              onChange={setObservationDraft}
              placeholder="Saisissez une observation, elle sera horodatée lors de l'enregistrement."
              className="min-h-64"
            />
            <p className="text-xs text-slate-500">
              Utilisez les outils de formatage pour structurer votre observation (gras, italique, titres, listes, etc.)
            </p>

            {/* Save Observation Button - Only for existing patients */}
            {isExistingPatient && (
              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!observationDraft.trim()) {
                      return;
                    }

                    setIsSavingObservation(true);
                    try {
                      // Call API to save observation
                      const result = await saveObservation(formData.id, observationDraft);

                      if (result.success && result.data) {
                        // Add the returned observation to the list
                        const newObservation: ObservationEntry = {
                          id: String(result.data.id),
                          timestamp: result.data.timestamp,
                          note: result.data.note,
                        };

                        setObservations((prev) => [newObservation, ...prev]);
                        setObservationDraft("");
                        setObservationSaved(true);

                        // Clear success message after 2 seconds
                        if (observationTimeoutRef.current) {
                          clearTimeout(observationTimeoutRef.current);
                        }
                        observationTimeoutRef.current = setTimeout(() => {
                          setObservationSaved(false);
                        }, 2000);
                      } else {
                        console.error("Failed to save observation:", result.error);
                      }
                    } catch (error) {
                      console.error("Error saving observation:", error);
                    } finally {
                      setIsSavingObservation(false);
                    }
                  }}
                  disabled={isSavingObservation || !observationDraft.trim()}
                >
                  {isSavingObservation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer l'observation
                    </>
                  )}
                </Button>
                {observationSaved && (
                  <p className="text-xs text-emerald-600 font-medium">
                    ✓ Observation enregistrée
                  </p>
                )}
              </div>
            )}
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
              {isExistingPatient? 'Mettre à jour':'Enregistrer'}
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
