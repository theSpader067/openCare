"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Clock, Edit2, Check, Minus, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"
import { Patient } from "@/types/document"

interface PatientPreviewWithTabsProps {
  selectedPatient: Patient
  renderPatientHeader: () => React.ReactNode
  variant: "desktop" | "mobile"
  t: (key: string) => string
  renderPatientContent?: () => React.ReactNode
}

type Tab = "apercu" | "traitement"

interface Treatment {
  id: string
  name: string
  posologie: string
  voie: "IV" | "IM" | "VO"
  hours: Record<number, boolean | null> // null = line, true = checkmark, false = empty
}

export function PatientPreviewWithTabs({
  selectedPatient,
  renderPatientHeader,
  variant,
  t,
  renderPatientContent,
}: PatientPreviewWithTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("apercu")
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: "1",
      name: "Triaxone",
      posologie: "250mg",
      voie: "IV",
      hours: { 8: true, 14: true, 20: null },
    },
  ])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTreatments, setEditingTreatments] = useState<Treatment[]>([])

  const handleEditClick = () => {
    setEditingTreatments(JSON.parse(JSON.stringify(treatments)))
    setIsEditModalOpen(true)
  }

  const handleSaveModal = () => {
    setTreatments(editingTreatments)
    setIsEditModalOpen(false)
  }

  const toggleCellState = (treatmentId: string, hour: number) => {
    setEditingTreatments(
      editingTreatments.map((t) => {
        if (t.id === treatmentId) {
          const current = t.hours[hour]
          // Only cycle between empty (false) and scheduled (null), not administered
          return {
            ...t,
            hours: {
              ...t.hours,
              [hour]: current === null ? false : null,
            },
          }
        }
        return t
      })
    )
  }

  const addTreatment = (name: string, posologie: string, voie: Treatment["voie"]) => {
    setEditingTreatments([...editingTreatments, {
      id: Date.now().toString(), name, posologie, voie, hours: {}
    }])
  }

  const removeTreatment = (id: string) => {
    setEditingTreatments(editingTreatments.filter((t) => t.id !== id))
  }

  const updateTreatmentField = (id: string, field: "name" | "posologie" | "voie", value: string) => {
    setEditingTreatments(editingTreatments.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  const toggleTreatmentHour = (treatmentId: string, hour: number) => {
    setTreatments(
      treatments.map((t) => {
        if (t.id === treatmentId) {
          const current = t.hours[hour]
          // Only toggle between empty and scheduled (null), not administered
          return {
            ...t,
            hours: {
              ...t.hours,
              [hour]: current === null ? false : null,
            },
          }
        }
        return t
      })
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-6 w-full h-full overflow-hidden">
      {/* Patient Header */}
      {renderPatientHeader()}

      {/* Add Observation Button - Full Width */}
      <Button
        onClick={() =>
          router.push(
            `/patients/dossier/quickFill?id=${selectedPatient.id}`
          )
        }
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("patients.buttons.addObservation")}
      </Button>

      {/* Tabs - Less rounded style */}
      <div className="flex gap-4 bg-white p-1 border border-slate-200 rounded-lg w-full inline-flex">
        <button
          onClick={() => setActiveTab("apercu")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-lg border-2",
            activeTab === "apercu"
              ? "bg-cyan-600 text-white border-cyan-600"
              : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>{t("patients.tabs.apercu")}</span>
        </button>
        <button
          onClick={() => setActiveTab("traitement")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-lg border-2",
            activeTab === "traitement"
              ? "bg-cyan-600 text-white border-cyan-600"
              : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Fiche Traitement</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full overflow-hidden">
        {activeTab === "apercu" && renderPatientContent && (
          <div>{renderPatientContent()}</div>
        )}

        {activeTab === "traitement" && (
          <div className="flex flex-col gap-4 w-full h-full overflow-hidden">
            <TreatmentSheet
              treatments={treatments}
              isLoading={isLoadingTreatments}
              onEdit={handleEditClick}
              onToggleHour={toggleTreatmentHour}
            />
            <TreatmentModal
              open={isEditModalOpen}
              treatments={editingTreatments}
              onToggleCell={toggleCellState}
              onUpdateField={updateTreatmentField}
              onAddTreatment={addTreatment}
              onRemoveTreatment={removeTreatment}
              onSave={handleSaveModal}
              onClose={() => setIsEditModalOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Treatment Sheet component for displaying the treatment schedule
interface TreatmentSheetProps {
  treatments: Treatment[]
  isLoading?: boolean
  onEdit: () => void
  onToggleHour: (treatmentId: string, hour: number) => void
}

function TreatmentSheet({ treatments, isLoading = false, onEdit, onToggleHour }: TreatmentSheetProps) {
  const today = new Date()
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getCellIcon = (state: boolean | null | undefined) => {
    if (state === true) {
      return <Check className="h-4 w-4 text-green-600" />
    } else if (state === null) {
      return <Minus className="h-4 w-4 text-slate-400" />
    }
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fiche Traitement</h3>
            <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
          </div>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-2 flex-shrink-0"
            disabled
          >
            <Edit2 className="h-4 w-4" />
            Éditer
          </Button>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white p-8 flex items-center justify-center w-full">
          <div className="animate-pulse space-y-3 w-full">
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-10 bg-slate-100 rounded w-full" />
            <div className="h-10 bg-slate-100 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (treatments.length === 0) {
    return (
      <div className="space-y-4 w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fiche Traitement</h3>
            <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
          </div>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-2 flex-shrink-0"
          >
            <Edit2 className="h-4 w-4" />
            Éditer
          </Button>
        </div>
        <div className="border border-slate-200 rounded-lg bg-white p-12 text-center w-full">
          <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucun traitement prévu</p>
          <p className="text-sm text-slate-400 mt-1">Les traitements s'afficheront ici une fois ajoutés</p>
        </div>
      </div>
    )
  }

  // Get unique hours with scheduled treatments (state true or null)
  const getScheduledHours = () => {
    const hoursSet = new Set<number>()
    treatments.forEach((treatment) => {
      Object.entries(treatment.hours).forEach(([hour, state]) => {
        if (state === true || state === null) {
          hoursSet.add(Number(hour))
        }
      })
    })
    return Array.from(hoursSet).sort((a, b) => a - b)
  }

  const scheduledHours = getScheduledHours()

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Header with date and edit button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Fiche Traitement</h3>
          <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
        </div>
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="gap-2 flex-shrink-0"
        >
          <Edit2 className="h-4 w-4" />
          Éditer
        </Button>
      </div>

      {/* Vertical Timeline */}
      <div className="border border-slate-200 rounded-lg bg-white w-full p-6 overflow-y-auto max-h-96">
        <div className="relative space-y-6">
          {/* Vertical connecting line */}
          <div className="absolute w-0.5 bg-slate-200 left-[66px] top-[6px] bottom-[6px]" />

          {scheduledHours.map((hour) => (
            <div key={hour} className="flex gap-6 items-start">
              {/* Time label and timeline dot */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="font-mono text-sm font-bold text-slate-700 w-12 text-right">
                  {String(hour).padStart(2, "0")}h
                </div>
                <div className="h-3 w-3 rounded-full bg-cyan-500 border-2 border-white shadow-sm flex-shrink-0" />
              </div>

              {/* Medications scheduled at this hour */}
              <div className="flex-1 space-y-3">
                {treatments
                  .filter((treatment) => treatment.hours[hour] !== undefined && treatment.hours[hour] !== false)
                  .map((treatment) => (
                    <button
                      key={`${treatment.id}-${hour}`}
                      onClick={() => onToggleHour(treatment.id, hour)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center justify-between gap-4 w-full cursor-pointer hover:bg-slate-50 transition-colors text-left"
                      type="button"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div>
                          <div className="font-medium text-slate-900">{treatment.name}</div>
                          <div className="text-xs text-slate-500">{treatment.posologie}</div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 flex-shrink-0">
                          {treatment.voie}
                        </span>
                      </div>

                      {/* Status badge - clickable indicator */}
                      <div className="flex-shrink-0">
                        {treatment.hours[hour] === null ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2 py-0.5">
                            <span>Prévu</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                            <span>Non coché</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Treatment Modal component for editing treatments
interface TreatmentModalProps {
  open: boolean
  treatments: Treatment[]
  onToggleCell: (treatmentId: string, hour: number) => void
  onUpdateField: (id: string, field: "name" | "posologie" | "voie", value: string) => void
  onAddTreatment: (name: string, posologie: string, voie: Treatment["voie"]) => void
  onRemoveTreatment: (id: string) => void
  onSave: () => void
  onClose: () => void
}

function TreatmentModal({
  open,
  treatments,
  onToggleCell,
  onUpdateField,
  onAddTreatment,
  onRemoveTreatment,
  onSave,
  onClose,
}: TreatmentModalProps) {
  const [newForm, setNewForm] = useState({ name: "", posologie: "", voie: "IV" as Treatment["voie"] })

  if (!open) return null

  const handleAddTreatment = () => {
    if (newForm.name.trim() && newForm.posologie.trim()) {
      onAddTreatment(newForm.name, newForm.posologie, newForm.voie)
      setNewForm({ name: "", posologie: "", voie: "IV" })
    }
  }

  const getHourChipClass = (state: boolean | null | undefined) => {
    // Modal only shows scheduled (null) vs empty - no administered state
    if (state === null) {
      return "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-400"
    }
    return "bg-slate-100 text-slate-400"
  }

  const footerContent = (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={onClose}
        type="button"
      >
        Annuler
      </Button>
      <Button
        onClick={onSave}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        type="button"
      >
        Enregistrer
      </Button>
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="Éditer Fiche Traitement" size="lg" footer={footerContent}>
      <div className="flex flex-col gap-6">
        {/* Scrollable Treatments Section */}
        <div className="overflow-y-auto max-h-[70vh] space-y-4 pr-4">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              {/* Editable Fields Row */}
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={treatment.name}
                  onChange={(e) => onUpdateField(treatment.id, "name", e.target.value)}
                  placeholder="Médicament"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <input
                  type="text"
                  value={treatment.posologie}
                  onChange={(e) => onUpdateField(treatment.id, "posologie", e.target.value)}
                  placeholder="Posologie"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <select
                  value={treatment.voie}
                  onChange={(e) => onUpdateField(treatment.id, "voie", e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="IV">IV</option>
                  <option value="IM">IM</option>
                  <option value="VO">VO</option>
                </select>
                <button
                  onClick={() => onRemoveTreatment(treatment.id)}
                  className="text-slate-500 hover:text-red-600 transition-colors p-2"
                  type="button"
                  title="Supprimer ce traitement"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Horaires Label */}
              <label className="block text-sm font-semibold text-slate-700">Horaires</label>

              {/* 4x6 Hour Chip Grid */}
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <button
                    key={`${treatment.id}-${hour}`}
                    onClick={() => onToggleCell(treatment.id, hour)}
                    className={cn(
                      "rounded text-xs py-1 font-mono font-semibold transition-colors",
                      getHourChipClass(treatment.hours[hour])
                    )}
                    type="button"
                    title={`${String(hour).padStart(2, "0")}h`}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-slate-200" />

        {/* Add New Treatment Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Ajouter un traitement</h3>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="Médicament"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <input
              type="text"
              value={newForm.posologie}
              onChange={(e) => setNewForm({ ...newForm, posologie: e.target.value })}
              placeholder="Posologie"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <select
              value={newForm.voie}
              onChange={(e) => setNewForm({ ...newForm, voie: e.target.value as Treatment["voie"] })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="IV">IV</option>
              <option value="IM">IM</option>
              <option value="VO">VO</option>
            </select>
          </div>
          <Button
            onClick={handleAddTreatment}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
    </Modal>
  )
}
