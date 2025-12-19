"use client";

import { useState } from "react";
import { X, Loader, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

const SPECIALTIES = [
  { id: "chirurgie", name: "Chirurgie" },
  { id: "cardiologie", name: "Cardiologie" },
  { id: "neurologie", name: "Neurologie" },
  { id: "pneumologie", name: "Pneumologie" },
  { id: "gastroenterologie", name: "Gastro-entérologie" },
  { id: "urologie", name: "Urologie" },
  { id: "orthopédie", name: "Orthopédie" },
  { id: "otorhinolaryngologie", name: "ORL" },
  { id: "ophtalmologie", name: "Ophtalmologie" },
  { id: "gynecologie", name: "Gynécologie" },
];

interface CreateCRTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCRTemplateModal({ isOpen, onClose, onSuccess }: CreateCRTemplateModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    specialite: "",
    customSpecialty: "",
    details: "",
    recommendationsPostop: "",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<"editor" | "preview">("editor");
  const [recommendationsTab, setRecommendationsTab] = useState<"editor" | "preview">("editor");

  const handleSave = async () => {
    if (
      !formData.title.trim() ||
      !formData.details.trim() ||
      !formData.specialite.trim() ||
      (formData.specialite === "autres" && !formData.customSpecialty.trim())
    ) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const specialty = formData.specialite === "autres" ? formData.customSpecialty : formData.specialite;

      const response = await fetch("/api/cr-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          specialite: specialty,
          details: formData.details,
          recommendationsPostop: formData.recommendationsPostop || null,
          isPublic: formData.isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create template");
      }

      setFormData({
        title: "",
        specialite: "",
        customSpecialty: "",
        details: "",
        recommendationsPostop: "",
        isPublic: false,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du modèle";
      setError(errorMessage);
      console.error("CR Template creation error:", errorMessage);
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
              Créer un modèle de CR
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

            {/* Template Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Titre du modèle
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Intervention cardiaque standard"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Specialty Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Spécialité
              </label>
              <select
                value={formData.specialite}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, specialite: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner une spécialité</option>
                {SPECIALTIES.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
                <option value="autres">Autres (créer nouvelle)</option>
              </select>
            </div>

            {/* Custom Specialty Name Input - Show only if "autres" is selected */}
            {formData.specialite === "autres" && (
              <div className="space-y-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <label className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Nouveau nom de spécialité
                </label>
                <input
                  type="text"
                  value={formData.customSpecialty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customSpecialty: e.target.value,
                    }))
                  }
                  placeholder="Ex: Chirurgie pédiatrique"
                  className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Details with Editor/Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Déroulement de l'intervention
                </label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setDetailsTab("editor")}
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                      detailsTab === "editor"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Code size={14} />
                    Éditeur
                  </button>
                  <button
                    onClick={() => setDetailsTab("preview")}
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                      detailsTab === "preview"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Eye size={14} />
                    Aperçu
                  </button>
                </div>
              </div>
              {detailsTab === "editor" ? (
                <textarea
                  value={formData.details}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      details: e.target.value,
                    }))
                  }
                  placeholder="Utilisez le markdown: ## Titre, **gras**, - listes"
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              ) : (
                <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm min-h-[180px] overflow-y-auto">
                  {formData.details ? (
                    <MarkdownRenderer content={formData.details} />
                  ) : (
                    <p className="text-slate-400 italic">Aperçu du contenu en markdown...</p>
                  )}
                </div>
              )}
            </div>

            {/* Post-Op Recommendations with Editor/Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Recommandations post-op (optionnel)
                </label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setRecommendationsTab("editor")}
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                      recommendationsTab === "editor"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Code size={14} />
                    Éditeur
                  </button>
                  <button
                    onClick={() => setRecommendationsTab("preview")}
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                      recommendationsTab === "preview"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Eye size={14} />
                    Aperçu
                  </button>
                </div>
              </div>
              {recommendationsTab === "editor" ? (
                <textarea
                  value={formData.recommendationsPostop}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recommendationsPostop: e.target.value,
                    }))
                  }
                  placeholder="Utilisez le markdown: - listes, **gras**, etc."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              ) : (
                <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm min-h-[120px] overflow-y-auto">
                  {formData.recommendationsPostop ? (
                    <MarkdownRenderer content={formData.recommendationsPostop} />
                  ) : (
                    <p className="text-slate-400 italic">Aperçu du contenu en markdown...</p>
                  )}
                </div>
              )}
            </div>

            {/* Public Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Rendre public
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
                  }
                  className="rounded border-slate-300"
                />
                <label htmlFor="isPublic" className="text-sm text-slate-700">
                  Ce modèle peut être utilisé par vos collègues
                </label>
              </div>
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
                !formData.title.trim() ||
                !formData.details.trim() ||
                !formData.specialite.trim() ||
                (formData.specialite === "autres" && !formData.customSpecialty.trim())
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
