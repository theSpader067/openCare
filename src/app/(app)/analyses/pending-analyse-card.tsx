"use client";

import { Clock, Download, User, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnalysisScannerModal } from "@/components/analysis-scanner-modal";

type Analyse = {
  id: string;
  patient: string;
  type: string;
  requestedAt: string;
  requestedDate: string;
  requester: string;
  status: "En cours" | "Terminée" | "Urgent";
  bilanCategory: "bilan" | "imagerie" | "anapath" | "autres";
  pendingTests?: Array<{
    id: string;
    label: string;
    value?: string;
  }>;
};

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
  const config = statusConfig[analyse.status];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [testValues, setTestValues] = useState<Record<string, string>>(
    analyse.pendingTests?.reduce((acc, test) => {
      acc[test.id] = test.value || "";
      return acc;
    }, {} as Record<string, string>) || {}
  );
  const [textareaResults, setTextareaResults] = useState("");

  const handleTestValueChange = (testId: string, value: string) => {
    setTestValues((prev) => ({ ...prev, [testId]: value }));
  };

  const handleScanComplete = (data: {
    imageUrl: string;
    extractedText: string;
  }) => {
    console.log("Scan completed. Extracted text:", data.extractedText);

    if (analyse.bilanCategory === "bilan" && analyse.pendingTests) {
      const updatedValues = { ...testValues };
      const text = data.extractedText;

      // Split into lines and words for better parsing
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const fullText = text.toLowerCase();

      analyse.pendingTests.forEach((test) => {
        const testLabel = test.label.toLowerCase();
        const testWords = testLabel.split(/\s+/);
        const firstWord = testWords[0];

        console.log(`Looking for test: ${test.label}`);

        // Strategy 1: Look for exact label match in lines
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lowerLine = line.toLowerCase();

          // Check if line contains the test name
          if (lowerLine.includes(testLabel) ||
              lowerLine.includes(firstWord) ||
              testWords.some(word => word.length > 3 && lowerLine.includes(word))) {

            // Extract all numbers from this line and nearby lines
            const numbers = line.match(/\d+[.,]?\d*/g);

            if (numbers && numbers.length > 0) {
              // Find the most likely value (usually the first or last number in the line)
              // Prefer numbers that look like lab values (with decimals)
              const valueCandidate = numbers.find(n => n.includes('.') || n.includes(',')) || numbers[numbers.length - 1];

              if (valueCandidate) {
                // Normalize decimal separator
                const normalizedValue = valueCandidate.replace(',', '.');
                updatedValues[test.id] = normalizedValue;
                console.log(`Found value for ${test.label}: ${normalizedValue}`);
                break;
              }
            }

            // If no number on this line, check next line (value might be on next line)
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1];
              const nextNumbers = nextLine.match(/\d+[.,]?\d*/g);
              if (nextNumbers && nextNumbers.length > 0) {
                const valueCandidate = nextNumbers.find(n => n.includes('.') || n.includes(',')) || nextNumbers[0];
                const normalizedValue = valueCandidate.replace(',', '.');
                updatedValues[test.id] = normalizedValue;
                console.log(`Found value for ${test.label} on next line: ${normalizedValue}`);
                break;
              }
            }
          }
        }

        // Strategy 2: If still not found, try fuzzy matching with common abbreviations
        if (!updatedValues[test.id]) {
          // Common lab abbreviations
          const abbreviations: Record<string, string[]> = {
            'ph': ['ph', 'p.h'],
            'po2': ['po2', 'po₂', 'pao2', 'pao₂', 'p02'],
            'pco2': ['pco2', 'pco₂', 'paco2', 'paco₂', 'pc02'],
            'hco3': ['hco3', 'hco₃', 'bicarbonate'],
            'glucose': ['glucose', 'glu', 'glycémie', 'glycemie'],
            'sodium': ['sodium', 'na', 'na+'],
            'potassium': ['potassium', 'k', 'k+'],
            'chlore': ['chlore', 'cl', 'cl-'],
            'calcium': ['calcium', 'ca', 'ca++'],
            'créatinine': ['créatinine', 'creatinine', 'créat', 'creat'],
            'urée': ['urée', 'uree', 'bun'],
            'lactate': ['lactate', 'lac'],
          };

          for (const [key, aliases] of Object.entries(abbreviations)) {
            if (testLabel.includes(key)) {
              for (const alias of aliases) {
                const regex = new RegExp(`${alias}[\\s:=-]*([\\d.,]+)`, 'gi');
                const match = fullText.match(regex);
                if (match && match.length > 0) {
                  const valueMatch = match[0].match(/[\d.,]+/);
                  if (valueMatch) {
                    const normalizedValue = valueMatch[0].replace(',', '.');
                    updatedValues[test.id] = normalizedValue;
                    console.log(`Found value for ${test.label} using abbreviation: ${normalizedValue}`);
                    break;
                  }
                }
              }
              if (updatedValues[test.id]) break;
            }
          }
        }
      });

      setTestValues(updatedValues);
      console.log("Updated test values:", updatedValues);
    } else if (analyse.bilanCategory !== "bilan") {
      // For imagerie/anapath, set the textarea with extracted text
      setTextareaResults(data.extractedText);
    }

    setIsScannerOpen(false);
  };

  const categoryBadgeMap: Record<"bilan" | "imagerie" | "anapath" | "autres", { label: string; color: string }> = {
    bilan: { label: "Bilan", color: "bg-violet-500/15 text-violet-700" },
    imagerie: { label: "Imagerie", color: "bg-blue-500/15 text-blue-700" },
    anapath: { label: "Anapath", color: "bg-pink-500/15 text-pink-700" },
    autres: { label: "Autres", color: "bg-slate-500/15 text-slate-700" },
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
              Voir détails
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
                    Détails de l'analyse
                  </h2>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">

                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Fermer"
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
                        Patient
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {analyse.patient}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Titre
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {analyse.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Date de demande
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {formatAnalyseDateTime(analyse.requestedDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Numéro d'ordre
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        {analyse.id}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Type
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
                      Saisie des résultats
                    </h3>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="inline-flex align-end h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex-shrink-0"
                      title="Scanner avec caméra"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <hr className="my-2 sm:my-3" />

                  {/* Bilan: Test inputs */}
                  {analyse.bilanCategory === "bilan" ? (
                    analyse.pendingTests && analyse.pendingTests.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3 sm:space-y-4">
                        {analyse.pendingTests.map((test) => (
                          <div key={test.id} className="flex items-center gap-2 sm:gap-3">
                            <label className="flex-1 text-xs sm:text-sm font-medium text-slate-700">
                              {test.label}
                            </label>
                            <input
                              type="text"
                              value={testValues[test.id] || ""}
                              onChange={(e) =>
                                handleTestValueChange(test.id, e.target.value)
                              }
                              placeholder="–"
                              maxLength={4}
                              className="w-12 sm:w-16 border-b border-slate-300 bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:border-b-2 transition"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">Aucun test en attente</p>
                    )
                  ) : (
                    // Imagerie or Anapath: Textarea
                    <textarea
                      value={textareaResults}
                      onChange={(e) => setTextareaResults(e.target.value)}
                      placeholder="Décrivez les résultats et observations..."
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
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={
                    analyse.bilanCategory === "bilan"
                      ? !analyse.pendingTests ||
                        analyse.pendingTests.some((test) => !testValues[test.id]?.trim())
                      : !textareaResults.trim()
                  }
                  onClick={() => {
                    if (onCompleted) {
                      const resultsToPass = analyse.bilanCategory === "bilan"
                        ? testValues
                        : { results: textareaResults };
                      onCompleted(analyse, resultsToPass);
                    }
                    setIsModalOpen(false);
                  }}
                >
                  Enregistrer
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
          analyse.bilanCategory === "bilan" && analyse.pendingTests
            ? analyse.pendingTests.map((test) => test.label)
            : []
        }
      />
    </>
  );
}