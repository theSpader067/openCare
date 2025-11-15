"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  AlertCircle,
  Stethoscope,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  pendingJoinRequests,
  availableTeams,
  hospitals,
  services,
} from "@/data/profile/profile-data";
import { statuses } from "@/data/onboarding/onboarding-content";

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

interface JoinRequest {
  id: string;
  residentId: string;
  residentName: string;
  residentAvatar: string;
  residentRole: string;
  teamId: string;
  teamName: string;
  requestDate: string;
}

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

interface PersonalInfo {
  avatar: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  specialty: string;
  year:string;
  hospital: string;
  address: string;
  bio: string;
  notifyByEmail: boolean;
  notifyByPush: boolean;
  profileVisible: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"personal" | "equipes" | "statistiques">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTeams, setSearchTeams] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  // Create team modal
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamCreated, setTeamCreated] = useState(false);
  const [teamCreationError, setTeamCreationError] = useState<string | null>(null);

  // Join requests
  const [joinRequests, setJoinRequests] = useState(pendingJoinRequests);
  const [isRequestsPanelOpen, setIsRequestsPanelOpen] = useState(false);

  // Edit team modal
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamHospital, setEditTeamHospital] = useState("");
  const [editTeamService, setEditTeamService] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [teamUpdateError, setTeamUpdateError] = useState<string | null>(null);

  // Personal info form with loading state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [originalPersonalInfo, setOriginalPersonalInfo] = useState<PersonalInfo | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch user profile data and teams
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setProfileError(null);

        const response = await fetch("/api/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setPersonalInfo(data);
        setOriginalPersonalInfo(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileError("Failed to load profile. Please try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  // Fetch user's teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true);
        setTeamsError(null);

        const response = await fetch("/api/teams");

        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }

        const data = await response.json();

        // Transform teams to match UI expectations
        const transformedTeams = (data.teams || []).map((team: any) => ({
          id: team.id.toString(),
          name: team.name,
          members: team.members?.length || 0,
          joined: true,
          description: team.service ? `Service: ${team.service}` : (team.hospital ? `Hôpital: ${team.hospital}` : "Équipe"),
          teamMembers: team.members?.map((member: any) => ({
            id: member.id.toString(),
            name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
            avatar: `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase(),
            role: team.adminId === member.id ? "Admin" : "Membre",
            specialty: member.specialty || "",
          })),
        }));

        setUserTeams(transformedTeams);
        // For now, use all teams as available teams (you can add filtering logic later)
        setTeams(availableTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeamsError("Failed to load teams.");
      } finally {
        setIsLoadingTeams(false);
      }
    };

    if (status === "authenticated") {
      fetchTeams();
    }
  }, [status]);

  // Check if any data has been modified
  const hasDataChanged = (): boolean => {
    if (!originalPersonalInfo || !personalInfo) return false;

    return (
      personalInfo.firstName !== originalPersonalInfo.firstName ||
      personalInfo.lastName !== originalPersonalInfo.lastName ||
      personalInfo.username !== originalPersonalInfo.username ||
      personalInfo.phone !== originalPersonalInfo.phone ||
      personalInfo.specialty !== originalPersonalInfo.specialty ||
      personalInfo.hospital !== originalPersonalInfo.hospital ||
      personalInfo.year !== originalPersonalInfo.year ||
      personalInfo.address !== originalPersonalInfo.address ||
      personalInfo.bio !== originalPersonalInfo.bio ||
      personalInfo.notifyByEmail !== originalPersonalInfo.notifyByEmail ||
      personalInfo.notifyByPush !== originalPersonalInfo.notifyByPush ||
      personalInfo.profileVisible !== originalPersonalInfo.profileVisible
    );
  };

  const handleSavePersonal = async () => {
    if (!personalInfo) return;

    // Check if any data has changed
    if (!hasDataChanged()) {
      // No changes, just exit edit mode
      setIsEditing(false);
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileError(null);

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          username: personalInfo.username,
          phone: personalInfo.phone,
          specialty: personalInfo.specialty,
          hospital: personalInfo.hospital,
          year: personalInfo.year,
          address: personalInfo.address,
          bio: personalInfo.bio,
          notifyByEmail: personalInfo.notifyByEmail,
          notifyByPush: personalInfo.notifyByPush,
          profileVisible: personalInfo.profileVisible,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Update original data to match current data
      setOriginalPersonalInfo(personalInfo);

      // Show success message
      setSaveSuccess(true);
      setIsEditing(false);

      // Hide success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileError("Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleJoinTeam = (teamId: string) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId ? { ...team, requestPending: true } : team
      )
    );
  };

  const handleCreateTeam = async () => {
    if (!selectedTeamName || !selectedHospital || !selectedService) return;

    try {
      setIsCreatingTeam(true);
      setTeamCreationError(null);

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedTeamName,
          hospital: selectedHospital,
          service: selectedService,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create team");
      }

      const data = await response.json();
      const newTeam = data.team;

      // Transform the team data to match the TeamMember interface
      const transformedTeam = {
        id: newTeam.id.toString(),
        name: newTeam.name,
        members: newTeam.members?.length || 1,
        joined: true,
        description: newTeam.service ? `Service: ${newTeam.service}` : "Nouvelle équipe",
        teamMembers: newTeam.members?.map((member: any) => ({
          id: member.id.toString(),
          name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
          avatar: `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase(),
          role: newTeam.adminId === member.id ? "Admin" : "Membre",
          specialty: member.specialty || "",
        })),
      };

      setUserTeams([...userTeams, transformedTeam]);
      setTeamCreated(true);
      setIsCreatingTeam(false);

      // Reset form after 1.5 seconds
      setTimeout(() => {
        setSelectedTeamName("");
        setSelectedHospital("");
        setSelectedService("");
        setTeamCreated(false);
        setIsCreateTeamOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating team:", error);
      setTeamCreationError(
        error instanceof Error ? error.message : "Failed to create team"
      );
      setIsCreatingTeam(false);
    }
  };

  const handleAcceptJoinRequest = (requestId: string) => {
    setJoinRequests(joinRequests.filter((req) => req.id !== requestId));
    // In a real app, this would add the resident to the team
  };

  const handleDeclineJoinRequest = (requestId: string) => {
    setJoinRequests(joinRequests.filter((req) => req.id !== requestId));
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTeams.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTeams.toLowerCase())
  );

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <Card className="border-none bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-20">
              <Loader className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileError || !personalInfo) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <Card className="border-none bg-red-50 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">{profileError || "Failed to load profile"}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <div className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4 text-indigo-600" />
                  {personalInfo.year}
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
          {profileError && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{profileError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 animate-in fade-in">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">Profil mis à jour avec succès!</p>
            </div>
          )}
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
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : isEditing ? (
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

              <div className="grid gap-4 md:grid-cols-3">
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
                  <label className="text-sm font-semibold text-slate-700">Hôpital</label>
                  <input
                    disabled={!isEditing}
                    value={personalInfo.hospital}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, hospital: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Année / Statut</label>
                  <select
                    disabled={!isEditing}
                    value={personalInfo.year}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, year: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Sélectionner un statut</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-1">
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
                <input
                  type="checkbox"
                  checked={personalInfo.notifyByEmail}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      notifyByEmail: e.target.checked,
                    })
                  }
                  disabled={!isEditing}
                  className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">Notifications push</p>
                  <p className="text-sm text-slate-600">Alertes temps réel sur l'application</p>
                </div>
                <input
                  type="checkbox"
                  checked={personalInfo.notifyByPush}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      notifyByPush: e.target.checked,
                    })
                  }
                  disabled={!isEditing}
                  className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">Visibilité du profil</p>
                  <p className="text-sm text-slate-600">Rendre votre profil visible aux collègues</p>
                </div>
                <input
                  type="checkbox"
                  checked={personalInfo.profileVisible}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      profileVisible: e.target.checked,
                    })
                  }
                  disabled={!isEditing}
                  className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Équipes Tab */}
      {activeTab === "equipes" && (
        <div className="space-y-6">
          {/* Create Team Button - Top */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setIsCreateTeamOpen(true);
                setTeamCreationError(null);
              }}
              className="h-10 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une équipe
            </Button>
          </div>

          {/* Mobile Search Bar - Always visible */}
          <div className="lg:hidden">
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

            {/* Mobile Search Results */}
            {searchTeams && (
              <div className="space-y-4 mt-4">
                {filteredTeams
                  .filter((team) => !team.joined)
                  .length > 0 ? (
                  filteredTeams
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
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Aucune équipe trouvée</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Large Screen Dynamic Search */}
          <div className="hidden lg:block">
            <Card className="border-none bg-white/90">
              <CardHeader>
                <CardTitle>Rechercher des équipes</CardTitle>
                <CardDescription>Trouvez et rejoignez d'autres équipes (tapez pour rechercher)</CardDescription>
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

                {/* Large Screen Search Results - Only show when searching */}
                {searchTeams && (
                  <div className="space-y-4">
                    {filteredTeams
                      .filter((team) => !team.joined)
                      .length > 0 ? (
                      filteredTeams
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
                        ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">Aucune équipe trouvée</p>
                      </div>
                    )}
                  </div>
                )}

                {!searchTeams && (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Commencez à taper pour rechercher des équipes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Join Requests Panel - Large Screen */}
          {joinRequests.length > 0 && (
            <div className="hidden lg:block">
              <Card className="border-none bg-white/90 border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Demandes d'adhésion en attente
                  </CardTitle>
                  <CardDescription>Residents demandant à rejoindre votre équipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-200 hover:bg-amber-50/50 transition"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {request.residentAvatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {request.residentName}
                          </p>
                          <p className="text-xs text-slate-600">
                            {request.residentRole} • {request.teamName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Demandé le {new Date(request.requestDate).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptJoinRequest(request.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeclineJoinRequest(request.id)}
                          className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sliding Panel for Requests - Mobile */}
          {isRequestsPanelOpen && joinRequests.length > 0 && (
            <div className="lg:hidden space-y-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Demandes d'adhésion ({joinRequests.length})
              </h3>
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-white border border-amber-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {request.residentAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {request.residentName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {request.residentRole}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 pl-10">
                    {request.teamName}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptJoinRequest(request.id)}
                      className="flex-1 h-8"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accepter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeclineJoinRequest(request.id)}
                      className="flex-1 h-8 text-rose-600 hover:bg-rose-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Join Requests Badge for Mobile - Collapsible trigger */}
          {joinRequests.length > 0 && (
            <div className="lg:hidden">
              <button
                onClick={() => setIsRequestsPanelOpen(!isRequestsPanelOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-900">
                    {joinRequests.length} demande{joinRequests.length > 1 ? "s" : ""} en attente
                  </span>
                </div>
                <span className="text-amber-600">{isRequestsPanelOpen ? "▼" : "▶"}</span>
              </button>
            </div>
          )}

          {/* My Teams */}
          {userTeams.length > 0 ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Mes Équipes ({userTeams.length})</h2>
              </div>

              {/* Teams List */}
              <div className="space-y-4">
                {userTeams.map((team, idx) => {
                  const colors = [
                    { bg: "from-stone-600 to-stone-700", light: "bg-stone-100", text: "text-stone-900" },
                    { bg: "from-slate-600 to-slate-700", light: "bg-slate-100", text: "text-slate-900" },
                    { bg: "from-zinc-600 to-zinc-700", light: "bg-zinc-100", text: "text-zinc-900" },
                    { bg: "from-gray-600 to-gray-700", light: "bg-gray-100", text: "text-gray-900" },
                  ];
                  const colorScheme = colors[idx % colors.length];
                  const adminCount = team.teamMembers?.filter((m: any) => m.role === "Admin").length || 0;
                  const isAdmin = team.teamMembers?.some((m: any) => m.role === "Admin" && m.id === (personalInfo?.avatar));

                  return (
                    <div
                      key={team.id}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 bg-white"
                    >
                      {/* Header with Info */}
                      <div className={`bg-gradient-to-r ${colorScheme.bg} px-5 py-4 flex items-start justify-between gap-4`}>
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className={`h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold text-base">{team.name}</h3>
                            {(team.hospital || team.service) && (
                              <div className="flex items-center gap-2 mt-1.5 text-xs text-white/70">
                                {team.hospital && <span>{team.hospital}</span>}
                                {team.hospital && team.service && <span>•</span>}
                                {team.service && <span>{team.service}</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit Button - Only visible if user is admin */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingTeamId(team.id);
                              setEditTeamName(team.name);
                              setEditTeamHospital(team.hospital || "");
                              setEditTeamService(team.service || "");
                              setSelectedMembers(new Set(team.teamMembers?.map((m: any) => m.id) || []));
                              setIsEditTeamOpen(true);
                              setTeamUpdateError(null);
                            }}
                            className="flex-shrink-0 p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Members Section */}
                      <div className="px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Membres ({team.teamMembers?.length || 0})</p>
                        </div>

                        <div className="space-y-2">
                          {team.teamMembers?.map((member: any) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                            >
                              {/* Avatar */}
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-stone-500 to-stone-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {member.avatar}
                              </div>

                              {/* Name and Status */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900">{member.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    member.role === "Admin"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}>
                                    {member.role === "Admin" ? "⭐ Admin" : "👤 Membre"}
                                  </span>
                                  {member.specialty && (
                                    <span className="text-xs text-slate-600">{member.specialty}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <Briefcase className="h-10 w-10 text-slate-400 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Aucune équipe</h3>
              <p className="text-sm text-slate-600 mb-4">Créez votre première équipe</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsCreateTeamOpen(true);
                  setTeamCreationError(null);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer
              </Button>
            </div>
          )}

          {/* Create Team Modal */}
          {isCreateTeamOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="relative">
                  <CardTitle>Créer une nouvelle équipe</CardTitle>
                  <button
                    onClick={() => {
                      setIsCreateTeamOpen(false);
                      setSelectedTeamName("");
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
                  {/* Error State */}
                  {teamCreationError && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{teamCreationError}</p>
                    </div>
                  )}

                  {/* Loading State */}
                  {isCreatingTeam && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                      <p className="text-sm text-slate-600 font-medium">Création de l'équipe...</p>
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
                        <label className="text-sm font-semibold text-slate-700">Nom de l'équipe</label>
                        <input
                          type="text"
                          value={selectedTeamName}
                          onChange={(e) => setSelectedTeamName(e.target.value)}
                          placeholder="Ex. Chirurgie B"
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Hôpital</label>
                        <input
                          value={selectedHospital}
                          placeholder="hôpital"
                          onChange={(e) => setSelectedHospital(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                       
                        />
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
                            <option key={service.id} value={service.name}>
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
                            setSelectedTeamName("");
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
                          disabled={!selectedTeamName || !selectedHospital || !selectedService || isCreatingTeam}
                          className="flex-1"
                        >
                          {isCreatingTeam ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Création...
                            </>
                          ) : (
                            "Créer l'équipe"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Team Modal */}
          {isEditTeamOpen && editingTeamId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="relative">
                  <CardTitle>Modifier l'équipe</CardTitle>
                  <button
                    onClick={() => {
                      setIsEditTeamOpen(false);
                      setEditingTeamId(null);
                      setEditTeamName("");
                      setEditTeamHospital("");
                      setEditTeamService("");
                      setSelectedMembers(new Set());
                    }}
                    className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Error State */}
                  {teamUpdateError && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{teamUpdateError}</p>
                    </div>
                  )}

                  {/* Team Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Détails de l'équipe</h3>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Nom de l'équipe</label>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        placeholder="Ex. Chirurgie B"
                        className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Hôpital</label>
                        <input
                          value={editTeamHospital}
                          placeholder="Nom de l'hôpital"
                          onChange={(e) => setEditTeamHospital(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Service</label>
                        <input
                          value={editTeamService}
                          placeholder="Nom du service"
                          onChange={(e) => setEditTeamService(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <span className="font-semibold">💡 Astuce:</span> Les membres non sélectionnés seront supprimés de l'équipe.
                      </p>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Membres</h3>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {userTeams.find(t => t.id === editingTeamId)?.teamMembers?.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.has(member.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedMembers);
                              if (e.target.checked) {
                                newSelected.add(member.id);
                              } else {
                                newSelected.delete(member.id);
                              }
                              setSelectedMembers(newSelected);
                            }}
                            className="h-4 w-4 rounded cursor-pointer"
                          />

                          {/* Member Info */}
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-stone-500 to-stone-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {member.avatar}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{member.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                member.role === "Admin"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {member.role === "Admin" ? "⭐ Admin" : "👤 Membre"}
                              </span>
                            </div>
                          </div>

                          {/* Will be deleted indicator */}
                          {!selectedMembers.has(member.id) && (
                            <div className="flex-shrink-0 px-2 py-1 rounded bg-red-50 border border-red-200">
                              <p className="text-xs text-red-700 font-semibold">À supprimer</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditTeamOpen(false);
                        setEditingTeamId(null);
                        setEditTeamName("");
                        setEditTeamHospital("");
                        setEditTeamService("");
                        setSelectedMembers(new Set());
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        // TODO: Implement team update API call
                        setIsEditTeamOpen(false);
                      }}
                      disabled={!editTeamName || isUpdatingTeam}
                      className="flex-1"
                    >
                      {isUpdatingTeam ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Modification...
                        </>
                      ) : (
                        "Enregistrer les modifications"
                      )}
                    </Button>
                  </div>
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
