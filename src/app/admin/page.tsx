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
  gradient,
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string;
  change: string;
  gradient: string;
}) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-white shadow-lg`}>
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm font-medium opacity-90">{label}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <Icon className="h-8 w-8 opacity-80" />
    </div>
    <p className="text-xs opacity-80">{change}</p>
  </div>
);

export default function AdminPage() {
  const totalRevenue = 44400;
  const totalConsultations = 1240;
  const activePatients = 856;
  const revenueChange = "+12.5% vs last month";
  const consultationsChange = "+8.3% vs last month";
  const patientsChange = "+5.2% vs last month";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600">
          Tableau de Bord
        </h1>
        <p className="text-lg text-slate-600">
          Bienvenue dans le centre de contrôle de votre établissement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          label="Revenus Totaux"
          value={`${(totalRevenue / 1000).toFixed(1)}k MAD`}
          change={revenueChange}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Activity}
          label="Consultations"
          value={totalConsultations.toString()}
          change={consultationsChange}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={Users}
          label="Patients Actifs"
          value={activePatients.toString()}
          change={patientsChange}
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Tendance des Revenus et Gestes
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Revenus (MAD) et nombre de gestes par mois
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Distribution des Actes
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Répartition par type
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Factures */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Factures Récentes
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                5 dernières factures
              </p>
            </div>
            <a
              href="/admin/finances/rapports"
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors whitespace-nowrap ml-4"
            >
              Voir plus →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                      <span className="font-bold text-slate-900">
                        {(facture.amount / 1000).toFixed(0)}k MAD
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          facture.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : facture.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {facture.status === "paid"
                          ? "Payée"
                          : facture.status === "pending"
                          ? "En attente"
                          : "En retard"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Consultations Récentes
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                5 dernières consultations
              </p>
            </div>
            <a
              href="/admin/organization/teams"
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors whitespace-nowrap ml-4"
            >
              Voir plus →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          consultation.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : consultation.status === "ongoing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
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
