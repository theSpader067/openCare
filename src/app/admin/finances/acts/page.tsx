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
  const [isHovered, setIsHovered] = useState(false);

  const periodLabels = {
    week: "Cette semaine",
    month: "Ce mois",
    year: "Cette année",
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Background Haze */}
      <div
        className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 ${accentGradient}`}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Gradient Top Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${gradient}`} />

        {/* Content */}
        <div className="space-y-6">
          {/* Header with Icon */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-600 mb-1">{title}</h3>
              <p className="text-xs text-slate-500">{periodLabels[period]}</p>
            </div>
            <div className={`p-3 rounded-xl ${accentColor} ${accentGradient} bg-gradient-to-br`}>
              {icon}
            </div>
          </div>

          {/* Value with Animation */}
          <div className="space-y-2">
            <div
              className={`text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom duration-500`}
            >
              {value}
            </div>
            {subtext && (
              <p className="text-sm text-slate-600 leading-relaxed">{subtext}</p>
            )}
          </div>

          {/* Period Selector - Only visible on hover */}
          {isHovered && (
            <div className="flex gap-2 pt-4 border-t border-slate-200 animate-in fade-in duration-700">
              {(["week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    period === p
                      ? `${accentGradient} bg-gradient-to-r text-white shadow-lg hover:shadow-xl`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
                </button>
              ))}
            </div>
          )}
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

const ITEMS_PER_PAGE = 5;

export default function FinancesActsPage() {
  const [gesturesPeriod, setGesturesPeriod] = useState<TimePeriod>("month");
  const [earningsPeriod, setEarningsPeriod] = useState<TimePeriod>("month");
  const [consultationsPeriod, setConsultationsPeriod] = useState<TimePeriod>("month");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ActStatus | "all">("all");

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

  // Filter acts based on search and status
  const filteredActLogs = useMemo(() => {
    return allActLogs.filter((log) => {
      const matchesSearch =
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.realisateur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.realisateur.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || log.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

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
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Finances - Actes</h1>
        <p className="text-slate-600 mt-2">
          Suivi détaillé des gestes, revenus et consultations
        </p>
      </div>

      {/* Stat Cards - Consultations first */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {consultationsData.consultations === 0 ? (
          <div className="md:col-span-1 flex items-center justify-center min-h-[300px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
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
          <div className="md:col-span-1 flex items-center justify-center min-h-[300px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-2" />
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
          <div className="md:col-span-1 flex items-center justify-center min-h-[300px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-2" />
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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
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
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as ActStatus | "all");
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Payé</option>
              <option value="pending">En attente</option>
              <option value="planned">Prévu</option>
              <option value="canceled">Annulé</option>
            </select>
          </div>
        </div>
        {searchTerm || filterStatus !== "all" ? (
          <p className="text-sm text-slate-600">
            {filteredActLogs.length} acte{filteredActLogs.length !== 1 ? "s" : ""} trouvé{filteredActLogs.length !== 1 ? "s" : ""}
          </p>
        ) : null}
      </div>

      {/* Acts Log Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <CardTitle className="text-xl">Journal des Actes</CardTitle>
          <span className="text-sm text-slate-600">{filteredActLogs.length} actes</span>
        </CardHeader>

        <CardContent className="p-0">
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
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Réalisateur</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Type</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Nom de l'acte</th>
                      <th className="px-6 py-4 text-right font-semibold text-slate-700">Prix</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Date & Heure</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700">Statut</th>
                      <th className="px-6 py-4 text-right font-semibold text-slate-700">Actions</th>
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              title="Imprimer"
                            >
                              <Printer className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-amber-100"
                              title="Modifier"
                            >
                              <Edit2 className="h-4 w-4 text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
                <div className="flex items-center justify-between px-8 py-6 border-t border-slate-200 bg-slate-50">
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
        </CardContent>
      </div>
    </div>
  );
}
