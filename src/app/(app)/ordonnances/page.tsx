"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, FilePlus, Pill, User, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";
import { mockPatients, mockOrdonnances } from "@/data/ordonnances/ordonnances-data";
import {
  createOrdonnance,
  getOrdonnances,
  deleteOrdonnance,
} from "@/lib/api/ordonnances";
import type { DocumentItem } from "@/types/document";

type Ordonnance = {
  id: string;
  title: string;
  date: string | null;
  patient?: Patient;
  clinicalInfo?: string;
  prescriptionDetails?: string;
  createdAt: string;
  createdBy: string;
  age?: number;
  patientId?: number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  isPrivate?: boolean;
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function OrdonnancesPage() {
  const { t } = useTranslation();
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [activeOrdonnanceId, setActiveOrdonnanceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(
    null
  );
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessiblePatients, setAccessiblePatients] = useState<Patient[]>([]);

  const [createForm, setCreateForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    patient: null as Patient | null,
    patientSource: null as "db" | "new" | null,
    patientName: "",
    patientAge: "",
    patientHistory: "",
    clinicalInfo: "",
    prescriptionDetails: "",
    isPrivate: false,
  });

  // Load ordonnances from API on mount
  useEffect(() => {
    const loadOrdonnances = async () => {
      try {
        setIsLoading(true);
        const result = await getOrdonnances();
        if (result.success && result.data) {
          const convertedOrdonnances = result.data.map((ord: any) => ({
            id: ord.id.toString(),
            title: ord.title,
            date: ord.date,
            patient: ord.patient,
            clinicalInfo: ord.clinicalInfo,
            prescriptionDetails: ord.prescriptionDetails,
            createdAt: ord.createdAt,
            createdBy: "Vous",
            patientId: ord.patientId,
            patientName: ord.patientName,
            patientAge: ord.patientAge,
            patientHistory: ord.patientHistory,
            isPrivate: ord.isPrivate || false,
          }));
          setOrdonnances(convertedOrdonnances);
          if (convertedOrdonnances.length > 0) {
            setActiveOrdonnanceId(convertedOrdonnances[0].id);
          }
        } else {
          console.error("Failed to load ordonnances:", result.error);
        }
      } catch (error) {
        console.error("Error loading ordonnances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrdonnances();
  }, []);

  // Load accessible patients from API
  useEffect(() => {
    const loadAccessiblePatients = async () => {
      try {
        const response = await fetch("/api/patients", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAccessiblePatients(result.data);
        } else {
          setAccessiblePatients([]);
        }
      } catch (error) {
        console.error("Error loading patients:", error);
        setAccessiblePatients([]);
      }
    };

    loadAccessiblePatients();
  }, []);

  const userOrdonnances = useMemo(() => {
    return ordonnances.filter((ord) => ord.createdBy === "Vous");
  }, [ordonnances]);

  const filteredOrdonnances = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return userOrdonnances.filter((ord) => {
      return (
        !query ||
        ord.title.toLowerCase().includes(query) ||
        ord.prescriptionDetails?.toLowerCase().includes(query) ||
        ord.patient?.fullName.toLowerCase().includes(query)
      );
    });
  }, [userOrdonnances, searchTerm]);

  const parsedOrdonnances = useMemo(() => {
    return ordonnances.map((ord) => ({
      id: ord.id,
      title: ord.title,
      date: ord.date || new Date().toISOString().split("T")[0],
      patient: ord.patient,
      createdAt: ord.createdAt,
      createdBy: ord.createdBy,
      clinicalInfo: ord.clinicalInfo,
      prescriptionDetails: ord.prescriptionDetails,
      patientId: ord.patientId,
      patientName: ord.patientName,
      patientAge: ord.patientAge,
      patientHistory: ord.patientHistory,
      isPrivate: ord.isPrivate,
    } as DocumentItem));
  }, [ordonnances]);

  const parsedFilteredOrdonnances = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return parsedOrdonnances
      .filter((ord) => ord.createdBy === "Vous")
      .filter((ord) => {
        return (
          !query ||
          ord.title.toLowerCase().includes(query) ||
          (ord.prescriptionDetails && ord.prescriptionDetails.toLowerCase().includes(query)) ||
          (ord.patient?.fullName && ord.patient.fullName.toLowerCase().includes(query))
        );
      });
  }, [parsedOrdonnances, searchTerm]);

  useEffect(() => {
    if (!isCreateMode && !activeOrdonnanceId && parsedFilteredOrdonnances.length > 0) {
      setActiveOrdonnanceId(parsedFilteredOrdonnances[0].id);
    }
  }, [activeOrdonnanceId, parsedFilteredOrdonnances, isCreateMode]);

  const activeOrdonnance = useMemo(() => {
    if (!activeOrdonnanceId) {
      return null;
    }
    return parsedOrdonnances.find((ord) => ord.id === activeOrdonnanceId) as Ordonnance | null ?? null;
  }, [activeOrdonnanceId, parsedOrdonnances]);

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectOrdonnance = (ordonnanceId: string) => {
    setActiveOrdonnanceId(ordonnanceId);
    setIsCreateMode(false);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setActiveOrdonnanceId(null);
    setCreateForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      patient: null,
      patientSource: null,
      patientName: "",
      patientAge: "",
      patientHistory: "",
      clinicalInfo: "",
      prescriptionDetails: "",
      isPrivate: false,
    });

    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("create");
    }
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
    closeMobilePanel();
  };

  const handleSelectPatient = (patient: Patient) => {
    setCreateForm((prev) => ({
      ...prev,
      patient,
      patientSource: "db",
      patientName: "",
      patientAge: "",
      patientHistory: "",
    }));
    setShowPatientModal(false);
  };

  const handleCreateNewPatient = (formData: Record<string, string>) => {
    if (!formData.fullName?.trim()) {
      return;
    }

    setCreateForm((prev) => ({
      ...prev,
      patientSource: "new",
      patientName: formData.fullName.trim(),
      patientAge: formData.age?.trim() || "",
      patientHistory: formData.histoire?.trim() || "",
      patient: null,
    }));
    setShowPatientModal(false);
  };

  const handleCreateOrdonnance = async () => {
    if (
      !createForm.title ||
      !createForm.date ||
      !createForm.clinicalInfo ||
      !createForm.prescriptionDetails ||
      !createForm.patientSource
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for API
      const apiData = {
        title: createForm.title,
        date: createForm.date,
        clinicalInfo: createForm.clinicalInfo,
        prescriptionDetails: createForm.prescriptionDetails,
        isPrivate: createForm.isPrivate,
      };

      if (createForm.patientSource === "db" && createForm.patient) {
        // Use existing patient from DB
        Object.assign(apiData, {
          patientId: createForm.patient.id,
        });
      } else {
        // Use new patient data
        Object.assign(apiData, {
          patientName: createForm.patientName,
          patientAge: createForm.patientAge,
          patientHistory: createForm.patientHistory,
        });
      }

      const result = await createOrdonnance(apiData as any);

      if (result.success && result.data) {
        // Convert the response data to match our Ordonnance type
        const newOrdonnance: Ordonnance = {
          id: result.data.id.toString(),
          title: result.data.title,
          date: result.data.date,
          patient: result.data.patient,
          clinicalInfo: result.data.clinicalInfo,
          prescriptionDetails: result.data.prescriptionDetails,
          createdAt: result.data.createdAt,
          createdBy: "Vous",
          patientId: result.data.patientId,
          patientName: result.data.patientName,
          patientAge: result.data.patientAge,
          patientHistory: result.data.patientHistory,
          isPrivate: result.data.isPrivate || false,
        };

        setOrdonnances((prev) => [newOrdonnance, ...prev]);
        setIsCreateMode(false);
        closeMobilePanel();
        setActiveOrdonnanceId(newOrdonnance.id);
        setCreateForm({
          title: "",
          date: new Date().toISOString().split("T")[0],
          patient: null,
          patientSource: null,
          patientName: "",
          patientAge: "",
          patientHistory: "",
          clinicalInfo: "",
          prescriptionDetails: "",
          isPrivate: false,
        });
      } else {
        console.error("Failed to create ordonnance:", result.error);
      }
    } catch (error) {
      console.error("Error creating ordonnance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    createForm.title &&
    createForm.date &&
    createForm.patientSource &&
    createForm.clinicalInfo &&
    createForm.prescriptionDetails;

  const createFormContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.title")}
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder={t("prescriptions.forms.titleExample")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.date")}
        </label>
        <input
          type="date"
          value={createForm.date}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Privacy Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.shareType")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setCreateForm((prev) => ({ ...prev, isPrivate: true }))
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              createForm.isPrivate
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">{t("prescriptions.forms.private")}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setCreateForm((prev) => ({ ...prev, isPrivate: false }))
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              !createForm.isPrivate
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{t("prescriptions.forms.team")}</span>
          </button>
        </div>
      </div>

      {/* Patient Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.patient")}
        </label>

        {!createForm.patientSource ? (
          // Show patient selection button
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPatientModal(true)}
            className="w-full justify-center"
          >
            <User className="mr-2 h-4 w-4" />
            Sélectionner un patient
          </Button>
        ) : createForm.patientSource === "db" ? (
          // Show selected patient from DB
          <div className="space-y-2">
            <input
              type="text"
              value={createForm.patient?.fullName || ""}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            <input
              type="hidden"
              value={createForm.patient?.id || ""}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setCreateForm((prev) => ({
                  ...prev,
                  patientSource: null,
                  patient: null,
                }))
              }
              className="w-full text-sm"
            >
              Changer de patient
            </Button>
          </div>
        ) : (
          // Show new patient fields
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("prescriptions.forms.patientName")}
              </label>
              <input
                type="text"
                value={createForm.patientName}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientName: e.target.value }))
                }
                placeholder={t("prescriptions.forms.patientNameExample")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("prescriptions.forms.patientAge")}
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={createForm.patientAge}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientAge: e.target.value }))
                }
                placeholder={t("prescriptions.forms.patientAgeExample")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("prescriptions.forms.patientHistory")}
              </label>
              <textarea
                value={createForm.patientHistory}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientHistory: e.target.value }))
                }
                placeholder={t("prescriptions.forms.patientHistoryPlaceholder")}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setCreateForm((prev) => ({
                  ...prev,
                  patientSource: null,
                  patientName: "",
                  patientAge: "",
                  patientHistory: "",
                }))
              }
              className="w-full text-sm"
            >
              {t("prescriptions.buttons.selectAnotherPatient")}
            </Button>
          </div>
        )}
      </div>

      {/* Clinical Info */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.clinicalInfo")}
        </label>
        <textarea
          value={createForm.clinicalInfo}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              clinicalInfo: e.target.value,
            }))
          }
          placeholder={t("prescriptions.forms.clinicalInfoPlaceholder")}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Prescription Details */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.prescriptionDetails")}
        </label>
        <textarea
          value={createForm.prescriptionDetails}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              prescriptionDetails: e.target.value,
            }))
          }
          placeholder={t("prescriptions.forms.prescriptionPlaceholder")}
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );

  const detailViewContent = activeOrdonnance ? (
    <>
      {/* Header with Patient ID and Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            ID Patient
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {activeOrdonnance.patient?.id || activeOrdonnance.patientId || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Date
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {formatDate(activeOrdonnance.date)}
          </p>
        </div>
      </div>

      {/* Ordonnance Title */}
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-2">
          Ordonnance
        </p>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {activeOrdonnance.title}
          </h2>
          {/* Privacy Badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
            activeOrdonnance.isPrivate
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}>
            {activeOrdonnance.isPrivate ? (
              <>
                <Lock className="h-4 w-4 text-red-600" />
                <span className={`text-xs font-semibold ${
                  activeOrdonnance.isPrivate ? "text-red-700" : "text-blue-700"
                }`}>
                  Privée
                </span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4 text-blue-600" />
                <span className={`text-xs font-semibold ${
                  activeOrdonnance.isPrivate ? "text-red-700" : "text-blue-700"
                }`}>
                  Équipe
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Patient Info */}
      {activeOrdonnance.patient && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            Patient
          </header>
          <p className="text-sm font-semibold text-slate-900">
            {activeOrdonnance.patient.fullName}
          </p>
          <p className="text-sm text-slate-700 mt-2">
            {(activeOrdonnance.patient as any).age} ans
          </p>
        </section>
      )}

      {/* Clinical Information */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Renseignement clinique
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeOrdonnance.clinicalInfo}
        </p>
      </section>

      {/* Prescription Details */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm flex-1">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Détails de la prescription
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-mono">
          {activeOrdonnance.prescriptionDetails}
        </p>
      </section>
    </>
  ) : null;

  const renderListItemContent = (item: DocumentItem) => {
    const ordonnance = item as Ordonnance;
    return (
      <>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              {ordonnance.title}
            </p>
            <p className="text-xs text-slate-500">
              Créé par {ordonnance.createdBy}
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {formatDate(ordonnance.date)}
          </span>
        </div>
        {ordonnance.patient && (
          <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">
              {ordonnance.patient.fullName}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(ordonnance.patient as any).age} ans
            </p>
          </div>
        )}
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {ordonnance.prescriptionDetails}
        </p>
      </>
    );
  };

  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("prescriptions.title")}</h1>
          <p className="text-sm text-slate-500">
            {t("prescriptions.subtitle")}
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          {t("prescriptions.buttons.newPrescription")}
        </Button>
      </section>
      <DataListLayout
        items={parsedOrdonnances}
        filteredItems={parsedFilteredOrdonnances}
        activeItemId={activeOrdonnanceId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: DocumentItem) => handleSelectOrdonnance(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title={t("prescriptions.title")}
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={detailViewContent ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={Pill}
        emptyTitle={t("prescriptions.empty.noPrescriptions")}
        emptyDescription={t("prescriptions.empty.createFirst")}
        searchPlaceholder={t("prescriptions.searchPlaceholder")}
        isSubmitting={isSubmitting}
        createTitle={t("prescriptions.modals.createTitle")}
        createDescription={t("prescriptions.modals.createDescription")}
        saveButtonText={t("prescriptions.buttons.save")}
        isFormValid={isFormValid as unknown as boolean}
        isLoading={isLoading}
        onSave={handleCreateOrdonnance}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={accessiblePatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName", "age", "histoire"]}
        onCreatePatient={handleCreateNewPatient}
        titleTranslationKey="prescriptions.modals.selectPatientTitle"
        searchPlaceholderTranslationKey="prescriptions.modals.searchPatientPlaceholder"
        noResultsTranslationKey="prescriptions.modals.noPatientFound"
      />
    </>
  );
}
