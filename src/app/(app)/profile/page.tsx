"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  X,
  Search,
  Plus,
  Check,
  Clock,
  Loader,
} from "lucide-react";

// Mockup user data
const userProfile = {
  id: "USR-001",
  firstName: "Dr. Alain",
  lastName: "Benali",
  username: "@alain.benali",
  avatar: "AB",
  specialty: "Chirurgie générale",
  email: "alain.benali@hospital.fr",
  phone: "+33 (0)6 12 34 56 78",
  address: "42 Rue de la Paix, 75000 Paris",
  bio: "Chirurgien spécialisé en chirurgie digestive et oncologique. 15+ ans d'expérience.",
  joinedDate: "2018-03-15",
};

interface TeamMemberUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  specialty: string;
}

interface TeamMember {
  id: string;
  name: string;
  members: number;
  joined?: boolean;
  requestPending?: boolean;
  description: string;
  teamMembers?: TeamMemberUser[];
}

const availableTeams: TeamMember[] = [
  {
    id: "TEAM-001",
    name: "Service Urologie B",
    members: 24,
    joined: true,
    description: "Équipe de chirurgie urologique",
    teamMembers: [
      { id: "M1", name: "Dr. Alain Benali", avatar: "AB", role: "Chef de service", specialty: "Chirurgien urologue" },
      { id: "M2", name: "Dr. Marie Dupont", avatar: "MD", role: "Chirurgien", specialty: "Chirurgienne urologue" },
      { id: "M3", name: "Dr. Jean Martin", avatar: "JM", role: "Chirurgien", specialty: "Chirurgien urologue" },
      { id: "M4", name: "IDE Sarah Laurent", avatar: "SL", role: "Infirmière", specialty: "Infirmière bloc" },
      { id: "M5", name: "IDE Claire Moreau", avatar: "CM", role: "Infirmière", specialty: "Infirmière secteur" },
      { id: "M6", name: "Dr. Pierre Lefebvre", avatar: "PL", role: "Chirurgien", specialty: "Chirurgien urologue" },
    ],
  },
  {
    id: "TEAM-002",
    name: "Chirurgie digestive",
    members: 18,
    joined: true,
    description: "Spécialité de chirurgie de l'appareil digestif",
    teamMembers: [
      { id: "M7", name: "Dr. Philippe Dupont", avatar: "PD", role: "Chef de service", specialty: "Chirurgien digestif" },
      { id: "M8", name: "Dr. Luc Michel", avatar: "LM", role: "Chirurgien", specialty: "Chirurgien digestif" },
      { id: "M9", name: "Dr. Fabrice Leroy", avatar: "FL", role: "Chirurgien", specialty: "Chirurgien digestif" },
      { id: "M10", name: "IDE Marc Bertrand", avatar: "MB", role: "Infirmier", specialty: "Infirmier bloc" },
      { id: "M11", name: "Dr. Stéphanie Adam", avatar: "SA", role: "Chirurgienne", specialty: "Chirurgienne digestive" },
    ],
  },
  {
    id: "TEAM-003",
    name: "Oncologie chirurgicale",
    members: 12,
    joined: false,
    requestPending: false,
    description: "Équipe dédiée à la chirurgie oncologique",
    teamMembers: [
      { id: "M12", name: "Dr. Thomas Evans", avatar: "TE", role: "Chef de service", specialty: "Chirurgien oncologue" },
      { id: "M13", name: "Dr. Sandra Moreau", avatar: "SM", role: "Chirurgienne", specialty: "Chirurgienne oncologue" },
      { id: "M14", name: "Dr. Nicolas Bernard", avatar: "NB", role: "Chirurgien", specialty: "Chirurgien oncologue" },
      { id: "M15", name: "IDE Julie Roux", avatar: "JR", role: "Infirmière", specialty: "Infirmière onco" },
    ],
  },
  {
    id: "TEAM-004",
    name: "Chirurgie vasculaire",
    members: 15,
    joined: false,
    requestPending: true,
    description: "Spécialité de la chirurgie vasculaire",
    teamMembers: [
      { id: "M16", name: "Dr. Robert Lefevre", avatar: "RL", role: "Chef de service", specialty: "Chirurgien vasculaire" },
      { id: "M17", name: "Dr. Isabelle Gillet", avatar: "IG", role: "Chirurgienne", specialty: "Chirurgienne vasculaire" },
      { id: "M18", name: "Dr. Xavier Perrin", avatar: "XP", role: "Chirurgien", specialty: "Chirurgien vasculaire" },
      { id: "M19", name: "IDE Dominique Fournier", avatar: "DF", role: "Infirmier", specialty: "Infirmier vascu" },
    ],
  },
  {
    id: "TEAM-005",
    name: "Traumatologie",
    members: 20,
    joined: false,
    requestPending: false,
    description: "Équipe de traumatologie et orthopédie",
    teamMembers: [
      { id: "M20", name: "Dr. David Rousseau", avatar: "DR", role: "Chef de service", specialty: "Chirurgien traumato" },
      { id: "M21", name: "Dr. Nathalie Beaumont", avatar: "NB", role: "Chirurgienne", specialty: "Chirurgienne traumato" },
      { id: "M22", name: "Dr. Olivier Sanchez", avatar: "OS", role: "Chirurgien", specialty: "Chirurgien ortho" },
      { id: "M23", name: "IDE François Dubois", avatar: "FD", role: "Infirmier", specialty: "Infirmier bloc" },
    ],
  },
];

// Simple pie chart component
function PieChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
      <svg width="150" height="150" viewBox="0 0 150 150" className="drop-shadow-sm">
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          currentAngle = endAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = 75 + 50 * Math.cos(startRad);
          const y1 = 75 + 50 * Math.sin(startRad);
          const x2 = 75 + 50 * Math.cos(endRad);
          const y2 = 75 + 50 * Math.sin(endRad);

          const largeArc = sliceAngle > 180 ? 1 : 0;
          const pathData = [
            `M 75 75`,
            `L ${x1} ${y1}`,
            `A 50 50 0 ${largeArc} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ");

          return <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />;
        })}
      </svg>
      <div className="space-y-1">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600">{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar chart component
function BarChart({ data, title, yLabel }: { data: { label: string; value: number }[]; title: string; yLabel: string }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const barHeight = 120;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
      <div className="flex items-end justify-around h-40 gap-2 px-2">
        {data.map((item) => {
          const height = (item.value / maxValue) * barHeight;
          return (
            <div key={item.label} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all hover:opacity-80"
                style={{ height: `${height}px` }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-slate-600 text-center truncate">{item.label}</span>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500 text-center">{yLabel}</div>
    </div>
  );
}

const hospitals = [
  { id: "H1", name: "Hôpital Central Paris" },
  { id: "H2", name: "Hôpital Universitaire Lyon" },
  { id: "H3", name: "Hôpital Régional Marseille" },
  { id: "H4", name: "Clinique Private Bordeaux" },
];

const services = [
  { id: "S1", name: "Chirurgie générale" },
  { id: "S2", name: "Chirurgie digestive" },
  { id: "S3", name: "Urologie" },
  { id: "S4", name: "Cardiologie" },
  { id: "S5", name: "Orthopédie" },
  { id: "S6", name: "Neurochirurgie" },
  { id: "S7", name: "Oncologie" },
  { id: "S8", name: "Traumatologie" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "equipes" | "statistiques">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTeams, setSearchTeams] = useState("");
  const [teams, setTeams] = useState(availableTeams);
  const [userTeams, setUserTeams] = useState(
    availableTeams.filter((team) => team.joined)
  );

  // Create team modal
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamCreated, setTeamCreated] = useState(false);

  // Personal info form
  const [personalInfo, setPersonalInfo] = useState(userProfile);

  const handleSavePersonal = () => {
    setIsEditing(false);
    // In a real app, this would save to backend
  };

  const handleJoinTeam = (teamId: string) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId ? { ...team, requestPending: true } : team
      )
    );
  };

  const handleCreateTeam = async () => {
    if (!selectedHospital || !selectedService) return;

    setIsCreatingTeam(true);
    // Simulate API call to check if service exists
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate successful team creation
    const serviceName = services.find((s) => s.id === selectedService)?.name || "";
    const hospitalName = hospitals.find((h) => h.id === selectedHospital)?.name || "";

    const newTeam: TeamMember = {
      id: `TEAM-${Date.now()}`,
      name: `${serviceName} - ${hospitalName}`,
      description: `Équipe créée pour ${serviceName}`,
      members: 1,
      joined: true,
      teamMembers: [
        { id: "ME", name: "Dr. Alain Benali", avatar: "AB", role: "Admin", specialty: "Chef de service" },
      ],
    };

    setTeams([...teams, newTeam]);
    setUserTeams([...userTeams, newTeam]);
    setTeamCreated(true);
    setIsCreatingTeam(false);

    // Reset form after 1.5 seconds
    setTimeout(() => {
      setSelectedHospital("");
      setSelectedService("");
      setTeamCreated(false);
      setIsCreateTeamOpen(false);
    }, 1500);
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTeams.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTeams.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Profile Header Card */}
      <Card className="border-none bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex-shrink-0">
              <span className="text-2xl font-semibold">{personalInfo.avatar}</span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {personalInfo.firstName} {personalInfo.lastName}
                  </h1>
                  <p className="text-sm text-slate-600">{personalInfo.username}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  {personalInfo.specialty}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  {personalInfo.email}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("personal")}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition",
            activeTab === "personal"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          )}
        >
          Personnel
        </button>
        <button
          onClick={() => setActiveTab("equipes")}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition",
            activeTab === "equipes"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          )}
        >
          Équipes
        </button>
        <button
          onClick={() => setActiveTab("statistiques")}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition",
            activeTab === "statistiques"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          )}
        >
          Statistiques
        </button>
      </div>

      {/* Personal Tab */}
      {activeTab === "personal" && (
        <div className="space-y-6">
          <Card className="border-none bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de profil et vos préférences
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "ghost" : "primary"}
                onClick={() => (isEditing ? handleSavePersonal() : setIsEditing(true))}
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                ) : (
                  "Modifier"
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Prénom</label>
                  <input
                    disabled={!isEditing}
                    value={personalInfo.firstName}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Nom</label>
                  <input
                    disabled={!isEditing}
                    value={personalInfo.lastName}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    disabled={!isEditing}
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, email: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                  <input
                    disabled={!isEditing}
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, phone: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Spécialité</label>
                  <input
                    disabled={!isEditing}
                    value={personalInfo.specialty}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, specialty: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Adresse</label>
                  <input
                    disabled={!isEditing}
                    value={personalInfo.address}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, address: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700">Biographie</label>
                <textarea
                  disabled={!isEditing}
                  value={personalInfo.bio}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, bio: e.target.value })
                  }
                  rows={4}
                  className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card className="border-none bg-white/90">
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">Notifications par email</p>
                  <p className="text-sm text-slate-600">Recevoir les mises à jour importantes</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">Notifications push</p>
                  <p className="text-sm text-slate-600">Alertes temps réel sur l'application</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">Visibilité du profil</p>
                  <p className="text-sm text-slate-600">Rendre votre profil visible aux collègues</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Équipes Tab */}
      {activeTab === "equipes" && (
        <div className="space-y-6">
          {/* My Teams */}
          {userTeams.map((team) => (
            <Card key={team.id} className="border-none bg-white/90">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 h-fit">
                    <Check className="h-3 w-3 mr-1" />
                    Rejoint
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Team Members Grid */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Membres ({team.teamMembers?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {team.teamMembers?.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                              {member.avatar}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {member.role}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {member.specialty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Lookup Teams */}
          <Card className="border-none bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rechercher des équipes</CardTitle>
                <CardDescription>Trouvez et rejoignez d'autres équipes</CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateTeamOpen(true)}
                className="h-9 flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une équipe..."
                  value={searchTeams}
                  onChange={(e) => setSearchTeams(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-4">
                {filteredTeams
                  .filter((team) => !team.joined)
                  .map((team) => (
                    <div
                      key={team.id}
                      className="rounded-2xl border border-slate-200 hover:border-indigo-300 transition overflow-hidden"
                    >
                      <div className="p-4 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{team.name}</p>
                          <p className="text-sm text-slate-600">{team.description}</p>
                          <p className="text-xs text-slate-500 mt-2">{team.members} membres</p>
                        </div>
                        {team.requestPending ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-fit flex-shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleJoinTeam(team.id)}
                            className="h-8 flex-shrink-0"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Rejoindre
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Team Modal */}
          {isCreateTeamOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="relative">
                  <CardTitle>Créer une nouvelle équipe</CardTitle>
                  <button
                    onClick={() => {
                      setIsCreateTeamOpen(false);
                      setSelectedHospital("");
                      setSelectedService("");
                      setTeamCreated(false);
                    }}
                    className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Loading State */}
                  {isCreatingTeam && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                      <p className="text-sm text-slate-600 font-medium">Vérification de l'équipe...</p>
                    </div>
                  )}

                  {/* Success State */}
                  {teamCreated && !isCreatingTeam && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">Équipe créée avec succès!</p>
                    </div>
                  )}

                  {/* Form State */}
                  {!isCreatingTeam && !teamCreated && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Hôpital</label>
                        <select
                          value={selectedHospital}
                          onChange={(e) => setSelectedHospital(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="">Sélectionner un hôpital</option>
                          {hospitals.map((hospital) => (
                            <option key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Service</label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="">Sélectionner un service</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsCreateTeamOpen(false);
                            setSelectedHospital("");
                            setSelectedService("");
                          }}
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleCreateTeam}
                          disabled={!selectedHospital || !selectedService}
                          className="flex-1"
                        >
                          Créer l'équipe
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Statistiques Tab */}
      {activeTab === "statistiques" && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none bg-white/90">
              <CardContent className="pt-6">
                <PieChart
                  title="Répartition des consultations"
                  data={[
                    { label: "Consultations", value: 45, color: "#4f46e5" },
                    { label: "Suivis", value: 30, color: "#06b6d4" },
                    { label: "Urgences", value: 15, color: "#f59e0b" },
                    { label: "Autres", value: 10, color: "#8b5cf6" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90">
              <CardContent className="pt-6">
                <PieChart
                  title="Répartition par type d'opération"
                  data={[
                    { label: "Digestive", value: 40, color: "#ef4444" },
                    { label: "Vasculaire", value: 25, color: "#0ea5e9" },
                    { label: "Urologie", value: 20, color: "#8b5cf6" },
                    { label: "Autre", value: 15, color: "#f59e0b" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Bar Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none bg-white/90">
              <CardContent className="pt-6">
                <BarChart
                  title="Interventions par mois (6 derniers mois)"
                  yLabel="Nombre d'interventions"
                  data={[
                    { label: "Juil", value: 12 },
                    { label: "Août", value: 15 },
                    { label: "Sept", value: 18 },
                    { label: "Oct", value: 14 },
                    { label: "Nov", value: 16 },
                    { label: "Déc", value: 20 },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90">
              <CardContent className="pt-6">
                <BarChart
                  title="Taux de succès par type"
                  yLabel="Taux de succès (%)"
                  data={[
                    { label: "Digest", value: 98 },
                    { label: "Vasc", value: 96 },
                    { label: "Urol", value: 97 },
                    { label: "Trauma", value: 95 },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Progress Bars */}
          <Card className="border-none bg-white/90">
            <CardHeader>
              <CardTitle>Objectifs mensuels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Consultations</span>
                  <span className="text-sm text-slate-600">45/50</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: "90%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Interventions</span>
                  <span className="text-sm text-slate-600">28/30</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: "93%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Documentation</span>
                  <span className="text-sm text-slate-600">82/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: "82%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Formations</span>
                  <span className="text-sm text-slate-600">15/20</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-500 h-2 rounded-full transition-all"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
