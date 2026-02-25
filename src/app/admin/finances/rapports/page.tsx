"use client";

import { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Calendar,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Facture {
  id: string;
  invoiceNumber: string;
  amount: number;
  patientRef: string;
  status: "paid" | "pending" | "overdue" | "canceled";
  createdDate: string;
  provider: string;
  description: string;
}

const SAMPLE_FACTURES: Facture[] = [
  {
    id: "1",
    invoiceNumber: "FAC-2026-001",
    amount: 25000,
    patientRef: "Patient ABC",
    status: "paid",
    createdDate: "2026-02-20",
    provider: "Dr. Martin",
    description: "Consultation générale + analyses",
  },
  {
    id: "2",
    invoiceNumber: "FAC-2026-002",
    amount: 15000,
    patientRef: "Patient XYZ",
    status: "pending",
    createdDate: "2026-02-19",
    provider: "Dr. Sarah",
    description: "Consultation spécialisée",
  },
  {
    id: "3",
    invoiceNumber: "FAC-2026-003",
    amount: 32000,
    patientRef: "Patient DEF",
    status: "paid",
    createdDate: "2026-02-18",
    provider: "Dr. Ahmed",
    description: "Acte chirurgical + hospitalisation",
  },
  {
    id: "4",
    invoiceNumber: "FAC-2026-004",
    amount: 8000,
    patientRef: "Patient GHI",
    status: "overdue",
    createdDate: "2026-02-17",
    provider: "Dr. Pierre",
    description: "Consultation suivi",
  },
  {
    id: "5",
    invoiceNumber: "FAC-2026-005",
    amount: 45000,
    patientRef: "Patient JKL",
    status: "paid",
    createdDate: "2026-02-16",
    provider: "Dr. Leila",
    description: "Acte complexe + exploration",
  },
  {
    id: "6",
    invoiceNumber: "FAC-2026-006",
    amount: 12000,
    patientRef: "Patient MNO",
    status: "canceled",
    createdDate: "2026-02-15",
    provider: "Dr. Hassan",
    description: "Consultation annulée",
  },
  {
    id: "7",
    invoiceNumber: "FAC-2026-007",
    amount: 22000,
    patientRef: "Patient PQR",
    status: "pending",
    createdDate: "2026-02-14",
    provider: "Dr. Jean",
    description: "Analyses laboratoire",
  },
  {
    id: "8",
    invoiceNumber: "FAC-2026-008",
    amount: 18000,
    patientRef: "Patient STU",
    status: "paid",
    createdDate: "2026-02-13",
    provider: "Dr. Fatima",
    description: "Radiologie et consultation",
  },
  {
    id: "9",
    invoiceNumber: "FAC-2026-009",
    amount: 9000,
    patientRef: "Patient VWX",
    status: "pending",
    createdDate: "2026-02-12",
    provider: "Dr. Mohamed",
    description: "Consultation initiale",
  },
  {
    id: "10",
    invoiceNumber: "FAC-2026-010",
    amount: 35000,
    patientRef: "Patient YZ",
    status: "paid",
    createdDate: "2026-02-11",
    provider: "Dr. Karim",
    description: "Intervention + suivi post-op",
  },
];

const STATUS_BADGES: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  paid: { label: "Payée", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  pending: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  overdue: { label: "En retard", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  canceled: { label: "Annulée", bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500" },
};

export default function RapportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFactures = useMemo(() => {
    return SAMPLE_FACTURES.filter((facture) => {
      const matchesSearch =
        facture.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facture.patientRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facture.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facture.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !selectedStatus || facture.status === selectedStatus;
      const factureDate = new Date(facture.createdDate);
      const matchesDateFrom = !dateFrom || factureDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || factureDate <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [searchQuery, selectedStatus, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginatedFactures = filteredFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const activeFiltersCount =
    (searchQuery.length > 0 ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const totalAmount = filteredFactures.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = filteredFactures
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-600" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600">
            Factures
          </h1>
        </div>
        <p className="text-lg text-slate-600 ml-8">
          Consultez et gérez toutes les factures créées par votre organisation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Total Factures
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {filteredFactures.length}
          </p>
          <p className="text-xs text-slate-600 mt-2">Nombre total</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Montant Total
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {(totalAmount / 1000).toFixed(0)}k MAD
          </p>
          <p className="text-xs text-slate-600 mt-2">Toutes les factures</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Montant Payé
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {(paidAmount / 1000).toFixed(0)}k MAD
          </p>
          <p className="text-xs text-slate-600 mt-2">
            {((paidAmount / totalAmount) * 100).toFixed(1)}% du total
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro de facture, patient, prestataire..."
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
          {filteredFactures.length > 0 ? (
            <>
              Affichage de{" "}
              <span className="text-indigo-600 font-bold">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              à{" "}
              <span className="text-indigo-600 font-bold">
                {Math.min(currentPage * itemsPerPage, filteredFactures.length)}
              </span>{" "}
              sur{" "}
              <span className="text-indigo-600 font-bold">
                {filteredFactures.length}
              </span>{" "}
              factures
            </>
          ) : (
            "Aucune facture trouvée"
          )}
        </p>
      </div>

      {/* Factures Table */}
      {filteredFactures.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
            <table className="w-full">
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient/Référence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedFactures.map((facture) => (
                  <tr
                    key={facture.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-bold text-slate-900">
                          {facture.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 text-sm">
                        {facture.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">
                        {(facture.amount / 1000).toFixed(0)}k MAD
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-medium text-sm ${
                          STATUS_BADGES[facture.status].bg
                        } ${STATUS_BADGES[facture.status].text}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            STATUS_BADGES[facture.status].dot
                          }`}
                        />
                        {STATUS_BADGES[facture.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium text-sm">
                        {facture.patientRef}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(facture.createdDate).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 group">
                          <Eye className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors duration-200 group">
                          <Download className="h-4 w-4 text-slate-600 group-hover:text-green-600" />
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
            Aucune facture trouvée
          </h3>
          <p className="text-slate-600 text-center mb-6 max-w-md">
            {searchQuery || selectedStatus || dateFrom || dateTo
              ? "Aucune facture ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              : "Aucune facture n'a été créée pour le moment."}
          </p>
          {(searchQuery || selectedStatus || dateFrom || dateTo) && (
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
