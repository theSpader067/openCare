"use client";

import { forwardRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/document";

type NewPatientFormFields = Record<string, string>;

interface PatientCreateProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onCreatePatient: (formData: NewPatientFormFields) => void;
  newPatientFields?: string[]; // e.g., ["nom", "age", "histoire"]
  newPatientDefaults?: NewPatientFormFields;
  searchPlaceholder?: string;
  noResultsText?: string;
  showTabs?: boolean;
  skipSuccessDisplay?: boolean; // If true, skip success message and timeout, let parent handle transition
}

export interface PatientCreateRef {
  getNewPatientFormData: () => NewPatientFormFields;
  getMode: () => "select" | "new";
}

export const PatientCreate = forwardRef<PatientCreateRef, PatientCreateProps>(
  function PatientCreate({
    patients,
    onSelectPatient,
    onCreatePatient,
    newPatientFields = ["nom", "age","histoire"],
    newPatientDefaults,
    searchPlaceholder,
    noResultsText,
    showTabs = true,
    skipSuccessDisplay = false,
  }: PatientCreateProps, ref) {
  const { t } = useTranslation();
  const defaultSearchPlaceholder = searchPlaceholder ?? t("patients.create.searchPlaceholder");
  const defaultNoResultsText = noResultsText ?? t("patients.create.noResults");
  const [patientMode, setPatientMode] = useState<"select" | "new">("select");
  const [patientSearch, setPatientSearch] = useState("");
  const [newPatientForm, setNewPatientForm] = useState<NewPatientFormFields>(
    newPatientDefaults || Object.fromEntries(newPatientFields.map((f) => [f, ""]))
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [createError, setCreateError] = useState<string>("");

  // Expose methods to parent component
  const [, setForceUpdate] = useState({});
  if (ref) {
    (ref as any).current = {
      getNewPatientFormData: () => newPatientForm,
      getMode: () => patientMode,
    };
  }

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) {
      return patients;
    }
    return patients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(query) ||
        Object.values(patient).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(query)
        )
      );
    });
  }, [patients, patientSearch]);

  const handleCreateNewPatient = async () => {
    if (!newPatientForm.fullName?.trim()) {
      setCreateError(t("patients.validation.nameRequired"));
      setCreateStatus("error");
      return;
    }

    setIsCreating(true);
    setCreateStatus("loading");
    setCreateError("");

    try {
      await onCreatePatient(newPatientForm);

      // If skipSuccessDisplay is true, let parent handle the transition
      if (skipSuccessDisplay) {
        setCreateStatus("idle");
        setIsCreating(false);
        return;
      }

      // Otherwise, show success state briefly
      setCreateStatus("success");

      // Reset form and return to select mode after a short delay
      setTimeout(() => {
        setNewPatientForm(
          newPatientDefaults || Object.fromEntries(newPatientFields.map((f) => [f, ""]))
        );
        setPatientMode("select");
        setCreateStatus("idle");
      }, 1500);
    } catch (error) {
      setCreateStatus("error");
      setCreateError(error instanceof Error ? error.message : t("patients.validation.createError"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setPatientMode("select");
    setPatientSearch("");
    setNewPatientForm(
      newPatientDefaults || Object.fromEntries(newPatientFields.map((f) => [f, ""]))
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs - Only show if showTabs is true - Clean Pill Shape Style */}
      {showTabs && (
        <div className="flex gap-4 bg-white p-1 border border-slate-200 rounded-full inline-flex">
          <button
            onClick={() => setPatientMode("select")}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2",
              patientMode === "select"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
            )}
          >
            {t("patients.tabs.existing")}
          </button>
          <button
            onClick={() => setPatientMode("new")}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2",
              patientMode === "new"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
            )}
          >
            {t("patients.tabs.new")}
          </button>
        </div>
      )}

      {patientMode === "select" ? (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-200 bg-slate-50">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={defaultSearchPlaceholder}
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Patients List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                // Extract patient info for display
                const pid = (patient as any).pid || patient.id;
                const patientInitials = patient.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                // Get age if available
                const age = (patient as any).age || (patient as any).dateOfBirth;

                // Get other relevant fields (filter out id, fullName, age, pid)
                const otherFields = Object.entries(patient)
                  .filter(([k, v]) => {
                    const keyToSkip = ["id", "fullName", "age", "pid"];
                    return !keyToSkip.includes(k) && typeof v === "string" && v.trim();
                  })
                  .slice(0, 2); // Only show first 2 additional fields

                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      console.log("PatientCreate: Clicked patient", patient);
                      onSelectPatient(patient);
                    }}
                    className="w-full text-left p-4 rounded border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 transition cursor-pointer group"
                  >
                    {/* Patient Header */}
                    <div className="flex items-start gap-3 mb-2">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-cyan-100 text-sm font-semibold text-cyan-700 flex-shrink-0">
                        {patientInitials}
                      </div>

                      {/* Name and ID */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {pid}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(age || otherFields.length > 0) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {age && (
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">
                            {age}
                          </span>
                        )}
                        {otherFields.map(([key, value]) => (
                          <span key={key} className="px-2 py-1 rounded bg-slate-100 text-slate-600 truncate">
                            {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-slate-500">{defaultNoResultsText}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {newPatientFields.map((field, index) => {
            const isTextarea = field === "histoire" || field === "description";
            const isNumber = field === "age";
            const isRequired = field === "fullName" || field === "nom";
            const label = field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase());

            return isTextarea ? (
              <div key={field} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {label}
                  </label>
                  {!isRequired && (
                    <span className="text-xs text-slate-400">
                      {t("common.labels.optional")}
                    </span>
                  )}
                </div>
                <textarea
                  value={newPatientForm[field]}
                  onChange={(e) =>
                    setNewPatientForm((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder={t("patients.create.enterField", { field: label.toLowerCase() })}
                  rows={3}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            ) : (
              <div key={field} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {label}
                  </label>
                  {!isRequired && (
                    <span className="text-xs text-slate-400">
                      {t("common.labels.optional")}
                    </span>
                  )}
                </div>
                <input
                  type={isNumber ? "number" : "text"}
                  value={newPatientForm[field]}
                  onChange={(e) =>
                    setNewPatientForm((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder={t("patients.create.enterField", { field: label.toLowerCase() })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            );
          })}

          {/* Status Messages */}
          {createStatus === "error" && (
            <div className="flex items-center gap-3 p-4 rounded border border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{createError}</p>
            </div>
          )}

          {createStatus === "success" && (
            <div className="flex items-center gap-3 p-4 rounded border border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{t("patients.messages.created")}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 rounded border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {t("common.buttons.cancel")}
            </button>
            <button
              onClick={handleCreateNewPatient}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 rounded bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="button"
            >
              {isCreating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {t("common.loading.creating")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t("common.buttons.save")}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
);
