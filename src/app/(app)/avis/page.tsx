"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Calendar, MailPlus, MessageSquare, Plus, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";
import { mockPatients, mockAvis } from "@/data/avis/avis-data";

type Avis = {
  id: string;
  title: string;
  date: string;
  patient?: Patient;
  specialist: string;
  specialty: string;
  opinion: string;
  recommendations: string;
  createdAt: string;
  createdBy: string;
  direction: "incoming" | "outgoing";
  response?: string;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function AvisPage() {
  const [avis, setAvis] = useState<Avis[]>(mockAvis);
  const [activeAvisId, setActiveAvisId] = useState<string | null>(
    mockAvis[0]?.id ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(
    null
  );
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState("");

  const [createForm, setCreateForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    patient: null as Patient | null,
    specialist: "",
    specialty: "",
    opinion: "",
    recommendations: "",
  });

  const filteredAvis = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return avis.filter((av) => {
      const matchesSearch =
        !query ||
        av.title.toLowerCase().includes(query) ||
        av.specialty.toLowerCase().includes(query) ||
        av.specialist.toLowerCase().includes(query) ||
        av.opinion.toLowerCase().includes(query) ||
        av.patient?.fullName.toLowerCase().includes(query);

      const matchesDirection =
        directionFilter === "all" || av.direction === directionFilter;

      return matchesSearch && matchesDirection;
    });
  }, [avis, searchTerm, directionFilter]);

  useEffect(() => {
    if (!isCreateMode && !activeAvisId && filteredAvis.length > 0) {
      setActiveAvisId(filteredAvis[0].id);
    }
  }, [activeAvisId, filteredAvis, isCreateMode]);

  const activeAvi = useMemo(() => {
    if (!activeAvisId) {
      return null;
    }
    return avis.find((av) => av.id === activeAvisId) ?? null;
  }, [activeAvisId, avis]);

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectAvi = (avisId: string) => {
    setActiveAvisId(avisId);
    setIsCreateMode(false);
    setResponseText("");
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setActiveAvisId(null);
    setCreateForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      patient: null,
      specialist: "",
      specialty: "",
      opinion: "",
      recommendations: "",
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
    if (!formData.fullName?.trim()) {
      return;
    }
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      fullName: formData.fullName,
      histoire: formData.histoire || "",
    };
    setCreateForm((prev) => ({ ...prev, patient: newPatient }));
    setShowPatientModal(false);
  };

  const handleCreateAvi = () => {
    if (
      !createForm.title ||
      !createForm.date ||
      !createForm.patient ||
      !createForm.specialist ||
      !createForm.specialty ||
      !createForm.opinion ||
      !createForm.recommendations
    ) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newAvi: Avis = {
        id: `AV-${Date.now()}`,
        title: createForm.title,
        date: createForm.date,
        patient: createForm.patient ?? undefined,
        specialist: createForm.specialist,
        specialty: createForm.specialty,
        opinion: createForm.opinion,
        recommendations: createForm.recommendations,
        createdAt: new Date().toISOString(),
        createdBy: "Vous",
        direction: "outgoing",
      };

      setAvis((prev) => [newAvi, ...prev]);
      setIsSubmitting(false);
      setIsCreateMode(false);
      closeMobilePanel();
      setActiveAvisId(newAvi.id);
      setCreateForm({
        title: "",
        date: new Date().toISOString().split("T")[0],
        patient: null,
        specialist: "",
        specialty: "",
        opinion: "",
        recommendations: "",
      });
    }, 520);
  };

  const handleSendResponse = () => {
    if (!responseText.trim() || !activeAvisId) {
      return;
    }

    setAvis((prev) =>
      prev.map((av) =>
        av.id === activeAvisId
          ? { ...av, response: responseText }
          : av
      )
    );

    setResponseText("");
  };

  const isFormValid =
    createForm.title &&
    createForm.date &&
    createForm.patient &&
    createForm.specialist &&
    createForm.specialty &&
    createForm.opinion &&
    createForm.recommendations;

  const createFormContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Titre de l'avis
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ex: Avis cardiologique"
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

      {/* Specialist */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Médecin spécialiste
        </label>
        <input
          type="text"
          value={createForm.specialist}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, specialist: e.target.value }))
          }
          placeholder="Ex: Dr. Sophie Bernard"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Specialty */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Spécialité
        </label>
        <input
          type="text"
          value={createForm.specialty}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, specialty: e.target.value }))
          }
          placeholder="Ex: Cardiologie"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Opinion */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Avis/Observation
        </label>
        <textarea
          value={createForm.opinion}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              opinion: e.target.value,
            }))
          }
          placeholder="Observations cliniques et diagnostic..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Recommandations
        </label>
        <textarea
          value={createForm.recommendations}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              recommendations: e.target.value,
            }))
          }
          placeholder="1. Recommandation 1\n2. Recommandation 2..."
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );

  const detailViewContent = activeAvi ? (
    <>
      {/* Header with Specialist and Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Spécialiste
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {activeAvi.specialist}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Date
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {formatDate(activeAvi.date)}
          </p>
        </div>
      </div>

      {/* Avis Title and Specialty */}
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1">
          {activeAvi.specialty}
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          {activeAvi.title}
        </h2>
      </div>

      {/* Patient Info */}
      {activeAvi.patient && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            Patient
          </header>
          <p className="text-sm font-semibold text-slate-900">
            {activeAvi.patient.fullName}
          </p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
            {(activeAvi.patient as any).histoire}
          </p>
        </section>
      )}

      {/* Opinion */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Avis/Observation
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeAvi.opinion}
        </p>
      </section>

      {/* Recommendations */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Recommandations
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeAvi.recommendations}
        </p>
      </section>

      {/* Response Section - Only for Incoming Avis */}
      {activeAvi.direction === "incoming" && (
        <>
          {activeAvi.response && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
              <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">
                Votre réponse
              </header>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {activeAvi.response}
              </p>
            </section>
          )}
          {!activeAvi.response && (
            <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Envoyer une réponse
              </header>
              <div className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Écrivez votre réponse à cet avis..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition"
                >
                  <Send className="h-4 w-4" />
                  Envoyer la réponse
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </>
  ) : null;

  const renderListItemContent = (avi: Avis) => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">
              {avi.title}
            </p>
            {avi.direction === "incoming" ? (
              <ArrowDown className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <ArrowUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500">
            {avi.specialty} • {avi.specialist}
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {formatDate(avi.date)}
        </span>
      </div>
      {avi.patient && (
        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">
            {avi.patient.fullName}
          </p>
        </div>
      )}
      <p className="mt-3 text-sm text-slate-600 line-clamp-2">
        {avi.opinion}
      </p>
      {avi.direction === "incoming" && avi.response && (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs">
          <p className="font-semibold text-green-700">Réponse envoyée</p>
        </div>
      )}
    </>
  );
  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Avis interservices</h1>
          <p className="text-sm text-slate-500">
            Consultez les demandes d&apos;avis des autres services et partagez vos recommandations en retour.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <MailPlus className="mr-2 h-4 w-4" />
          Demander un avis
        </Button>
      </section>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200">
        <button
          onClick={() => setDirectionFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            directionFilter === "all"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tous ({avis.length})
        </button>
        <button
          onClick={() => setDirectionFilter("incoming")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
            directionFilter === "incoming"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowDown className="h-4 w-4" />
          Entrants ({avis.filter((a) => a.direction === "incoming").length})
        </button>
        <button
          onClick={() => setDirectionFilter("outgoing")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
            directionFilter === "outgoing"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowUp className="h-4 w-4" />
          Sortants ({avis.filter((a) => a.direction === "outgoing").length})
        </button>
      </div>

      <DataListLayout
        items={avis}
        filteredItems={filteredAvis}
        activeItemId={activeAvisId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: Avis ) => handleSelectAvi(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title="Avis médicaux"
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={detailViewContent ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={MessageSquare}
        emptyTitle="Aucun avis"
        emptyDescription="Créez votre premier avis médical"
        searchPlaceholder="Rechercher un avis..."
        isSubmitting={isSubmitting}
        createTitle="Nouvel avis"
        createDescription="Enregistrez un nouvel avis médical"
        saveButtonText="Enregistrer"
        isFormValid={isFormValid as unknown as boolean}
        onSave={handleCreateAvi}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={mockPatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName", "histoire"]}
        onCreatePatient={handleCreateNewPatient}
      />
    </>
  );
}
