"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/document";

type NewPatientFormFields = Record<string, string>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  newPatientFields?: string[]; // e.g., ["fullName", "age", "histoire"]
  newPatientDefaults?: NewPatientFormFields;
  onCreatePatient: (formData: NewPatientFormFields) => void;
  searchPlaceholder?: string;
  noResultsText?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export function PatientModal({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
  newPatientFields = ["fullName", "histoire"],
  newPatientDefaults,
  onCreatePatient,
  searchPlaceholder = "Rechercher un patient...",
  noResultsText = "Aucun patient trouvé",
  mobileOnly = false,
  desktopOnly = false,
}: PatientModalProps) {
  const [patientMode, setPatientMode] = useState<"select" | "new">("select");
  const [patientSearch, setPatientSearch] = useState("");
  const [newPatientForm, setNewPatientForm] = useState<NewPatientFormFields>(
    newPatientDefaults || Object.fromEntries(newPatientFields.map((f) => [f, ""]))
  );

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

  const handleCreateNewPatient = () => {
    onCreatePatient(newPatientForm);
    setNewPatientForm(
      newPatientDefaults || Object.fromEntries(newPatientFields.map((f) => [f, ""]))
    );
    setPatientMode("select");
  };

  const handleClose = () => {
    setPatientMode("select");
    setPatientSearch("");
    setNewPatientForm(
      newPatientDefaults || Object.fromEntries(newPatientFields.map((f) => [f, ""]))
    );
    onClose();
  };

  if (!isOpen) return null;

  const wrapperClasses = mobileOnly
    ? "xl:hidden"
    : desktopOnly
      ? "hidden xl:flex"
      : "";

  const containerClasses = mobileOnly ? "fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 xl:hidden" : desktopOnly ? "hidden xl:fixed xl:inset-0 xl:z-50 xl:bg-black/30 xl:flex xl:items-center xl:justify-center xl:p-4" : "fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="relative pb-3">
          <CardTitle>Sélectionner ou créer un patient</CardTitle>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mode Tabs */}
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
              Existants
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
              Nouveau
            </button>
          </div>

          {patientMode === "select" ? (
            <div className="space-y-3">
              {/* Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
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
                      onClick={() => {
                        onSelectPatient(patient);
                        handleClose();
                      }}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                    >
                      <p className="font-medium text-slate-900">
                        {patient.fullName}
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
                    {noResultsText}
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
                      {label}
                    </label>
                    <textarea
                      value={newPatientForm[field]}
                      onChange={(e) =>
                        setNewPatientForm((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      placeholder={`Entrez ${label.toLowerCase()}...`}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                ) : (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      {label}
                    </label>
                    <input
                      type={isNumber ? "number" : "text"}
                      value={newPatientForm[field]}
                      onChange={(e) =>
                        setNewPatientForm((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      placeholder={`Entrez ${label.toLowerCase()}...`}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                );
              })}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateNewPatient}
                  disabled={!newPatientForm.fullName?.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
