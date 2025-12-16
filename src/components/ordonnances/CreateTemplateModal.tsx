"use client";

import { useState } from "react";
import { X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

const TEMPLATE_CLASSES = [
  { id: "supplementation", name: "Supplémentation" },
  { id: "antibiotiques", name: "Antibiotiques" },
  { id: "gastro-enterologie", name: "Gastro-entérologie" },
  { id: "cardiologie", name: "Cardiologie" },
  { id: "neprologie", name: "Néphrologie" },
  { id: "endocrinologie", name: "Endocrinologie" },
  { id: "dermatologie", name: "Dermatologie" },
  { id: "pneumologie", name: "Pneumologie" },
];

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    classId: "",
    className: "",
    prescriptionDetails: "",
    remarquesConsignes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.prescriptionDetails.trim() ||
      !formData.classId.trim() ||
      (formData.classId === "autres" && !formData.className.trim())
    ) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const templateClass = formData.classId === "autres" ? formData.className : formData.classId;

      const response = await fetch("/api/ordonnance-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.name,
          class: templateClass,
          prescriptionDetails: formData.prescriptionDetails,
          prescriptionConsignes: formData.remarquesConsignes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create template");
      }

      setFormData({
        name: "",
        classId: "",
        className: "",
        prescriptionDetails: "",
        remarquesConsignes: "",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du modèle";
      setError(errorMessage);
      console.error("Template creation error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-200 p-6 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900">
              Créer un modèle personnalisé
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Error Display */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Template Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Nom du modèle
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Amoxicilline standard"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Catégorie
              </label>
              <select
                value={formData.classId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, classId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {TEMPLATE_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
                <option value="autres">Autres (créer nouvelle)</option>
              </select>
            </div>

            {/* New Class Name Input - Show only if "autres" is selected */}
            {formData.classId === "autres" && (
              <div className="space-y-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <label className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Nouveau nom de catégorie
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      className: e.target.value,
                    }))
                  }
                  placeholder="Ex: Dermatologie spécialisée"
                  className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Prescription Details */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Détails de la prescription
              </label>
              <textarea
                value={formData.prescriptionDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    prescriptionDetails: e.target.value,
                  }))
                }
                placeholder="Ex: 1. Amoxicilline 500mg - 1 cp × 3/jour pendant 10 jours..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Remarques/Consignes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Remarques & Consignes (optionnel)
              </label>
              <textarea
                value={formData.remarquesConsignes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    remarquesConsignes: e.target.value,
                  }))
                }
                placeholder="Ex: À prendre de préférence à jeun..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 flex gap-3 flex-shrink-0 bg-slate-50">
            <Button
              variant="ghost"
              className="flex-1 h-10"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={
                isLoading ||
                !formData.name.trim() ||
                !formData.prescriptionDetails.trim() ||
                !formData.classId.trim() ||
                (formData.classId === "autres" && !formData.className.trim())
              }
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin inline" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
