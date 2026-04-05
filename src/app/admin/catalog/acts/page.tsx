"use client";

import { useState, useMemo } from "react";
import { Plus, Search, CheckCircle2, Circle, X, ChevronDown, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminHeader } from "@/components/admin/admin-header";
import actesMedicalesData from "@/components/data/actes-medicales.json";

interface Act {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: string;
  specialite: string;
  prix: number;
  devise: string;
  taxRate: number;
  duree: string;
  actif: boolean;
}

interface NewActForm {
  code: string;
  customCode: string;
  nom: string;
  description: string;
  categorie: string;
  customCategorie: string;
  specialite: string;
  customSpecialite: string;
  prix: string;
}

type FilterType = "all" | "selected" | "unselected";

export default function CatalogActsPage() {
  const acts = actesMedicalesData.actes as Act[];

  // Get unique codes, categories, and specialties from existing acts
  const uniqueCodes = Array.from(new Set(acts.map((act) => act.code))).sort();
  const uniqueCategories = Array.from(new Set(acts.map((act) => act.categorie))).sort();
  const uniqueSpecialties = Array.from(new Set(acts.map((act) => act.specialite))).sort();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActIds, setSelectedActIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(new Set(uniqueSpecialties));
  const [formData, setFormData] = useState<NewActForm>({
    code: "",
    customCode: "",
    nom: "",
    description: "",
    categorie: "",
    customCategorie: "",
    specialite: "",
    customSpecialite: "",
    prix: "",
  });

  // Initialize prices
  useMemo(() => {
    const initialPrices: Record<string, number> = {};
    acts.forEach((act) => {
      if (!prices[act.id]) {
        initialPrices[act.id] = act.prix;
      }
    });
    if (Object.keys(initialPrices).length > 0) {
      setPrices((prev) => ({ ...prev, ...initialPrices }));
    }
  }, []);

  // Group acts by specialty
  const actsBySpecialty = useMemo(() => {
    const grouped: Record<string, Act[]> = {};
    acts.forEach((act) => {
      if (!grouped[act.specialite]) {
        grouped[act.specialite] = [];
      }
      grouped[act.specialite].push(act);
    });
    return grouped;
  }, [acts]);

  // Filter acts based on search term, filter type, and specialty
  const filteredActsBySpecialty = useMemo(() => {
    const filtered: Record<string, Act[]> = {};

    Object.entries(actsBySpecialty).forEach(([specialty, specialtyActs]) => {
      // Apply specialty filter
      if (filterSpecialty && specialty !== filterSpecialty) {
        return;
      }

      let result = specialtyActs;

      // Apply search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (act) =>
            act.code.toLowerCase().includes(term) ||
            act.nom.toLowerCase().includes(term) ||
            act.categorie.toLowerCase().includes(term) ||
            act.description.toLowerCase().includes(term) ||
            specialty.toLowerCase().includes(term)
        );
      }

      // Apply selection filter
      if (filterType === "selected") {
        result = result.filter((act) => selectedActIds.has(act.id));
      } else if (filterType === "unselected") {
        result = result.filter((act) => !selectedActIds.has(act.id));
      }

      if (result.length > 0) {
        filtered[specialty] = result;
      }
    });

    return filtered;
  }, [actsBySpecialty, searchTerm, filterType, filterSpecialty, selectedActIds]);

  const toggleSpecialtyExpanded = (specialty: string) => {
    const newExpanded = new Set(expandedSpecialties);
    if (newExpanded.has(specialty)) {
      newExpanded.delete(specialty);
    } else {
      newExpanded.add(specialty);
    }
    setExpandedSpecialties(newExpanded);
  };

  const toggleSpecialtySelection = (specialty: string) => {
    const specialtyActs = filteredActsBySpecialty[specialty] || [];
    const allSelected = specialtyActs.every((act) => selectedActIds.has(act.id));

    const newSelected = new Set(selectedActIds);
    specialtyActs.forEach((act) => {
      if (allSelected) {
        newSelected.delete(act.id);
      } else {
        newSelected.add(act.id);
      }
    });
    setSelectedActIds(newSelected);
  };

  const isSpecialtyFullySelected = (specialty: string) => {
    const specialtyActs = filteredActsBySpecialty[specialty] || [];
    return specialtyActs.length > 0 && specialtyActs.every((act) => selectedActIds.has(act.id));
  };

  const toggleActSelection = (actId: string) => {
    const newSelected = new Set(selectedActIds);
    if (newSelected.has(actId)) {
      newSelected.delete(actId);
    } else {
      newSelected.add(actId);
    }
    setSelectedActIds(newSelected);
  };

  const handlePriceChange = (actId: string, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setPrices((prev) => ({ ...prev, [actId]: price }));
  };

  const handleAddActs = () => {
    const selectedActs = Array.from(selectedActIds)
      .map((id) => {
        const act = acts.find((a) => a.id === id);
        if (!act) return null;
        return { ...act, prix: prices[id] || act.prix };
      })
      .filter((act): act is typeof acts[0] & { prix: number } => act !== null);
    console.log("Adding acts to organization:", selectedActs);
    // TODO: Implement API call to add acts to organization
    setSelectedActIds(new Set());
  };

  const handleOpenModal = () => {
    setFormData({
      code: "",
      customCode: "",
      nom: "",
      description: "",
      categorie: "",
      customCategorie: "",
      specialite: "",
      customSpecialite: "",
      prix: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (field: keyof NewActForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAct = () => {
    const finalCode = formData.code === "autres" ? formData.customCode : formData.code;
    const finalCategorie = formData.categorie === "autres" ? formData.customCategorie : formData.categorie;
    const finalSpecialite = formData.specialite === "autres" ? formData.customSpecialite : formData.specialite;

    if (!finalCode || !formData.nom || !finalCategorie || !finalSpecialite || !formData.prix) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const newAct = {
      id: `${finalCode}-${Date.now()}`,
      code: finalCode,
      nom: formData.nom,
      description: formData.description,
      categorie: finalCategorie,
      specialite: finalSpecialite,
      prix: Math.round(parseFloat(formData.prix) * 100),
      devise: "MAD",
      taxRate: 10,
      duree: "",
      actif: true,
    };

    console.log("Creating new act:", newAct);
    // TODO: Implement API call to create act
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeader
        title="Catalogue des Actes"
        subtitle="Sélectionnez et ajoutez des actes à votre organisation"
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par code, nom ou catégorie..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filterType === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Tous ({acts.length})
            </button>
            <button
              onClick={() => setFilterType("selected")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filterType === "selected"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Sélectionnés ({selectedActIds.size})
            </button>
            <button
              onClick={() => setFilterType("unselected")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filterType === "unselected"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Non sélectionnés ({acts.length - selectedActIds.size})
            </button>
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className={`pl-9 pr-3 py-1 rounded-full text-sm font-medium border transition appearance-none cursor-pointer ${
                filterSpecialty
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            >
              <option value="">Toutes les spécialités</option>
              {uniqueSpecialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selection Actions Bar */}
      {selectedActIds.size > 0 && (
        <div className="bg-teal-50 border-2 border-teal-300 p-4 flex items-center justify-between">
          <p className="text-slate-900 font-bold uppercase tracking-wide">
            {selectedActIds.size} acte{selectedActIds.size !== 1 ? "s" : ""} sélectionné{selectedActIds.size !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedActIds(new Set())}
            >
              Annuler
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              onClick={handleAddActs}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {Object.keys(filteredActsBySpecialty).length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun acte trouvé</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm.trim()
                  ? `Aucun acte ne correspond à votre recherche "${searchTerm}"`
                  : "Le catalogue est vide. Créez votre premier acte pour commencer."}
              </p>
              {!searchTerm.trim() && (
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un nouvel acte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acts Grouped by Specialty */}
      {Object.keys(filteredActsBySpecialty).length > 0 && (
        <Card className="border-slate-200 overflow-hidden">
          {Object.entries(filteredActsBySpecialty)
            .sort(([specA], [specB]) => {
              // Put Généraliste first
              if (specA === "Généraliste") return -1;
              if (specB === "Généraliste") return 1;
              return specA.localeCompare(specB);
            })
            .map(([specialty, specialtyActs], index, array) => (
              <div
                key={specialty}
                className={index < array.length - 1 ? "border-b border-slate-200" : ""}
              >
                {/* Specialty Header */}
                <div
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1" onClick={() => toggleSpecialtyExpanded(specialty)}>
                    {/* Specialty Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSpecialtySelection(specialty);
                      }}
                      className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                    >
                      {isSpecialtyFullySelected(specialty) ? (
                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    {/* Specialty Name and Count */}
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-900">{specialty}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {specialtyActs.length} acte{specialtyActs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div onClick={() => toggleSpecialtyExpanded(specialty)} className="cursor-pointer">
                    <ChevronDown
                      className={`h-5 w-5 text-slate-600 transition-transform ${
                        expandedSpecialties.has(specialty) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Specialty Acts */}
                {expandedSpecialties.has(specialty) && (
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-sm table-fixed">
                      <colgroup>
                        <col style={{ width: "4%" }} />
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "48%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "18%" }} />
                      </colgroup>
                      <thead>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <th className="px-3 py-3 text-left font-semibold text-slate-700"></th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Code</th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Nom</th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Catégorie</th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-700">Prix (MAD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specialtyActs.map((act, actIndex) => (
                          <tr
                            key={act.id}
                            onClick={() => toggleActSelection(act.id)}
                            className={`border-t border-slate-200 hover:bg-slate-50 transition cursor-pointer ${
                              selectedActIds.has(act.id) ? "bg-indigo-50" : ""
                            } ${actIndex === specialtyActs.length - 1 ? "" : ""}`}
                          >
                            <td className="px-3 py-3">
                              <button
                                onClick={() => toggleActSelection(act.id)}
                                className="p-1 hover:bg-slate-200 rounded transition"
                              >
                                {selectedActIds.has(act.id) ? (
                                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-400" />
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant="muted">{act.code}</Badge>
                            </td>
                            <td className="px-3 py-3">
                              <div>
                                <p className="font-medium text-slate-900">{act.nom}</p>
                                <p className="text-xs text-slate-500 mt-1">{act.description}</p>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-slate-600">{act.categorie}</td>
                            <td className="px-3 py-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={prices[act.id] ? (prices[act.id] / 100).toFixed(2) : (act.prix / 100).toFixed(2)}
                                onChange={(e) => handlePriceChange(act.id, e.target.value)}
                                className="w-20 px-2 py-1 text-right border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base">💡 Conseil</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Sélectionnez les actes que vous souhaitez ajouter à votre organisation. Vous pouvez rechercher par code,
          nom ou catégorie pour trouver rapidement les actes pertinents.
        </CardContent>
      </Card>

      {/* Create Act Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-slate-200 shadow-lg">
            <CardHeader className="flex items-center justify-between border-b border-slate-200 pb-4">
              <CardTitle>Créer un nouvel acte</CardTitle>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Code Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Code
                  </label>
                  <select
                    value={formData.code}
                    onChange={(e) => handleFormChange("code", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un code</option>
                    {uniqueCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                    <option value="autres">Autres (personnalisé)</option>
                  </select>
                  {formData.code === "autres" && (
                    <textarea
                      placeholder="Spécifier le code personnalisé..."
                      value={formData.customCode}
                      onChange={(e) => handleFormChange("customCode", e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  )}
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    placeholder="Nom de l'acte..."
                    value={formData.nom}
                    onChange={(e) => handleFormChange("nom", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Description de l'acte..."
                    value={formData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Category Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => handleFormChange("categorie", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="autres">Autres (personnalisé)</option>
                  </select>
                  {formData.categorie === "autres" && (
                    <textarea
                      placeholder="Spécifier la catégorie personnalisée..."
                      value={formData.customCategorie}
                      onChange={(e) => handleFormChange("customCategorie", e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  )}
                </div>

                {/* Specialty Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Spécialité
                  </label>
                  <select
                    value={formData.specialite}
                    onChange={(e) => handleFormChange("specialite", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une spécialité</option>
                    {uniqueSpecialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                    <option value="autres">Autres (personnalisé)</option>
                  </select>
                  {formData.specialite === "autres" && (
                    <textarea
                      placeholder="Spécifier la spécialité personnalisée..."
                      value={formData.customSpecialite}
                      onChange={(e) => handleFormChange("customSpecialite", e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  )}
                </div>

                {/* Price Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Prix (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.prix}
                    onChange={(e) => handleFormChange("prix", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateAct}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer l'acte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
