"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Settings,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  LogOut,
  Check,
  X,
  Eye,
  EyeOff,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "overview" | "schedule" | "settings" | "security";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  license: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: session?.user?.name || "Sophie Martin",
    email: session?.user?.email || "sophie.martin@hopital.fr",
    phone: "+33 6 12 34 56 78",
    department: "Cardiologie",
    position: "Infirmière Diplômée d'État (IDE)",
    license: "IDE/2019/FR/0145892",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    setEditingField(null);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    setPasswords({ current: "", new: "", confirm: "" });
    alert("Mot de passe changé avec succès");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Aperçu", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "schedule", label: "Planning", icon: <Calendar className="h-5 w-5" /> },
    { id: "settings", label: "Paramètres", icon: <Settings className="h-5 w-5" /> },
    { id: "security", label: "Sécurité", icon: <Lock className="h-5 w-5" /> },
  ];

  return (
    <div className="h-full bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-slate-200 flex items-center px-6 gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Profil</h1>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {profileData.name[0]}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {profileData.name}
              </h2>
              <p className="text-sm text-indigo-600 font-medium truncate">
                {profileData.position}
              </p>
              <p className="text-xs text-slate-600 mt-1 truncate">
                {profileData.department}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                activeSection === item.id
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Informations Personnelles
                </h2>

                {/* Personal Info Grid */}
                <div className="grid grid-cols-2 gap-6 bg-white rounded-xl border border-slate-200 p-6">
                  <EditableField
                    label="Nom complet"
                    value={profileData.name}
                    fieldKey="name"
                    isEditing={editingField === "name"}
                    isSaving={isSaving}
                    onEdit={() => setEditingField("name")}
                    onChange={(v) => handleFieldChange("name", v)}
                    onSave={handleSaveField}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <EditableField
                    label="Email"
                    value={profileData.email}
                    fieldKey="email"
                    isEditing={editingField === "email"}
                    isSaving={isSaving}
                    onEdit={() => setEditingField("email")}
                    onChange={(v) => handleFieldChange("email", v)}
                    onSave={handleSaveField}
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <EditableField
                    label="Téléphone"
                    value={profileData.phone}
                    fieldKey="phone"
                    isEditing={editingField === "phone"}
                    isSaving={isSaving}
                    onEdit={() => setEditingField("phone")}
                    onChange={(v) => handleFieldChange("phone", v)}
                    onSave={handleSaveField}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <EditableField
                    label="Département"
                    value={profileData.department}
                    fieldKey="department"
                    isEditing={editingField === "department"}
                    isSaving={isSaving}
                    onEdit={() => setEditingField("department")}
                    onChange={(v) => handleFieldChange("department", v)}
                    onSave={handleSaveField}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <div className="col-span-2">
                    <EditableField
                      label="Poste"
                      value={profileData.position}
                      fieldKey="position"
                      isEditing={editingField === "position"}
                      isSaving={isSaving}
                      onEdit={() => setEditingField("position")}
                      onChange={(v) => handleFieldChange("position", v)}
                      onSave={handleSaveField}
                      icon={<Briefcase className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Certifications & Licences
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Numéro de licence</p>
                      <p className="text-lg font-bold text-slate-900">
                        {profileData.license}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        Infirmière Diplômée d'État • Valide jusqu'en 2027
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Statistiques
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatBox label="Patients assignés" value="6" />
                  <StatBox label="Quarts ce mois" value="18" />
                  <StatBox label="Heures travaillées" value="144h" />
                </div>
              </div>
            </div>
          )}

          {/* Schedule Section */}
          {activeSection === "schedule" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Horaire de Travail
              </h2>

              <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-6">
                {/* Current */}
                <div className="pb-6 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-600 mb-3">
                    Quart actuel
                  </p>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-lg font-bold text-indigo-700">
                      Mardi, 08:00 - 20:00
                    </p>
                    <p className="text-sm text-indigo-600 mt-1">
                      12 heures • Cardiologie
                    </p>
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-3">
                    Planning de la semaine
                  </p>
                  <div className="space-y-2">
                    {[
                      { day: "Lundi", hours: "08:00 - 20:00", status: "Travail" },
                      { day: "Mardi", hours: "08:00 - 20:00", status: "Travail" },
                      { day: "Mercredi", hours: "-", status: "Repos" },
                      { day: "Jeudi", hours: "14:00 - 22:00", status: "Travail" },
                      { day: "Vendredi", hours: "08:00 - 20:00", status: "Travail" },
                      { day: "Samedi", hours: "-", status: "Repos" },
                      { day: "Dimanche", hours: "-", status: "Repos" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <span className="font-medium text-slate-900">
                          {item.day}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.hours}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              item.status === "Repos"
                                ? "text-emerald-600"
                                : "text-slate-600"
                            )}
                          >
                            {item.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Paramètres
              </h2>

              <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-6">
                <SettingItem
                  label="Notifications"
                  description="Recevoir les alertes de patients"
                  defaultChecked={true}
                />
                <SettingItem
                  label="Emails"
                  description="Recevoir les emails de notifications"
                  defaultChecked={false}
                />
                <SettingItem
                  label="Mode sombre"
                  description="Activer le thème sombre"
                  defaultChecked={false}
                />

                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Langue
                  </label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Sécurité
              </h2>

              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Changer le mot de passe
                  </h3>

                  <div className="space-y-4">
                    <PasswordField
                      label="Mot de passe actuel"
                      value={passwords.current}
                      onChange={(v) =>
                        setPasswords((p) => ({ ...p, current: v }))
                      }
                      show={showCurrentPassword}
                      onToggleShow={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    />
                    <PasswordField
                      label="Nouveau mot de passe"
                      value={passwords.new}
                      onChange={(v) => setPasswords((p) => ({ ...p, new: v }))}
                      show={showNewPassword}
                      onToggleShow={() => setShowNewPassword(!showNewPassword)}
                    />
                    <PasswordField
                      label="Confirmer le mot de passe"
                      value={passwords.confirm}
                      onChange={(v) =>
                        setPasswords((p) => ({ ...p, confirm: v }))
                      }
                      show={showNewPassword}
                      onToggleShow={() => setShowNewPassword(!showNewPassword)}
                    />

                    <button
                      onClick={handleChangePassword}
                      disabled={isSaving}
                      className={cn(
                        "w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mt-6",
                        isSaving
                          ? "bg-indigo-600 text-white opacity-75 cursor-wait"
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
                          <Check className="h-4 w-4" />
                          Confirmer
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Last Login */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Activité
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Dernier accès</p>
                      <p className="text-base font-semibold text-slate-900">
                        Aujourd'hui à 07:45
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Session actuelle</p>
                      <p className="text-base font-semibold text-slate-900">
                        En cours depuis 2h 15min
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Editable Field Component
function EditableField({
  label,
  value,
  fieldKey,
  isEditing,
  isSaving,
  onEdit,
  onChange,
  onSave,
  icon,
}: {
  label: string;
  value: string;
  fieldKey: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit()}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="w-full flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left group"
        >
          <span className="text-slate-400 group-hover:text-slate-600">{icon}</span>
          <span className="text-slate-900 font-medium">{value}</span>
        </button>
      )}
    </div>
  );
}

// Stat Box Component
function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
      <p className="text-sm text-slate-600 mb-2">{label}</p>
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}

// Setting Item Component
function SettingItem({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border-b border-slate-200 last:border-b-0">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-indigo-600" : "bg-slate-300"
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

// Password Field Component
function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
