"use client";

import { LucideIcon, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentItem } from "@/types/document";

interface DetailSectionProps<T extends DocumentItem> {
  isCreateMode: boolean;
  activeItem: T | null;
  createFormContent: React.ReactNode;
  detailViewContent: React.ReactNode;
  onOpenCreate: () => void;
  onCancelCreate: () => void;
  onSave: () => void;
  emptyIcon?: React.ComponentType<any>;
  emptyTitle?: string;
  emptyDescription?: string;
  isSubmitting?: boolean;
  createTitle?: string;
  createDescription?: string;
  saveButtonText?: string;
  isFormValid?: boolean;
  showScrollArea?: boolean;
}

export function DetailSection<T extends DocumentItem>({
  isCreateMode,
  activeItem,
  createFormContent,
  detailViewContent,
  onOpenCreate,
  onCancelCreate,
  onSave,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  isSubmitting = false,
  createTitle = "Nouveau document",
  createDescription,
  saveButtonText = "Enregistrer",
  isFormValid = true,
  showScrollArea = true,
}: DetailSectionProps<T>) {
  const content =
    isCreateMode && !activeItem ? (
      <>
        <CardHeader className="space-y-2 border-b border-slate-200/50 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl">{createTitle}</CardTitle>
              {createDescription && (
                <CardDescription className="text-sm leading-relaxed">
                  {createDescription}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {showScrollArea ? (
          <ScrollArea className="flex-1">
            <CardContent className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">{createFormContent}</div>
            </CardContent>
          </ScrollArea>
        ) : (
          <CardContent className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-5">{createFormContent}</div>
          </CardContent>
        )}
        <div className="border-t border-slate-200/50 bg-gradient-to-b from-white/50 to-white/80 px-6 py-5 space-y-3 backdrop-blur-sm">
          <Button
            variant="ghost"
            className="w-full h-10 rounded-xl"
            onClick={onCancelCreate}
          >
            Annuler
          </Button>
          <Button
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            onClick={onSave}
            disabled={!isFormValid || isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement…" : saveButtonText}
          </Button>
        </div>
      </>
    ) : !activeItem ? (
      <CardContent className="flex flex-1 items-center justify-center py-12 px-6">
        <EmptyState
          icon={emptyIcon as unknown as LucideIcon}
          title={emptyTitle || "Sélectionnez un élément"}
          description={
            emptyDescription ||
            "Choisissez un élément dans la liste pour afficher les détails."
          }
        />
      </CardContent>
    ) : (
      <div className="flex flex-col h-full overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {detailViewContent}
          </div>
        </ScrollArea>
      </div>
    );

  return (
    <Card className="flex h-full flex-col border-none bg-white/95 overflow-hidden">
      {content}
    </Card>
  );
}
