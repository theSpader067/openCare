"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, CalendarDays, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Patient } from "@/types/document"

interface PatientPreviewWithTabsProps {
  selectedPatient: Patient
  renderPatientHeader: () => React.ReactNode
  variant: "desktop" | "mobile"
  t: (key: string) => string
  renderPatientContent?: () => React.ReactNode
}

type Tab = "apercu" | "parcours"

export function PatientPreviewWithTabs({
  selectedPatient,
  renderPatientHeader,
  variant,
  t,
  renderPatientContent,
}: PatientPreviewWithTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("apercu")
  const [parcoursData, setParcoursData] = useState<any>(null)
  const [parcoursLoading, setParcoursLoading] = useState(false)
  const [parcoursError, setParcoursError] = useState<string | null>(null)

  // Fetch parcours data when tab becomes active
  useEffect(() => {
    if (activeTab === "parcours" && selectedPatient && !parcoursData) {
      fetchParcoursData()
    }
  }, [activeTab, selectedPatient])

  const fetchParcoursData = async () => {
    if (!selectedPatient) return

    setParcoursLoading(true)
    setParcoursError(null)

    try {
      const response = await fetch(
        `/api/patients/${selectedPatient.id}/timeline?type=all`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `Failed to fetch timeline data (${response.status})`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setParcoursData(data)
    } catch (error) {
      console.error("Error fetching parcours data:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to load timeline data"
      setParcoursError(errorMsg)
    } finally {
      setParcoursLoading(false)
    }
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

      {/* Tabs - Modern Segmented Design */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full">
        <button
          onClick={() => setActiveTab("apercu")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === "apercu"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>{t("patients.tabs.apercu")}</span>
        </button>
        <button
          onClick={() => setActiveTab("parcours")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === "parcours"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>{t("patients.tabs.timeline")}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "apercu" && renderPatientContent && (
          <div>{renderPatientContent()}</div>
        )}

        {activeTab === "parcours" && (
          <div className="flex flex-col gap-4">
            {parcoursLoading && (
              <div className="flex h-96 items-center justify-center">
                <Spinner
                  label={t("patients.labels.loadingTimeline")}
                />
              </div>
            )}

            {parcoursError && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800">{parcoursError}</p>
              </div>
            )}

            {!parcoursLoading && !parcoursError && parcoursData && (
              <ParcoursTimeline data={parcoursData} t={t} />
            )}

            {!parcoursLoading && !parcoursError && !parcoursData && (
              <div className="flex h-96 items-center justify-center">
                <p className="text-slate-500">
                  {t("patients.empty.noTimeline")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Timeline component for displaying parcours data
function ParcoursTimeline({
  data,
  t,
}: {
  data: any
  t: (key: string) => string
}) {
  // Parse events from API response
  let allEvents: any[] = [];

  if (data && data.events && Array.isArray(data.events)) {
    // Parse events from API endpoint
    allEvents = data.events.map((event: any) => {
      // Determine description based on event type and available data
      let description = ""
      if (typeof event.details === "string") {
        description = event.details
      } else if (typeof event.summary === "string") {
        description = event.summary
      } else if (event.details && typeof event.details === "object") {
        // For object details, try to extract a meaningful summary
        if (event.details.details) {
          description = event.details.details
        } else if (event.details.interpretation) {
          description = event.details.interpretation
        }
      }

      return {
        type: event.type,
        date: new Date(event.date || event.timestamp),
        title: event.title,
        description: description,
        data: event,
      }
    })
  }

  // Filter out invalid events and sort
  allEvents = allEvents.filter((e) => e.date instanceof Date && !isNaN(e.date.getTime()))
  allEvents.sort((a, b) => b.date.getTime() - a.date.getTime())

  if (allEvents.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">
          {t("patients.empty.noTimeline")}
        </p>
      </div>
    )
  }

  const getEventColor = (
    type: string
  ): { bg: string; border: string; icon: string } => {
    switch (type) {
      case "hospitalization":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "bg-green-100 text-green-600",
        }
      case "analyse":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "bg-blue-100 text-blue-600",
        }
      case "ordonnance":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: "bg-amber-100 text-amber-600",
        }
      case "compte-rendu":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          icon: "bg-emerald-100 text-emerald-600",
        }
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          icon: "bg-slate-100 text-slate-600",
        }
    }
  }

  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case "hospitalization":
        return t("patients.timeline.hospitalization")
      case "analyse":
        return t("patients.timeline.analysis")
      case "ordonnance":
        return t("patients.timeline.ordonnance")
      case "compte-rendu":
        return t("patients.timeline.rapport")
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      {allEvents.map((event, index) => {
        const colors = getEventColor(event.type)
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date)
        const formattedDate = eventDate.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        return (
          <div key={`${event.type}-${index}`} className="flex gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  colors.icon
                )}
              >
                <CalendarDays className="h-5 w-5" />
              </div>
              {index < allEvents.length - 1 && (
                <div className="my-2 h-12 w-px bg-gradient-to-b from-slate-300 to-slate-200" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                  {getEventTypeLabel(event.type)}
                </span>
                <span className="text-xs text-slate-500">{formattedDate}</span>
              </div>
              <div className={cn("rounded-lg border p-4", colors.bg, colors.border)}>
                <h4 className="font-medium text-slate-900 mb-1">
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-sm text-slate-700 line-clamp-3">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
