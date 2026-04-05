"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  Users,
  Stethoscope,
  Microscope,
  Heart,
  Eye,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Printer,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/admin-header";

type TimePeriod = "week" | "month" | "year";
type ActStatus = "paid" | "pending" | "planned" | "canceled";
type ActType = "geste" | "exploration" | "consultation" | "suivi";

interface ActLog {
  id: string;
  type: ActType;
  name: string;
  prix: number;
  datetime: string;
  status: ActStatus;
  realisateur: {
    name: string;
    specialty: string;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  gradient: string;
  accentColor: string;
  accentGradient: string;
}

function StatCard({
  title,
  value,
  subtext,
  icon,
  period,
  onPeriodChange,
  gradient,
  accentColor,
  accentGradient,
}: StatCardProps) {
  const periodLabels = {
    week: "Cette semaine",
    month: "Ce mois",
    year: "Cette année",
  };

  // Extract primary color from gradient for hue background
  const getHueGradient = (grad: string) => {
    if (grad.includes("blue")) return "from-blue-50 to-cyan-50";
    if (grad.includes("purple")) return "from-purple-50 to-pink-50";
    if (grad.includes("green")) return "from-green-50 to-emerald-50";
    return "from-slate-50 to-slate-100";
  };

  return (
    <div className="group relative">
      {/* Card with Hue Gradient Background */}
      <div
        className={`relative bg-gradient-to-br ${getHueGradient(
          gradient
        )} rounded-lg p-5 backdrop-blur-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        {/* Gradient Top Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${gradient}`} />

        {/* Content */}
        <div className="space-y-4">
          {/* Header with Icon */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-700 mb-0.5 uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-slate-500">{periodLabels[period]}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${accentColor} ${accentGradient} bg-gradient-to-br`}>
              {icon}
            </div>
          </div>

          {/* Value with Animation */}
          <div className="space-y-1.5">
            <div
              className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom duration-500`}
            >
              {value}
            </div>
            {subtext && (
              <p className="text-xs text-slate-600 leading-relaxed">{subtext}</p>
            )}
          </div>

          {/* Period Selector - Always visible */}
          <div className="flex gap-2 pt-3 border-t border-slate-300">
            {(["week", "month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-wide ${
                  period === p
                    ? `${gradient} bg-gradient-to-r text-white shadow-md hover:shadow-lg`
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const getActTypeIcon = (type: ActType) => {
  const iconProps = "h-4 w-4";
  switch (type) {
    case "geste":
      return <Stethoscope className={`${iconProps} text-blue-600`} />;
    case "exploration":
      return <Microscope className={`${iconProps} text-purple-600`} />;
    case "consultation":
      return <Heart className={`${iconProps} text-pink-600`} />;
    case "suivi":
      return <Eye className={`${iconProps} text-orange-600`} />;
    default:
      return <Zap className={`${iconProps} text-slate-600`} />;
  }
};

const getStatusBadge = (status: ActStatus) => {
  const configs = {
    paid: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <Clock className="h-4 w-4" />,
    },
    planned: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <AlertCircle className="h-4 w-4" />,
    },
    canceled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const config = configs[status];
  const labels = {
    paid: "Payé",
    pending: "En attente",
    planned: "Prévu",
    canceled: "Annulé",
  };

  return (
    <Badge
      className={`${config.bg} ${config.text} ${config.border} flex items-center gap-1.5`}
    >
      {config.icon}
      {labels[status]}
    </Badge>
  );
};

const ITEMS_PER_PAGE = 10;

export default function FinancesActsPage() {
  const [gesturesPeriod, setGesturesPeriod] = useState<TimePeriod>("month");
  const [earningsPeriod, setEarningsPeriod] = useState<TimePeriod>("month");
  const [consultationsPeriod, setConsultationsPeriod] = useState<TimePeriod>("month");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ActStatus | "all">("all");
  const [filterType, setFilterType] = useState<ActType | "all">("all");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");

  const statsData = {
    week: {
      gestures: 0,
      earnings: 0,
      earningsMean: 0,
      consultations: 0,
    },
    month: {
      gestures: 612,
      earnings: 195000,
      earningsMean: 318,
      consultations: 356,
    },
    year: {
      gestures: 7344,
      earnings: 2340000,
      earningsMean: 318,
      consultations: 4272,
    },
  };

  // Mock act logs
  const allActLogs: ActLog[] = [
    {
      id: "1",
      type: "geste",
      name: "Injection intramusculaire",
      prix: 2000,
      datetime: "2025-02-23 10:30",
      status: "paid",
      realisateur: { name: "Dr. Ahmed Hassan", specialty: "Généraliste" },
    },
    {
      id: "2",
      type: "exploration",
      name: "Échocardiographie",
      prix: 20000,
      datetime: "2025-02-23 09:15",
      status: "paid",
      realisateur: { name: "Dr. Fatima Benali", specialty: "Cardiologie" },
    },
    {
      id: "3",
      type: "consultation",
      name: "Consultation spécialisée - Cardiologie",
      prix: 8000,
      datetime: "2025-02-22 14:45",
      status: "pending",
      realisateur: { name: "Dr. Mohamed Rachid", specialty: "Cardiologie" },
    },
    {
      id: "4",
      type: "geste",
      name: "Pansement simple",
      prix: 2500,
      datetime: "2025-02-22 11:20",
      status: "paid",
      realisateur: { name: "Infirmier Karim", specialty: "Soins paramédicaux" },
    },
    {
      id: "5",
      type: "suivi",
      name: "Consultation de suivi",
      prix: 3500,
      datetime: "2025-02-21 16:00",
      status: "planned",
      realisateur: { name: "Dr. Leila Sabrina", specialty: "Médecine interne" },
    },
    {
      id: "6",
      type: "exploration",
      name: "Spirométrie",
      prix: 12000,
      datetime: "2025-02-21 13:30",
      status: "canceled",
      realisateur: { name: "Dr. Hassan Saïd", specialty: "Pneumologie" },
    },
  ];

  // Helper function to get unique specialties
  const uniqueSpecialties = useMemo(() => {
    return Array.from(new Set(allActLogs.map((log) => log.realisateur.specialty))).sort();
  }, []);

  // Filter acts based on search, status, type, specialty, and date range
  const filteredActLogs = useMemo(() => {
    return allActLogs.filter((log) => {
      const matchesSearch =
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.realisateur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.realisateur.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || log.status === filterStatus;
      const matchesType = filterType === "all" || log.type === filterType;
      const matchesSpecialty = filterSpecialty === "all" || log.realisateur.specialty === filterSpecialty;

      // Date range filtering
      const logDate = new Date(log.datetime);
      const startDate = dateRangeStart ? new Date(dateRangeStart) : null;
      const endDate = dateRangeEnd ? new Date(dateRangeEnd) : null;
      const matchesDateRange =
        (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);

      return matchesSearch && matchesStatus && matchesType && matchesSpecialty && matchesDateRange;
    });
  }, [searchTerm, filterStatus, filterType, filterSpecialty, dateRangeStart, dateRangeEnd]);

  // Pagination
  const totalPages = Math.ceil(filteredActLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const actLogs = filteredActLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const gesturesData = statsData[gesturesPeriod];
  const earningsData = statsData[earningsPeriod];
  const consultationsData = statsData[consultationsPeriod];

  return (
    <div className="space-y-10">
      {/* Header */}
      <AdminHeader
        title="Finances - Actes"
        subtitle="Suivi détaillé des gestes, revenus et consultations"
      />

      {/* Stat Cards - Consultations first */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {consultationsData.consultations === 0 ? (
          <div className="md:col-span-1 flex items-center justify-center min-h-[220px] rounded-lg border-2 border-dashed border-slate-300 bg-purple-50">
            <div className="text-center">
              <Users className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Aucune donnée disponible</p>
            </div>
          </div>
        ) : (
          <StatCard
            title="Consultations (Gén. + Spé.)"
            value={consultationsData.consultations}
            icon={<Users className="h-6 w-6 text-white" />}
            period={consultationsPeriod}
            onPeriodChange={setConsultationsPeriod}
            gradient="from-purple-500 to-pink-500"
            accentColor="from-purple-600 to-pink-600"
            accentGradient="from-purple-500/20 to-pink-500/20"
            subtext={`${((consultationsData.consultations / (consultationsData.consultations + gesturesData.gestures)) * 100).toFixed(1)}% du total des actes`}
          />
        )}

        {gesturesData.gestures === 0 ? (
          <div className="md:col-span-1 flex items-center justify-center min-h-[220px] rounded-lg border-2 border-dashed border-slate-300 bg-blue-50">
            <div className="text-center">
              <Activity className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Aucune donnée disponible</p>
            </div>
          </div>
        ) : (
          <StatCard
            title="Total des Gestes"
            value={gesturesData.gestures}
            icon={<Activity className="h-6 w-6 text-white" />}
            period={gesturesPeriod}
            onPeriodChange={setGesturesPeriod}
            gradient="from-blue-500 to-cyan-500"
            accentColor="from-blue-600 to-cyan-600"
            accentGradient="from-blue-500/20 to-cyan-500/20"
            subtext={`${Math.round(gesturesData.gestures / 30)} par jour en moyenne`}
          />
        )}

        {earningsData.earnings === 0 ? (
          <div className="md:col-span-1 flex items-center justify-center min-h-[220px] rounded-lg border-2 border-dashed border-slate-300 bg-green-50">
            <div className="text-center">
              <TrendingUp className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Aucune donnée disponible</p>
            </div>
          </div>
        ) : (
          <StatCard
            title="Revenus Totaux"
            value={`${(earningsData.earnings / 1000).toFixed(0)}k MAD`}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            period={earningsPeriod}
            onPeriodChange={setEarningsPeriod}
            gradient="from-emerald-500 to-teal-500"
            accentColor="from-emerald-600 to-teal-600"
            accentGradient="from-emerald-500/20 to-teal-500/20"
            subtext={`Revenu moyen: ${earningsData.earningsMean.toLocaleString()} MAD par geste`}
          />
        )}
      </div>

      {/* Filters & Search Component */}
      <div className="space-y-4">
        {/* Search Input Row */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par acte, réalisateur ou spécialité..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as ActStatus | "all");
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="planned">Prévu</option>
            <option value="canceled">Annulé</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as ActType | "all");
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="geste">Geste</option>
            <option value="exploration">Exploration</option>
            <option value="consultation">Consultation</option>
            <option value="suivi">Suivi</option>
          </select>

          {/* Specialty Filter */}
          <select
            value={filterSpecialty}
            onChange={(e) => {
              setFilterSpecialty(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
          >
            <option value="all">Toutes les spécialités</option>
            {uniqueSpecialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          {/* Date Range Start */}
          <input
            type="date"
            value={dateRangeStart}
            onChange={(e) => {
              setDateRangeStart(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
            placeholder="Date début"
          />

          {/* Date Range End */}
          <input
            type="date"
            value={dateRangeEnd}
            onChange={(e) => {
              setDateRangeEnd(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
            placeholder="Date fin"
          />
        </div>

        {/* Results count */}
        {searchTerm || filterStatus !== "all" || filterType !== "all" || filterSpecialty !== "all" || dateRangeStart || dateRangeEnd ? (
          <p className="text-sm text-slate-600">
            {filteredActLogs.length} acte{filteredActLogs.length !== 1 ? "s" : ""} trouvé{filteredActLogs.length !== 1 ? "s" : ""}
          </p>
        ) : null}
      </div>

      {/* Acts Log Table */}
      <div className="border-2 border-slate-300 overflow-hidden shadow-sm bg-white">
        <div className="bg-slate-100 border-b-2 border-slate-300 px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Journal des Actes</h2>
          <span className="text-sm font-medium text-slate-600">{filteredActLogs.length} actes</span>
        </div>

        <div>
          {filteredActLogs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Zap className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium mb-2">Aucun acte trouvé</p>
              <p className="text-slate-500 text-sm">Le journal des actes apparaîtra ici</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-wider">Réalisateur</th>
                      <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-wider">Nom de l'acte</th>
                      <th className="px-6 py-4 text-right font-black text-slate-900 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-wider">Date & Heure</th>
                      <th className="px-6 py-4 text-center font-black text-slate-900 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-right font-black text-slate-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actLogs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200 ${
                          index % 2 === 0 ? "" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{log.realisateur.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{log.realisateur.specialty}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg w-fit">
                            {getActTypeIcon(log.type)}
                            <span className="text-xs font-medium text-slate-700 capitalize">
                              {log.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{log.name}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-slate-900">
                            {(log.prix / 100).toFixed(2)} MAD
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{log.datetime}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(log.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Imprimer"
                            >
                              <Printer className="h-5 w-5 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="h-5 w-5 text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 hover:bg-red-100 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-8 py-6 border-t-2 border-slate-300 bg-slate-100">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
