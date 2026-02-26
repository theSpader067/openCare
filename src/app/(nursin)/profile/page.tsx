"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Shield,
  Bell,
  Moon,
  LogOut,
  Save,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Lock,
  Clock,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  license: string;
}

interface PreferencesData {
  notifications: boolean;
  darkMode: boolean;
  emailUpdates: boolean;
  language: "fr" | "en";
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || "Infirmière Sophie Martin",
    email: session?.user?.email || "sophie.martin@hopital-central.fr",
    phone: "+33 6 12 34 56 78",
    department: "Cardiologie",
    role: "Infirmière Diplômée d'État (IDE)",
    license: "IDE/2019/FR/0145892",
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    language: "fr",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowPasswordForm(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
            <p className="text-sm text-slate-600">Gérez vos informations et préférences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600"></div>

          {/* Profile Info */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-20 mb-6">
              {/* Avatar */}
              <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white flex-shrink-0">
                {(session?.user?.name?.[0] || "S").toUpperCase()}
              </div>

              {/* Quick Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{formData.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{formData.role}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3 mr-1" />
                    Actif
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {formData.department}
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Modifier
              </button>
            </div>

            {/* Editable Form */}
            {isEditing ? (
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Numéro de licence
                    </label>
                    <input
                      type="text"
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2",
                      isSaving
                        ? "bg-indigo-600 text-white cursor-wait opacity-75"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 px-4 rounded-lg font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <InfoItem icon={User} label="Nom" value={formData.name} />
                <InfoItem icon={Mail} label="Email" value={formData.email} />
                <InfoItem icon={Phone} label="Téléphone" value={formData.phone} />
                <InfoItem icon={Briefcase} label="Département" value={formData.department} />
                <div className="sm:col-span-2">
                  <InfoItem icon={Stethoscope} label="Numéro de Licence" value={formData.license} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Informations de Poste</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600">Quart actuel</p>
                <p className="font-semibold text-slate-900">08:00 - 20:00 (12h)</p>
              </div>
              <div>
                <p className="text-slate-600">Patients assignés</p>
                <p className="font-semibold text-slate-900">6 patients</p>
              </div>
              <div>
                <p className="text-slate-600">Ancienneté</p>
                <p className="font-semibold text-slate-900">5 ans</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Statut d'Accès</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600">Accès au système</p>
                <p className="font-semibold text-emerald-700">✓ Actif</p>
              </div>
              <div>
                <p className="text-slate-600">Dernier accès</p>
                <p className="font-semibold text-slate-900">Aujourd'hui à 07:45</p>
              </div>
              <div>
                <p className="text-slate-600">Session actuelle</p>
                <p className="font-semibold text-slate-900">En cours depuis 2h 15min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Bell className="h-6 w-6 text-indigo-600" />
            Préférences
          </h3>

          <div className="space-y-4">
            <PreferenceToggle
              icon={Bell}
              label="Notifications"
              description="Recevoir les notifications système"
              checked={preferences.notifications}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, notifications: value }))
              }
            />
            <PreferenceToggle
              icon={Moon}
              label="Mode sombre"
              description="Activer le thème sombre"
              checked={preferences.darkMode}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, darkMode: value }))
              }
            />
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Langue
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    language: e.target.value as "fr" | "en",
                  }))
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-600" />
            Sécurité
          </h3>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">Changer le mot de passe</p>
                <p className="text-xs text-slate-600 mt-1">
                  Dernière modification il y a 90 jours
                </p>
              </div>
              <Lock className="h-5 w-5 text-slate-400" />
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        current: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2",
                    isSaving
                      ? "bg-indigo-600 text-white cursor-wait opacity-75"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  )}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirmer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ current: "", new: "", confirm: "" });
                  }}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 p-6 sm:p-8 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Déconnexion</h3>
            <p className="text-sm text-slate-600 mt-1">
              Terminer votre session actuelle
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-slate-600 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function PreferenceToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-indigo-600" />
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-indigo-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 mt-0.5",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
