"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
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
  MoreVertical,
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
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"personal" | "equipes" | "statistiques">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTeams, setSearchTeams] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  // Search teams state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Create team modal
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamCreated, setTeamCreated] = useState(false);
  const [teamCreationError, setTeamCreationError] = useState<string | null>(null);

  // Join requests
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isRequestsPanelOpen, setIsRequestsPanelOpen] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Edit team modal
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamHospital, setEditTeamHospital] = useState("");
  const [editTeamService, setEditTeamService] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [teamUpdateError, setTeamUpdateError] = useState<string | null>(null);

  // Delete team modal
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [teamDeleteError, setTeamDeleteError] = useState<string | null>(null);

  // Team menu dropdown
  const [openMenuTeamId, setOpenMenuTeamId] = useState<string | null>(null);

  // Pending requests dropdown
  const [isPendingRequestsOpen, setIsPendingRequestsOpen] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

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
          throw new Error(t("profile.errors.fetchProfile"));
        }

        const data = await response.json();
        setPersonalInfo(data);
        setOriginalPersonalInfo(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileError(t("profile.errors.loadProfile"));
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, t]);

  // Fetch user's teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true);
        setTeamsError(null);

        const response = await fetch("/api/teams");

        if (!response.ok) {
          throw new Error(t("profile.errors.fetchTeams"));
        }

        const data = await response.json();

        // Transform teams to match UI expectations
        const transformedTeams = (data.teams || []).map((team: any) => ({
          id: team.id.toString(),
          name: team.name,
          members: team.members?.length || 0,
          joined: true,
          adminId: team.adminId?.toString(),
          hospital: team.hospital,
          service: team.service,
          description: team.service ? `Service: ${team.service}` : (team.hospital ? `Hôpital: ${team.hospital}` : "Équipe"),
          teamMembers: team.members?.map((member: any) => ({
            id: member.id.toString(),
            name: member.username? `${member.username || ""} ` : member.firstName && member.lastName? `${member.firstName || ""} ${member.lastName || ""}`.trim(): 'N/A',
            avatar: `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase(),
            role: team.adminId === member.id ? "Admin" : "Membre",
            specialty: member.specialty || "",
          })),
        }));

        console.log(transformedTeams.map((t : any)=>t.teamMembers.map((m:any)=>m.name)))


        setUserTeams(transformedTeams);
        // For now, use all teams as available teams (you can add filtering logic later)
        setTeams(availableTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeamsError(t("profile.errors.loadTeams"));
      } finally {
        setIsLoadingTeams(false);
      }
    };

    if (status === "authenticated") {
      fetchTeams();
      fetchTeamRequests();
    }
  }, [status, t]);

  // Fetch pending team requests
  const fetchTeamRequests = async () => {
    setIsLoadingRequests(true);
    setRequestsError(null);

    try {
      const response = await fetch("/api/team-requests/pending");

      if (!response.ok) {
        throw new Error(t("profile.errors.fetchRequests"));
      }

      const data = await response.json();
      setJoinRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching team requests:", error);
      setRequestsError(t("profile.errors.loadRequests"));
      setJoinRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

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
        throw new Error(t("profile.errors.saveProfile"));
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
      setProfileError(t("profile.errors.saveProfileRetry"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    setJoiningTeamId(teamId);

    try {
      const response = await fetch("/api/team-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error joining team:", error);
        setJoiningTeamId(null);
        return;
      }

      const data = await response.json();

      // Mark team as sent request
      setSentRequests(new Set([...sentRequests, teamId]));

      setJoiningTeamId(null);
    } catch (error) {
      console.error("Error joining team:", error);
      setJoiningTeamId(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);

    try {
      const response = await fetch(`/api/team-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("profile.errors.acceptRequest"));
      }

      // Remove the request from the list
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId));

      // Refresh teams list to show the new member added
      const teamsResponse = await fetch("/api/teams");
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setUserTeams(teamsData.teams);
      }

      setProcessingRequestId(null);
    } catch (error) {
      console.error("Error accepting request:", error);
      setProcessingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);

    try {
      const response = await fetch(`/api/team-requests/${requestId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("profile.errors.declineRequest"));
      }

      // Remove the request from the list
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId));

      setProcessingRequestId(null);
    } catch (error) {
      console.error("Error declining request:", error);
      setProcessingRequestId(null);
    }
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
        throw new Error(error.error || t("profile.errors.createTeam"));
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
        error instanceof Error ? error.message : t("profile.errors.createTeam")
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

  const handleSearchTeams = async () => {
    if (!searchTeams.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/teams/search?q=${encodeURIComponent(searchTeams)}`
      );

      if (!response.ok) {
        throw new Error(t("profile.errors.searchTeams"));
      }

      const data = await response.json();
      setSearchResults(data.teams || []);
    } catch (error) {
      console.error("Error searching teams:", error);
      setSearchError(
        error instanceof Error ? error.message : t("profile.errors.searchTeams")
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

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
                <p className="font-semibold">{profileError || t("profile.errors.loadProfile")}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  {t("profile.buttons.retry")}
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
          {t("profile.tabs.personal")}
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
          {t("profile.tabs.teams")}
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
          {t("profile.tabs.statistics")}
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
              <p className="text-sm font-medium">{t("profile.messages.profileUpdatedSuccess")}</p>
            </div>
          )}
          <Card className="border-none bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("profile.sections.personalInfo")}</CardTitle>
                <CardDescription>
                  {t("profile.sections.personalInfoDesc")}
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
                    {t("profile.buttons.saving")}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("profile.buttons.save")}
                  </>
                ) : (
                  t("profile.buttons.edit")
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.firstName")}</label>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.lastName")}</label>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.email")}</label>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.phone")}</label>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.specialty")}</label>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.hospital")}</label>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.yearStatus")}</label>
                  <select
                    disabled={!isEditing}
                    value={personalInfo.year}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, year: e.target.value })
                    }
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">{t("profile.placeholders.selectStatus")}</option>
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
                  <label className="text-sm font-semibold text-slate-700">{t("profile.labels.address")}</label>
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
                <label className="text-sm font-semibold text-slate-700">{t("profile.labels.bio")}</label>
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
              <CardTitle>{t("profile.sections.preferences")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">{t("profile.labels.emailNotifications")}</p>
                  <p className="text-sm text-slate-600">{t("profile.labels.emailNotificationsDesc")}</p>
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
                  <p className="font-medium text-slate-900">{t("profile.labels.pushNotifications")}</p>
                  <p className="text-sm text-slate-600">{t("profile.labels.pushNotificationsDesc")}</p>
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
                  <p className="font-medium text-slate-900">{t("profile.labels.profileVisibility")}</p>
                  <p className="text-sm text-slate-600">{t("profile.labels.profileVisibilityDesc")}</p>
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
          {/* Two-column layout: Search on right, Teams on left (on XL screens) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* My Teams - Left side on XL, Full width on smaller screens */}
            <div className="xl:order-2">
              {userTeams.length > 0 ? (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{t("profile.sections.myTeams", { count: userTeams.length })}</h2>
                  </div>

                  {/* Teams List */}
                  <div className="space-y-4 mb-4">
                    {userTeams.map((team, idx) => {
                      const colors = [
                        { bg: "from-indigo-600 to-indigo-700", light: "bg-indigo-100", text: "text-indigo-900" },
                        { bg: "from-purple-600 to-purple-700", light: "bg-purple-100", text: "text-purple-900" },
                        { bg: "from-blue-600 to-blue-700", light: "bg-blue-100", text: "text-blue-900" },
                        { bg: "from-violet-600 to-violet-700", light: "bg-violet-100", text: "text-violet-900" },
                      ];
                      const colorScheme = colors[idx % colors.length];
                      const adminCount = team.teamMembers?.filter((m: any) => m.role === "Admin").length || 0;
                      const isAdmin = team.adminId === (session?.user as any).id;
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
                              <div className="min-w-0 flex-1 my-auto">
                                <h1 className="text-white font-semibold my-auto text-2xl">{team.name}</h1>
                                {(team.hospital || team.service) && (
                                  <div className="flex items-center gap-2 mt-1.5 text-xs text-white/70">
                                    {team.hospital && <span>{team.hospital}</span>}
                                    {team.hospital && team.service && <span>•</span>}
                                    {team.service && <span>{team.service}</span>}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Menu Button - Only visible if user is admin */}
                            {isAdmin && (
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenuTeamId(openMenuTeamId === team.id ? null : team.id)}
                                  className="flex-shrink-0 p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition hover:cursor-pointer"
                                >
                                  <MoreVertical className="h-5 w-5" />
                                </button>

                                {/* Dropdown Menu */}
                                {openMenuTeamId === team.id && (
                                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                                    <button
                                      onClick={() => {
                                        setEditingTeamId(team.id);
                                        setEditTeamName(team.name);
                                        setEditTeamHospital(team.hospital || "");
                                        setEditTeamService(team.service || "");
                                        setSelectedMembers(new Set(team.teamMembers?.map((m: any) => m.id) || []));
                                        setIsEditTeamOpen(true);
                                        setTeamUpdateError(null);
                                        setOpenMenuTeamId(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                      {t("profile.buttons.editTeam")}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeletingTeamId(team.id);
                                        setIsDeleteTeamOpen(true);
                                        setTeamDeleteError(null);
                                        setOpenMenuTeamId(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 transition border-t border-slate-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      {t("profile.buttons.deleteTeam")}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Members Section */}
                          <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-200">
                            <div className="space-y-3">
                              {team.teamMembers && team.teamMembers.length > 0 ? (
                                team.teamMembers.map((member: any) => (
                                  <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
                                      {member.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <span>{member.specialty}</span>
                                        {member.role === "Admin" && (
                                          <Badge className="bg-indigo-100 text-indigo-700 h-fit text-xs">Admin</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-500 text-center py-2">{t("profile.messages.noMembers")}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">{t("profile.messages.noTeams")}</p>
                </div>
              )}
            </div>

            {/* Search Component - Right side on XL, Full width on smaller screens */}
            <div className="xl:order-1">
              <Card className="border-none bg-white/90 sticky top-20">
                <CardHeader className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{t("profile.sections.searchTeams")}</CardTitle>
                    <CardDescription>{t("profile.sections.searchTeamsDesc")}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Pending Requests Button */}
                  {joinRequests.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setIsPendingRequestsOpen(!isPendingRequestsOpen)}
                        className="relative p-2 rounded-lg border border-slate-200 hover:bg-amber-50 text-amber-600 transition"
                        title={t("profile.labels.pendingRequests", { count: joinRequests.length })}
                      >
                        <Clock className="h-5 w-5" />
                        {joinRequests.length > 0 && (
                          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            {joinRequests.length}
                          </span>
                        )}
                      </button>

                      {/* Pending Requests Dropdown */}
                      {isPendingRequestsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">

                          {/* Requests List */}
                          <div className="max-h-96 overflow-y-auto">
                            {joinRequests.map((request) => (
                              <div key={request.id} className="border-b border-slate-100 last:border-b-0 p-4 hover:bg-slate-50 transition">
                                {/* Header with avatar and name */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                                    {request.residentAvatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{request.residentName}</p>
                                    <p className="text-xs text-slate-600 truncate">{request.specialty} → {request.teamName}</p>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptRequest(request.id)}
                                    disabled={processingRequestId === request.id}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("profile.buttons.accept")}
                                  >
                                    {processingRequestId === request.id ? (
                                      <div className="h-4 w-4 rounded-full border-2 border-emerald-300 border-t-emerald-700 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                    {processingRequestId === request.id ? "..." : t("profile.buttons.accept")}
                                  </button>
                                  <button
                                    onClick={() => handleDeclineRequest(request.id)}
                                    disabled={processingRequestId === request.id}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("profile.buttons.decline")}
                                  >
                                    {processingRequestId === request.id ? (
                                      <div className="h-4 w-4 rounded-full border-2 border-red-300 border-t-red-700 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                    {processingRequestId === request.id ? "..." : t("profile.buttons.decline")}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Create Team Button */}
                  <button
                    onClick={() => {
                      setIsCreateTeamOpen(true);
                      setTeamCreationError(null);
                    }}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-600 transition"
                    title={t("profile.buttons.quickCreate")}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input with Button */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t("profile.placeholders.searchTeams")}
                      value={searchTeams}
                      onChange={(e) => setSearchTeams(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchTeams();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <button
                    onClick={handleSearchTeams}
                    disabled={isSearching || !searchTeams.trim()}
                    className="flex-shrink-0 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                    title={t("profile.buttons.search")}
                  >
                    {isSearching ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">{t("profile.errors.searchTitle")}</p>
                      <p className="text-sm text-red-700">{searchError}</p>
                    </div>
                  </div>
                )}

                {/* Loading Skeletons */}
                {isSearching && (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-200 p-4 bg-slate-50 animate-pulse"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="h-5 bg-slate-200 rounded w-40"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 rounded w-24"></div>
                          </div>
                          <div className="h-8 bg-slate-200 rounded w-24 flex-shrink-0"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Results */}
                {hasSearched && !isSearching && (
                  <div className="space-y-4">
                    {searchResults.length > 0 ? (
                      searchResults.map((team) => (
                        <div
                          key={team.id}
                          className="rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition overflow-hidden"
                        >
                          <div className="p-4 flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{team.name}</p>
                              <p className="text-sm text-slate-600">{team.description}</p>
                              <p className="text-xs text-slate-500 mt-2">{team.members} {t("profile.labels.members")}</p>
                            </div>
                            {sentRequests.has(team.id) ? (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-fit flex-shrink-0">
                                <Check className="h-3 w-3 mr-1" />
                                {t("profile.labels.sent")}
                              </Badge>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleJoinTeam(team.id)}
                                disabled={joiningTeamId === team.id}
                                className="h-8 flex-shrink-0"
                              >
                                {joiningTeamId === team.id ? (
                                  <>
                                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                                    {t("profile.buttons.sending")}
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3 mr-1" />
                                    {t("profile.buttons.join")}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium text-slate-900 mb-1">{t("profile.messages.noTeamsFound")}</p>
                        <p className="text-sm">{t("profile.messages.noTeamsFoundDesc")}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Initial State */}
                {!hasSearched && (
                  <div className="text-center py-12 text-slate-500">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-slate-900 mb-1">{t("profile.messages.searchTeams")}</p>
                    <p className="text-sm">{t("profile.messages.searchTeamsDesc")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Create Team Modal */}
          {isCreateTeamOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="relative">
                  <CardTitle>{t("profile.modals.createTeamTitle")}</CardTitle>
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
                      <p className="text-sm text-slate-600 font-medium">{t("profile.messages.creatingTeam")}</p>
                    </div>
                  )}

                  {/* Success State */}
                  {teamCreated && !isCreatingTeam && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">{t("profile.messages.teamCreatedSuccess")}</p>
                    </div>
                  )}

                  {/* Form State */}
                  {!isCreatingTeam && !teamCreated && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t("profile.labels.teamName")}</label>
                        <input
                          type="text"
                          value={selectedTeamName}
                          onChange={(e) => setSelectedTeamName(e.target.value)}
                          placeholder={t("profile.placeholders.teamNameExample")}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t("profile.labels.hospital")}</label>
                        <input
                          value={selectedHospital}
                          placeholder={t("profile.placeholders.hospital")}
                          onChange={(e) => setSelectedHospital(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"

                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t("profile.labels.service")}</label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="">{t("profile.placeholders.selectService")}</option>
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
                          {t("common.buttons.cancel")}
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
                              {t("profile.messages.creating")}
                            </>
                          ) : (
                            t("profile.buttons.createTeam")
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
                  <CardTitle>{t("profile.modals.editTeamTitle")}</CardTitle>
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
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{t("profile.sections.teamDetails")}</h3>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">{t("profile.labels.teamName")}</label>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        placeholder={t("profile.placeholders.teamNameExample")}
                        className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t("profile.labels.hospital")}</label>
                        <input
                          value={editTeamHospital}
                          placeholder={t("profile.placeholders.hospitalName")}
                          onChange={(e) => setEditTeamHospital(e.target.value)}
                          className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t("profile.labels.service")}</label>
                        <input
                          value={editTeamService}
                          placeholder={t("profile.placeholders.serviceName")}
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
                        {t("profile.messages.memberWarning")}
                      </p>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{t("profile.sections.members")}</h3>

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
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                                {member.role === "Admin" ? t("profile.labels.admin") : t("profile.labels.member")}
                              </span>
                            </div>
                          </div>

                          {/* Will be deleted indicator */}
                          {!selectedMembers.has(member.id) && (
                            <div className="flex-shrink-0 px-2 py-1 rounded bg-red-50 border border-red-200">
                              <p className="text-xs text-red-700 font-semibold">{t("profile.labels.toDelete")}</p>
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
                      {t("common.buttons.cancel")}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={async () => {
                        if (!editingTeamId) return;

                        setIsUpdatingTeam(true);
                        setTeamUpdateError(null);

                        try {
                          const response = await fetch(`/api/teams/${editingTeamId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: editTeamName,
                              hospital: editTeamHospital,
                              service: editTeamService,
                              members: Array.from(selectedMembers),
                            }),
                          });

                          if (!response.ok) {
                            throw new Error(t("profile.errors.updateTeam"));
                          }

                          // Refresh teams list
                          const teamsResponse = await fetch("/api/teams");
                          if (teamsResponse.ok) {
                            const data = await teamsResponse.json();
                            const transformedTeams = (data.teams || []).map((team: any) => ({
                              id: team.id.toString(),
                              name: team.name,
                              members: team.members?.length || 0,
                              joined: true,
                              adminId: team.adminId?.toString(),
                              hospital: team.hospital,
                              service: team.service,
                              description: team.service ? `Service: ${team.service}` : (team.hospital ? `Hôpital: ${team.hospital}` : "Équipe"),
                              teamMembers: team.members?.map((member: any) => ({
                                id: member.id.toString(),
                                name: `${member.username || ""}`.trim(),
                                avatar: `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase(),
                                role: team.adminId === member.id ? "Admin" : "Membre",
                                specialty: member.specialty || "",
                              })),
                            }));
                            setUserTeams(transformedTeams);
                          }

                          setIsEditTeamOpen(false);
                          setEditingTeamId(null);
                        } catch (error) {
                          console.error("Error updating team:", error);
                          setTeamUpdateError(t("profile.errors.updateTeamError"));
                        } finally {
                          setIsUpdatingTeam(false);
                        }
                      }}
                      disabled={!editTeamName || isUpdatingTeam}
                      className="flex-1"
                    >
                      {isUpdatingTeam ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {t("profile.buttons.modifying")}
                        </>
                      ) : (
                        t("profile.buttons.saveChanges")
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delete Team Confirmation Modal */}
          {isDeleteTeamOpen && deletingTeamId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader>
                  <CardTitle>{t("profile.modals.deleteTeamTitle")}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      {t("profile.messages.deleteWarning")}
                    </p>
                  </div>

                  {teamDeleteError && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{teamDeleteError}</p>
                    </div>
                  )}

                  <p className="text-sm text-slate-700">
                    {t("profile.messages.deleteConfirm")} <span className="font-semibold">"{userTeams.find(t => t.id === deletingTeamId)?.name}"</span>?
                  </p>
                </CardContent>

                <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsDeleteTeamOpen(false);
                      setDeletingTeamId(null);
                      setTeamDeleteError(null);
                    }}
                    disabled={isDeletingTeam}
                    className="flex-1"
                  >
                    {t("common.buttons.cancel")}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!deletingTeamId) return;

                      setIsDeletingTeam(true);
                      setTeamDeleteError(null);

                      try {
                        const response = await fetch(`/api/teams/${deletingTeamId}`, {
                          method: "DELETE",
                        });

                        if (!response.ok) {
                          throw new Error(t("profile.errors.deleteTeam"));
                        }

                        // Remove team from list
                        setUserTeams(userTeams.filter(t => t.id !== deletingTeamId));
                        setIsDeleteTeamOpen(false);
                        setDeletingTeamId(null);
                      } catch (error) {
                        console.error("Error deleting team:", error);
                        setTeamDeleteError(t("profile.errors.deleteTeamError"));
                      } finally {
                        setIsDeletingTeam(false);
                      }
                    }}
                    disabled={isDeletingTeam}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingTeam ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        {t("profile.buttons.deleting")}
                      </>
                    ) : (
                      t("profile.buttons.delete")
                    )}
                  </Button>
                </div>
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
                  title={t("profile.charts.consultationBreakdown")}
                  data={[
                    { label: t("profile.charts.labels.consultations"), value: 45, color: "#4f46e5" },
                    { label: t("profile.charts.labels.followups"), value: 30, color: "#06b6d4" },
                    { label: t("profile.charts.labels.emergencies"), value: 15, color: "#f59e0b" },
                    { label: t("profile.charts.labels.others"), value: 10, color: "#8b5cf6" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90">
              <CardContent className="pt-6">
                <PieChart
                  title={t("profile.charts.operationBreakdown")}
                  data={[
                    { label: t("profile.charts.operationTypes.digestive"), value: 40, color: "#ef4444" },
                    { label: t("profile.charts.operationTypes.vascular"), value: 25, color: "#0ea5e9" },
                    { label: t("profile.charts.operationTypes.urology"), value: 20, color: "#8b5cf6" },
                    { label: t("profile.charts.operationTypes.other"), value: 15, color: "#f59e0b" },
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
                  title={t("profile.charts.monthlyInterventions")}
                  yLabel={t("profile.charts.interventionsCount")}
                  data={[
                    { label: t("profile.charts.months.jul"), value: 12 },
                    { label: t("profile.charts.months.aug"), value: 15 },
                    { label: t("profile.charts.months.sep"), value: 18 },
                    { label: t("profile.charts.months.oct"), value: 14 },
                    { label: t("profile.charts.months.nov"), value: 16 },
                    { label: t("profile.charts.months.dec"), value: 20 },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90">
              <CardContent className="pt-6">
                <BarChart
                  title={t("profile.charts.successRate")}
                  yLabel={t("profile.charts.successRatePercent")}
                  data={[
                    { label: t("profile.charts.operationAbbr.digest"), value: 98 },
                    { label: t("profile.charts.operationAbbr.vasc"), value: 96 },
                    { label: t("profile.charts.operationAbbr.urol"), value: 97 },
                    { label: t("profile.charts.operationAbbr.trauma"), value: 95 },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Progress Bars */}
          <Card className="border-none bg-white/90">
            <CardHeader>
              <CardTitle>{t("profile.sections.monthlyGoals")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{t("profile.labels.consultations")}</span>
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
                  <span className="text-sm font-medium text-slate-700">{t("profile.labels.interventions")}</span>
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
                  <span className="text-sm font-medium text-slate-700">{t("profile.labels.documentation")}</span>
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
                  <span className="text-sm font-medium text-slate-700">{t("profile.labels.training")}</span>
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
