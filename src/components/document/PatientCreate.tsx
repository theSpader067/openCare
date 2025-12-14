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
      {/* Mode Tabs - Only show if showTabs is true */}
      {showTabs && (
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setPatientMode("select")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition",
              patientMode === "select"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600"
            )}
          >
            {t("patients.tabs.existing")}
          </button>
          <button
            onClick={() => setPatientMode("new")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition",
              patientMode === "new"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600"
            )}
          >
            {t("patients.tabs.new")}
          </button>
        </div>
      )}

      {patientMode === "select" ? (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={defaultSearchPlaceholder}
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
          {/* Patients List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    console.log("PatientCreate: Clicked patient", patient);
                    onSelectPatient(patient);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition cursor-pointer"
                >
                  <p className="font-medium text-slate-900">
                    {patient.fullName} <span className="text-slate-400">({(patient as any).pid || patient.id})</span>
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {Object.entries(patient)
                      .filter(([k]) => k !== "id" && k !== "fullName")
                      .map(([, v]) => v)
                      .filter((v) => typeof v === "string")
                      .join(" • ")}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-4">
                {defaultNoResultsText}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {newPatientFields.map((field) => {
            const isTextarea = field === "histoire" || field === "description";
            const isNumber = field === "age";
            const label = field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase());

            return isTextarea ? (
              <div key={field} className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-600">
                  {label} ({t("common.labels.optional")})
                </label>
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            ) : (
              <div key={field} className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-600">
                  {label} {field==="Nom"? "": `(${t("common.labels.optional")})`}
                </label>
                <input
                  type={"text"}
                  value={newPatientForm[field]}
                  onChange={(e) =>
                    setNewPatientForm((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder={t("patients.create.enterField", { field: label.toLowerCase() })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            );
          })}

          {/* Status Messages */}
          {createStatus === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <p className="text-sm text-rose-700">{createError}</p>
            </div>
          )}

          {createStatus === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{t("patients.messages.created")}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {t("common.buttons.cancel")}
            </button>
            <button
              onClick={handleCreateNewPatient}
              disabled={isCreating}
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="button"
            >
              {isCreating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {t("common.loading.creating")}
                </>
              ) : (
                t("common.buttons.save")
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
);
