"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, FilePlus, Pill, User, Lock, Users, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { OrdonnancePDF } from "@/components/pdf/OrdonnancePDF";
import { OrdonnanceTemplatesSidebar } from "@/components/ordonnances/OrdonnanceTemplatesSidebar";
import { CreateTemplateModal } from "@/components/ordonnances/CreateTemplateModal";
import { Button } from "@/components/ui/button";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import { TeamSelector, type Team } from "@/components/ui/team-selector";
import { calculateAge } from "@/lib/utils/age";
import type { Patient } from "@/types/document";
import { mockPatients, mockOrdonnances } from "@/data/ordonnances/ordonnances-data";
import { type OrdonnanceTemplate } from "@/data/ordonnances/ordonnance-templates";
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
  remarquesConsignes?: string;
  prescriptionDetails?: string;
  createdAt: string;
  createdBy: string;
  age?: number;
  patientId?: number;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  isPrivate?: boolean;
  teamsData?: string;
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
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessiblePatients, setAccessiblePatients] = useState<Patient[]>([]);
  const [templateRefreshTrigger, setTemplateRefreshTrigger] = useState(0);

  const [createForm, setCreateForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    patient: null as Patient | null,
    patientSource: null as "db" | "new" | null,
    patientName: "",
    patientAge: "",
    patientHistory: "",
    remarquesConsignes: "",
    prescriptionDetails: "",
    isPrivate: true,
    selectedTeams: [] as Team[],
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
            remarquesConsignes: ord.remarquesConsignes,
            prescriptionDetails: ord.prescriptionDetails,
            createdAt: ord.createdAt,
            createdBy: "Vous",
            patientId: ord.patientId,
            patientName: ord.patientName,
            patientAge: ord.patientAge,
            patientHistory: ord.patientHistory,
            isPrivate: ord.isPrivate || false,
            teamsData: ord.teamsData,
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
      remarquesConsignes: ord.remarquesConsignes,
      prescriptionDetails: ord.prescriptionDetails,
      patientId: ord.patientId,
      patientName: ord.patientName,
      patientAge: ord.patientAge,
      patientHistory: ord.patientHistory,
      isPrivate: ord.isPrivate,
      teamsData: ord.teamsData,
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
      remarquesConsignes: "",
      prescriptionDetails: "",
      isPrivate: true,
      selectedTeams: [],
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
      !createForm.remarquesConsignes ||
      !createForm.prescriptionDetails ||
      !createForm.patientSource
    ) {
      return;
    }

    // If sharing with team, at least one team must be selected
    if (!createForm.isPrivate && createForm.selectedTeams.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for API
      const apiData = {
        title: createForm.title,
        date: createForm.date,
        remarquesConsignes: createForm.remarquesConsignes,
        prescriptionDetails: createForm.prescriptionDetails,
        isPrivate: createForm.isPrivate,
        teamsData: !createForm.isPrivate ? JSON.stringify(createForm.selectedTeams) : undefined,
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
          remarquesConsignes: result.data.remarquesConsignes,
          prescriptionDetails: result.data.prescriptionDetails,
          createdAt: result.data.createdAt,
          createdBy: "Vous",
          patientId: result.data.patientId,
          patientName: result.data.patientName,
          patientAge: result.data.patientAge,
          patientHistory: result.data.patientHistory,
          isPrivate: result.data.isPrivate || false,
          teamsData: result.data.teamsData,
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
          remarquesConsignes: "",
          prescriptionDetails: "",
          isPrivate: true,
          selectedTeams: [],
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
    createForm.remarquesConsignes &&
    createForm.prescriptionDetails &&
    (createForm.isPrivate || createForm.selectedTeams.length > 0);

  const handleExportPDF = async () => {
    if (!activeOrdonnance) return;

    const patientName = activeOrdonnance.patient?.fullName || activeOrdonnance.patientName || "N/A";

    // Calculate age from patient's date of birth or use stored age
    let patientAge: string = "N/A";
    if (activeOrdonnance.patient?.dateOfBirth) {
      const calculatedAge = calculateAge(activeOrdonnance.patient.dateOfBirth);
      patientAge = calculatedAge !== null ? calculatedAge.toString() : (activeOrdonnance.patientAge || "N/A");
    } else if (activeOrdonnance.patientAge) {
      patientAge = activeOrdonnance.patientAge;
    }

    const pdfDocument = (
      <OrdonnancePDF
        title={activeOrdonnance.title}
        date={activeOrdonnance.date}
        patientName={patientName}
        patientAge={patientAge}
        prescriptionDetails={activeOrdonnance.prescriptionDetails || "N/A"}
        remarquesConsignes={activeOrdonnance.remarquesConsignes || "N/A"}
        formattedDate={formatDate(activeOrdonnance.date)}
      />
    );

    const filename = `ordonnance-${activeOrdonnance.title.replace(/\s+/g, "-").toLowerCase()}-${new Date().getTime()}.pdf`;

    try {
      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleSelectTemplate = (template: OrdonnanceTemplate) => {
    setCreateForm((prev) => ({
      ...prev,
      prescriptionDetails: template.prescriptionDetails,
      remarquesConsignes: template.remarquesConsignes,
    }));
  };

  const formContent = (
    <div className="space-y-5 max-w-2xl">
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

      {/* Team Selector */}
      <TeamSelector
        onTeamsChange={(teams) =>
          setCreateForm((prev) => ({
            ...prev,
            selectedTeams: teams,
            isPrivate: teams.length === 0,
          }))
        }
        selectedTeams={createForm.selectedTeams}
      />

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

      {/* Remarques/Consignes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("prescriptions.forms.remarquesConsignes")}
        </label>
        <textarea
          value={createForm.remarquesConsignes}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              remarquesConsignes: e.target.value,
            }))
          }
          placeholder={t("prescriptions.forms.remarquesConsignesPlaceholder")}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );

  const createFormContent = (
    <div className="flex h-full gap-0 bg-white">
      {/* Templates Sidebar */}
      <OrdonnanceTemplatesSidebar
        onSelectTemplate={handleSelectTemplate}
        onOpenCreateTemplate={() => setShowCreateTemplateModal(true)}
        refreshTrigger={templateRefreshTrigger}
      />

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {formContent}
      </div>
    </div>
  );

  const detailViewContent = activeOrdonnance ? (
    <>
      {/* Header Section */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900">
              {activeOrdonnance.title}
            </h2>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors whitespace-nowrap"
            title="Exporter en PDF"
          >
            <Download className="h-4 w-4 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">PDF</span>
          </button>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="text-slate-600">
            <span className="font-medium">Date:</span> {formatDate(activeOrdonnance.date)}
          </div>

          {activeOrdonnance.isPrivate ? (
            <div className="text-red-700 font-medium">Privée</div>
          ) : (
            <>
              {activeOrdonnance.teamsData && (() => {
                try {
                  const teams = JSON.parse(activeOrdonnance.teamsData);
                  return teams.map((team: Team) => (
                    <div key={team.id} className="text-blue-700 font-medium">
                      {team.name}
                    </div>
                  ));
                } catch {
                  return <div className="text-blue-700 font-medium">Équipe</div>;
                }
              })()}
            </>
          )}
        </div>
      </div>

      {/* Patient Info */}
      {activeOrdonnance.patient && (
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Nom du patient</p>
              <p className="text-sm font-semibold text-slate-900">{activeOrdonnance.patient.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Âge</p>
              <p className="text-sm font-semibold text-slate-900">
                {activeOrdonnance.patient?.dateOfBirth
                  ? `${calculateAge(activeOrdonnance.patient.dateOfBirth)} ans`
                  : "N/A"}
              </p>
            </div>
            {activeOrdonnance.patientId && (
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">ID Patient</p>
                <p className="text-sm font-semibold text-slate-900">#{activeOrdonnance.patientId}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Créé par</p>
              <p className="text-sm font-semibold text-slate-900">{activeOrdonnance.createdBy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Details Section */}
      <section className="space-y-2 pb-4 border-b border-slate-200">
        <header className="text-sm font-semibold text-slate-900">Détails de la prescription</header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeOrdonnance.prescriptionDetails || "N/A"}
        </p>
      </section>

      {/* Remarques/Consignes Section */}
      {activeOrdonnance.remarquesConsignes && (
        <section className="space-y-2">
          <header className="text-sm font-semibold text-slate-900">Remarques & Consignes</header>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {activeOrdonnance.remarquesConsignes || "N/A"}
          </p>
        </section>
      )}
    </>
  ) : null;

  const renderListItemContent = (item: DocumentItem) => {
    const ordonnance = item as Ordonnance;
    const patientAge = ordonnance.patient?.dateOfBirth
      ? calculateAge(ordonnance.patient.dateOfBirth)
      : null;

    return (
      <div className="space-y-3">
        {/* Title and Date Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">
              {ordonnance.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Par {ordonnance.createdBy}
            </p>
          </div>
          <p className="text-xs text-slate-600 flex-shrink-0 whitespace-nowrap">
            {formatDate(ordonnance.date)}
          </p>
        </div>

        {/* Patient Info */}
        {ordonnance.patient && (
          <div className="border border-slate-200 rounded px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900">
                  {ordonnance.patient.fullName}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {patientAge !== null ? `${patientAge} ans` : "Âge inconnu"}
                </p>
              </div>
              {ordonnance.patientId && (
                <p className="text-xs text-slate-600 flex-shrink-0">#{ordonnance.patientId}</p>
              )}
            </div>
          </div>
        )}

        {/* Prescription Preview */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-600">Prescription:</p>
          <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
            {ordonnance.prescriptionDetails || "Aucun détail"}
          </p>
        </div>

        {/* Privacy/Team Badges */}
        {(ordonnance.isPrivate || ordonnance.teamsData) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {ordonnance.isPrivate ? (
              <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                Privée
              </span>
            ) : (
              ordonnance.teamsData && (() => {
                try {
                  const teams = JSON.parse(ordonnance.teamsData);
                  return teams.slice(0, 2).map((team: Team) => (
                    <span
                      key={team.id}
                      className="inline-flex text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                    >
                      {team.name}
                    </span>
                  ));
                } catch {
                  return null;
                }
              })()
            )}
          </div>
        )}
      </div>
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

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        onSuccess={() => {
          setTemplateRefreshTrigger((prev) => prev + 1);
        }}
      />
    </>
  );
}
