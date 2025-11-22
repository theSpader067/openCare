"use client";

import { LucideIcon, Search, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types/document";

interface ListSectionProps<T extends DocumentItem> {
  title: string;
  items: T[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeItemId: string | null;
  onSelectItem: (item: T) => void;
  renderItemContent: (item: T) => React.ReactNode;
  emptyIcon?: React.ComponentType<any>;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  hideCount?: boolean;
  isLoading?: boolean;
}

export function ListSection<T extends DocumentItem>({
  title,
  items,
  searchTerm,
  onSearchChange,
  activeItemId,
  onSelectItem,
  renderItemContent,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  searchPlaceholder = "Rechercher…",
  hideCount = false,
  isLoading = false,
}: ListSectionProps<T>) {
  return (
    <Card className="flex h-full w-full flex-col border-none bg-white/95">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {!hideCount && (
            <Badge variant="muted" className="bg-slate-100 text-slate-600">
              {items.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="p-1 hover:bg-slate-100 rounded transition"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-6 pb-6">
        {isLoading ? (
          <div className="flex max-h-150 flex-col overflow-y-auto pt-4">
            <ul className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <li key={`skeleton-${i}`}>
                  <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse mt-2"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={emptyIcon as unknown as LucideIcon}
            title={emptyTitle || "Aucun élément"}
            description={
              emptyDescription || "Créez votre premier élément pour commencer."
            }
          />
        ) : (
          <div className="flex max-h-150 flex-col overflow-y-auto pt-4">
            <ul className="flex flex-col gap-3">
              {items.map((item) => {
                const isActive = item.id === activeItemId;
                return (
                  <li key={item.id}>
                    <div
                      onClick={() => onSelectItem(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onSelectItem(item);
                        }
                      }}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition cursor-pointer",
                        "hover:-translate-y-[1px] hover:shadow-md",
                        isActive
                          ? "border-indigo-200 bg-indigo-50/80"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      {renderItemContent(item)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
