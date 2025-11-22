"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Calendar, MailPlus, MessageSquare, Plus, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { DocumentItem, Patient } from "@/types/document";
import { mockPatients, mockAvis } from "@/data/avis/avis-data";
import { useSession } from "next-auth/react";
import { createAvis, fetchAvis, updateAvisAnswer, type AvisResponse } from "@/lib/api/avis";

type Avis = {
  id: string;
  answer_date: string;
  patient?: Patient;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  destination_specialty: string;
  creatorSpecialty?: string;
  opinion: string;
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
  const { t } = useTranslation();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [activeAvisId, setActiveAvisId] = useState<string | null>(null);
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
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    date: new Date().toISOString().split("T")[0],
    patient: null as Patient | null,
    patientSource: null as "db" | "new" | null,
    patientName: "",
    patientAge: "",
    patientHistory: "",
    specialty: "",
    opinion: "",
  });
  
  const { data: session } = useSession()

  // Helper function to determine avis direction
  const getAvisDirection = (avis: any): "incoming" | "outgoing" => {
    const userId = (session?.user as any)?.id;
    const userSpecialty = (session?.user as any)?.specialty;

    // If avis is sent to user's specialty, it's incoming
    if (avis.destination_specialty && userSpecialty && avis.destination_specialty === userSpecialty) {
      return "incoming";
    }
    
    // If user created the avis, it's outgoing
    if (avis.creatorId && userId && avis.creatorId.toString() === userId.toString()) {
      return "outgoing";
    }

    

    // Default based on creatorId presence
    return avis.creatorId ? "incoming" : "outgoing";
  };

  // Fetch avis from backend on component mount
  useEffect(() => {
    const loadAvis = async () => {
      try {
        const response = await fetchAvis();
        const avisList = response.map((av: any) => ({
          id: av.id.toString(),
          answer_date: av.answer_date || new Date().toISOString(),
          patient: av.patient ? {
            id: av.patient.id.toString(),
            fullName: av.patient.fullName,
          } : undefined,
          patientName: av.patientName || undefined,
          patientAge: av.patientAge || undefined,
          patientHistory: av.patientHistory || undefined,
          destination_specialty: av.destination_specialty || "",
          creatorSpecialty: av.creatorSpecialty || undefined,
          opinion: av.details || "",
          createdAt: av.createdAt,
          createdBy: av.creator?.firstName ? `${av.creator.firstName} ${av.creator.lastName}` : "Vous",
          direction: getAvisDirection(av),
          response: av.answer,
        }));
        setAvis(avisList);
        if (avisList.length > 0) {
          setActiveAvisId(avisList[0].id);
        }
      } catch (error) {
        console.error("Error loading avis:", error);
        // Fallback to empty list on error
        setAvis([]);
      }
    };

    if (session?.user) {
      loadAvis();
    }
  }, [session?.user]);

  const filteredAvis = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return avis.filter((av) => {
      const matchesSearch =
        !query ||
        av.destination_specialty.toLowerCase().includes(query) ||
        av.opinion.toLowerCase().includes(query) ||
        av.patientName?.toLowerCase().includes(query)||
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
      date: new Date().toISOString().split("T")[0],
      patient: null,
      patientSource: null,
      patientName: "",
      patientAge: "",
      patientHistory: "",
      specialty: "",
      opinion: "",
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

  const handleCreateAvi = async () => {
    if (
      !createForm.date ||
      !createForm.patientSource ||
      !createForm.specialty ||
      !createForm.opinion
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const aviDict = {
        answer_date: createForm.date,
        patientId: createForm.patientSource === "db" && createForm.patient ? parseInt(createForm.patient.id as any) : undefined,
        patientName: createForm.patientSource === "new" ? createForm.patientName : undefined,
        patientAge: createForm.patientSource === "new" ? createForm.patientAge : undefined,
        patientHistory: createForm.patientSource === "new" ? createForm.patientHistory : undefined,
        destination_specialty: createForm.specialty,
        opinion: createForm.opinion,
      }
      
      console.log('AVIS@@@@@@@@@@@@@@@@@@@@')
      console.log(aviDict)
      // Call API to create avis
      const response = await createAvis(aviDict);

      // Convert API response to local Avis format
      // Create a temporary avis object with creatorId for direction determination
      const tempAvis = {
        ...response,
        destination_specialty: response.destination_specialty || createForm.specialty,
      };

      const newAvi: Avis = {
        id: response.id.toString(),
        answer_date: createForm.date,
        patient: response.patient ? {
          id: response.patient.id.toString(),
          fullName: response.patient.fullName,
        } : (createForm.patientSource === "new" ? {
          id: `PAT-${Date.now()}`,
          fullName: createForm.patientName,
          age: createForm.patientAge ? parseInt(createForm.patientAge) : undefined,
          histoire: createForm.patientHistory,
        } : undefined),
        patientName: createForm.patientSource === "new" ? createForm.patientName : undefined,
        patientAge: createForm.patientSource === "new" ? createForm.patientAge : undefined,
        patientHistory: createForm.patientSource === "new" ? createForm.patientHistory : undefined,
        destination_specialty: response.destination_specialty || createForm.specialty,
        creatorSpecialty: response.creator?.specialty || undefined,
        opinion: response.details || createForm.opinion,
        createdAt: response.createdAt,
        createdBy: response.creator?.firstName ? `${response.creator.firstName} ${response.creator.lastName}` : "Vous",
        direction: getAvisDirection(tempAvis),
        response: response.answer,
      };

      // Add to list
      setAvis((prev) => [newAvi, ...prev]);
      setIsSubmitting(false);
      setIsCreateMode(false);
      closeMobilePanel();
      setActiveAvisId(newAvi.id);

      // Reset form
      setCreateForm({
        date: new Date().toISOString().split("T")[0],
        patient: null,
        patientSource: null,
        patientName: "",
        patientAge: "",
        patientHistory: "",
        specialty: "",
        opinion: "",
      });
    } catch (error) {
      console.error("Error creating avis:", error);
      setIsSubmitting(false);
      // You could show a toast notification here for better UX
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim() || !activeAvisId) {
      return;
    }

    setIsSendingResponse(true);

    try {
      // Call API to update avis answer
      const response = await updateAvisAnswer(parseInt(activeAvisId), responseText);

      // Update local state with the response from API
      setAvis((prev) =>
        prev.map((av) =>
          av.id === activeAvisId
            ? { ...av, response: response.answer || responseText }
            : av
        )
      );

      setResponseText("");
      setIsSendingResponse(false);
    } catch (error) {
      console.error("Error sending response:", error);
      setIsSendingResponse(false);
      // You could show a toast notification here for better UX
    }
  };

  const isFormValid =
    createForm.date &&
    createForm.patientSource &&
    createForm.specialty &&
    createForm.opinion;
  
    if (!session) return null;

  const createFormContent = (
    <div className="space-y-4">
      {/* Service - Moved to top */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("avis.forms.service")}
        </label>
        <input
          type="text"
          value={createForm.specialty}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              specialty: e.target.value,
            }))
          }
          placeholder={t("avis.forms.servicePlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("avis.forms.date")}
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
          {t("avis.forms.patient")}
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
            {t("avis.buttons.selectPatient")}
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
              {t("avis.buttons.changePatient")}
            </Button>
          </div>
        ) : (
          // Show new patient fields
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("avis.forms.patientName")}
              </label>
              <input
                type="text"
                value={createForm.patientName}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientName: e.target.value }))
                }
                placeholder={t("avis.forms.patientNamePlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("avis.forms.patientAge")}
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={createForm.patientAge}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientAge: e.target.value }))
                }
                placeholder={t("avis.forms.patientAgePlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("avis.forms.patientHistory")}
              </label>
              <textarea
                value={createForm.patientHistory}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientHistory: e.target.value }))
                }
                placeholder={t("avis.forms.patientHistoryPlaceholder")}
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
              {t("avis.buttons.selectAnotherPatient")}
            </Button>
          </div>
        )}
      </div>

      {/* Opinion */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("avis.forms.opinion")}
        </label>
        <textarea
          value={createForm.opinion}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              opinion: e.target.value,
            }))
          }
          placeholder={t("avis.forms.opinionPlaceholder")}
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );

  const detailViewContent = activeAvi ? (
    <>
      {/* Header with Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {activeAvi.direction === "incoming" ? t("avis.sections.senderSpecialty") : t("avis.sections.destinationSpecialty")}
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {activeAvi.direction === "incoming"
              ? activeAvi.creatorSpecialty || t("avis.sections.notSpecified")
              : activeAvi.destination_specialty || t("avis.sections.notSpecified")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {t("avis.forms.date")}
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {formatDate(activeAvi.answer_date)}
          </p>
        </div>
      </div>

      {/* Patient Info */}
      {(activeAvi.patient || (activeAvi as any).patientName) && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            {t("avis.sections.patientInfo")}
          </header>

          <div className="space-y-3">
            {/* Patient Name */}
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                {t("avis.sections.name")}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {activeAvi.patient?.fullName || (activeAvi as any).patientName || t("avis.sections.notSpecified")}
              </p>
            </div>

            {/* Patient Age */}
            {(activeAvi.patient || (activeAvi as any).patientAge) && (
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                  {t("avis.sections.age")}
                </p>
                <p className="text-sm text-slate-700">
                  {(activeAvi as any).patientAge || t("avis.sections.notSpecified")}
                </p>
              </div>
            )}

            {/* Patient History / Antécédents */}
            {((activeAvi.patient && (activeAvi.patient as any).histoire) || (activeAvi as any).patientHistory) && (
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                  {t("avis.sections.medicalHistory")}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {(activeAvi.patient as any)?.histoire || (activeAvi as any).patientHistory || t("avis.sections.noHistory")}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Opinion */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("avis.sections.observation")}
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeAvi.opinion}
        </p>
      </section>

      {/* Response Section - Only for Incoming Avis */}
      {activeAvi.direction === "incoming" && (
        <>
          {activeAvi.response && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
              <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">
                {t("avis.sections.yourResponse")}
              </header>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {activeAvi.response}
              </p>
            </section>
          )}
          {!activeAvi.response && (
            <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("avis.sections.sendResponse")}
              </header>
              <div className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={t("avis.forms.responsePlaceholder")}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || isSendingResponse}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition"
                >
                  <Send className="h-4 w-4" />
                  {isSendingResponse ? t("avis.buttons.sending") : t("avis.buttons.sendResponse")}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </>
  ) : null;

  const renderListItemContent = (avi: DocumentItem) => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
           
            {avi.direction === "incoming" ? (
              <ArrowDown className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <ArrowUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500">
            {avi.direction === "incoming"
              ? (avi as any).creatorSpecialty || "Non spécifiée"
              : avi.destination_specialty || "Non spécifiée"}
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {formatDate(avi.answer_date)}
        </span>
      </div>
      {(avi.patient || (avi as any).patientName) && (
        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">
            {avi.patient?.fullName || (avi as any).patientName || "Patient"}
          </p>
          {((avi as any).patientAge || (avi as any).patientHistory) && (
            <p className="text-slate-600 mt-1 line-clamp-1">
              {(avi as any).patientAge && `Âge: ${(avi as any).patientAge}`}
              {(avi as any).patientAge && (avi as any).patientHistory && " • "}
              {(avi as any).patientHistory && `Antécédents: ${(avi as any).patientHistory}`}
            </p>
          )}
        </div>
      )}
      <p className="mt-3 text-sm text-slate-600 line-clamp-2">
        {avi.opinion}
      </p>
      {avi.direction === "incoming" && avi.response && (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs">
          <p className="font-semibold text-green-700">{t("avis.sections.responseSent")}</p>
        </div>
      )}
    </>
  );
  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("avis.title")}</h1>
          <p className="text-sm text-slate-500">
            {t("avis.subtitle")}
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <MailPlus className="mr-2 h-4 w-4" />
          {t("avis.buttons.request")}
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
          {t("avis.tabs.all")} ({avis.length})
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
          {t("avis.tabs.incoming")} ({avis.filter((a) => a.direction === "incoming").length})
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
          {t("avis.tabs.outgoing")} ({avis.filter((a) => a.direction === "outgoing").length})
        </button>
      </div>

      <DataListLayout
        items={avis as unknown as DocumentItem[]}
        filteredItems={filteredAvis as unknown as DocumentItem[]}
        activeItemId={activeAvisId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: DocumentItem ) => handleSelectAvi(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title={t("avis.title")}
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={detailViewContent ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={MessageSquare}
        emptyTitle={t("avis.empty.title")}
        emptyDescription={t("avis.empty.description")}
        searchPlaceholder={t("avis.searchPlaceholder")}
        isSubmitting={isSubmitting}
        createTitle={t("avis.modals.createTitle")}
        createDescription={t("avis.modals.createDescription")}
        saveButtonText={t("avis.buttons.save")}
        isFormValid={isFormValid as unknown as boolean}
        onSave={handleCreateAvi}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={mockPatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName","age", "histoire"]}
        onCreatePatient={handleCreateNewPatient}
      />
    </>
  );
}
