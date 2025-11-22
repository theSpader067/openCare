"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, FilePlus, Stethoscope, User, X, Plus, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";
import { operationTypes, teamMembers, mockPatients } from "@/data/comptes-rendus/comptes-rendus-data";
import { createCompteRendu, getComptesRendus, deleteCompteRendu } from "@/lib/api/comptes-rendus";
import type { DocumentItem } from "@/types/document";

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
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
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
  const { t } = useTranslation();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showOperatorSelect, setShowOperatorSelect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Load comptes-rendus from API on mount
  useEffect(() => {
    const loadOperations = async () => {
      try {
        setIsLoading(true);
        const result = await getComptesRendus();
        if (result.success && result.data) {
          const convertedOps = result.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            date: item.date,
            duration: item.duration,
            operators: item.operators,
            details: item.details,
            postNotes: item.postNotes,
            patient: item.patient,
            patientName: item.patientName,
            patientAge: item.patientAge,
            patientHistory: item.patientHistory,
            createdAt: item.createdAt,
            createdBy: "Vous",
          }));
          setOperations(convertedOps);
          if (convertedOps.length > 0) {
            setActiveOperationId(convertedOps[0].id);
          }
        } else {
          console.error("Failed to load comptes-rendus:", result.error);
        }
      } catch (error) {
        console.error("Error loading comptes-rendus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOperations();
  }, []);

  const [createForm, setCreateForm] = useState({
    title: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    operators: [] as Operator[],
    patient: null as Patient | null,
    patientSource: null as "db" | "new" | null,
    patientName: "",
    patientAge: "",
    patientHistory: "",
    details: "",
    postNotes: "",
  });

  const userOperations = useMemo(() => {
    return operations.filter((op) => op.createdBy === "Vous");
  }, [operations]);

  const filteredOperations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return userOperations.filter((op) => {
      return (
        !query ||
        op.title.toLowerCase().includes(query) ||
        op.type.toLowerCase().includes(query) ||
        op.details.toLowerCase().includes(query) ||
        op.patient?.fullName.toLowerCase().includes(query) ||
        op.patientName?.toLowerCase().includes(query) ||
        op.operators.some((o) => o.name.toLowerCase().includes(query))
      );
    });
  }, [userOperations, searchTerm]);

  const parsedOperations = useMemo(() => {
    return operations.map((op) => ({
      id: op.id,
      title: op.title,
      date: op.date,
      type: op.type,
      duration: op.duration,
      operators: op.operators,
      details: op.details,
      postNotes: op.postNotes,
      patient: op.patient,
      patientName: op.patientName,
      patientAge: op.patientAge,
      patientHistory: op.patientHistory,
      createdAt: op.createdAt,
      createdBy: op.createdBy,
    } as DocumentItem));
  }, [operations]);

  const parsedFilteredOperations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return parsedOperations
      .filter((op) => op.createdBy === "Vous")
      .filter((op) => {
        return (
          !query ||
          op.title.toLowerCase().includes(query) ||
          ((op as any).type && (op as any).type.toLowerCase().includes(query)) ||
          ((op as any).details && (op as any).details.toLowerCase().includes(query)) ||
          (op.patient?.fullName && op.patient.fullName.toLowerCase().includes(query)) ||
          ((op as any).patientName && (op as any).patientName.toLowerCase().includes(query)) ||
          ((op as any).operators && (op as any).operators.some((o: any) => o.name.toLowerCase().includes(query)))
        );
      });
  }, [parsedOperations, searchTerm]);

  useEffect(() => {
    if (!isCreateMode && !activeOperationId && parsedFilteredOperations.length > 0) {
      setActiveOperationId(parsedFilteredOperations[0].id);
    }
  }, [activeOperationId, parsedFilteredOperations, isCreateMode]);

  const activeOperation = useMemo(() => {
    if (!activeOperationId) {
      return null;
    }
    return parsedOperations.find((op) => op.id === activeOperationId) as Operation | null ?? null;
  }, [activeOperationId, parsedOperations]);

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
      patientSource: null,
      patientName: "",
      patientAge: "",
      patientHistory: "",
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

  const handleCreateOperation = async () => {
    if (
      !createForm.title ||
      !createForm.type ||
      !createForm.date ||
      !createForm.duration ||
      !createForm.details ||
      !createForm.postNotes ||
      createForm.operators.length === 0 ||
      !createForm.patientSource
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare API data based on patient source
      const apiData = {
        title: createForm.title,
        type: createForm.type,
        date: createForm.date,
        duration: parseInt(createForm.duration),
        details: createForm.details,
        postNotes: createForm.postNotes,
      };

      if (createForm.patientSource === "db" && createForm.patient) {
        // Use existing patient from DB
        Object.assign(apiData, {
          patientId: createForm.patient.id,
          patientName: '',
          patientAge: '',
          patientHistory: '',
        });
      } else {
        // Use new patient data
        Object.assign(apiData, {
          patientId: '',
          patientName: createForm.patientName,
          patientAge: createForm.patientAge,
          patientHistory: createForm.patientHistory,
        });
      }

      // Prepare operator IDs
      const operatorIds = createForm.operators.map((op) => parseInt(op.id) || op.id);
      console.log(apiData)
      const result = await createCompteRendu({
        ...apiData,
        operatorIds,
      } as any);

      if (result.success && result.data) {
        // Convert the response data to match our Operation type
        const newOperation: Operation = {
          id: result.data.id,
          title: result.data.title,
          type: result.data.type,
          date: result.data.date,
          duration: result.data.duration,
          operators: result.data.operators,
          details: result.data.details,
          postNotes: result.data.postNotes,
          patient: result.data.patient,
          createdAt: result.data.createdAt,
          createdBy: "Vous",
        };

        setOperations((prev) => [newOperation, ...prev]);
        setIsCreateMode(false);
        closeMobilePanel();
        setActiveOperationId(newOperation.id);
        setCreateForm({
          title: "",
          type: "",
          date: new Date().toISOString().split("T")[0],
          duration: "",
          operators: [],
          patient: null,
          patientSource: null,
          patientName: "",
          patientAge: "",
          patientHistory: "",
          details: "",
          postNotes: "",
        });
      } else {
        console.error("Failed to create compte-rendu:", result.error);
      }
    } catch (error) {
      console.error("Error creating compte-rendu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOperation = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      const result = await deleteCompteRendu(deleteTargetId);
      if (result.success) {
        // Remove from list
        setOperations((prev) => prev.filter((op) => op.id !== deleteTargetId));
        // Clear selection if it was the active item
        if (activeOperationId === deleteTargetId) {
          setActiveOperationId(null);
          setIsCreateMode(false);
        }
        // Close dialog
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      } else {
        console.error("Failed to delete rapport:", result.error);
      }
    } catch (error) {
      console.error("Error deleting rapport:", error);
    } finally {
      setIsDeleting(false);
      setOpenMenuId(null);
    }
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
    createForm.patientSource;

  const createFormContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.title")}
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder={t("reports.forms.titlePlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.type")}
        </label>
        <select
          value={createForm.type}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, type: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">{t("reports.forms.selectType")}</option>
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
          {t("reports.forms.date")}
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
          {t("reports.forms.duration")}
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
          {t("reports.forms.patient")}
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
            {t("reports.buttons.selectPatient")}
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
              {t("reports.buttons.changePatient")}
            </Button>
          </div>
        ) : (
          // Show new patient fields
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("reports.forms.patientName")}
              </label>
              <input
                type="text"
                value={createForm.patientName}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientName: e.target.value }))
                }
                placeholder={t("reports.forms.patientNamePlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("reports.forms.patientAge")}
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={createForm.patientAge}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientAge: e.target.value }))
                }
                placeholder={t("reports.forms.patientAgePlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("reports.forms.patientHistory")}
              </label>
              <textarea
                value={createForm.patientHistory}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientHistory: e.target.value }))
                }
                placeholder={t("reports.forms.patientHistoryPlaceholder")}
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
              {t("reports.buttons.selectAnotherPatient")}
            </Button>
          </div>
        )}
      </div>

      {/* Operators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t("reports.forms.surgicalTeam")}
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOperatorSelect(!showOperatorSelect)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {t("reports.buttons.add")}
          </Button>
        </div>

        {showOperatorSelect && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-40 overflow-y-auto">
            {availableOperators.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                {t("reports.forms.allOperatorsAdded")}
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
          {t("reports.forms.details")}
        </label>
        <textarea
          value={createForm.details}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, details: event.target.value }))
          }
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder={t("reports.forms.detailsPlaceholder")}
        />
      </div>

      {/* Post Notes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.postOpRecommendations")}
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
          placeholder={t("reports.forms.postOpPlaceholder")}
        />
      </div>
    </div>
  );

  const detailViewContent = activeOperation ? (
    <>
      {/* Header with Type/Surgeon and Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Chirurgien principal
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {activeOperation.createdBy}
          </p>
        </div>
        <div className="text-right flex-1">
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
      {(activeOperation.patient || activeOperation.patientName) && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            Patient
          </header>
          <div className="space-y-3">
            {/* Patient from DB */}
            {activeOperation.patient && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                    Nom
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeOperation.patient.fullName}
                  </p>
                </div>
                {(activeOperation.patient as any).age && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      Âge
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {(activeOperation.patient as any).age} ans
                    </p>
                  </div>
                )}
                {(activeOperation.patient as any).histoire && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      Antécédents
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {(activeOperation.patient as any).histoire}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Inline Patient Data */}
            {!activeOperation.patient && activeOperation.patientName && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                    Nom
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeOperation.patientName}
                  </p>
                </div>
                {activeOperation.patientAge && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      Âge
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {activeOperation.patientAge} ans
                    </p>
                  </div>
                )}
                {activeOperation.patientHistory && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      Antécédents
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {activeOperation.patientHistory}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
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

  const renderListItemContent = (item: DocumentItem) => {
    const operation = item as Operation;
    return (
      <>
        <div className="flex flex-wrap items-start justify-between gap-3 relative">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {operation.title}
            </p>
            <p className="text-xs text-slate-500">
              {(operation as any).type} • Créé par {operation.createdBy}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {formatDate(operation.date)}
            </span>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === operation.id ? null : operation.id);
                }}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openMenuId === operation.id && (
                <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(operation.id);
                      setShowDeleteConfirm(true);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {(operation.patient || (operation as any).patientName) && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <p className="font-semibold text-slate-700 text-xs">
              {operation.patient?.fullName || (operation as any).patientName}
            </p>
          </div>
        )}
        <div className="mt-3 space-y-1 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">
            {(operation as any).duration}min • {(operation as any).operators.length} opérateurs
          </p>
          <p className="text-xs text-slate-500 line-clamp-1">
            {(operation as any).operators.map((o: any) => o.name).join(", ")}
          </p>
        </div>
      </>
    );
  };

  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("reports.title")}</h1>
          <p className="text-sm text-slate-500">
            {t("reports.subtitle")}
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          {t("reports.buttons.new")}
        </Button>
      </section>
      <DataListLayout
        items={parsedOperations}
        filteredItems={parsedFilteredOperations}
        activeItemId={activeOperationId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: DocumentItem) => handleSelectOperation(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title={t("reports.title")}
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={activeOperation ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={Stethoscope}
        emptyTitle={t("reports.empty.title")}
        emptyDescription={t("reports.empty.description")}
        searchPlaceholder={t("reports.searchPlaceholder")}
        isSubmitting={isSubmitting}
        createTitle={t("reports.modals.createTitle")}
        createDescription={t("reports.modals.createDescription")}
        saveButtonText={t("reports.buttons.save")}
        isFormValid={isFormValid as boolean}
        isLoading={isLoading}
        onSave={handleCreateOperation}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={mockPatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName", "age","histoire"]}
        onCreatePatient={handleCreateNewPatient}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Supprimer le compte rendu</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce compte rendu? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteOperation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
