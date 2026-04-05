"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Lock,
  Zap,
  Palette,
  Database,
  Users,
  Mail,
  Clock,
  Save,
  ChevronRight,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface SettingOption {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "input" | "textarea";
  value: boolean | string;
}

const SETTING_SECTIONS: SettingsSection[] = [
  {
    id: "general",
    title: "Général",
    icon: <Settings className="h-5 w-5" />,
    description: "Paramètres généraux de l'établissement",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: <Bell className="h-5 w-5" />,
    description: "Gérez les alertes et notifications",
  },
  {
    id: "appearance",
    title: "Apparence",
    icon: <Palette className="h-5 w-5" />,
    description: "Personnalisez l'interface",
  },
  {
    id: "security",
    title: "Sécurité",
    icon: <Lock className="h-5 w-5" />,
    description: "Paramètres de sécurité et accès",
  },
  {
    id: "integrations",
    title: "Intégrations",
    icon: <Zap className="h-5 w-5" />,
    description: "Connexions externes et API",
  },
  {
    id: "data",
    title: "Données",
    icon: <Database className="h-5 w-5" />,
    description: "Sauvegarde et gestion des données",
  },
];

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    // General
    organizationName: "Hôpital Central de Casablanca",
    timezone: "Africa/Casablanca",
    language: "fr",
    dateFormat: "DD/MM/YYYY",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    notificationFrequency: "immediate",
    activityAlerts: true,
    systemAlerts: true,

    // Appearance
    theme: "light",
    colorScheme: "indigo",
    compactMode: false,

    // Security
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    ipWhitelist: "",

    // Integrations
    enableAPI: true,
    enableLDAPSync: false,
    enableSSOIntegration: false,

    // Data
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: 36,
  });

  const handleToggle = (key: string) => {
    setSettings((prev:any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Nom de l'Établissement
        </label>
        <input
          type="text"
          value={settings.organizationName}
          onChange={(e) => handleChange("organizationName", e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-slate-50 to-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Fuseau Horaire
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option>Africa/Casablanca</option>
            <option>Europe/Paris</option>
            <option>UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Langue
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="fr">Français</option>
            <option value="ar">Arabe</option>
            <option value="en">Anglais</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Format de Date
        </label>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleChange("dateFormat", e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
        >
          <option>DD/MM/YYYY</option>
          <option>MM/DD/YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-semibold text-slate-900">
                Notifications par Email
              </p>
              <p className="text-xs text-slate-600">
                Recevez les mises à jour par email
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("emailNotifications")}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              settings.emailNotifications ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                settings.emailNotifications ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-semibold text-slate-900">
                Notifications SMS
              </p>
              <p className="text-xs text-slate-600">
                Recevez les alertes urgentes par SMS
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("smsNotifications")}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              settings.smsNotifications ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                settings.smsNotifications ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-semibold text-slate-900">
                Alertes d'Activité
              </p>
              <p className="text-xs text-slate-600">
                Notifications sur les activités importantes
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("activityAlerts")}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              settings.activityAlerts ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                settings.activityAlerts ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Fréquence des Notifications
        </label>
        <select
          value={settings.notificationFrequency}
          onChange={(e) =>
            handleChange("notificationFrequency", e.target.value)
          }
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
        >
          <option value="immediate">Immédiat</option>
          <option value="hourly">Toutes les heures</option>
          <option value="daily">Quotidien</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-semibold text-slate-900">
                Authentification à Deux Facteurs
              </p>
              <p className="text-xs text-slate-600">
                Sécurité renforcée pour les comptes
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("twoFactorAuth")}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              settings.twoFactorAuth ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                settings.twoFactorAuth ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Expiration des Mots de Passe (jours)
          </label>
          <input
            type="number"
            value={settings.passwordExpiry}
            onChange={(e) => handleChange("passwordExpiry", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Délai de Session (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleChange("sessionTimeout", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Liste Blanche d'Adresses IP
        </label>
        <textarea
          value={settings.ipWhitelist}
          onChange={(e) => handleChange("ipWhitelist", e.target.value)}
          placeholder="192.168.1.1, 10.0.0.0/8"
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
        />
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="font-semibold text-slate-900">
              Sauvegarde Automatique
            </p>
            <p className="text-xs text-slate-600">
              Sauvegarder automatiquement les données
            </p>
          </div>
        </div>
        <button
          onClick={() => handleToggle("autoBackup")}
          className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
            settings.autoBackup ? "bg-indigo-600" : "bg-slate-300"
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
              settings.autoBackup ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Fréquence de Sauvegarde
          </label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => handleChange("backupFrequency", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="hourly">Toutes les heures</option>
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Conservation des Données (mois)
          </label>
          <input
            type="number"
            value={settings.dataRetention}
            onChange={(e) => handleChange("dataRetention", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "data":
        return renderDataSettings();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-600">
              Cette section est en cours de développement
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <AdminHeader
        title="Paramètres"
        subtitle="Configurez les paramètres de votre établissement"
      />

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-600" />
          <p className="text-green-700 font-medium">
            Paramètres enregistrés avec succès
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-md sticky top-6">
            {SETTING_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-6 py-4 border-b border-slate-200 last:border-b-0 transition-all duration-200 flex items-start gap-3 group ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-l-indigo-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`mt-0.5 transition-colors duration-200 ${
                    activeSection === section.id
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-indigo-600"
                  }`}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm transition-colors duration-200 ${
                      activeSection === section.id
                        ? "text-indigo-600"
                        : "text-slate-900 group-hover:text-indigo-600"
                    }`}
                  >
                    {section.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {section.description}
                  </p>
                </div>
                {activeSection === section.id && (
                  <ChevronRight className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-md p-8">
            {renderContent()}

            {/* Save Button */}
            <div className="mt-10 pt-8 border-t border-slate-200 flex gap-4 justify-end">
              <button className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors duration-200">
                Réinitialiser
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
