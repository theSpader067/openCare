"use client";

import { ArrowLeft, FilePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListSection } from "./ListSection";
import { DetailSection } from "./DetailSection";
import type { DocumentItem } from "@/types/document";

interface DataListLayoutProps<T extends DocumentItem> {
  // Data
  items: T[];
  filteredItems: T[];
  activeItemId: string | null;
  isCreateMode: boolean;
  isMobilePanelOpen: boolean;
  mobilePanelMode: "view" | "create" | null;

  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;

  // Item Selection
  onSelectItem: (item: T) => void;
  onOpenCreate: () => void;
  onCancelCreate: () => void;

  // Mobile Panel
  onCloseMobilePanel: () => void;

  // Rendering
  title: string;
  renderListItemContent: (item: T) => React.ReactNode;
  renderDetailViewContent: (item: T) => React.ReactNode;
  createFormContent: React.ReactNode;

  // Customization
  emptyIcon?: React.ComponentType<any>;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  isSubmitting?: boolean;
  createTitle?: string;
  createDescription?: string;
  saveButtonText?: string;
  isFormValid?: boolean;
  hideListCount?: boolean;
  showDetailScrollArea?: boolean;
  onSave: () => void;
}

export function DataListLayout<T extends DocumentItem>({
  items,
  filteredItems,
  activeItemId,
  isCreateMode,
  isMobilePanelOpen,
  mobilePanelMode,
  searchTerm,
  onSearchChange,
  onSelectItem,
  onOpenCreate,
  onCancelCreate,
  onCloseMobilePanel,
  title,
  renderListItemContent,
  renderDetailViewContent,
  createFormContent,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  searchPlaceholder,
  isSubmitting = false,
  createTitle,
  createDescription,
  saveButtonText,
  isFormValid = true,
  hideListCount = false,
  showDetailScrollArea = true,
  onSave,
}: DataListLayoutProps<T>) {
  const activeItem = items.find((item) => item.id === activeItemId) ?? null;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Desktop View */}
      <section className="hidden xl:grid xl:flex-1 xl:gap-6 xl:grid-cols-[1.3fr_2fr]">
        <ListSection
          title={title}
          items={filteredItems}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          activeItemId={activeItemId}
          onSelectItem={onSelectItem}
          renderItemContent={renderListItemContent}
          emptyIcon={emptyIcon}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          searchPlaceholder={searchPlaceholder}
          hideCount={hideListCount}
        />

        <DetailSection
          isCreateMode={isCreateMode}
          activeItem={activeItem}
          createFormContent={createFormContent}
          detailViewContent={
            activeItem ? renderDetailViewContent(activeItem) : null
          }
          onOpenCreate={onOpenCreate}
          onCancelCreate={onCancelCreate}
          onSave={onSave}
          emptyIcon={emptyIcon}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          isSubmitting={isSubmitting}
          createTitle={createTitle}
          createDescription={createDescription}
          saveButtonText={saveButtonText}
          isFormValid={isFormValid}
          showScrollArea={showDetailScrollArea}
        />
      </section>

      {/* Mobile & Tablet List View */}
      <section className="flex flex-1 xl:hidden">
        <ListSection
          title={title}
          items={filteredItems}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          activeItemId={activeItemId}
          onSelectItem={onSelectItem}
          renderItemContent={renderListItemContent}
          emptyIcon={emptyIcon}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          searchPlaceholder={searchPlaceholder}
          hideCount={hideListCount}
        />
      </section>

      {/* Mobile Floating Button */}
      {!isMobilePanelOpen && (
        <div className="fixed bottom-24 right-4 xl:hidden z-40">
          <Button
            onClick={onOpenCreate}
            size="lg"
            className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <FilePlus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Sliding Panel */}
      {isMobilePanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 xl:hidden flex items-end">
          <div className="w-full rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col h-[95vh]">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <button
                onClick={onCloseMobilePanel}
                className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              {mobilePanelMode === "view" && activeItem && (
                <h3 className="font-semibold text-slate-900 truncate flex-1 mx-4">
                  {activeItem.title}
                </h3>
              )}
              {mobilePanelMode === "create" && (
                <h3 className="font-semibold text-slate-900">
                  {createTitle || "Nouveau document"}
                </h3>
              )}
            </div>

            {/* Panel Content */}
            {mobilePanelMode === "view" && activeItem ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 pb-24">
                    <div className="space-y-4">
                      {renderDetailViewContent(activeItem)}
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : mobilePanelMode === "create" ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 pb-24">
                    <div className="space-y-4">{createFormContent}</div>
                  </div>
                </ScrollArea>
                <div className="border-t border-slate-200/70 bg-white/90 p-4 space-y-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onCancelCreate}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="w-full"
                    onClick={onSave}
                    disabled={!isFormValid || isSubmitting}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Enregistrement…" : saveButtonText}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
