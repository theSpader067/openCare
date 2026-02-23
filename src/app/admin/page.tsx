"use client";

import { BarChart3, FileText, DollarSign, Stethoscope, Building2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const adminStats = [
  {
    label: "Actes définis",
    value: "—",
    description: "Gestes, opérations et spécialités",
    icon: Stethoscope,
    href: "/admin/catalog/acts",
  },
  {
    label: "Documents",
    value: "—",
    description: "Modèles d'ordonnances et rapports",
    icon: FileText,
    href: "/admin/documents/prescriptions",
  },
  {
    label: "Paiements en attente",
    value: "—",
    description: "À reconcilier et traiter",
    icon: DollarSign,
    href: "/admin/finances/payments",
  },
  {
    label: "Équipes",
    value: "—",
    description: "Utilisateurs et permissions",
    icon: Users,
    href: "/admin/organization/teams",
  },
];

const recentActivities = [
  {
    title: "Configuration de l'organisation",
    description: "Mise en place des paramètres de base",
    timestamp: "À configurer",
  },
  {
    title: "Catalogue des actes",
    description: "Définir les gestes et opérations",
    timestamp: "À configurer",
  },
  {
    title: "Modèles de documents",
    description: "Designer les ordonnances et rapports",
    timestamp: "À configurer",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Admin</h1>
        <p className="text-slate-600 mt-2">
          Bienvenue dans le cœur de votre hôpital/clinique. Ici, vous gérez tout.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <a
              key={stat.label}
              href={stat.href}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </CardTitle>
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                      <Icon className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules de gestion */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Modules de Gestion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Catalogue",
                  description: "Définissez tous les actes, gestes et opérations",
                  icon: Stethoscope,
                  href: "/admin/catalog/acts",
                },
                {
                  title: "Documents",
                  description: "Concevez vos ordonnances et rapports",
                  icon: FileText,
                  href: "/admin/documents/prescriptions",
                },
                {
                  title: "Finances",
                  description: "Gérez les actes facturables et paiements",
                  icon: DollarSign,
                  href: "/admin/finances/acts",
                },
                {
                  title: "Organisation",
                  description: "Paramètres de votre établissement",
                  icon: Building2,
                  href: "/admin/organization/info",
                },
              ].map((module) => {
                const Icon = module.icon;
                return (
                  <a
                    key={module.title}
                    href={module.href}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{module.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {module.description}
                            </CardDescription>
                          </div>
                          <Icon className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        </div>
                      </CardHeader>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Démarrage rapide</CardTitle>
              <CardDescription>Configuration initiale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="pb-4 border-b border-slate-200 last:border-0 last:pb-0"
                  >
                    <h3 className="font-medium text-sm text-slate-900">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {activity.description}
                    </p>
                    <span className="text-xs text-slate-500 mt-2 inline-block">
                      {activity.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            À propos de l'Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            Ce tableau de bord est le centre de contrôle de votre établissement. Vous pouvez :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Définir tous les actes et gestes médicaux</li>
            <li>Configurer le design de vos documents imprimables</li>
            <li>Gérer les finances et les paiements</li>
            <li>Organiser les équipes et les utilisateurs</li>
            <li>Paramétrer votre établissement</li>
          </ul>
          <p className="pt-2">
            Cet espace n'est accessible que aux administrateurs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
