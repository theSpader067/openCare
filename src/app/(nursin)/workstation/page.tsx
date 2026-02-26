"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Pill,
  Heart,
  TrendingUp,
  ChevronRight,
  X,
  Activity,
  Users,
  AlertCircle,
  ArrowLeft,
  Save,
  Loader,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface Treatment {
  id: string;
  name: string;
  posologie: string;
  voie: "IV" | "IM" | "VO";
  duration?: number;
  hours: Record<number, boolean>;
}

interface NursingPatient {
  id: string;
  name: string;
  salle: string;
  age: number;
  diagnostic: string;
  motif: string;
  treatments: Treatment[];
}

interface Task {
  id: string;
  label: string;
  done: boolean;
}

// Mock data
const mockPatients: NursingPatient[] = [
  {
    id: "1",
    name: "Jean Dupont",
    salle: "S12",
    age: 62,
    diagnostic: "Pneumonie communautaire",
    motif: "Dyspnée",
    treatments: [
      {
        id: "t1",
        name: "Ceftriaxone",
        posologie: "1g",
        voie: "IV",
        duration: 7,
        hours: { 8: true, 14: true, 20: false },
      },
      {
        id: "t2",
        name: "Paracétamol",
        posologie: "500mg",
        voie: "VO",
        duration: 5,
        hours: { 8: true, 14: false, 20: true },
      },
    ],
  },
  {
    id: "2",
    name: "Marie Lefèvre",
    salle: "S14",
    age: 45,
    diagnostic: "Gastro-entérite",
    motif: "Douleurs abdominales",
    treatments: [
      {
        id: "t3",
        name: "Métoclopramide",
        posologie: "10mg",
        voie: "IV",
        duration: 3,
        hours: { 8: false, 14: true, 20: false },
      },
    ],
  },
  {
    id: "3",
    name: "Philippe Martin",
    salle: "S08",
    age: 78,
    diagnostic: "Infection urinaire",
    motif: "Dysuria",
    treatments: [
      {
        id: "t4",
        name: "Ciprofloxacine",
        posologie: "500mg",
        voie: "VO",
        duration: 10,
        hours: { 6: true, 18: true },
      },
      {
        id: "t5",
        name: "Tamsulosine",
        posologie: "0.4mg",
        voie: "VO",
        duration: 30,
        hours: { 21: true },
      },
    ],
  },
  {
    id: "4",
    name: "Sylvie Moreau",
    salle: "S16",
    age: 35,
    diagnostic: "Fracture tibiale",
    motif: "Post-opératoire",
    treatments: [
      {
        id: "t6",
        name: "Morphine",
        posologie: "2mg",
        voie: "IV",
        duration: 5,
        hours: { 8: true, 14: true, 20: true },
      },
    ],
  },
  {
    id: "5",
    name: "Robert Blanc",
    salle: "S20",
    age: 72,
    diagnostic: "Insuffisance cardiaque",
    motif: "Tachycardie",
    treatments: [
      {
        id: "t7",
        name: "Furosémide",
        posologie: "40mg",
        voie: "VO",
        duration: 60,
        hours: { 8: true },
      },
      {
        id: "t8",
        name: "Bisoprolol",
        posologie: "2.5mg",
        voie: "VO",
        duration: 60,
        hours: { 8: true, 20: true },
      },
    ],
  },
  {
    id: "6",
    name: "Isabelle Leclerc",
    salle: "S10",
    age: 55,
    diagnostic: "Diabète décompensé",
    motif: "Hyperglycémie",
    treatments: [
      {
        id: "t9",
        name: "Insuline rapide",
        posologie: "10UI",
        voie: "IV",
        duration: 7,
        hours: { 8: false, 12: true, 18: false },
      },
    ],
  },
];

const mockTasks: Task[] = [
  { id: "1", label: "Vérifier les constantes (08h)", done: false },
  { id: "2", label: "Administrer Paracétamol 1g - S12", done: true },
  { id: "3", label: "Changer pansement - S08", done: false },
  { id: "4", label: "Surveillance post-op - S16", done: false },
  { id: "5", label: "Prélèvement sanguin - S14", done: true },
  { id: "6", label: "Entretien hygiène - S20", done: false },
];

// ============================================================================
// PATIENT LIST ITEM
// ============================================================================
function PatientListItem({
  patient,
  isSelected,
  onClick,
}: {
  patient: NursingPatient;
  isSelected: boolean;
  onClick: () => void;
}) {
  const overdueTreatments = patient.treatments.filter((t) => {
    const currentHour = new Date().getHours();
    return Object.entries(t.hours).some(
      ([hour, administered]) =>
        parseInt(hour) < currentHour && administered === false
    );
  }).length;

  const pendingTreatments = patient.treatments.filter((t) =>
    Object.values(t.hours).some((v) => v === false)
  ).length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2.5 transition-all duration-200 border-l-4 text-left group",
        isSelected
          ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-l-indigo-600 shadow-md"
          : "bg-white border-l-transparent hover:bg-slate-50 hover:border-l-indigo-300"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-sm font-bold transition-colors",
              isSelected ? "text-indigo-900" : "text-slate-900 group-hover:text-indigo-700"
            )}
          >
            {patient.name}
          </h3>
        </div>
        <div
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors",
            isSelected
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700"
          )}
        >
          {patient.salle}
        </div>
      </div>

      <p
        className={cn(
          "text-xs line-clamp-1 mb-2 transition-colors",
          isSelected ? "text-indigo-700" : "text-slate-600"
        )}
      >
        {patient.diagnostic}
      </p>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={isSelected ? "text-indigo-600" : "text-slate-500"}>
          {patient.age}a • {patient.treatments.length} méd
        </span>

        {overdueTreatments > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
            <AlertTriangle className="h-3 w-3" />
            {overdueTreatments}
          </span>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// PATIENT DETAIL VIEW
// ============================================================================
function PatientDetailView({
  patient,
  onBack,
}: {
  patient: NursingPatient;
  onBack: () => void;
}) {
  const [patientTreatments, setPatientTreatments] = useState(patient.treatments);
  const [initialTreatments] = useState(patient.treatments);
  const [isSaving, setIsSaving] = useState(false);
  const currentHour = new Date().getHours();
  const displayHours = Array.from({ length: 24 }, (_, i) => i);

  // Check if data has been modified
  const hasChanges = JSON.stringify(patientTreatments) !== JSON.stringify(initialTreatments);

  // Cycle through states: empty → planned (false) → administered (true) → empty
  const handleToggleTreatment = (treatmentId: string, hour: number) => {
    setPatientTreatments(
      patientTreatments.map((t) => {
        if (t.id !== treatmentId) return t;

        const currentState = t.hours[hour];

        // Cycle: empty → false (planned) → true (administered) → empty
        let newHours = { ...t.hours };

        if (currentState === undefined) {
          // Empty → Planned
          newHours[hour] = false;
        } else if (currentState === false) {
          // Planned → Administered
          newHours[hour] = true;
        } else if (currentState === true) {
          // Administered → Empty
          delete newHours[hour];
        }

        return {
          ...t,
          hours: newHours,
        };
      })
    );
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    // In real app, would update initial state and send to backend
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 shadow-lg border-b border-slate-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors mb-3 font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au calendrier
        </button>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
            <p className="text-slate-300 text-sm mt-1">{patient.diagnostic}</p>
          </div>
          <Badge className="bg-white text-slate-900 font-bold text-base px-3 py-1.5">
            {patient.salle}
          </Badge>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Demographics Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
              Données démographiques
            </h3>
            <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div>
                <p className="text-xs text-slate-600 font-medium">Âge</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{patient.age} ans</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Motif d'admission</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{patient.motif}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Chambre</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{patient.salle}</p>
              </div>
            </div>
          </section>

          {/* ATCD Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
              Antécédents
            </h3>
            <div className="space-y-2 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Médicaux</p>
                <p className="text-sm text-slate-600">Hypertension, Diabète</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-1">Chirurgicaux</p>
                <p className="text-sm text-slate-600">Appendicectomie (2015)</p>
              </div>
            </div>
          </section>

          {/* Last Observation */}
          <section>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
              Dernière observation
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Patient stable, constantes normales. Apétence bonne. Pas de plaintes
                actuelles. Plaies cicatrisant bien. À continuer traitement en cours.
              </p>
            </div>
          </section>

          {/* Horaire des Traitements Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Horaire des traitements
            </h3>

            <div className="space-y-3">
              {patientTreatments.map((treatment) => {
                return (
                  <div
                    key={treatment.id}
                    className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Treatment header */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900">
                            {treatment.name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {treatment.posologie} • {treatment.voie}
                            {treatment.duration && ` • ${treatment.duration}j`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time grid */}
                    <div className="p-4 bg-white space-y-3">
                      <div className="grid grid-cols-8 gap-1.5">
                        {displayHours.map((hour) => {
                          const isScheduled = hour in treatment.hours;
                          const isAdministered = treatment.hours[hour] === true;
                          const isPlanned = isScheduled && !isAdministered;
                          const timeDisplay = `${String(hour).padStart(2, "0")}:00`;

                          return (
                            <button
                              key={hour}
                              onClick={() =>
                                handleToggleTreatment(treatment.id, hour)
                              }
                              className={cn(
                                "py-1.5 px-1 rounded text-xs font-bold transition-all duration-200 transform hover:scale-105 active:scale-95",
                                !isScheduled
                                  ? "bg-slate-100 text-slate-400 hover:bg-slate-150"
                                  : isAdministered
                                  ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                                  : isPlanned
                                  ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                                  : ""
                              )}
                              title={`${timeDisplay}${isScheduled ? (isAdministered ? " - Administré" : " - À administrer") : " - Non prévu"}`}
                            >
                              {timeDisplay}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-100 border border-slate-300 rounded"></div>
                          <span className="text-slate-600">Non prévu</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-blue-500 rounded"></div>
                          <span className="text-slate-600">À administrer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-emerald-500 rounded"></div>
                          <span className="text-slate-600">Administré</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "rounded-lg text-sm font-semibold gap-2 flex items-center",
            hasChanges && !isSaving
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SHIFT SCHEDULE TABLE
// ============================================================================
function ShiftScheduleTimeline() {
  const currentHour = new Date().getHours();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // State management for treatments
  const [treatments, setTreatments] = useState<Record<string, Record<number, boolean>>>(() => {
    const state: Record<string, Record<number, boolean>> = {};
    mockPatients.forEach((patient) => {
      state[patient.id] = {};
      patient.treatments.forEach((treatment) => {
        state[`${patient.id}-${treatment.id}`] = { ...treatment.hours };
      });
    });
    return state;
  });

  // Track originally scheduled hours (for en retard detection)
  const originallyScheduled = new Set<string>();
  mockPatients.forEach((patient) => {
    patient.treatments.forEach((treatment) => {
      Object.keys(treatment.hours).forEach((hour) => {
        originallyScheduled.add(`${patient.id}-${treatment.id}-${hour}`);
      });
    });
  });

  // Display all 24 hours
  const displayHours = Array.from({ length: 24 }, (_, i) => i);

  // Track if state has changed from initial
  const [initialTreatments] = useState(treatments);
  const hasChanges = JSON.stringify(treatments) !== JSON.stringify(initialTreatments);

  // Loading state for save
  const [isSavingTreatments, setIsSavingTreatments] = useState(false);

  // Handle save with loading state
  const handleSave = async () => {
    setIsSavingTreatments(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSavingTreatments(false);
    // In real app, send to backend here
  };

  // Click handler to toggle treatment state
  const handleCellClick = (patientId: string, treatmentId: string, hour: number) => {
    setTreatments((prev) => {
      const key = `${patientId}-${treatmentId}`;
      const current = prev[key] || {};

      if (!(hour in current)) {
        // Empty slot → À administrer (pending)
        return {
          ...prev,
          [key]: { ...current, [hour]: false },
        };
      }

      const currentState = current[hour];

      // Cycle through states: false (à administrer) → true (administré) → remove (aucun)
      if (currentState === false) {
        // À administrer → Administré
        return {
          ...prev,
          [key]: { ...current, [hour]: true },
        };
      } else if (currentState === true) {
        // Administré → Remove (aucun)
        const newState = { ...current };
        delete newState[hour];
        return {
          ...prev,
          [key]: newState,
        };
      }

      return prev;
    });
  };

  // Get status for a cell
  const getStatus = (patientId: string, treatmentId: string, hour: number) => {
    const key = `${patientId}-${treatmentId}`;
    const treatmentState = treatments[key];

    if (!(hour in treatmentState)) {
      return "none"; // No treatment scheduled
    }

    const isAdministered = treatmentState[hour] === true;
    const isPast = hour < currentHour;
    const wasOriginallyScheduled = originallyScheduled.has(`${patientId}-${treatmentId}-${hour}`);

    // Only show en retard for originally scheduled treatments that are past and not done
    if (isPast && !isAdministered && wasOriginallyScheduled) {
      return "overdue"; // En retard
    }

    return isAdministered ? "administered" : "pending"; // Administré or À administrer
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            Calendrier des traitements • 24h
          </h1>
          <p className="text-sm text-slate-600">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" • Heure actuelle: "}
            <span className="font-bold text-slate-900">
              {currentHour}h
            </span>
            <span className="text-slate-500 ml-2">• Cliquez sur une case pour modifier l'état</span>
          </p>
        </div>

        {/* Save button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSavingTreatments}
            className={cn(
              "rounded-lg font-semibold whitespace-nowrap ml-4 gap-2 flex items-center",
              isSavingTreatments
                ? "bg-indigo-600 text-white cursor-wait opacity-75"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            {isSavingTreatments ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          {/* Header row */}
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
            <tr>
              {/* Patient column header */}
              <th className="px-4 py-3 text-left font-bold text-sm border-b-2 border-slate-700 whitespace-nowrap w-40">
                Patient
              </th>

              {/* Hour headers */}
              {displayHours.map((hour) => (
                <th
                  key={`header-${hour}`}
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className={cn(
                    "px-2 py-3 text-center font-bold text-xs border-b-2 border-slate-700 whitespace-nowrap transition-colors duration-200 cursor-pointer",
                    hoveredHour === hour
                      ? "bg-indigo-600"
                      : hour === currentHour
                      ? "bg-indigo-700"
                      : ""
                  )}
                >
                  {hour}h
                </th>
              ))}
            </tr>
          </thead>

          {/* Patient rows */}
          <tbody>
            {mockPatients.map((patient, patientIdx) => {
              const patientTreatments = patient.treatments;

              // Check if patient has any overdue treatments
              const hasOverdue = patientTreatments.some((t) => {
                const key = `${patient.id}-${t.id}`;
                const treatmentState = treatments[key];
                return Object.entries(treatmentState).some(
                  ([h, v]) => parseInt(h) < currentHour && v === false
                );
              });

              return (
                <tr
                  key={patient.id}
                  className={cn(
                    "border-b border-slate-200 transition-colors duration-200 hover:bg-slate-50",
                    hasOverdue ? "bg-red-50/50" : "bg-white",
                    patientIdx % 2 === 1 ? "bg-slate-50/30" : ""
                  )}
                >
                  {/* Patient info cell */}
                  <td className="px-4 py-4 border-r border-slate-200 sticky left-0 z-5 bg-inherit">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {patient.name[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-slate-600">{patient.salle}</p>
                      </div>
                    </div>
                  </td>

                  {/* Treatment cells - one per treatment per hour */}
                  {displayHours.map((hour) => {
                    const patientTreatmentsAtHour = patientTreatments.filter((t) => {
                      const key = `${patient.id}-${t.id}`;
                      return hour in treatments[key];
                    });

                    const statuses = patientTreatmentsAtHour.map((t) =>
                      getStatus(patient.id, t.id, hour)
                    );

                    const hasAdministered = statuses.includes("administered");
                    const hasOverdueAtHour = statuses.includes("overdue");
                    const hasPending = statuses.includes("pending");

                    // Determine cell status (multiple treatments at same hour)
                    let cellStatus = "none";
                    if (hasOverdueAtHour) {
                      cellStatus = "overdue";
                    } else if (hasAdministered && !hasPending) {
                      cellStatus = "administered";
                    } else if (hasPending) {
                      cellStatus = "pending";
                    }

                    const treatmentNames = patientTreatmentsAtHour
                      .map((t) => t.name)
                      .join(", ");

                    // Click handler for any cell (empty or filled)
                    const handleClick = () => {
                      if (patientTreatmentsAtHour.length > 0) {
                        // Click existing treatment
                        handleCellClick(patient.id, patientTreatmentsAtHour[0].id, hour);
                      } else {
                        // Click empty slot - add first treatment
                        if (patientTreatments.length > 0) {
                          handleCellClick(patient.id, patientTreatments[0].id, hour);
                        }
                      }
                    };

                    return (
                      <td
                        key={`${patient.id}-${hour}`}
                        onMouseEnter={() => setHoveredHour(hour)}
                        onMouseLeave={() => setHoveredHour(null)}
                        onClick={handleClick}
                        className={cn(
                          "px-2 py-4 text-center border-r border-slate-200 transition-all duration-200 cursor-pointer group",
                          cellStatus === "none"
                            ? "bg-white hover:bg-slate-100"
                            : cellStatus === "administered"
                            ? "bg-emerald-100 hover:bg-emerald-200"
                            : cellStatus === "overdue"
                            ? "bg-red-100 hover:bg-red-200 animate-pulse"
                            : "bg-indigo-100 hover:bg-indigo-200"
                        )}
                        title={cellStatus === "none" ? "Cliquez pour ajouter un traitement" : `${treatmentNames}\nCliquez pour changer l'état`}
                      >
                        {patientTreatmentsAtHour.length > 0 && (
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Status badge */}
                            <div
                              className={cn(
                                "h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                                cellStatus === "administered"
                                  ? "bg-emerald-600"
                                  : cellStatus === "overdue"
                                  ? "bg-red-600"
                                  : cellStatus === "pending"
                                  ? "bg-indigo-600"
                                  : "bg-slate-300"
                              )}
                            >
                              {cellStatus === "administered" ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : cellStatus === "overdue" ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : cellStatus === "pending" ? (
                                "●"
                              ) : (
                                "-"
                              )}
                            </div>

                            {/* Count */}
                            {patientTreatmentsAtHour.length > 1 && (
                              <span className="text-xs font-bold text-slate-700 bg-white/60 px-1.5 py-0.5 rounded">
                                {patientTreatmentsAtHour.length}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-300 bg-gradient-to-r from-slate-50 to-blue-50">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
          Légende
        </p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-700">Administré</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              ●
            </div>
            <span className="text-sm text-slate-700">À administrer</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-700">En retard</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-400">
              -
            </div>
            <span className="text-sm text-slate-700">Aucun traitement</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TASKS PANEL
// ============================================================================
function TasksPanel({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [initialTaskState] = useState(JSON.stringify(initialTasks));
  const [isSavingTasks, setIsSavingTasks] = useState(false);

  // Track if tasks have changed
  const hasTaskChanges = JSON.stringify(tasks) !== initialTaskState;

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const handleSaveTasks = async () => {
    setIsSavingTasks(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSavingTasks(false);
    // In real app, send to backend here
  };

  // Helper to extract patient name from task label
  const getPatientNameFromTask = (label: string): string | null => {
    // Look for room patterns like "S12", "S14", etc.
    const roomMatch = label.match(/(?:Chambre|salle|S|Chamb\.?)\s*(\d+)/i);
    if (roomMatch) {
      const roomNum = roomMatch[1];
      const patient = mockPatients.find((p) => p.salle.includes(roomNum));
      return patient ? patient.name : null;
    }

    // Look for direct patient name references
    for (const patient of mockPatients) {
      if (label.includes(patient.name)) {
        return patient.name;
      }
    }

    return null;
  };

  const todoTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Premium header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-bold">Tâches</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-emerald-100">Complété</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>

        <p className="text-xs text-emerald-100 mt-2">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Tasks content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* To-do section */}
        {todoTasks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">
              À faire ({todoTasks.length})
            </p>
            <div className="space-y-2">
              {todoTasks.map((task) => {
                const patientName = getPatientNameFromTask(task.label);
                return (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="w-full group flex items-start gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 hover:from-red-100 hover:to-orange-100 hover:border-red-300 transition-all duration-200 text-left"
                  >
                    <Circle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5 group-hover:text-red-600 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-red-900">
                        {task.label}
                      </p>
                      {patientName && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {patientName}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-red-300 transition-colors flex-shrink-0 mt-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Done section */}
        {doneTasks.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">
              Complétées ({doneTasks.length})
            </p>
            <div className="space-y-1.5">
              {doneTasks.map((task) => {
                const patientName = getPatientNameFromTask(task.label);
                return (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="w-full group flex items-start gap-3 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 text-left"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 line-through">
                        {task.label}
                      </p>
                      {patientName && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {patientName}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-slate-200 bg-slate-50">
        <Button
          onClick={handleSaveTasks}
          disabled={!hasTaskChanges || isSavingTasks}
          className={cn(
            "w-full gap-2 rounded-lg h-10 font-semibold flex items-center justify-center",
            isSavingTasks
              ? "bg-emerald-600 text-white cursor-wait opacity-75"
              : hasTaskChanges
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
          size="sm"
        >
          {isSavingTasks ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE - RESPONSIVE
// ============================================================================
export default function WorkstationPage() {
  const [selectedPatient, setSelectedPatient] = useState<NursingPatient | null>(null);
  const [activeView, setActiveView] = useState<"calendar" | "patients" | "tasks">("calendar");
  const [showPatientsList, setShowPatientsList] = useState(false);
  const [showTasksPanel, setShowTasksPanel] = useState(false);

  // Desktop view (3 columns)
  const desktopLayout = (
    <div className="flex h-full gap-0 overflow-hidden bg-slate-50">
      {/* LEFT: Patient list */}
      <div className="w-3/12 border-r border-slate-300 bg-white flex flex-col overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-4 py-3 border-b border-slate-700 shadow-md">
          <h1 className="text-sm font-black uppercase tracking-wider">
            👥 Patients du Service
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {mockPatients.length} patients hospitalisés
          </p>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {mockPatients.map((patient) => (
            <PatientListItem
              key={patient.id}
              patient={patient}
              isSelected={selectedPatient?.id === patient.id}
              onClick={() => setSelectedPatient(patient)}
            />
          ))}
        </div>
      </div>

      {/* CENTER: Shift Schedule Timeline or Patient Detail */}
      <div className="w-6/12 border-r border-slate-300 flex overflow-hidden shadow-sm">
        {selectedPatient ? (
          <PatientDetailView
            patient={selectedPatient}
            onBack={() => setSelectedPatient(null)}
          />
        ) : (
          <ShiftScheduleTimeline />
        )}
      </div>

      {/* RIGHT: Tasks */}
      <div className="w-3/12 bg-white flex flex-col overflow-hidden shadow-sm">
        <TasksPanel tasks={mockTasks} />
      </div>
    </div>
  );

  // Mobile/Tablet view
  const mobileLayout = (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-4 py-3 border-b border-slate-700 shadow-md">
        <h1 className="text-base font-black uppercase tracking-wider">
          {activeView === "calendar" && "📅 Calendrier"}
          {activeView === "patients" && "👥 Patients"}
          {activeView === "tasks" && "✅ Tâches"}
        </h1>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeView === "calendar" && (
          <ShiftScheduleTimeline />
        )}
        {activeView === "patients" && (
          <div className="flex flex-col h-full bg-white">
            <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-4 py-3 border-b border-slate-700 shadow-md">
              <h2 className="text-sm font-bold">Patients du Service</h2>
              <p className="text-xs text-slate-300 mt-1">
                {mockPatients.length} patients hospitalisés
              </p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {mockPatients.map((patient) => (
                <PatientListItem
                  key={patient.id}
                  patient={patient}
                  isSelected={selectedPatient?.id === patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setActiveView("calendar");
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {activeView === "tasks" && (
          <TasksPanel tasks={mockTasks} />
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="flex-shrink-0 bg-white border-t border-slate-300 px-3 py-3 flex gap-2 justify-around shadow-lg">
        <button
          onClick={() => setActiveView("patients")}
          className={cn(
            "flex-1 py-3 px-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
            activeView === "patients"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          <Users className="h-4 w-4" />
          <span className="hidden xs:inline">Patients</span>
        </button>
        <button
          onClick={() => setActiveView("calendar")}
          className={cn(
            "flex-1 py-3 px-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
            activeView === "calendar"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden xs:inline">Calendrier</span>
        </button>
        <button
          onClick={() => setActiveView("tasks")}
          className={cn(
            "flex-1 py-3 px-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
            activeView === "tasks"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden xs:inline">Tâches</span>
        </button>
      </div>

      {/* Patient Detail Modal for Mobile */}
      {selectedPatient && activeView === "calendar" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden">
          <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            <PatientDetailView
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Layout (lg and above) */}
      <div className="hidden lg:flex h-full">
        {desktopLayout}
      </div>

      {/* Mobile/Tablet Layout (below lg) */}
      <div className="flex lg:hidden h-full flex-col">
        {mobileLayout}
      </div>
    </>
  );
}
