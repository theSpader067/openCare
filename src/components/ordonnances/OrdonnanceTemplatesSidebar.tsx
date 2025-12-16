"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { OrdonnanceTemplate } from "@/data/ordonnances/ordonnance-templates";

interface OrdonnanceTemplatesSidebarProps {
  onSelectTemplate: (template: OrdonnanceTemplate) => void;
  onOpenCreateTemplate?: () => void;
  refreshTrigger?: number;
}

interface BackendTemplate {
  id: number;
  title: string;
  class: string;
  prescriptionDetails: string;
  prescriptionConsignes: string | null;
  creatorId: number;
}

interface TemplateCategory {
  id: string;
  name: string;
  templates: OrdonnanceTemplate[];
}

const CATEGORY_NAMES: Record<string, string> = {
  supplementation: "Supplémentation",
  antibiotiques: "Antibiotiques",
  "gastro-enterologie": "Gastro-entérologie",
  cardiologie: "Cardiologie",
  neprologie: "Néphrologie",
  endocrinologie: "Endocrinologie",
  dermatologie: "Dermatologie",
  pneumologie: "Pneumologie",
};

export function OrdonnanceTemplatesSidebar({
  onSelectTemplate,
  onOpenCreateTemplate,
  refreshTrigger,
}: OrdonnanceTemplatesSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<BackendTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const response = await fetch("/api/ordonnance-templates");
        if (response.ok) {
          const templates = await response.json();
          setAllTemplates(templates);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchAllTemplates();
  }, [refreshTrigger]);

  // Organize templates by class
  const categorizedTemplates = useMemo(() => {
    const categories: TemplateCategory[] = [];
    const categoryMap = new Map<string, OrdonnanceTemplate[]>();

    // Group templates by class
    allTemplates.forEach((template) => {
      if (!categoryMap.has(template.class)) {
        categoryMap.set(template.class, []);
      }
      categoryMap.get(template.class)!.push({
        id: `backend-${template.id}`,
        name: template.title,
        prescriptionDetails: template.prescriptionDetails,
        remarquesConsignes: template.prescriptionConsignes || "",
      });
    });

    // Convert map to array of categories, ordered by known categories
    Object.entries(CATEGORY_NAMES).forEach(([classId, name]) => {
      if (categoryMap.has(classId)) {
        categories.push({
          id: classId,
          name,
          templates: categoryMap.get(classId) || [],
        });
      }
    });

    // Add any custom categories not in the predefined list
    categoryMap.forEach((templates, classId) => {
      if (!CATEGORY_NAMES[classId]) {
        categories.push({
          id: classId,
          name: classId.charAt(0).toUpperCase() + classId.slice(1),
          templates,
        });
      }
    });

    return categories;
  }, [allTemplates]);

  const handleSelectTemplate = (template: OrdonnanceTemplate) => {
    setSelectedTemplateId(template.id);
    onSelectTemplate(template);
    // Auto-close on mobile when template is selected
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Flex, Mobile Fixed Overlay */}
      <div
        className={`
          border-r border-slate-200 bg-white overflow-hidden
          transition-all duration-300 ease-in-out
          flex flex-col shadow-sm

          /* Desktop: flex layout */
          lg:static lg:border-r lg:w-64 lg:shadow-sm

          /* Mobile: fixed overlay */
          fixed left-0 top-0 h-screen z-40 w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3 flex-shrink-0 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 whitespace-nowrap">
              Modèles de prescription
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={18} className="text-slate-600" />
            </button>
          </div>
          <button
            onClick={onOpenCreateTemplate}
            className="
              w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              bg-indigo-50 border border-indigo-200 hover:bg-indigo-100
              transition-colors duration-200 text-indigo-700 text-xs font-semibold
            "
            title="Ajouter votre propre modèle"
          >
            <Plus size={14} />
            Créer modèle
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-scroll">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-slate-500">Chargement des modèles...</p>
            </div>
          ) : categorizedTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-slate-500">Aucun modèle disponible</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full px-1 py-2">
              {categorizedTemplates.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border-b border-slate-100 last:border-b-0 mb-1"
                >
                  <AccordionTrigger className="
                    text-xs font-bold text-slate-800
                    hover:text-indigo-700 hover:bg-indigo-50
                    px-3 py-2.5 transition-all duration-200
                    rounded-md mx-1 hover:no-underline
                    data-[state=open]:bg-indigo-50 data-[state=open]:text-indigo-700
                  ">
                    <span className="text-left">{category.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-2 px-2">
                    <div className="space-y-1 max-h-[180px] overflow-y-scroll">
                      {category.templates.map((template) => {
                        const isActive = selectedTemplateId === template.id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => handleSelectTemplate(template)}
                            className={`
                              w-full text-left px-3 py-2 rounded-md text-xs
                              transition-all duration-200 truncate font-medium
                              ${isActive
                                ? "bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-sm"
                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                              }
                            `}
                            title={template.name}
                          >
                            <div className="flex items-center gap-2">
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                              )}
                              <span className="truncate">{template.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2.5 text-xs text-slate-500 border-t border-slate-200 bg-gradient-to-t from-slate-50 to-white flex-shrink-0 text-center">
          Cliquez pour remplir
        </div>
      </div>

      {/* Toggle Button - Desktop Only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          hidden lg:flex px-2 py-3 hover:bg-slate-100 transition-colors items-center justify-center
          flex-shrink-0 border-r border-slate-200 bg-white hover:bg-slate-50
        "
        title={isOpen ? "Masquer modèles" : "Afficher modèles"}
      >
        {isOpen ? (
          <ChevronLeft size={18} className="text-slate-600" />
        ) : (
          <ChevronRight size={18} className="text-slate-600" />
        )}
      </button>

      {/* Mobile Toggle Button - Hidden on Desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          lg:hidden fixed bottom-6 left-6 z-50 p-3 rounded-full
          bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg
          transition-all duration-200
        "
        title="Modèles"
      >
        <Plus size={20} />
      </button>
    </>
  );
}
