"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, FilePlus, MailPlus, Plus, Stethoscope, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";
import { operationTypes, teamMembers, mockPatients, mockOperations } from "@/data/comptes-rendus/comptes-rendus-data";

type Operation = {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  operators: Operator[];
  details: string;
  postNotes: string;
  patient?: Patient;
  createdAt: string;
  createdBy: string;
};

type Operator = {
  id: string;
  name: string;
  role: string;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function ComptesRendusPage() {
  const [operations, setOperations] = useState<Operation[]>(mockOperations);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(
    mockOperations[0]?.id ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(
    null
  );
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showOperatorSelect, setShowOperatorSelect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    operators: [] as Operator[],
    patient: null as Patient | null,
    details: "",
    postNotes: "",
  });

  const filteredOperations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return operations.filter((op) => {
      return (
        !query ||
        op.type.toLowerCase().includes(query) ||
        op.title.toLowerCase().includes(query) ||
        op.createdBy.toLowerCase().includes(query) ||
        op.details.toLowerCase().includes(query) ||
        op.patient?.fullName.toLowerCase().includes(query) ||
        op.operators.some((o) => o.name.toLowerCase().includes(query))
      );
    });
  }, [operations, searchTerm]);

  useEffect(() => {
    if (!isCreateMode && !activeOperationId && filteredOperations.length > 0) {
      setActiveOperationId(filteredOperations[0].id);
    }
  }, [activeOperationId, filteredOperations, isCreateMode]);

  const activeOperation = useMemo(() => {
    if (!activeOperationId) {
      return null;
    }
    return operations.find((op) => op.id === activeOperationId) ?? null;
  }, [activeOperationId, operations]);

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectOperation = (operationId: string) => {
    setActiveOperationId(operationId);
    setIsCreateMode(false);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setActiveOperationId(null);
    setCreateForm({
      title: "",
      type: "",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      operators: [],
      patient: null,
      details: "",
      postNotes: "",
    });
    setShowOperatorSelect(false);

    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("create");
    }
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
    closeMobilePanel();
  };

  const handleAddOperator = (member: TeamMember) => {
    const alreadyAdded = createForm.operators.some((op) => op.id === member.id);
    if (!alreadyAdded) {
      setCreateForm((prev) => ({
        ...prev,
        operators: [
          ...prev.operators,
          { id: member.id, name: member.name, role: member.role },
        ],
      }));
    }
    setShowOperatorSelect(false);
  };

  const handleRemoveOperator = (id: string) => {
    setCreateForm((prev) => ({
      ...prev,
      operators: prev.operators.filter((op) => op.id !== id),
    }));
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

  const handleCreateOperation = () => {
    if (
      !createForm.type ||
      !createForm.title ||
      !createForm.date ||
      !createForm.duration ||
      !createForm.details ||
      !createForm.postNotes ||
      createForm.operators.length === 0 ||
      !createForm.patient
    ) {
      return;
    }
    setIsSubmitting(true);
    const newOperation: Operation = {
      id: `OP-${Date.now()}`,
      title: createForm.title,
      type: createForm.type,
      date: createForm.date,
      duration: parseInt(createForm.duration),
      operators: createForm.operators,
      patient: createForm.patient,
      details: createForm.details,
      postNotes: createForm.postNotes,
      createdAt: new Date().toISOString(),
      createdBy: "Dr. Marie Dupont",
    };
    setTimeout(() => {
      setOperations((previous) => [newOperation, ...previous]);
      setIsCreateMode(false);
      if (typeof window !== "undefined" && window.innerWidth < 1280) {
        setMobilePanelMode("view");
        setIsMobilePanelOpen(true);
      }
      setActiveOperationId(newOperation.id);
      setIsSubmitting(false);
    }, 350);
  };

  const availableOperators = teamMembers.filter(
    (member) => !createForm.operators.some((op) => op.id === member.id)
  );

  const isFormValid =
    createForm.type &&
    createForm.title &&
    createForm.date &&
    createForm.duration &&
    createForm.details &&
    createForm.postNotes &&
    createForm.operators.length > 0 &&
    createForm.patient;

  const createFormContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Titre de l'intervention
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ex: Cholécystectomie laparoscopique"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Type d'intervention
        </label>
        <select
          value={createForm.type}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, type: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Sélectionner un type…</option>
          {operationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Date
        </label>
        <input
          type="date"
          value={createForm.date}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, date: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Durée (min)
        </label>
        <input
          type="number"
          value={createForm.duration}
          onChange={(event) =>
            setCreateForm((prev) => ({
              ...prev,
              duration: event.target.value,
            }))
          }
          placeholder="120"
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

      {/* Operators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Équipe opératoire
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOperatorSelect(!showOperatorSelect)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        </div>

        {showOperatorSelect && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-40 overflow-y-auto">
            {availableOperators.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Tous les opérateurs ont été ajoutés
              </p>
            ) : (
              availableOperators.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleAddOperator(member)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition text-sm"
                >
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </button>
              ))
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {createForm.operators.map((operator) => (
            <Badge
              key={operator.id}
              variant="muted"
              className="rounded-full pl-3 pr-1.5 py-1"
            >
              {operator.name}
              <button
                onClick={() => handleRemoveOperator(operator.id)}
                className="ml-1.5 hover:text-slate-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Détails de l'intervention
        </label>
        <textarea
          value={createForm.details}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, details: event.target.value }))
          }
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Déroulement de l'intervention, observations, incidents…"
        />
      </div>

      {/* Post Notes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Recommandations post-opératoires
        </label>
        <textarea
          value={createForm.postNotes}
          onChange={(event) =>
            setCreateForm((prev) => ({
              ...prev,
              postNotes: event.target.value,
            }))
          }
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="1. Recommandation 1\n2. Recommandation 2…"
        />
      </div>
    </div>
  );

  const detailViewContent = activeOperation ? (
    <>
      {/* Header with Type/Surgeon and Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Chirurgien principal
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {activeOperation.createdBy}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Date
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {formatDate(activeOperation.date)}
          </p>
        </div>
      </div>

      {/* Title and Type */}
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1">
          {activeOperation.type}
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          {activeOperation.title}
        </h2>
      </div>

      {/* Patient Info */}
      {activeOperation.patient && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            Patient
          </header>
          <p className="text-sm font-semibold text-slate-900">
            {activeOperation.patient.fullName}
          </p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
            {(activeOperation.patient as any).histoire}
          </p>
        </section>
      )}

      {/* Operation Info */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Calendar className="h-4 w-4" />
          Informations opératoires
        </header>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Durée
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeOperation.duration} minutes
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Équipe
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeOperation.operators.length} personnes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Équipe opératoire ({activeOperation.operators.length})
        </header>
        <div className="flex flex-wrap gap-2">
          {activeOperation.operators.map((operator) => (
            <div
              key={operator.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                {operator.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{operator.name}</p>
                <p className="text-xs text-slate-500">{operator.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Détails de l'intervention
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeOperation.details}
        </p>
      </section>

      {/* Post Notes */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm flex-1">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Recommandations post-opératoires
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeOperation.postNotes}
        </p>
      </section>
    </>
  ) : null;

  const renderListItemContent = (operation: Operation) => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">
            {operation.title}
          </p>
          <p className="text-xs text-slate-500">
            {operation.type} • {operation.createdBy}
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {formatDate(operation.date)}
        </span>
      </div>
      {operation.patient && (
        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">
            {operation.patient.fullName}
          </p>
        </div>
      )}
      <div className="mt-3 space-y-1 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">
          {operation.duration}min • {operation.operators.length} opérateurs
        </p>
        <p className="text-xs text-slate-500 line-clamp-1">
          {operation.operators.map((o) => o.name).join(", ")}
        </p>
      </div>
    </>
  );

  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Comptes rendus opératoires</h1>
          <p className="text-sm text-slate-500">
          Documentez vos interventions chirurgicales et consultez les détails de chaque opération.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <MailPlus className="mr-2 h-4 w-4" />
          nouveau compte rendu
        </Button>
      </section>
      <DataListLayout
        items={operations}
        filteredItems={filteredOperations}
        activeItemId={activeOperationId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item) => handleSelectOperation(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title="Comptes rendus opératoires"
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={detailViewContent ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={Stethoscope}
        emptyTitle="Aucun compte rendu"
        emptyDescription="Créez votre premier compte rendu pour commencer à documenter vos interventions."
        searchPlaceholder="Rechercher une intervention…"
        isSubmitting={isSubmitting}
        createTitle="Nouveau compte rendu opératoire"
        createDescription="Enregistrez une nouvelle intervention chirurgicale"
        saveButtonText="Enregistrer"
        isFormValid={isFormValid as boolean}
        onSave={handleCreateOperation}
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
