"use client";

import { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Document {
  id: string;
  name: string;
  type: "ordonnance" | "rapport" | "bilan" | "facture";
  status: "draft" | "published" | "archived";
  createdDate: string;
  organization: string;
  createdBy: string;
}

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: "1",
    name: "Ordonnance - Patient ABC",
    type: "ordonnance",
    status: "published",
    createdDate: "2026-02-20",
    organization: "Hôpital Central",
    createdBy: "Dr. Martin",
  },
  {
    id: "2",
    name: "Bilan de Santé - Février 2026",
    type: "bilan",
    status: "published",
    createdDate: "2026-02-19",
    organization: "Hôpital Central",
    createdBy: "Dr. Sarah",
  },
  {
    id: "3",
    name: "Rapport Consultation - Patient XYZ",
    type: "rapport",
    status: "draft",
    createdDate: "2026-02-18",
    organization: "Hôpital Central",
    createdBy: "Dr. Ahmed",
  },
  {
    id: "4",
    name: "Facture - Consultation Générale",
    type: "facture",
    status: "published",
    createdDate: "2026-02-17",
    organization: "Hôpital Central",
    createdBy: "Admin",
  },
  {
    id: "5",
    name: "Ordonnance - Patient DEF",
    type: "ordonnance",
    status: "archived",
    createdDate: "2026-02-15",
    organization: "Hôpital Central",
    createdBy: "Dr. Martin",
  },
  {
    id: "6",
    name: "Rapport Spécialisé - Cardiologie",
    type: "rapport",
    status: "published",
    createdDate: "2026-02-14",
    organization: "Hôpital Central",
    createdBy: "Dr. Pierre",
  },
  {
    id: "7",
    name: "Bilan Annuel - Prévention",
    type: "bilan",
    status: "published",
    createdDate: "2026-02-13",
    organization: "Hôpital Central",
    createdBy: "Dr. Sarah",
  },
  {
    id: "8",
    name: "Facture - Acte Chirurgical",
    type: "facture",
    status: "published",
    createdDate: "2026-02-12",
    organization: "Hôpital Central",
    createdBy: "Admin",
  },
  {
    id: "9",
    name: "Ordonnance - Patient GHI",
    type: "ordonnance",
    status: "draft",
    createdDate: "2026-02-11",
    organization: "Hôpital Central",
    createdBy: "Dr. Martin",
  },
  {
    id: "10",
    name: "Rapport - Suivi Post-Opératoire",
    type: "rapport",
    status: "published",
    createdDate: "2026-02-10",
    organization: "Hôpital Central",
    createdBy: "Dr. Jean",
  },
];

const TYPE_BADGES: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  ordonnance: {
    label: "Ordonnance",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "📋",
  },
  rapport: {
    label: "Rapport",
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "📄",
  },
  bilan: { label: "Bilan", bg: "bg-cyan-50", text: "text-cyan-700", icon: "📊" },
  facture: {
    label: "Facture",
    bg: "bg-green-50",
    text: "text-green-700",
    icon: "💳",
  },
};

const STATUS_BADGES: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: { label: "Brouillon", bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500" },
  published: {
    label: "Publié",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  archived: {
    label: "Archivé",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
};

export default function DocumentsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDocuments = useMemo(() => {
    return SAMPLE_DOCUMENTS.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || doc.type === selectedType;
      const matchesStatus = !selectedStatus || doc.status === selectedStatus;
      const docDate = new Date(doc.createdDate);
      const matchesDateFrom =
        !dateFrom || docDate >= new Date(dateFrom);
      const matchesDateTo =
        !dateTo || docDate <= new Date(dateTo);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [searchQuery, selectedType, selectedStatus, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const activeFiltersCount =
    (searchQuery.length > 0 ? 1 : 0) +
    (selectedType ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-600" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600">
            Documents de l'Établissement
          </h1>
        </div>
        <p className="text-lg text-slate-600 ml-8">
          Consultez et gérez tous les documents créés par votre organisation
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de document ou créateur..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-end gap-4 flex-wrap">
          {/* Type Filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
            >
              <option value="">Tous</option>
              {Object.entries(TYPE_BADGES).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
            >
              <option value="">Tous</option>
              {Object.entries(STATUS_BADGES).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Du
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Date To Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Au
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors duration-200 text-sm"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-medium">
          {filteredDocuments.length > 0 ? (
            <>
              Affichage de{" "}
              <span className="text-indigo-600 font-bold">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              à{" "}
              <span className="text-indigo-600 font-bold">
                {Math.min(currentPage * itemsPerPage, filteredDocuments.length)}
              </span>{" "}
              sur{" "}
              <span className="text-indigo-600 font-bold">
                {filteredDocuments.length}
              </span>{" "}
              documents
            </>
          ) : (
            "Aucun document trouvé"
          )}
        </p>
      </div>

      {/* Documents Table */}
      {filteredDocuments.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
            <table className="w-full">
              <colgroup>
                <col style={{ width: "35%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nom du Document
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date Création
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Créé par
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-900">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-medium text-sm ${
                          TYPE_BADGES[doc.type].bg
                        } ${TYPE_BADGES[doc.type].text}`}
                      >
                        <span>{TYPE_BADGES[doc.type].icon}</span>
                        {TYPE_BADGES[doc.type].label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-medium text-sm ${
                          STATUS_BADGES[doc.status].bg
                        } ${STATUS_BADGES[doc.status].text}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            STATUS_BADGES[doc.status].dot
                          }`}
                        />
                        {STATUS_BADGES[doc.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(doc.createdDate).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium text-sm">
                        {doc.createdBy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 group">
                          <Eye className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200 group">
                          <Edit2 className="h-4 w-4 text-slate-600 group-hover:text-indigo-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 group">
                          <Trash2 className="h-4 w-4 text-slate-600 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300">
          <FileText className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-slate-600 text-center mb-6 max-w-md">
            {searchQuery || selectedType || selectedStatus || dateFrom || dateTo
              ? "Aucun document ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              : "Aucun document n'a été créé pour le moment. Commencez par créer un nouveau template de document."}
          </p>
          {(searchQuery || selectedType || selectedStatus || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
