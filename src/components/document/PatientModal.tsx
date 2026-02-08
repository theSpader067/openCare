"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PatientCreate } from "@/components/document/PatientCreate";
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
  titleTranslationKey?: string; // Translation key for modal title
  searchPlaceholderTranslationKey?: string; // Translation key for search placeholder
  noResultsTranslationKey?: string; // Translation key for no results text
}

export function PatientModal({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
  newPatientFields = ["fullName", "age","histoire"],
  newPatientDefaults,
  onCreatePatient,
  searchPlaceholder = "Rechercher un patient...",
  noResultsText = "Aucun patient trouvé",
  mobileOnly = false,
  desktopOnly = false,
  titleTranslationKey = "avis.modals.selectPatientTitle",
  searchPlaceholderTranslationKey = "avis.modals.searchPatientPlaceholder",
  noResultsTranslationKey = "avis.modals.noPatientFound",
}: PatientModalProps) {
  const { t } = useTranslation();

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
  };

  if (!isOpen) return null;

  // Use translation keys if available, otherwise use provided strings
  const modalTitle = titleTranslationKey ? t(titleTranslationKey) : "Sélectionner ou créer un patient";
  const searchText = searchPlaceholderTranslationKey ? t(searchPlaceholderTranslationKey) : searchPlaceholder;
  const noResultsMessage = noResultsTranslationKey ? t(noResultsTranslationKey) : noResultsText;

  const containerClasses = mobileOnly ? "fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 xl:hidden" : desktopOnly ? "hidden xl:fixed xl:inset-0 xl:z-50 xl:bg-black/30 xl:flex xl:items-center xl:justify-center xl:p-4" : "fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="relative pb-3">
          <CardTitle>{modalTitle}</CardTitle>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded transition"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          <PatientCreate
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onCreatePatient={onCreatePatient}
            newPatientFields={newPatientFields}
            newPatientDefaults={newPatientDefaults}
            searchPlaceholder={searchText}
            noResultsText={noResultsMessage}
            showTabs={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
