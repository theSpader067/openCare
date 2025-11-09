"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, FilePlus, Pill, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";
import { mockPatients, mockOrdonnances } from "@/data/ordonnances/ordonnances-data";

type Ordonnance = {
  id: string;
  title: string;
  date: string;
  patient?: Patient;
  clinicalInfo: string;
  prescriptionDetails: string;
  createdAt: string;
  createdBy: string;
  age?: number;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function OrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>(mockOrdonnances);
  const [activeOrdonnanceId, setActiveOrdonnanceId] = useState<string | null>(
    mockOrdonnances[0]?.id ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(
    null
  );
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    patient: null as Patient | null,
    clinicalInfo: "",
    prescriptionDetails: "",
  });

  const userOrdonnances = useMemo(() => {
    return ordonnances.filter((ord) => ord.createdBy === "Vous");
  }, [ordonnances]);

  const filteredOrdonnances = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return userOrdonnances.filter((ord) => {
      return (
        !query ||
        ord.title.toLowerCase().includes(query) ||
        ord.prescriptionDetails.toLowerCase().includes(query) ||
        ord.patient?.fullName.toLowerCase().includes(query)
      );
    });
  }, [userOrdonnances, searchTerm]);

  useEffect(() => {
    if (!isCreateMode && !activeOrdonnanceId && filteredOrdonnances.length > 0) {
      setActiveOrdonnanceId(filteredOrdonnances[0].id);
    }
  }, [activeOrdonnanceId, filteredOrdonnances, isCreateMode]);

  const activeOrdonnance = useMemo(() => {
    if (!activeOrdonnanceId) {
      return null;
    }
    return ordonnances.find((ord) => ord.id === activeOrdonnanceId) ?? null;
  }, [activeOrdonnanceId, ordonnances]);

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
      clinicalInfo: "",
      prescriptionDetails: "",
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
    setCreateForm((prev) => ({ ...prev, patient }));
    setShowPatientModal(false);
  };

  const handleCreateNewPatient = (formData: Record<string, string>) => {
    if (!formData.fullName?.trim() || !formData.age) {
      return;
    }
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      fullName: formData.fullName.trim(),
      age: parseInt(formData.age, 10),
      histoire: formData.histoire?.trim() || "",
    };
    setCreateForm((prev) => ({ ...prev, patient: newPatient }));
    setShowPatientModal(false);
  };

  const handleCreateOrdonnance = () => {
    if (
      !createForm.title ||
      !createForm.date ||
      !createForm.patient ||
      !createForm.clinicalInfo ||
      !createForm.prescriptionDetails
    ) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newOrdonnance: Ordonnance = {
        id: `ORD-${Date.now()}`,
        title: createForm.title,
        date: createForm.date,
        patient: createForm.patient ?? undefined,
        clinicalInfo: createForm.clinicalInfo,
        prescriptionDetails: createForm.prescriptionDetails,
        createdAt: new Date().toISOString(),
        createdBy: "Vous",
      };

      setOrdonnances((prev) => [newOrdonnance, ...prev]);
      setIsSubmitting(false);
      setIsCreateMode(false);
      closeMobilePanel();
      setActiveOrdonnanceId(newOrdonnance.id);
      setCreateForm({
        title: "",
        date: new Date().toISOString().split("T")[0],
        patient: null,
        clinicalInfo: "",
        prescriptionDetails: "",
      });
    }, 520);
  };

  const isFormValid =
    createForm.title &&
    createForm.date &&
    createForm.patient &&
    createForm.clinicalInfo &&
    createForm.prescriptionDetails;

  const createFormContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Titre de l'ordonnance
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ex: Traitement post-opératoire"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Date
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

      {/* Patient Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Patient
        </label>
        <button
          type="button"
          onClick={() => setShowPatientModal(true)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {createForm.patient ? (
            <span className="font-medium text-slate-900">
              {createForm.patient.fullName}
            </span>
          ) : (
            <span className="text-slate-500">Sélectionner un patient</span>
          )}
        </button>
      </div>

      {/* Clinical Info */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Renseignement clinique
        </label>
        <textarea
          value={createForm.clinicalInfo}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              clinicalInfo: e.target.value,
            }))
          }
          placeholder="Contexte clinique et antécédents pertinents..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Prescription Details */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Détails de la prescription
        </label>
        <textarea
          value={createForm.prescriptionDetails}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              prescriptionDetails: e.target.value,
            }))
          }
          placeholder="1. Médicament A - dosage × fréquence..."
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
            {activeOrdonnance.patient?.id}
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
        <h2 className="text-2xl font-bold text-slate-900">
          {activeOrdonnance.title}
        </h2>
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

  const renderListItemContent = (ordonnance: Ordonnance) => (
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

  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ordonnances</h1>
          <p className="text-sm text-slate-500">
            Gérez vos prescriptions médicales et consultez l'historique des ordonnances.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Nouvelle ordonnance
        </Button>
      </section>
      <DataListLayout
        items={ordonnances}
        filteredItems={filteredOrdonnances}
        activeItemId={activeOrdonnanceId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: Ordonnance) => handleSelectOrdonnance(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title="Ordonnances"
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={detailViewContent ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={Pill}
        emptyTitle="Aucune ordonnance"
        emptyDescription="Créez votre première ordonnance"
        searchPlaceholder="Rechercher une ordonnance..."
        isSubmitting={isSubmitting}
        createTitle="Nouvelle ordonnance"
        createDescription="Enregistrez une nouvelle prescription"
        saveButtonText="Enregistrer"
        isFormValid={isFormValid as unknown as boolean}
        onSave={handleCreateOrdonnance}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={mockPatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName", "age", "histoire"]}
        onCreatePatient={handleCreateNewPatient}
      />
    </>
  );
}
