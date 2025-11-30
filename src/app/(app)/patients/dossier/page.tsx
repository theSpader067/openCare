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
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, UserRound, X, ChevronLeft, Loader2, Sparkles, Dices, Clock } from "lucide-react";
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
import { SmartEditor } from "@/components/editor/smart-editor";
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
  motif: string;
  medicalHistory: string;
  surgicalHistory: string;
  otherHistory: string;
  atcdsGynObstetrique: string;
  atcdsFamiliaux: string;
  addressOrigin: string;
  addressHabitat: string;
  couvertureSociale: string;
  situationFamiliale: string;
  profession: string;
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
  motif: "",
  medicalHistory: "",
  surgicalHistory: "",
  otherHistory: "",
  atcdsGynObstetrique: "",
  atcdsFamiliaux: "",
  addressOrigin: "",
  addressHabitat: "",
  couvertureSociale: "",
  situationFamiliale: "",
  profession: "",
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
    motif: patient.motif || "",
    medicalHistory: patient.histories.medical.join("\n"),
    surgicalHistory: patient.histories.surgical.join("\n"),
    otherHistory: patient.histories.other.join('\n'),
    atcdsGynObstetrique: patient.atcdsGynObstetrique || "",
    atcdsFamiliaux: patient.atcdsFamiliaux || "",
    addressOrigin: patient.addressOrigin || "",
    addressHabitat: patient.addressHabitat || "",
    couvertureSociale: patient.couvertureSociale || "",
    situationFamiliale: patient.situationFamiliale || "",
    profession: patient.profession || ""
  };
}

export default function PatientDossierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
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
              motif: apiPatient.motif,
              atcdsGynObstetrique: apiPatient.atcdsGynObstetrique,
              atcdsFamiliaux: apiPatient.atcdsFamiliaux,
              addressOrigin: apiPatient.addressOrigin,
              addressHabitat: apiPatient.addressHabitat,
              couvertureSociale: apiPatient.couvertureSociale,
              situationFamiliale: apiPatient.situationFamiliale,
              profession: apiPatient.profession,
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
              motif: transformedPatient.motif || "",
              medicalHistory: transformedPatient.histories.medical.join("\n"),
              surgicalHistory: transformedPatient.histories.surgical.join("\n"),
              otherHistory: transformedPatient.histories.other.join("\n"),
              atcdsGynObstetrique: transformedPatient.atcdsGynObstetrique || "",
              atcdsFamiliaux: transformedPatient.atcdsFamiliaux || "",
              addressOrigin: transformedPatient.addressOrigin || "",
              addressHabitat: transformedPatient.addressHabitat || "",
              couvertureSociale: transformedPatient.couvertureSociale || "",
              situationFamiliale: transformedPatient.situationFamiliale || "",
              profession: transformedPatient.profession || "",
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
    ? `${t("patients.dossier.title")} · ${patient?.name ?? ""}`
    : t("patients.dossier.createTitle");
  const pageDescription = isExistingPatient
    ? t("patients.dossier.updateDesc")
    : t("patients.dossier.createDesc");



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

  const formatRelativeTimeFromNow = () => {
    return t("patients.dossier.lastUpdated", { time: t("common.time.fewMinutesAgo") });
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
          motif: formData.motif?.trim(),
          atcdsMedical:formData.medicalHistory?.trim(),
          atcdsChirurgical: formData.surgicalHistory?.trim(),
          atcdsExtra: formData.otherHistory?.trim(),
          atcdsGynObstetrique: formData.atcdsGynObstetrique?.trim(),
          atcdsFamiliaux: formData.atcdsFamiliaux?.trim(),
          addressOrigin: formData.addressOrigin?.trim(),
          addressHabitat: formData.addressHabitat?.trim(),
          couvertureSociale: formData.couvertureSociale?.trim(),
          situationFamiliale: formData.situationFamiliale?.trim(),
          profession: formData.profession?.trim(),
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
          motif: formData.motif?.trim(),
          atcdsMedical: formData.medicalHistory?.trim(),
          atcdsChirurgical: formData.surgicalHistory?.trim(),
          atcdsExtra: formData.otherHistory?.trim(),
          atcdsGynObstetrique: formData.atcdsGynObstetrique?.trim(),
          atcdsFamiliaux: formData.atcdsFamiliaux?.trim(),
          addressOrigin: formData.addressOrigin?.trim(),
          addressHabitat: formData.addressHabitat?.trim(),
          couvertureSociale: formData.couvertureSociale?.trim(),
          situationFamiliale: formData.situationFamiliale?.trim(),
          profession: formData.profession?.trim(),
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
            {t("patients.dossier.title")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("patients.dossier.noInfoAvailable")}
          </p>
        </section>
        <EmptyState
          icon={UserRound}
          title={t("patients.dossier.notFound")}
          description={t("patients.dossier.notFoundDesc")}
          action={
            <Button variant="primary" onClick={() => router.push("/patients")}>
              {t("patients.dossier.backToPatientList")}
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
              {t("patients.dossier.saved")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isExistingPatient && (
            <Button
              type="button"
              variant="ghost"
              className="border-2 border-blue-300 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 hover:border-blue-400 shadow-sm hover:shadow-md transition-all"
              onClick={() => router.push(`/timeline?id=${formData.pid}`)}
            >
              <Clock className="mr-2 h-4 w-4" />
              {t("patients.buttons.carePathway")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/patients")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("patients.dossier.backToList")}
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("patients.dossier.patientInfo")}</CardTitle>
          <CardDescription>
            {t("patients.dossier.patientInfoDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label={t("common.labels.fullName")}
              id="patient-name"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder={t("patients.dossier.nameExample")}
              required
            />
            <InputField
              label={t("common.labels.dateOfBirth")}
              id="patient-birth"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange("birthDate")}
              required
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="patient-id" className="text-sm font-medium text-[#221b5b]">
                  {t("patients.dossier.fileId")}
                </label>

              </div>
              <div className="flex items-center justify-between">
              <button
                  type="button"
                  onClick={generateRandomPatientId}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
                  title={t("patients.dossier.generateId")}
                  aria-label={t("patients.dossier.generateId")}
                >
                  <Dices className="h-4 w-4" />
                </button>
              <input
                id="patient-id"
                type="text"
                value={formData.pid}
                onChange={handleInputChange("pid")}
                placeholder={t("patients.dossier.idExample")}
                required
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
              />
              </div>
            </div>
            <InputField
              label={t("patients.form.serviceAssignment")}
              id="patient-service"
              value={formData.service}
              onChange={handleInputChange("service")}
              placeholder={t("patients.dossier.serviceExample")}
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
              label={t("patients.dossier.nextContact")}
              id="patient-next-visit"
              value={formData.nextVisit}
              onChange={handleInputChange("nextVisit")}
              placeholder={t("patients.dossier.nextContactExample")}
            />
          </div>

          {/* Demographic Information Section */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Informations démographiques</h3>

            {/* Row 1: Address Origin, Address Habitat, Profession */}
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <InputField
                label={t("patients.dossier.addressOrigin")}
                id="patient-address-origin"
                value={formData.addressOrigin}
                onChange={handleInputChange("addressOrigin")}
                placeholder={t("patients.dossier.addressOrigin")}
              />
              <InputField
                label={t("patients.dossier.addressHabitat")}
                id="patient-address-habitat"
                value={formData.addressHabitat}
                onChange={handleInputChange("addressHabitat")}
                placeholder={t("patients.dossier.addressHabitat")}
              />
              <InputField
                label={t("patients.dossier.profession")}
                id="patient-profession"
                value={formData.profession}
                onChange={handleInputChange("profession")}
                placeholder={t("patients.dossier.profession")}
              />
            </div>

            {/* Row 2: Social Coverage, Family Situation */}
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label={t("patients.dossier.couvertureSociale")}
                id="patient-couverture-sociale"
                value={formData.couvertureSociale}
                onChange={handleInputChange("couvertureSociale")}
                options={[
                  { label: "AMO", value: "AMO" },
                  { label: "CNOPS", value: "CNOPS" },
                  { label: "CNSS", value: "CNSS" },
                  { label: "Autre", value: "Autre" },
                ]}
              />
              <SelectField
                label={t("patients.dossier.situationFamiliale")}
                id="patient-situation-familiale"
                value={formData.situationFamiliale}
                onChange={handleInputChange("situationFamiliale")}
                options={[
                  { label: "Célibataire", value: "Célibataire" },
                  { label: "Marié", value: "Marié" },
                  { label: "Divorcé", value: "Divorcé" },
                  { label: "Veuf", value: "Veuf" },
                ]}
              />
            </div>
          </div>

          {isExistingPatient ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Badge variant="muted">{formData.identifier}</Badge>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {formatRelativeTimeFromNow()}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("patients.dossier.mainDiagnosis")}</CardTitle>
          <CardDescription>
            {t("patients.dossier.diagnosisDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <InputField
              label={t("patients.dossier.cimCode")}
              id="patient-diagnosis-code"
              value={formData.diagnosisCode}
              onChange={handleInputChange("diagnosisCode")}
              placeholder={t("patients.dossier.cimExample")}
            />
            <TextareaField
              label={t("patients.dossier.diagnosis")}
              id="patient-diagnosis-label"
              value={formData.diagnosisLabel}
              onChange={handleInputChange("diagnosisLabel")}
              placeholder={t("patients.dossier.diagnosisSummary")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("patients.dossier.historyTitle")}</CardTitle>
          <CardDescription>
            {t("patients.dossier.historyDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            label={t("patients.dossier.motif")}
            id="patient-motif"
            value={formData.motif}
            onChange={handleInputChange("motif")}
            placeholder={t("patients.dossier.motif")}
          />

          {/* Medical History Section */}
          <div>
            <label className="text-sm font-medium text-[#221b5b]">{t("patients.dossier.medicalHistory")}</label>
            <div className="mt-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {["HTA", "Diabète", "Hépatopathie", "Néphropathie", "Cardiopathie", "Asthme", "BPCO", "Obésité", "Dyslipidémie", "Hypercholestérolémie", "Hypothyroïdie", "Hyperthyroïdie", "Épilepsie", "Migraines", "Dépression", "Anxiété", "VIH", "Hépatite", "Tuberculose", "Autres maladies chroniques"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentText = formData.medicalHistory.trim();
                      const newText = currentText ? `${currentText}, ${tag}` : tag;
                      setFormData((prev) => ({ ...prev, medicalHistory: newText }));
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <TextareaField
              label=""
              id="patient-medical-history"
              value={formData.medicalHistory}
              onChange={handleInputChange("medicalHistory")}
              placeholder={t("patients.dossier.separateByLine")}
            />
          </div>

          {/* Surgical History Section */}
          <div>
            <label className="text-sm font-medium text-[#221b5b]">{t("patients.dossier.surgicalHistory")}</label>
            <div className="mt-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {["Appendicectomie", "Cholécystectomie", "Laparoscopie", "Coeliostomie", "Hystérectomie", "Césarienne", "Cure hernie", "Ligature trompe", "Vasectomie", "Prostatectomie", "Néphrectomie", "Thyroïdectomie", "Mastectomie", "Tumorectomie", "Péridural", "Chirurgie bariatrique", "Chirurgie cardiaque", "Chirurgie vasculaire", "Chirurgie ORL", "Autres chirurgies"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentText = formData.surgicalHistory.trim();
                      const newText = currentText ? `${currentText}, ${tag}` : tag;
                      setFormData((prev) => ({ ...prev, surgicalHistory: newText }));
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border border-amber-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <TextareaField
              label=""
              id="patient-surgical-history"
              value={formData.surgicalHistory}
              onChange={handleInputChange("surgicalHistory")}
              placeholder={t("patients.dossier.separateByLine")}
            />
          </div>

          {/* Gynecological/Obstetric History Section */}
          <div>
            <label className="text-sm font-medium text-[#221b5b]">{t("patients.dossier.atcdsGynObstetrique")}</label>
            <div className="mt-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {["Ménopause", "Préménopause", "Dysménorrhée", "Aménorrhée", "Infertilité", "Endométriose", "Fibrome utérin", "Kyste ovarien", "Cancer du sein", "Cancer de l'utérus", "Cancer de l'ovaire", "Grossesse multiple", "Placenta praevia", "Prééclampsie", "Éclampsie", "Diabète gestationnel", "Hémorragie de la délivrance", "Dépression post-partum", "Fausse couche récidivante", "Autres complications gynéco-obstétriques"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentText = formData.atcdsGynObstetrique.trim();
                      const newText = currentText ? `${currentText}, ${tag}` : tag;
                      setFormData((prev) => ({ ...prev, atcdsGynObstetrique: newText }));
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors border border-pink-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <TextareaField
              label=""
              id="patient-atcds-gynobstetrique"
              value={formData.atcdsGynObstetrique}
              onChange={handleInputChange("atcdsGynObstetrique")}
              placeholder={t("patients.dossier.separateByLine")}
            />
          </div>

          {/* Family History Section */}
          <div>
            <label className="text-sm font-medium text-[#221b5b]">{t("patients.dossier.atcdsFamiliaux")}</label>
            <div className="mt-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {["Cancer", "Diabète", "HTA", "Cardiopathie", "AVC", "Asthme", "Emphysème", "Maladie mentale", "Épilepsie", "Hémophilie", "Drépanocytose", "Mucoviscidose", "Maladie d'Alzheimer", "Parkinson", "Polyarthrite", "Lupus", "Hérédité familiale", "Consanguinité", "Infertilité familiale", "Autres antécédents familiaux"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentText = formData.atcdsFamiliaux.trim();
                      const newText = currentText ? `${currentText}, ${tag}` : tag;
                      setFormData((prev) => ({ ...prev, atcdsFamiliaux: newText }));
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors border border-purple-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <TextareaField
              label=""
              id="patient-atcds-familiaux"
              value={formData.atcdsFamiliaux}
              onChange={handleInputChange("atcdsFamiliaux")}
              placeholder={t("patients.dossier.separateByLine")}
            />
          </div>

          <TextareaField
            label={t("patients.dossier.otherInfo")}
            id="patient-other-history"
            value={formData.otherHistory}
            onChange={handleInputChange("otherHistory")}
            placeholder={t("patients.dossier.allergyExample")}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("patients.dossier.observations")}</CardTitle>
          <CardDescription>
            {t("patients.dossier.observationsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Observations Section */}
          {observations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                {t("patients.dossier.observationHistory", { count: observations.length })}
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
                      <p className="text-sm">{t("patients.dossier.selectDate")}</p>
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
                    <p className="text-sm font-semibold text-slate-800">{t("patients.dossier.observationDetail")}</p>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                      onClick={() => setIsObservationPanelOpen(false)}
                      aria-label={t("common.buttons.close")}
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

          {/* New Observation Input - Smart Editor with AI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#221b5b]">
                {isExistingPatient
                  ? t("patients.dossier.addObservation")
                  : t("patients.dossier.initialObservations")}
              </label>
              {isExistingPatient && (
                <button
                  type="button"
                  onClick={() => router.push(`/patients/dossier/quickFill?id=${formData.id}`)}
                  className="text-sm text-indigo-600 font-medium hover:underline transition-all"
                >
                  {t("patients.dossier.quickFill") || "Ajout rapide"}
                </button>
              )}
            </div>
            <SmartEditor
              value={observationDraft}
              onChange={setObservationDraft}
              placeholder={t("patients.dossier.observationPlaceholder")}
              contextInputIds={[
                "patient-name",
                "patient-birth",
                "patient-diagnosis-code",
                "patient-diagnosis-label",
                "patient-medical-history",
                "patient-surgical-history",
                "patient-other-history"
              ]}
            />
            <p className="text-xs text-slate-500">
              {t("patients.dossier.editorHelp")}
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
                      {t("common.buttons.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("patients.dossier.saveObservation")}
                    </>
                  )}
                </Button>
                {observationSaved && (
                  <p className="text-xs text-emerald-600 font-medium">
                    {t("patients.dossier.observationSaved")}
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator />

        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/patients")}
          >
            {t("common.buttons.cancel")}
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.buttons.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isExistingPatient ? t("common.buttons.update") : t("common.buttons.save")}
              </>
            )}
          </Button>
        </div>
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
