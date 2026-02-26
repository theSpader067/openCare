"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Heart,
  Shield,
  Award,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  LogOut,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  license: string;
  experience: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: session?.user?.name || "Dr. Sophie Martin",
    email: session?.user?.email || "sophie.martin@hopital-central.fr",
    phone: "+33 6 12 34 56 78",
    department: "Cardiologie",
    position: "Infirmière Diplômée d'État (IDE)",
    license: "IDE/2019/FR/0145892",
    experience: 5,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Mock schedule data
  const schedule = {
    current: { day: "Mardi", hours: "08:00 - 20:00" },
    thisWeek: ["Lun: 08:00-20:00", "Mar: 08:00-20:00", "Mer: Repos", "Jeu: 14:00-22:00", "Ven: 08:00-20:00"],
  };

  const stats = {
    patientsAssigned: 6,
    shiftsThisMonth: 18,
    hoursWorked: 144,
    certifications: 3,
  };

  const certifications = [
    { name: "ACLS Certification", issued: "2022", expires: "2025" },
    { name: "Pediatric Advanced Life Support", issued: "2021", expires: "2024" },
    { name: "Infection Control", issued: "2023", expires: "2026" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Profil Professionnel</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            <Edit2 className="h-4 w-4" />
            {isEditing ? "Annuler" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Professional Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Banner with gradient */}
          <div className="h-40 bg-gradient-to-r from-indigo-600 to-blue-600 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
          </div>

          {/* Profile Content */}
          <div className="px-6 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-24 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-40 w-40 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <span className="text-6xl font-bold">{profileData.name[0]}</span>
                </div>
              </div>

              {/* Profile Info */}
              {!isEditing ? (
                <div className="flex-1 pt-8">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{profileData.name}</h2>
                    <p className="text-lg text-indigo-600 font-semibold mb-4">{profileData.position}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Actif
                      </Badge>
                      <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-300">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {profileData.department}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
                        <Award className="h-3 w-3 mr-1" />
                        {profileData.experience} ans
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Email</p>
                        <p className="text-sm font-semibold text-slate-900">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Téléphone</p>
                        <p className="text-sm font-semibold text-slate-900">{profileData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Licence</p>
                        <p className="text-sm font-semibold text-slate-900">{profileData.license}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Département</p>
                        <p className="text-sm font-semibold text-slate-900">{profileData.department}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 pt-8 space-y-4 border-l-2 border-slate-200 pl-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nom complet</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Position</label>
                      <input
                        type="text"
                        name="position"
                        value={profileData.position}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Département</label>
                      <input
                        type="text"
                        name="department"
                        value={profileData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
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
                          <Save className="h-4 w-4" />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Patients Assignés"
            value={stats.patientsAssigned}
            color="indigo"
          />
          <StatCard
            icon={Calendar}
            label="Postes ce mois"
            value={stats.shiftsThisMonth}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Heures travaillées"
            value={`${stats.hoursWorked}h`}
            color="emerald"
          />
          <StatCard
            icon={Award}
            label="Certifications"
            value={stats.certifications}
            color="purple"
          />
        </div>

        {/* Schedule & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">Horaire Actuel</h3>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-200">
              <p className="text-sm text-slate-600 mb-2">Aujourd'hui</p>
              <p className="text-2xl font-bold text-indigo-600 mb-1">{schedule.current.day}</p>
              <p className="text-lg font-semibold text-slate-900">{schedule.current.hours}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Cette semaine</p>
              <div className="space-y-2">
                {schedule.thisWeek.map((day, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{day.split(":")[0]}</span>
                    <span className="text-sm font-semibold text-slate-900">{day.split(":")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-bold text-slate-900">Certifications</h3>
            </div>

            <div className="space-y-3">
              {certifications.map((cert, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-slate-900">{cert.name}</p>
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>Émise: {cert.issued}</span>
                    <span>Expire: {cert.expires}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <h3 className="font-bold text-white text-lg">Déconnexion</h3>
            <p className="text-red-100 text-sm">Terminer votre session actuelle</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "indigo" | "blue" | "emerald" | "purple";
}) {
  const colorClasses = {
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700",
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <Icon className="h-8 w-8 opacity-75" />
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
