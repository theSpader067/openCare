"use client";

import { Clock, Download, User, Camera, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AnalysisScannerModal } from "@/components/analysis-scanner-modal";
import { Analyse } from "./page";
import { useTranslation } from "react-i18next";


const statusConfig: Record<
  Analyse["status"],
  { badge: string; indicator: string; bg: string }
> = {
  "En cours": {
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    indicator: "bg-sky-500",
    bg: "bg-white hover:bg-sky-50/30",
  },
  Terminée: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    indicator: "bg-emerald-500",
    bg: "bg-white hover:bg-emerald-50/30",
  },
  Urgent: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    indicator: "bg-rose-500",
    bg: "bg-white hover:bg-rose-50/30",
  },
};

function formatAnalyseDateTime(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function PendingAnalyseCard({
  analyse,
  onCompleted,
}: {
  analyse: Analyse;
  onCompleted?: (analyse: Analyse, testValues: Record<string, string>) => void;
}) {
  const { t } = useTranslation();
  const config = statusConfig[analyse.status];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testValues, setTestValues] = useState<Record<string, string>>(
    analyse.labEntries?.reduce((acc, test) => {
      acc[test.id!] = test.value || "";
      return acc;
    }, {} as Record<string, string>) || {}
  );
  const [textareaResults, setTextareaResults] = useState("");

  const handleTestValueChange = (testId: string, value: string) => {
    setTestValues((prev) => ({ ...prev, [testId]: value }));
  };

  const handleSaveResults = async () => {
    if (!analyse.apiId) {
      console.error("No API ID available for analyse");
      return;
    }

    setIsSaving(true);

    try {
      if (analyse.bilanCategory === "bilan" && analyse.labEntries) {
        // Prepare lab entries with entered values
        const labEntriesToUpdate = analyse.labEntries
          .filter((entry) => entry.id && testValues[entry.id])
          .map((entry) => ({
            id: entry.id,
            value: testValues[entry.id!].trim(),
            interpretation: entry.interpretation || undefined,
          }));

        if (labEntriesToUpdate.length === 0) {
          console.warn("No lab values to save");
          setIsSaving(false);
          return;
        }

        // Call API to update lab entries
        const response = await fetch(`/api/analyses/${analyse.apiId}/labentries`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            labEntries: labEntriesToUpdate,
            status: "Terminée",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save lab values");
        }

        const result = await response.json();
        console.log("✓ Lab values saved successfully:", result);

        // Call the parent callback if provided
        if (onCompleted) {
          onCompleted(analyse, testValues);
        }

        // Close modal
        setIsModalOpen(false);
      } else {
        // Handle imagerie/anapath/autres with textarea
        if (!textareaResults.trim()) {
          console.warn("No results to save");
          setIsSaving(false);
          return;
        }

        // For non-bilan types, just call the callback
        if (onCompleted) {
          onCompleted(analyse, { results: textareaResults });
        }

        setIsModalOpen(false);
      }

      console.log("Analysis results saved");
    } catch (error) {
      console.error("Error saving results:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanComplete = (data: {
    imageUrl: string;
    extractedText: string;
  }) => {
    console.log("Scan completed. Extracted text:", data.extractedText);

    setIsScannerOpen(false);
  };

  const categoryBadgeMap: Record<"bilan" | "imagerie" | "anapath" | "autres", { label: string; color: string }> = {
    bilan: { label: t("analyses.categories.bilan"), color: "bg-violet-500/15 text-violet-700" },
    imagerie: { label: t("analyses.categories.imagerie"), color: "bg-blue-500/15 text-blue-700" },
    anapath: { label: t("analyses.categories.anapath"), color: "bg-pink-500/15 text-pink-700" },
    autres: { label: t("analyses.categories.autres"), color: "bg-slate-500/15 text-slate-700" },
  };

  return (
    <>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md",
          config.bg,
        )}
      >
        {/* Status Indicator Bar */}
        <div className={cn("absolute left-0 top-0 h-full w-1", config.indicator)} />

        <div className="px-4 py-3">
          {/* Main Content */}
          <div className="flex items-center justify-between gap-3">
            {/* Patient and Type */}
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {analyse.patient}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {analyse.type}
              </p>
            </div>

            {/* Date and Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {formatAnalyseDateTime(analyse.requestedDate)}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold whitespace-nowrap",
                  config.badge,
                )}
              >
                {analyse.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 text-xs"
              onClick={() => setIsModalOpen(true)}
            >
              {t("analyses.buttons.viewDetails")}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal - Portal to body */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-1.5 sm:p-4 pointer-events-auto">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-80vh h-80vh">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 px-3 py-2 sm:px-6 sm:py-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    {t("analyses.modal.title")}
                  </h2>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">

                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    onClick={() => setIsModalOpen(false)}
                    aria-label={t("analyses.buttons.close")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-3 py-2 sm:px-6 sm:py-4 space-y-2 sm:space-y-4 sm:space-y-6">
                {/* Order Details */}
                <div className="space-y-2 sm:space-y-3 sm:space-y-4 pb-2 sm:pb-4 border-b border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {t("analyses.labels.patient")}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {analyse.patient}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {t("analyses.labels.title")}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {analyse.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {t("analyses.labels.requestDate")}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {formatAnalyseDateTime(analyse.requestedDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {t("analyses.labels.orderNumber")}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {analyse.id}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {t("analyses.labels.type")}
                      </p>
                      <div className="mt-1">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                          categoryBadgeMap[analyse.bilanCategory].color,
                        )}>
                          {categoryBadgeMap[analyse.bilanCategory].label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saisie des résultats - Adapted to type */}
                <div>
                  <div className="flex justify-between items-center w-full gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                      {t("analyses.results.sectionTitle")}
                    </h3>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="inline-flex align-end h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex-shrink-0"
                      title={t("analyses.results.scanCamera")}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <hr className="my-2 sm:my-3" />

                  {/* Bilan: Test inputs */}
                  {analyse.bilanCategory === "bilan" ? (
                    analyse.labEntries && analyse.labEntries.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3 sm:space-y-4 max-h-[200px] overflow-y-auto">
                        {analyse.labEntries.map((test) => (
                          <div key={test.id} className="flex items-center gap-2 sm:gap-3 ">
                            <label className="flex-1 text-xs sm:text-sm font-medium text-slate-700">
                              {test.name}
                            </label>
                            <input
                              type="text"
                              value={testValues[test.id!] || ""}
                              onChange={(e) =>
                                handleTestValueChange(String(test.id!), e.target.value)
                              }
                              placeholder="–"
                              maxLength={4}
                              className="w-12 sm:w-16 border-b border-slate-300 bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:border-b-2 transition"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">{t("analyses.results.noTestsPending")}</p>
                    )
                  ) : (
                    // Imagerie or Anapath: Textarea
                    <textarea
                      value={textareaResults}
                      onChange={(e) => setTextareaResults(e.target.value)}
                      placeholder={t("analyses.results.describeResults")}
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 px-3 py-2 sm:px-6 sm:py-4 flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  {t("analyses.buttons.cancel")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={
                    isSaving || (
                      analyse.bilanCategory === "bilan"
                        ? !analyse.labEntries ||
                          !analyse.labEntries.some((test) => testValues[test.id!]?.trim())
                        : !textareaResults.trim()
                    )
                  }
                  onClick={handleSaveResults}
                >
                  {isSaving ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {t("analyses.loading.registering")}
                    </>
                  ) : (
                    t("analyses.buttons.save")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Scanner Modal */}
      <AnalysisScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanComplete}
        testLabels={
          analyse.bilanCategory === "bilan" && analyse.labEntries
            ? analyse.labEntries.map((test) => test.name!)
            : []
        }
      />
    </>
  );
}