"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Pencil,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  Archive,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { FactureFilters } from "./facture-filters";

const PAGE_SIZE = 10;

// Mock data types
type Acte = {
  code: string;
  label: string;
  quantite: number;
  tarifUnit: number;
  total: number;
};

type Facture = {
  id: string;
  numero: string;
  date: string;
  patientId: string;
  patientName: string;
  patientAge: string;
  actes: Acte[];
  montantTotal: number;
  status: "Brouillon" | "Envoyée" | "Payée" | "Annulée";
  createdAt: string;
  createdBy: string;
};

// Professional status styling
const STATUS_CONFIG = {
  Brouillon: {
    badge: "bg-yellow-50 text-yellow-900 border border-yellow-200",
    dot: "bg-yellow-600",
    icon: Clock,
  },
  Envoyée: {
    badge: "bg-blue-50 text-blue-900 border border-blue-200",
    dot: "bg-blue-600",
    icon: FileText,
  },
  Payée: {
    badge: "bg-emerald-50 text-emerald-900 border border-emerald-200",
    dot: "bg-emerald-600",
    icon: Check,
  },
  Annulée: {
    badge: "bg-slate-50 text-cyan-600 border border-slate-200",
    dot: "bg-slate-600",
    icon: Archive,
  },
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: "cyan" | "emerald" | "orange" | "red";
  period?: "week" | "month" | "year";
  onPeriodChange?: (period: "week" | "month" | "year") => void;
  isClickable?: boolean;
  onClick?: () => void;
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
  period,
  onPeriodChange,
  isClickable,
  onClick,
}: StatCardProps) {
  const colorMap = {
    cyan: "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 text-cyan-600",
    emerald:
      "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600",
    orange:
      "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 text-orange-600",
    red: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-600",
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 ${colorMap[color]} ${
        isClickable ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          {subtext && (
            <p className="text-xs font-medium text-slate-600">{subtext}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 opacity-20">{icon}</div>
      </div>

      {/* Period Toggle Buttons */}
      {onPeriodChange && (
        <div className="flex gap-3 border-t pt-4">
          {(["week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={(e) => {
                e.stopPropagation();
                onPeriodChange(p);
              }}
              className={`px-0 py-1 text-xs font-semibold transition-colors relative ${
                period === p
                  ? "text-slate-900"
                  : "text-slate-600 hover:text-slate-700"
              }`}
            >
              {p === "week"
                ? "Semaine"
                : p === "month"
                  ? "Mois"
                  : "Année"}
              {period === p && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Mock data
const mockFactures: Facture[] = [
  {
    id: "FAC-001",
    numero: "FAC-2024-001",
    date: "2024-02-10",
    patientId: "PAT-001",
    patientName: "Fatou Diop",
    patientAge: "45 ans",
    actes: [
      {
        code: "CON-001",
        label: "Consultation générale",
        quantite: 1,
        tarifUnit: 5000,
        total: 5000,
      },
      {
        code: "ECG-001",
        label: "Électrocardiogramme",
        quantite: 1,
        tarifUnit: 8000,
        total: 8000,
      },
    ],
    montantTotal: 13000,
    status: "Payée",
    createdAt: "2024-02-10T10:30:00",
    createdBy: "Dr. Benali",
  },
  {
    id: "FAC-002",
    numero: "FAC-2024-002",
    date: "2024-02-08",
    patientId: "PAT-002",
    patientName: "Mamadou Ba",
    patientAge: "52 ans",
    actes: [
      {
        code: "CON-001",
        label: "Consultation générale",
        quantite: 1,
        tarifUnit: 5000,
        total: 5000,
      },
    ],
    montantTotal: 5000,
    status: "Envoyée",
    createdAt: "2024-02-08T14:15:00",
    createdBy: "Dr. Sall",
  },
  {
    id: "FAC-003",
    numero: "FAC-2024-003",
    date: "2024-02-05",
    patientId: "PAT-003",
    patientName: "Aïssatou Ndiaye",
    patientAge: "38 ans",
    actes: [
      {
        code: "ECH-001",
        label: "Échographie abdominale",
        quantite: 1,
        tarifUnit: 15000,
        total: 15000,
      },
      {
        code: "CON-001",
        label: "Consultation générale",
        quantite: 1,
        tarifUnit: 5000,
        total: 5000,
      },
    ],
    montantTotal: 20000,
    status: "Brouillon",
    createdAt: "2024-02-05T09:45:00",
    createdBy: "Dr. Benali",
  },
  {
    id: "FAC-004",
    numero: "FAC-2024-004",
    date: "2024-02-03",
    patientId: "PAT-004",
    patientName: "Omar Diallo",
    patientAge: "67 ans",
    actes: [
      {
        code: "CON-001",
        label: "Consultation générale",
        quantite: 1,
        tarifUnit: 5000,
        total: 5000,
      },
      {
        code: "ECG-001",
        label: "Électrocardiogramme",
        quantite: 1,
        tarifUnit: 8000,
        total: 8000,
      },
      {
        code: "BIO-001",
        label: "Bilan biologique complet",
        quantite: 1,
        tarifUnit: 12000,
        total: 12000,
      },
    ],
    montantTotal: 25000,
    status: "Payée",
    createdAt: "2024-02-03T11:20:00",
    createdBy: "Dr. Sall",
  },
  {
    id: "FAC-005",
    numero: "FAC-2024-005",
    date: "2024-02-01",
    patientId: "PAT-005",
    patientName: "Marie Sarr",
    patientAge: "41 ans",
    actes: [
      {
        code: "CON-001",
        label: "Consultation générale",
        quantite: 1,
        tarifUnit: 5000,
        total: 5000,
      },
    ],
    montantTotal: 5000,
    status: "Annulée",
    createdAt: "2024-02-01T13:30:00",
    createdBy: "Dr. Benali",
  },
];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(amount);
}

export default function FacturesPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [facturesData, setFacturesData] = useState<Facture[]>(mockFactures);
  const [selectedFactureId, setSelectedFactureId] = useState<string | null>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [facturesLoading, setFacturesLoading] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<"week" | "month" | "year">(
    "month"
  );
  const [invoicesPeriod, setInvoicesPeriod] = useState<"week" | "month" | "year">(
    "month"
  );
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    from: "",
    to: "",
  });

  useEffect(() => {
    if (
      selectedFactureId &&
      !facturesData.some((facture) => facture.id === selectedFactureId)
    ) {
      setSelectedFactureId(null);
    }
  }, [facturesData, selectedFactureId]);

  useEffect(() => {
    if (!selectedFactureId) {
      setIsMobilePreviewOpen(false);
    }
  }, [selectedFactureId]);

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      query: "",
      status: "all",
      from: "",
      to: "",
    });
    setCurrentPage(1);
  };

  const isFilterActive = useMemo(() => {
    return (
      filters.query !== "" ||
      filters.status !== "all" ||
      filters.from !== "" ||
      filters.to !== ""
    );
  }, [filters]);

  const filteredFactures = useMemo(() => {
    let result = [...facturesData];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (facture) =>
          facture.patientName.toLowerCase().includes(query) ||
          facture.numero.toLowerCase().includes(query),
      );
    }

    if (filters.status !== "all") {
      result = result.filter((facture) => facture.status === filters.status);
    }

    if (filters.from || filters.to) {
      result = result.filter((facture) => {
        const factureDate = new Date(facture.date);
        const fromDate = filters.from ? new Date(filters.from) : null;
        const toDate = filters.to ? new Date(filters.to) : null;

        if (fromDate && factureDate < fromDate) return false;
        if (toDate && factureDate > toDate) return false;

        return true;
      });
    }

    return result;
  }, [facturesData, filters]);

  const paginatedFactures = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredFactures.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredFactures]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFactures.length / PAGE_SIZE) || 1,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const selectedFacture =
    facturesData.find((facture) => facture.id === selectedFactureId) ?? null;

  const startItem =
    filteredFactures.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem =
    filteredFactures.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, filteredFactures.length);

  // Dashboard Statistics
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculate date range for revenue based on period
    let revenueDateFrom = new Date();
    if (revenuePeriod === "week") {
      revenueDateFrom.setDate(today.getDate() - 7);
    } else if (revenuePeriod === "month") {
      revenueDateFrom.setMonth(today.getMonth() - 1);
    } else {
      revenueDateFrom.setFullYear(today.getFullYear() - 1);
    }

    const totalRevenue = facturesData.reduce((sum, f) => {
      const factureDate = new Date(f.date);
      if (f.status === "Payée" && factureDate >= revenueDateFrom) {
        return sum + f.montantTotal;
      }
      return sum;
    }, 0);

    // Calculate date range for invoices based on period
    let invoicesDateFrom = new Date();
    if (invoicesPeriod === "week") {
      invoicesDateFrom.setDate(today.getDate() - 7);
    } else if (invoicesPeriod === "month") {
      invoicesDateFrom.setMonth(today.getMonth() - 1);
    } else {
      invoicesDateFrom.setFullYear(today.getFullYear() - 1);
    }

    const invoicesCount = facturesData.filter((f) => {
      const factureDate = new Date(f.date);
      return factureDate >= invoicesDateFrom;
    }).length;

    const overdueInvoices = facturesData.filter((f) => {
      const factureDate = new Date(f.date);
      const daysDiff = Math.floor(
        (today.getTime() - factureDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return f.status === "Envoyée" && daysDiff > 30;
    });

    return {
      totalRevenue,
      invoicesCount,
      overdueCount: overdueInvoices.length,
      overdueInvoices,
    };
  }, [facturesData, revenuePeriod, invoicesPeriod]);


  const renderFactureDetail = () => {
    if (!selectedFacture) {
      return (
        <EmptyState
          icon={FileText}
          title="Aucune facture sélectionnée"
          description="Sélectionnez une facture pour afficher les détails"
        />
      );
    }

    const statusConfig = STATUS_CONFIG[selectedFacture.status];

    return (
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="border-b-2 border-cyan-100 pb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
                Numéro de facture
              </p>
              <h2 className="text-3xl font-bold text-slate-900 font-mono">
                {selectedFacture.numero}
              </h2>
            </div>
            <div className="text-right">
              <Badge className={cn("px-4 py-2 font-semibold text-sm", statusConfig.badge)}>
                {selectedFacture.status}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            {formatDate(selectedFacture.date)}
          </p>
        </div>

        {/* Patient Section */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mb-4">
            Client
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">NOM</p>
              <p className="text-sm font-medium text-slate-900">
                {selectedFacture.patientName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">IDENTIFIANT</p>
              <p className="text-sm font-medium text-slate-900 font-mono">
                {selectedFacture.patientId}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">ÂGE</p>
              <p className="text-sm font-medium text-slate-900">
                {selectedFacture.patientAge}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-300">
          <table className="min-w-full">
            <thead className="bg-cyan-600 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">Code</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">Quantité</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap">Prix Unit.</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {selectedFacture.actes.map((acte, idx) => (
                <tr key={acte.code} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600 bg-slate-50 whitespace-nowrap">
                    {acte.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 min-w-[150px]">
                    {acte.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-center font-medium whitespace-nowrap">
                    {acte.quantite}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right font-medium whitespace-nowrap">
                    {formatCurrency(acte.tarifUnit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium bg-slate-50 whitespace-nowrap">
                    {formatCurrency(acte.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-2 border border-slate-300 rounded-lg p-6 bg-white">
            <div className="flex justify-between text-sm mb-3 pb-3 border-b border-slate-200">
              <span className="text-slate-600">Sous-total</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(selectedFacture.montantTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300">
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">TOTAL</span>
              <span className="text-xl font-bold text-slate-900">
                {formatCurrency(selectedFacture.montantTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1 bg-cyan-600 hover:bg-sky-800 text-white font-semibold"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Page Header */}
      <div className="border-b-2 border-cyan-100 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Factures</h1>
        <p className="text-sm text-slate-600">
          Gestion des factures et des actes médicaux
        </p>
      </div>

      {/* Stat Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<TrendingUp size={40} />}
          label="Revenu Total"
          value={formatCurrency(stats.totalRevenue)}
          subtext="Factures payées"
          color="emerald"
          period={revenuePeriod}
          onPeriodChange={setRevenuePeriod}
        />
        <StatCard
          icon={<Calendar size={40} />}
          label="Factures Créées"
          value={stats.invoicesCount.toString()}
          subtext={`${stats.invoicesCount} facture${stats.invoicesCount !== 1 ? "s" : ""} crée${stats.invoicesCount !== 1 ? "es" : ""}`}
          color="cyan"
          period={invoicesPeriod}
          onPeriodChange={setInvoicesPeriod}
        />
        <StatCard
          icon={<AlertTriangle size={40} />}
          label="Factures En Retard"
          value={stats.overdueCount.toString()}
          subtext={`Cliquez pour voir les détails`}
          color="red"
          isClickable={true}
          onClick={() => setIsOverdueModalOpen(true)}
        />
      </div>

      {/* Overdue Invoices Modal */}
      <Modal
        open={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
        title="Factures En Retard"
        size="lg"
      >
        {stats.overdueInvoices.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-emerald-50">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune facture en retard
            </h3>
            <p className="text-sm text-slate-600">
              Excellente nouvelle ! Toutes vos factures sont à jour.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-red-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Facture
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Jours
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stats.overdueInvoices.map((facture) => {
                    const daysDiff = Math.floor(
                      (new Date().getTime() - new Date(facture.date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr
                        key={facture.id}
                        className="hover:bg-red-50 transition cursor-pointer"
                        onClick={() => {
                          setSelectedFactureId(facture.id);
                          setIsOverdueModalOpen(false);
                        }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">
                            {facture.patientName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-slate-700">
                            {facture.numero}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-red-600">
                            {formatCurrency(facture.montantTotal)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-slate-600">
                          {formatDate(facture.date)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            {daysDiff} j.
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div></div>
        <Button
          className="bg-cyan-600 hover:bg-sky-800 text-white font-semibold"
          onClick={() => router.push("/factures/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 xl:hidden",
          isMobilePreviewOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMobilePreviewOpen(false)}
      />

      {/* Mobile Preview Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-md flex flex-col border-r-2 border-cyan-100 bg-white shadow-2xl transition-transform duration-300 xl:hidden",
          isMobilePreviewOpen
            ? "translate-x-0"
            : "pointer-events-none -translate-x-full",
        )}
      >
        <div className="border-b-2 border-slate-200 bg-cyan-600 text-white px-6 py-5 flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-wider">
            Détails Facture
          </p>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setIsMobilePreviewOpen(false)}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {renderFactureDetail()}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        {/* Table Section */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-300 shadow-sm bg-white">
          {facturesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner label="Chargement des factures..." />
            </div>
          ) : facturesData.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                icon={FileText}
                title="Aucune facture"
                description="Créez votre première facture pour commencer"
                action={
                  <Button
                    className="bg-cyan-600 hover:bg-sky-800 text-white font-semibold"
                    onClick={() => router.push("/factures/create")}
                  >
                    Créer une facture
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <FactureFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                isFilterActive={isFilterActive}
                resetFilters={resetFilters}
              />
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-cyan-600 bg-cyan-600 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">
                        Facture
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest">
                        Actes
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest">
                        Montant
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest">
                        —
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedFactures.map((facture) => {
                      const statusConfig = STATUS_CONFIG[facture.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr
                          key={facture.id}
                          onClick={() => {
                            setSelectedFactureId(facture.id);
                            if (typeof window !== "undefined" && window.innerWidth < 1280) {
                              setIsMobilePreviewOpen(true);
                            }
                          }}
                          className={cn(
                            "cursor-pointer transition-colors duration-200 border-l-4",
                            selectedFactureId === facture.id
                              ? "border-l-cyan-600 bg-cyan-50"
                              : "border-l-transparent hover:bg-slate-50",
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">
                                {facture.patientName}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {facture.patientAge}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono font-semibold text-slate-900">
                                {facture.numero}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {formatDate(facture.date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                              {facture.actes.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(facture.montantTotal)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                statusConfig.dot
                              )} />
                              <span className="text-xs font-semibold text-slate-700">
                                {facture.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ChevronRight className="h-5 w-5 text-slate-400 inline-block" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {startItem === 0
                    ? "Aucune facture"
                    : `${startItem}–${endItem} sur ${filteredFactures.length}`}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="font-semibold border-slate-300"
                  >
                    Précédent
                  </Button>
                  <span className="flex items-center px-3 py-1 rounded border border-slate-300 text-xs font-bold text-slate-700 bg-white">
                    {currentPage}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || endItem === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="font-semibold border-slate-300"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Panel - Desktop */}
        <div className="hidden xl:block bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
          <div className="border-b-2 border-slate-300 bg-slate-50 px-6 py-4">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Aperçu Détaillé
            </p>
          </div>
          <div className="overflow-y-auto h-full max-h-[calc(100vh-200px)] p-6">
            {renderFactureDetail()}
          </div>
        </div>
      </div>
    </div>
  );
}
