"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HistoryFilters = {
  query: string;
  type: string;
  from: string;
  to: string;
};

const bilanTypes = {
  bilan: {
    label: "Bilans",
    items: ["NFS", "CRP", "Ionogramme", "Bilan hépatique", "Bilan ionogramme", "Bilan de coagulation", "Gaz du sang artériel", "Groupage sanguin", "Lactates sanguins", "Dosage protéinurie", "Fer sérique + Ferritine", "HbA1c", "Test allergologique", "Bilan pré-chimiothérapie", "Numération plaquettaire", "Dosage INR"],
  },
  imagerie: {
    label: "Imagerie",
    items: ["TDM TAP", "TDM abdominopelvien", "Rx thorax", "Échographie abdominale", "Radiographie"],
  },
  anapath: {
    label: "Anapath",
    items: ["Biopsie", "Cytoponction", "Analyse histologique"],
  },
};

type HistoryFiltersProps = {
  filters: HistoryFilters;
  onFilterChange: <K extends keyof HistoryFilters>(key: K, value: string) => void;
  uniqueHistoryTypes: string[];
  isHistoryFilterActive: boolean;
  resetHistoryFilters: () => void;
};

export function HistoryFilters({ filters, onFilterChange, uniqueHistoryTypes, isHistoryFilterActive, resetHistoryFilters }: HistoryFiltersProps) {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className={cn(
      "border-b border-slate-200 bg-slate-50/70 transition-all duration-300",
      isSearchOpen ? "px-4 py-4" : "sm:px-4 sm:py-4"
    )}>
      {/* Mobile Search Toggle Button */}
      <div className="flex sm:hidden items-center justify-between mb-4 pt-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("analyses.filters.title")}
        </span>
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          aria-label={t("analyses.filters.toggleAria")}
        >
          {isSearchOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expandable Search Panel - Mobile Only */}
      <div className={cn(
        "sm:hidden overflow-hidden transition-all duration-300",
        isSearchOpen ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0"
      )}>
        <div className="space-y-4 pb-4">
          {/* Search Bar */}
          <div className="flex w-full flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("analyses.filters.patientOrId")}
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                type="search"
                value={filters.query}
                onChange={(event) =>
                  onFilterChange("query", event.target.value)
                }
                placeholder={t("analyses.filters.searchPlaceholder")}
                className="w-full bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters Grid - Mobile */}
          <div className="grid gap-3 grid-cols-1">
            {/* Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("analyses.filters.analysisType")}
              </label>
              <select
                value={filters.type}
                onChange={(event) =>
                  onFilterChange("type", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">{t("analyses.filters.allTypes")}</option>
                <optgroup label={t("analyses.filters.categories.bilans")}>
                  {bilanTypes.bilan.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("analyses.filters.categories.imagerie")}>
                  {bilanTypes.imagerie.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("analyses.filters.categories.anapath")}>
                  {bilanTypes.anapath.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Date Range - From */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("analyses.filters.from")}
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(event) =>
                  onFilterChange("from", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Date Range - To */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("analyses.filters.to")}
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(event) =>
                  onFilterChange("to", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="sm"
              disabled={!isHistoryFilterActive}
              onClick={resetHistoryFilters}
              className="h-11 rounded-2xl border border-transparent text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/60"
            >
              {t("analyses.buttons.reset")}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Search - Always Visible */}
      <div className="hidden sm:block">
        <div className="space-y-4">
          {/* Search Bar - Full Width */}
          <div className="flex w-full flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("analyses.filters.patientOrId")}
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                type="search"
                value={filters.query}
                onChange={(event) =>
                  onFilterChange("query", event.target.value)
                }
                placeholder={t("analyses.filters.searchPlaceholder")}
                className="w-full bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters Grid - Desktop */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("analyses.filters.analysisType")}
              </label>
              <select
                value={filters.type}
                onChange={(event) =>
                  onFilterChange("type", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">{t("analyses.filters.allTypes")}</option>
                <optgroup label={t("analyses.filters.categories.bilans")}>
                  {bilanTypes.bilan.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("analyses.filters.categories.imagerie")}>
                  {bilanTypes.imagerie.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("analyses.filters.categories.anapath")}>
                  {bilanTypes.anapath.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Date Range - From */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("analyses.filters.from")}
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(event) =>
                  onFilterChange("from", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Date Range - To */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("analyses.filters.to")}
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(event) =>
                  onFilterChange("to", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Reset Button */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 lg:text-transparent">
                Action
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isHistoryFilterActive}
                onClick={resetHistoryFilters}
                className="h-11 rounded-2xl border border-transparent text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/60"
              >
                {t("analyses.buttons.reset")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}