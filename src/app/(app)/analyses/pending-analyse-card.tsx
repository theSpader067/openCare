"use client";

import { Clock, Download, User, X, Loader, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { Analyse } from "./page";
import { useTranslation } from "react-i18next";


const statusConfig: Record<
  Analyse["status"],
  { badge: string; indicator: string; bg: string }
> = {
  "En cours": {
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    indicator: "bg-cyan-500",
    bg: "bg-white hover:bg-cyan-50",
  },
  Terminée: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indicator: "bg-emerald-500",
    bg: "bg-white hover:bg-emerald-50",
  },
  Urgent: {
    badge: "bg-red-50 text-red-700 border-red-200",
    indicator: "bg-red-500",
    bg: "bg-white hover:bg-red-50",
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [testValues, setTestValues] = useState<Record<string, string>>(
    analyse.labEntries?.reduce((acc, test) => {
      acc[test.id!] = test.value || "";
      return acc;
    }, {} as Record<string, string>) || {}
  );
  const [testInterpretations, setTestInterpretations] = useState<Record<string, { text: string; isNormal: boolean }>>(
    {}
  );
  const [textareaResults, setTextareaResults] = useState("");

  const handleTestValueChange = (testId: string, value: string) => {
    setTestValues((prev) => ({ ...prev, [testId]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only images allowed
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(t("analyses.errors.invalidFileType") || "Only image files are allowed (JPEG, PNG, GIF, WebP)");
      return;
    }

    setIsOcrProcessing(true);

    try {
      // Read image file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = (e.target?.result as string).split(',')[1]; // Remove data:image/... prefix

          console.log("=== GPT-4o VISION PROCESSING ===");
          console.log("File name:", file.name);
          console.log("File type:", file.type);

          const testLabels = analyse.bilanCategory === "bilan" && analyse.labEntries
            ? analyse.labEntries.map((entry) => entry.name).filter(Boolean) as string[]
            : undefined;

          // Call GPT-4o Vision API to process image
          const response = await fetch("/api/analyses/process-file", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData: base64Data,
              fileName: file.name,
              testLabels,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to process image");
          }

          const result = await response.json();
          const labData = result.data;

          console.log("GPT-4o Vision processing result:", labData);
          console.log("=== END GPT-4o VISION ===\n");

          // Handle bilan (lab work) analysis
          if (analyse.bilanCategory === "bilan" && analyse.labEntries && analyse.labEntries.length > 0) {
            console.log("Processing lab entries for bilan analysis...");

            const updatedValues = { ...testValues };
            const updatedInterpretations = { ...testInterpretations };

            if (labData.labEntries && Array.isArray(labData.labEntries)) {
              for (const extracted of labData.labEntries) {
                // Find the matching lab entry
                const labEntry = analyse.labEntries.find(
                  (entry) => entry.name?.toLowerCase() === extracted.name.toLowerCase()
                );

                if (labEntry && labEntry.id) {
                  console.log(`✓ Setting ${labEntry.name} (${labEntry.id}) = ${extracted.value}`);
                  updatedValues[labEntry.id] = extracted.value;

                  // Store interpretation with normal/abnormal status
                  if (extracted.interpretation) {
                    updatedInterpretations[labEntry.id] = {
                      text: extracted.interpretation,
                      isNormal: extracted.isNormal !== false, // Default to true if not specified
                    };
                    console.log(`  Interpretation: ${extracted.interpretation} (${extracted.isNormal ? 'normal' : 'abnormal'})`);
                  }
                } else {
                  console.log(`✗ No matching lab entry for "${extracted.name}"`);
                }
              }
            }

            setTestValues(updatedValues);
            setTestInterpretations(updatedInterpretations);
            console.log(`✓ Successfully extracted lab data from image`);
          } else if (analyse.bilanCategory !== "bilan") {
            // For non-bilan analyses, store primary interpretation as results
            if (labData.primaryInterpretation) {
              setTextareaResults(labData.primaryInterpretation);
              console.log(`✓ Stored primary interpretation: ${labData.primaryInterpretation}`);
            }
          }
        } catch (error) {
          console.error("Image processing error:", error);
          alert(t("analyses.errors.ocrFailed") || "Failed to process image. Please try again.");
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload error:", error);
      setIsOcrProcessing(false);
      alert(t("analyses.errors.fileUploadFailed") || "Failed to upload file. Please try again.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          let errorMessage = "Failed to save lab values";
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status}`;
          }
          throw new Error(errorMessage);
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

        // Call API to save non-bilan results
        const response = await fetch(`/api/analyses/${analyse.apiId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interpretation: textareaResults,
            status: "Terminée",
          }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to save analysis results";
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("✓ Analysis results saved successfully:", result);

        // Call the parent callback if provided
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



  const statusKeyMap: Record<string, string> = {
    "En cours": "analyses.statuses.enCours",
    "Terminée": "analyses.statuses.terminee",
    "Urgent": "analyses.statuses.urgent",
  };

  const categoryBadgeMap: Record<"bilan" | "imagerie" | "anapath" | "autres", { label: string; color: string }> = {
    bilan: { label: t("analyses.categories.bilan"), color: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
    imagerie: { label: t("analyses.categories.imagerie"), color: "bg-blue-50 text-blue-700 border border-blue-200" },
    anapath: { label: t("analyses.categories.anapath"), color: "bg-purple-50 text-purple-700 border border-purple-200" },
    autres: { label: t("analyses.categories.autres"), color: "bg-slate-100 text-slate-700 border border-slate-200" },
  };

  return (
    <>
      <div
        className={cn(
          "group relative overflow-hidden rounded border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md",
          config.bg,
        )}
      >
        {/* Status Indicator Bar */}
        <div className={cn("absolute left-0 top-0 h-full w-1", config.indicator)} />

        <div className="px-5 py-4">
          {/* Main Content */}
          <div className="flex items-start justify-between gap-4">
            {/* Patient and Type Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {analyse.patient}
              </h3>
              <p className="text-xs text-slate-600 truncate">
                {analyse.type}
              </p>
            </div>

            {/* Status Section */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span
                className={cn(
                  "inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                  config.badge,
                )}
              >
                {t(statusKeyMap[analyse.status] || "analyses.statuses.enCours")}
              </span>
              <p className="text-xs text-slate-500">
                {formatAnalyseDateTime(analyse.requestedDate)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 text-xs font-medium"
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
            <div className="w-full max-w-2xl rounded border border-slate-200 bg-white shadow-xl flex flex-col max-h-80vh h-80vh">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
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
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 space-y-6">
                {/* Order Details */}
                <div className="space-y-4 pb-4 border-b border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
                        {t("analyses.labels.patient")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {analyse.patient}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
                        {t("analyses.labels.title")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {analyse.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
                        {t("analyses.labels.requestDate")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatAnalyseDateTime(analyse.requestedDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
                        {t("analyses.labels.orderNumber")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {analyse.id}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
                        {t("analyses.labels.type")}
                      </p>
                      <div>
                        <span className={cn(
                          "inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold",
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
                  <div className="flex justify-between items-center w-full gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                      {t("analyses.results.sectionTitle")}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isOcrProcessing}
                        className="inline-flex align-end h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t("analyses.results.uploadFile") || "Upload file"}
                      >
                        {isOcrProcessing ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload image"
                  />

                  {/* Bilan: Test inputs */}
                  {analyse.bilanCategory === "bilan" ? (
                    analyse.labEntries && analyse.labEntries.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {analyse.labEntries.map((test) => {
                          const interpretation = testInterpretations[test.id!];
                          const borderColor = interpretation
                            ? interpretation.isNormal
                              ? "border-emerald-400"
                              : "border-red-400"
                            : "border-slate-300";
                          const textColor = interpretation
                            ? interpretation.isNormal
                              ? "text-emerald-600"
                              : "text-red-600"
                            : "";

                          return (
                            <div key={test.id} className="space-y-1">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <label className="flex-1 text-xs sm:text-sm font-medium text-slate-700 pt-1">
                                  {test.name}
                                </label>
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    type="text"
                                    value={testValues[test.id!] || ""}
                                    onChange={(e) =>
                                      handleTestValueChange(String(test.id!), e.target.value)
                                    }
                                    placeholder="–"
                                    maxLength={8}
                                    className={cn(
                                      "w-16 sm:w-20 border-b-2 bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-b-2 transition",
                                      borderColor
                                    )}
                                  />
                                  {interpretation && (
                                    <div className={cn("text-xs opacity-60 font-normal", textColor)}>
                                      {interpretation.text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5 flex gap-2 justify-end rounded-b">
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

    </>
  );
}