"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FactureFilters = {
  query: string;
  status: string;
  from: string;
  to: string;
};

type FactureFiltersProps = {
  filters: FactureFilters;
  onFilterChange: <K extends keyof FactureFilters>(key: K, value: string) => void;
  isFilterActive: boolean;
  resetFilters: () => void;
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "Brouillon", label: "Brouillon" },
  { value: "Envoyée", label: "Envoyée" },
  { value: "Payée", label: "Payée" },
  { value: "Annulée", label: "Annulée" },
];

export function FactureFilters({
  filters,
  onFilterChange,
  isFilterActive,
  resetFilters,
}: FactureFiltersProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div
      className={cn(
        "border-b border-slate-300 bg-slate-50 transition-all duration-300",
        isSearchOpen ? "px-6 py-4" : "sm:px-6 sm:py-4",
      )}
    >
      {/* Mobile Search Toggle Button */}
      <div className="flex sm:hidden items-center justify-between mb-4 pt-2 px-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
          Filtres
        </span>
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition font-semibold"
          aria-label="Basculer les filtres"
        >
          {isSearchOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expandable Search Panel - Mobile Only */}
      <div
        className={cn(
          "sm:hidden overflow-hidden transition-all duration-300",
          isSearchOpen ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0",
        )}
      >
        <div className="space-y-4 pb-4">
          {/* Search Bar */}
          <div className="flex w-full flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Recherche
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-500" />
              <input
                type="search"
                value={filters.query}
                onChange={(event) =>
                  onFilterChange("query", event.target.value)
                }
                placeholder="Patient ou numéro..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters Grid - Mobile */}
          <div className="grid gap-3 grid-cols-1">
            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(event) =>
                  onFilterChange("status", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range - From */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                De
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(event) =>
                  onFilterChange("from", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Date Range - To */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                À
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(event) =>
                  onFilterChange("to", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={!isFilterActive}
              onClick={resetFilters}
              className="h-10 rounded-lg border-slate-300 text-slate-700 hover:bg-white font-semibold"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Search - Always Visible */}
      <div className="hidden sm:block">
        {/* Row 1: Search Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4 lg:pb-4 lg:border-b lg:border-slate-300">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Recherche
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-500" />
              <input
                type="search"
                value={filters.query}
                onChange={(event) =>
                  onFilterChange("query", event.target.value)
                }
                placeholder="Patient ou numéro..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="hidden lg:flex lg:items-end lg:gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!isFilterActive}
              onClick={resetFilters}
              className="h-10 rounded-lg border-slate-300 text-slate-700 hover:bg-white font-semibold"
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Row 2: Filter Controls */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(event) =>
                onFilterChange("status", event.target.value)
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              De
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                onFilterChange("from", event.target.value)
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              À
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                onFilterChange("to", event.target.value)
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="lg:hidden"></div>
        </div>

        {/* Reset Button for Mobile/Tablet - Below filters */}
        <div className="mt-4 flex lg:hidden">
          <Button
            variant="outline"
            size="sm"
            disabled={!isFilterActive}
            onClick={resetFilters}
            className="h-10 w-full rounded-lg border-slate-300 text-slate-700 hover:bg-white font-semibold sm:w-auto"
          >
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}
