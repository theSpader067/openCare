"use client";

import {
  BarChart3,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  Eye,
  Download,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 4000, gestes: 350 },
  { month: "Fév", revenue: 4500, gestes: 385 },
  { month: "Mar", revenue: 5200, gestes: 420 },
  { month: "Avr", revenue: 6100, gestes: 475 },
  { month: "Mai", revenue: 5900, gestes: 450 },
  { month: "Juin", revenue: 7200, gestes: 520 },
  { month: "Juil", revenue: 8400, gestes: 580 },
];

const actsDistribution = [
  { name: "Consultations", value: 45, color: "#6366F1" },
  { name: "Gestes", value: 30, color: "#8B5CF6" },
  { name: "Explorations", value: 15, color: "#EC4899" },
  { name: "Suivis", value: 10, color: "#F59E0B" },
];

const recentFactures = [
  {
    id: "1",
    number: "FAC-2026-045",
    patient: "Patient ABC",
    amount: 25000,
    status: "paid",
    date: "2026-02-23",
  },
  {
    id: "2",
    number: "FAC-2026-044",
    patient: "Patient XYZ",
    amount: 15000,
    status: "pending",
    date: "2026-02-22",
  },
  {
    id: "3",
    number: "FAC-2026-043",
    patient: "Patient DEF",
    amount: 32000,
    status: "paid",
    date: "2026-02-21",
  },
  {
    id: "4",
    number: "FAC-2026-042",
    patient: "Patient GHI",
    amount: 8000,
    status: "overdue",
    date: "2026-02-20",
  },
  {
    id: "5",
    number: "FAC-2026-041",
    patient: "Patient JKL",
    amount: 18000,
    status: "pending",
    date: "2026-02-19",
  },
];

const recentConsultations = [
  {
    id: "1",
    patient: "Patient ABC",
    doctor: "Dr. Martin",
    type: "Consultation Générale",
    time: "10:30",
    status: "completed",
  },
  {
    id: "2",
    patient: "Patient XYZ",
    doctor: "Dr. Sarah",
    type: "Cardiologie",
    time: "11:45",
    status: "completed",
  },
  {
    id: "3",
    patient: "Patient DEF",
    doctor: "Dr. Ahmed",
    type: "Consultation Générale",
    time: "14:15",
    status: "ongoing",
  },
  {
    id: "4",
    patient: "Patient GHI",
    doctor: "Dr. Pierre",
    type: "Dermatologie",
    time: "15:00",
    status: "pending",
  },
  {
    id: "5",
    patient: "Patient JKL",
    doctor: "Dr. Leila",
    type: "Médecine Interne",
    time: "16:30",
    status: "pending",
  },
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string;
  change: string;
  color: "teal" | "amber" | "blue";
}) => {
  const colorMap = {
    teal: {
      iconBg: "bg-teal-50",
      iconText: "text-teal-600",
      accentBar: "bg-teal-500",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      accentBar: "bg-amber-500",
    },
    blue: {
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      accentBar: "bg-blue-500",
    },
  };

  const colors = colorMap[color];

  return (
    <div className="bg-white border border-slate-200/80 rounded-[10px] p-6 shadow-[0px_18px_45px_rgba(15,23,42,0.04)] hover:shadow-[0px_24px_55px_rgba(15,23,42,0.08)] transition-all duration-200 relative overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 w-full ${colors.accentBar}`}></div>

      <div className="pt-2">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-slate-500 font-semibold">
              {label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 mt-3">{value}</p>
          </div>
          <div className={`p-4 ${colors.iconBg} rounded-2xl`}>
            <Icon className={`h-6 w-6 ${colors.iconText}`} />
          </div>
        </div>
        <p className="text-xs font-semibold text-emerald-600">{change}</p>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const totalRevenue = 44400;
  const totalConsultations = 1240;
  const activePatients = 856;
  const revenueChange = "+12.5% vs last month";
  const consultationsChange = "+8.3% vs last month";
  const patientsChange = "+5.2% vs last month";

  return (
    <div className="space-y-10 bg-slate-50">
      {/* Header */}
      <div className="space-y-4 pb-8 border-b border-slate-200/70">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">
            Tableau de bord
          </h1>
        </div>
        <p className="text-sm font-medium text-slate-600 max-w-2xl">
          Aperçu complet de votre établissement — Gestion centralisée des revenus, consultations et patient
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={DollarSign}
          label="Revenus Totaux"
          value={`${(totalRevenue / 1000).toFixed(1)}k MAD`}
          change={revenueChange}
          color="teal"
        />
        <StatCard
          icon={Activity}
          label="Consultations"
          value={totalConsultations.toString()}
          change={consultationsChange}
          color="amber"
        />
        <StatCard
          icon={Users}
          label="Patients Actifs"
          value={activePatients.toString()}
          change={patientsChange}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[10px] shadow-[0px_18px_45px_rgba(15,23,42,0.04)] p-6">
          <div className="mb-8 pb-6 border-b border-slate-200/70">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Tendance Revenus & Gestes
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Analyse mensuelle des revenus (MAD) et volume de gestes
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                strokeWidth={3}
                name="Revenus (MAD)"
                dot={{ fill: "#4F46E5", r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="gestes"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Gestes (Nombre)"
                dot={{ fill: "#8B5CF6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Acts Distribution Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-[10px] shadow-[0px_18px_45px_rgba(15,23,42,0.04)] p-6">
          <div className="mb-8 pb-6 border-b border-slate-200/70">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Distribution Actes
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Répartition par catégories d'actes
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actsDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {actsDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Factures */}
        <div className="bg-white border border-slate-200/80 rounded-[10px] shadow-[0px_18px_45px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="p-6 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Factures Récentes
              </h2>
              <p className="text-sm font-medium text-slate-600 mt-1">
                5 dernières transactions
              </p>
            </div>
            <a
              href="/admin/finances/rapports"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors whitespace-nowrap ml-4"
            >
              Voir plus
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Facture
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentFactures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {facture.number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {facture.patient}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {(facture.amount / 1000).toFixed(0)}k MAD
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                          facture.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : facture.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {facture.status === "paid"
                          ? "Payée"
                          : facture.status === "pending"
                          ? "Attente"
                          : "Retard"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white border border-slate-200/80 rounded-[10px] shadow-[0px_18px_45px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="p-6 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Consultations Récentes
              </h2>
              <p className="text-sm font-medium text-slate-600 mt-1">
                5 dernières consultations
              </p>
            </div>
            <a
              href="/admin/organization/teams"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors whitespace-nowrap ml-4"
            >
              Voir plus
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Médecin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentConsultations.map((consultation) => (
                  <tr
                    key={consultation.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {consultation.patient}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {consultation.doctor}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {consultation.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {consultation.time}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                          consultation.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : consultation.status === "ongoing"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {consultation.status === "completed"
                          ? "Terminée"
                          : consultation.status === "ongoing"
                          ? "En cours"
                          : "À venir"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
