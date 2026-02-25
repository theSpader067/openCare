"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Clock, Edit2, Check, Minus, X } from "lucide-react"
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
          return {
            ...t,
            hours: {
              ...t.hours,
              [hour]: current === true ? null : current === null ? false : true,
            },
          }
        }
        return t
      })
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
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

      {/* Tabs - Clean Pill Shape Style */}
      <div className="flex gap-4 bg-white p-1 border border-slate-200 rounded-full w-full inline-flex">
        <button
          onClick={() => setActiveTab("apercu")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2",
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
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2",
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
      <div className="min-h-96">
        {activeTab === "apercu" && renderPatientContent && (
          <div>{renderPatientContent()}</div>
        )}

        {activeTab === "traitement" && (
          <div className="flex flex-col gap-4">
            <TreatmentSheet
              treatments={treatments}
              isLoading={isLoadingTreatments}
              onEdit={handleEditClick}
            />
            <TreatmentModal
              open={isEditModalOpen}
              treatments={editingTreatments}
              onToggleCell={toggleCellState}
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
}

function TreatmentSheet({ treatments, isLoading = false, onEdit }: TreatmentSheetProps) {
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fiche Traitement</h3>
            <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
          </div>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled
          >
            <Edit2 className="h-4 w-4" />
            Éditer
          </Button>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white p-8 flex items-center justify-center">
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fiche Traitement</h3>
            <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
          </div>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Éditer
          </Button>
        </div>
        <div className="border border-slate-200 rounded-lg bg-white p-12 text-center">
          <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucun traitement prévu</p>
          <p className="text-sm text-slate-400 mt-1">Les traitements s'afficheront ici une fois ajoutés</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Éditer
        </Button>
      </div>

      {/* Treatment Table with horizontal scrollbar */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                Traitement
              </th>
              {hours.map((hour) => (
                <th
                  key={hour}
                  className="px-2 py-3 text-center font-semibold text-slate-600 text-xs w-10 min-w-[40px]"
                >
                  {hour}h
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment, idx) => (
              <tr key={treatment.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-4 py-3 text-slate-900 sticky left-0 z-10 bg-inherit">
                  <div className="font-semibold">{treatment.name}</div>
                  <div className="text-xs text-slate-500">{treatment.posologie}</div>
                  <div className="text-xs font-medium text-indigo-600 mt-1">{treatment.voie}</div>
                </td>
                {hours.map((hour) => (
                  <td
                    key={`${treatment.id}-${hour}`}
                    className="px-2 py-3 text-center border-l border-slate-100"
                  >
                    <div className="flex items-center justify-center h-8">
                      {getCellIcon(treatment.hours[hour])}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>Administré</span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4 text-slate-400" />
          <span>Prévu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4" />
          <span>Non prévu</span>
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
  onSave: () => void
  onClose: () => void
}

function TreatmentModal({
  open,
  treatments,
  onToggleCell,
  onSave,
  onClose,
}: TreatmentModalProps) {
  if (!open) return null

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getCellIcon = (state: boolean | null | undefined) => {
    if (state === true) {
      return <Check className="h-4 w-4 text-green-600" />
    } else if (state === null) {
      return <Minus className="h-4 w-4 text-slate-400" />
    }
    return null
  }

  const getCellBgColor = (state: boolean | null | undefined) => {
    if (state === true) {
      return "bg-green-50 hover:bg-green-100"
    } else if (state === null) {
      return "bg-slate-100 hover:bg-slate-200"
    }
    return "bg-white hover:bg-slate-50"
  }

  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="flex flex-col gap-4 w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Éditer Fiche Traitement</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 flex-shrink-0"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Editable Treatment Table with horizontal scrollbar */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                  Traitement
                </th>
                {hours.map((hour) => (
                  <th
                    key={hour}
                    className="px-2 py-3 text-center font-semibold text-slate-600 text-xs w-10 min-w-[40px]"
                  >
                    {hour}h
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {treatments.map((treatment, idx) => (
                <tr key={treatment.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-3 text-slate-900 sticky left-0 z-10 bg-inherit">
                    <div className="font-semibold">{treatment.name}</div>
                    <div className="text-xs text-slate-500">{treatment.posologie}</div>
                    <div className="text-xs font-medium text-indigo-600 mt-1">{treatment.voie}</div>
                  </td>
                  {hours.map((hour) => (
                    <td
                      key={`${treatment.id}-${hour}`}
                      className="px-2 py-3 text-center border-l border-slate-100"
                    >
                      <button
                        onClick={() => onToggleCell(treatment.id, hour)}
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded cursor-pointer transition-colors mx-auto",
                          getCellBgColor(treatment.hours[hour])
                        )}
                        type="button"
                        title="Click to cycle through states"
                      >
                        {getCellIcon(treatment.hours[hour])}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-xs text-slate-600 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Administré</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-slate-400" />
            <span>Prévu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-white border border-slate-300 rounded" />
            <span>Non prévu</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
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
      </div>
    </Modal>
  )
}
