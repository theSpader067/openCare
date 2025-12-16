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
  Users,
  Building2,
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

  const tabItems: { id: "personal" | "equipes"; label: string }[] = [
    { id: "personal", label: t("profile.tabs.personal") },
    { id: "equipes", label: t("profile.tabs.teams") },
  ];

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
          teamMembers: team.members?.map((member: any) => {
            const firstName = member.firstName?.trim() || "";
            const lastName = member.lastName?.trim() || "";
            const username = member.username?.trim() || "";
            const displayName = (firstName && lastName) ? `${firstName} ${lastName}` : username || "N/A";
            const avatarInitials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || username[0]?.toUpperCase() || "?";
            return {
              id: member.id.toString(),
              name: displayName,
              avatar: avatarInitials,
              role: team.adminId === member.id ? "Admin" : "Membre",
              specialty: member.specialty || "",
            };
          }),
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
        teamMembers: newTeam.members?.map((member: any) => {
          const firstName = member.firstName?.trim() || "";
          const lastName = member.lastName?.trim() || "";
          const username = member.username?.trim() || "";
          const displayName = (firstName && lastName) ? `${firstName} ${lastName}` : username || "N/A";
          const avatarInitials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || username[0]?.toUpperCase() || "?";
          return {
            id: member.id.toString(),
            name: displayName,
            avatar: avatarInitials,
            role: newTeam.adminId === member.id ? "Admin" : "Membre",
            specialty: member.specialty || "",
          };
        }),
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
      <div className="space-y-4 pb-20 lg:pb-0">
        {/* Header Skeleton */}
        <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px]">
          <CardContent className="p-4 pt-6 space-y-3">
            {/* Avatar and Info Row */}
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-[10px] bg-slate-200 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded-[10px] w-48 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-[10px] w-32 animate-pulse"></div>
              </div>
            </div>
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 p-2.5">
                  <div className="h-8 w-8 rounded-[10px] bg-slate-200 animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-200 rounded-[10px] w-12 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded-[10px] w-8 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 bg-slate-200 rounded-[10px] w-24 animate-pulse"
            ></div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-4 lg:grid-cols-[3fr_1fr]">
          {/* Personal Info Card Skeleton */}
          <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px]">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="space-y-2">
                <div className="h-6 bg-slate-200 rounded-[10px] w-40 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-[10px] w-56 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* 2-column grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <div className="h-4 bg-slate-200 rounded-[10px] w-24 animate-pulse"></div>
                    <div className="h-10 bg-slate-200 rounded-[10px] animate-pulse"></div>
                  </div>
                ))}
              </div>
              {/* Full width fields */}
              {[1, 2].map((i) => (
                <div key={i} className="flex flex-col space-y-2 md:col-span-2">
                  <div className="h-4 bg-slate-200 rounded-[10px] w-20 animate-pulse"></div>
                  <div className="h-20 bg-slate-200 rounded-[10px] animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preferences Sidebar Skeleton */}
          <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px] h-fit">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="space-y-2">
                <div className="h-6 bg-slate-200 rounded-[10px] w-32 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-[10px] w-40 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-200 p-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded-[10px] w-32 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded-[10px] w-24 animate-pulse"></div>
                  </div>
                  <div className="h-6 w-11 bg-slate-200 rounded-full animate-pulse flex-shrink-0"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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

  const highlightMetrics = [
    {
      label: t("profile.tabs.teams"),
      value: userTeams.length.toString().padStart(2, "0"),
      helper: t("profile.sections.myTeams", { count: userTeams.length }),
      icon: Users,
    },
    {
      label: t("profile.labels.specialty"),
      value: personalInfo.specialty || "—",
      helper: personalInfo.year || t("profile.labels.yearStatus"),
      icon: Briefcase,
    },
    {
      label: t("profile.labels.hospital"),
      value: personalInfo.hospital || "—",
      helper: personalInfo.address || t("profile.labels.address"),
      icon: Building2,
    },
  ];

  const inputBaseClasses =
    "px-4 py-2 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 transition";

  const contactRows = [
    { icon: Mail, label: t("profile.labels.email"), value: personalInfo.email || "—" },
    { icon: Phone, label: t("profile.labels.phone"), value: personalInfo.phone || "—" },
    { icon: MapPin, label: t("profile.labels.hospital"), value: personalInfo.hospital || "—" },
  ];

  return (
    <div className="relative pb-16 lg:pb-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-indigo-50 via-white to-transparent" />
      <div className="space-y-4">
        <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px]">
          <CardContent className="p-4 pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-slate-900 text-xl font-semibold text-white">
                {personalInfo.avatar}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold text-slate-900">
                    {personalInfo.firstName} {personalInfo.lastName}
                  </h1>
                  <Badge
                    variant={personalInfo.profileVisible ? "success" : "muted"}
                    className="px-2 py-0.5 text-[10px] font-semibold"
                  >
                    {personalInfo.profileVisible
                      ? t("profile.labels.profileVisibility")
                      : t("profile.labels.profileVisibilityDesc")}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">@{personalInfo.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {highlightMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs"
                  >
                    <div className="rounded-[10px] bg-white p-1.5 text-slate-600">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {metric.label}
                      </p>
                      <p className="font-semibold text-slate-900">{metric.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-[10px] border border-slate-200 bg-white p-1">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-[10px] px-3 py-1.5 text-sm font-medium transition",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {isSavingProfile && (
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <Loader className="h-3 w-3 animate-spin" />
              {t("profile.buttons.saving")}
            </div>
          )}
        </div>

      {/* Personal Tab */}
      {activeTab === "personal" && (
        <div className="space-y-3">
          {profileError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{profileError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-700">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{t("profile.messages.profileUpdatedSuccess")}</p>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px]">
              <CardHeader className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{t("profile.sections.personalInfo")}</CardTitle>
                  <CardDescription>{t("profile.sections.personalInfoDesc")}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (originalPersonalInfo) {
                          setPersonalInfo(originalPersonalInfo);
                        }
                        setIsEditing(false);
                      }}
                    >
                      {t("common.buttons.cancel")}
                    </Button>
                  )}
                  <Button
                    variant="primary"
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.firstName")}
                    </label>
                    <input
                      disabled={!isEditing}
                      value={personalInfo.firstName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.lastName")}
                    </label>
                    <input
                      disabled={!isEditing}
                      value={personalInfo.lastName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.email")}
                    </label>
                    <input
                      disabled={!isEditing}
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, email: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.phone")}
                    </label>
                    <input
                      disabled={!isEditing}
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, phone: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Specialty */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.specialty")}
                    </label>
                    <input
                      disabled={!isEditing}
                      value={personalInfo.specialty}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, specialty: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Hospital */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.hospital")}
                    </label>
                    <input
                      disabled={!isEditing}
                      value={personalInfo.hospital}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, hospital: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Year Status */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.yearStatus")}
                    </label>
                    <select
                      disabled={!isEditing}
                      value={personalInfo.year}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, year: e.target.value })
                      }
                      className={cn(inputBaseClasses, "pr-10")}
                    >
                      <option value="">{t("profile.placeholders.selectStatus")}</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address - Full Width */}
                  <div className="flex flex-col space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.address")}
                    </label>
                    <input
                      disabled={!isEditing}
                      value={personalInfo.address}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, address: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>

                  {/* Bio - Full Width */}
                  <div className="flex flex-col space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      {t("profile.labels.bio")}
                    </label>
                    <textarea
                      disabled={!isEditing}
                      value={personalInfo.bio}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, bio: e.target.value })
                      }
                      rows={3}
                      className={cn(inputBaseClasses, "min-h-[90px] resize-none leading-relaxed")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("profile.sections.preferences")}</CardTitle>
                <CardDescription>{t("profile.labels.profileVisibilityDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[10px] border border-slate-200">
                  {contactRows.map((row, index) => {
                    const Icon = row.icon;
                    return (
                      <div
                        key={row.label}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 text-sm",
                          index !== contactRows.length - 1 && "border-b border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <Icon className="h-4 w-4 text-slate-500" />
                          {row.label}
                        </div>
                        <span className="text-slate-500">{row.value}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: t("profile.labels.emailNotifications"),
                      description: t("profile.labels.emailNotificationsDesc"),
                      value: personalInfo.notifyByEmail,
                      onChange: (checked: boolean) =>
                        setPersonalInfo({ ...personalInfo, notifyByEmail: checked }),
                    },
                    {
                      title: t("profile.labels.pushNotifications"),
                      description: t("profile.labels.pushNotificationsDesc"),
                      value: personalInfo.notifyByPush,
                      onChange: (checked: boolean) =>
                        setPersonalInfo({ ...personalInfo, notifyByPush: checked }),
                    },
                    {
                      title: t("profile.labels.profileVisibility"),
                      description: t("profile.labels.profileVisibilityDesc"),
                      value: personalInfo.profileVisible,
                      onChange: (checked: boolean) =>
                        setPersonalInfo({ ...personalInfo, profileVisible: checked }),
                    },
                  ].map((pref) => (
                    <div
                      key={pref.title}
                      className="flex items-center justify-between gap-4 rounded-[10px] border border-slate-200 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{pref.title}</p>
                        <p className="text-xs text-slate-500">{pref.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={pref.value}
                        disabled={!isEditing}
                        onClick={() => isEditing && pref.onChange(!pref.value)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full border transition focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-200",
                          pref.value ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-slate-200",
                          !isEditing && "cursor-not-allowed opacity-60"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
                            pref.value ? "translate-x-5" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}


{/* Équipes Tab */}
{activeTab === "equipes" && (
  <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px]">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <CardTitle>{t("profile.sections.myTeams", { count: userTeams.length })}</CardTitle>
            <CardDescription>{t("profile.sections.searchTeamsDesc")}</CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-600">
            <Users className="h-4 w-4" />
            {userTeams.length} {t("profile.labels.members")}
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-3">
          {userTeams.length > 0 ? (
            userTeams.map((team) => {
              const isAdmin = team.adminId === (session?.user as any)?.id;
              return (
                <div
                  key={team.id}
                  className="rounded-[10px] border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-indigo-600 text-sm font-semibold text-white">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{team.name}</h3>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-slate-600">
                          {team.hospital && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {team.hospital}
                            </span>
                          )}
                          {team.service && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {team.service}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuTeamId(openMenuTeamId === team.id ? null : team.id)}
                          className="rounded-[10px] border border-slate-200 bg-white/80 p-2 text-slate-500 shadow-sm transition hover:bg-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuTeamId === team.id && (
                                <div className="absolute right-0 mt-2 w-44 rounded-[10px] border border-slate-200 bg-white p-1 shadow-xl z-50">
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
                              className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                              className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("profile.buttons.deleteTeam")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 bg-white px-3 py-2.5">
                    {team.teamMembers && team.teamMembers.length > 0 ? (
                      team.teamMembers.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-200 p-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {member.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">{member.name}</p>
                              {member.specialty && (
                                <p className="text-[11px] text-slate-500">{member.specialty}</p>
                              )}
                            </div>
                          </div>
                          {member.role && (
                            <Badge
                              variant={member.role === "Admin" ? "warning" : "muted"}
                              className="text-[10px]"
                            >
                              {member.role === "Admin"
                                ? t("profile.labels.admin")
                                : t("profile.labels.member")}
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="py-2 text-center text-xs text-slate-500">
                        {t("profile.messages.noMembers")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-500">
              <p className="text-sm">{t("profile.messages.noTeams")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm rounded-[10px] lg:sticky lg:top-24">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{t("profile.sections.searchTeams")}</CardTitle>
              <CardDescription>{t("profile.sections.searchTeamsDesc")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {joinRequests.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsPendingRequestsOpen(!isPendingRequestsOpen)}
                    className="relative inline-flex items-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
                    title={t("profile.labels.pendingRequests", { count: joinRequests.length })}
                  >
                    <Clock className="h-4 w-4" />
                    {joinRequests.length}
                  </button>
                  {isPendingRequestsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-[10px] border border-slate-200 bg-white p-3 shadow-2xl z-50">
                      <div className="max-h-96 space-y-2 overflow-y-auto">
                        {joinRequests.map((request) => (
                          <div key={request.id} className="rounded-[10px] border border-slate-200 p-2.5">
                            <div className="mb-2 flex items-start gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-semibold text-white">
                                {request.residentAvatar}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900">{request.residentName}</p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {request.specialty} → {request.teamName}
                                </p>
                              </div>
                            </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={processingRequestId === request.id}
                        className="flex-1 rounded-[10px] bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                                {processingRequestId === request.id ? (
                                  <div className="mx-auto h-3 w-3 rounded-full border-2 border-emerald-300 border-t-emerald-700 animate-spin" />
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <Check className="h-3 w-3" />
                                    {t("profile.buttons.accept")}
                                  </div>
                                )}
                              </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        disabled={processingRequestId === request.id}
                        className="flex-1 rounded-[10px] bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                                {processingRequestId === request.id ? (
                                  <div className="mx-auto h-3 w-3 rounded-full border-2 border-red-300 border-t-red-700 animate-spin" />
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <X className="h-3 w-3" />
                                    {t("profile.buttons.decline")}
                                  </div>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreateTeamOpen(true);
                  setTeamCreationError(null);
                }}
                className="gap-2 text-indigo-600 hover:bg-indigo-50"
              >
                <Plus className="h-4 w-4" />
                {t("profile.buttons.createTeam")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                className={cn(inputBaseClasses, "pl-10")}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearchTeams}
              disabled={isSearching || !searchTeams.trim()}
              className="h-10 w-10 px-0"
            >
              {isSearching ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchError && (
            <div className="flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50/80 p-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{t("profile.errors.searchTitle")}</p>
                <p className="text-sm text-red-700">{searchError}</p>
              </div>
            </div>
          )}

          {isSearching && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                  <div className="flex animate-pulse items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded bg-slate-200" />
                      <div className="h-3 rounded bg-slate-200" />
                      <div className="h-3 rounded bg-slate-200" />
                    </div>
                    <div className="h-7 w-20 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && !isSearching && (
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((team) => (
                      <div
                        key={team.id}
                        className="rounded-[10px] border border-slate-200 px-3 py-2.5 shadow-sm transition hover:border-indigo-300 hover:shadow-lg"
                      >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{team.name}</p>
                        <p className="text-xs text-slate-500">{team.description}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {team.members} {t("profile.labels.members")}
                        </p>
                      </div>
                      {sentRequests.has(team.id) ? (
                        <Badge variant="warning" className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <Check className="h-3 w-3" />
                          {t("profile.labels.sent")}
                        </Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={joiningTeamId === team.id}
                          className="gap-1 whitespace-nowrap"
                        >
                          {joiningTeamId === team.id ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          <span className="text-xs font-semibold">
                            {joiningTeamId === team.id
                              ? t("profile.buttons.sending")
                              : t("profile.buttons.join")}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                      <div className="rounded-[10px] border border-dashed border-slate-200 p-4 text-center text-slate-500">
                  <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-xs font-medium text-slate-900">{t("profile.messages.noTeamsFound")}</p>
                  <p className="text-xs">{t("profile.messages.noTeamsFoundDesc")}</p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && !isSearching && (
                  <div className="rounded-[10px] border border-dashed border-slate-200 p-4 text-center text-slate-500">
              <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-xs font-medium text-slate-900">{t("profile.messages.searchTeams")}</p>
              <p className="text-xs">{t("profile.messages.searchTeamsDesc")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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

    {/* Create Team Modal */}
    {isCreateTeamOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md border border-slate-200 bg-white shadow-2xl rounded-[10px]">
          <CardHeader className="relative space-y-1">
            <CardTitle>{t("profile.modals.createTeamTitle")}</CardTitle>
            <CardDescription>{t("profile.sections.searchTeamsDesc")}</CardDescription>
            <button
              onClick={() => {
                setIsCreateTeamOpen(false);
                setSelectedTeamName("");
                setSelectedHospital("");
                setSelectedService("");
                setTeamCreated(false);
              }}
              className="absolute right-4 top-4 rounded-[10px] p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamCreationError && (
              <div className="flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {teamCreationError}
              </div>
            )}

            {isCreatingTeam && (
              <div className="flex flex-col items-center gap-2 py-4 text-sm text-slate-600">
                <Loader className="h-5 w-5 text-indigo-600" />
                {t("profile.messages.creatingTeam")}
              </div>
            )}

            {teamCreated && !isCreatingTeam && (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-600">{t("profile.messages.teamCreatedSuccess")}</p>
              </div>
            )}

            {!isCreatingTeam && !teamCreated && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {t("profile.labels.teamName")}
                  </label>
                  <input
                    type="text"
                    value={selectedTeamName}
                    onChange={(e) => setSelectedTeamName(e.target.value)}
                    placeholder={t("profile.placeholders.teamNameExample")}
                    className={inputBaseClasses}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {t("profile.labels.hospital")}
                  </label>
                  <input
                    value={selectedHospital}
                    placeholder={t("profile.placeholders.hospital")}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className={inputBaseClasses}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {t("profile.labels.service")}
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className={cn(inputBaseClasses, "pr-10")}
                  >
                    <option value="">{t("profile.placeholders.selectService")}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setIsCreateTeamOpen(false);
                      setSelectedTeamName("");
                      setSelectedHospital("");
                      setSelectedService("");
                    }}
                  >
                    {t("common.buttons.cancel")}
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleCreateTeam}
                    disabled={!selectedTeamName || !selectedHospital || !selectedService || isCreatingTeam}
                  >
                    {isCreatingTeam ? (
                      <Loader className="h-4 w-4 animate-spin" />
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-3xl border border-slate-200 bg-white shadow-2xl rounded-[10px]">
          <CardHeader className="relative pb-3">
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
              className="absolute right-4 top-4 rounded-[10px] p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamUpdateError && (
              <div className="flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {teamUpdateError}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {t("profile.labels.teamName")}
                </label>
                <input
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {t("profile.labels.hospital")}
                </label>
                <input
                  value={editTeamHospital}
                  onChange={(e) => setEditTeamHospital(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  {t("profile.labels.service")}
                </label>
                <input
                  value={editTeamService}
                  onChange={(e) => setEditTeamService(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>
            </div>

            <div className="rounded-[10px] border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-800">
              {t("profile.messages.memberWarning")}
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-[10px] border border-slate-200 p-3">
              {userTeams
                .find((t) => t.id === editingTeamId)
                ?.teamMembers?.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-[10px] border border-slate-100 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={(e) => {
                        const next = new Set(selectedMembers);
                        if (e.target.checked) {
                          next.add(member.id);
                        } else {
                          next.delete(member.id);
                        }
                        setSelectedMembers(next);
                      }}
                      className="h-4 w-4 rounded"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-900">{member.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {member.role === "Admin"
                          ? t("profile.labels.admin")
                          : t("profile.labels.member")}
                      </p>
                    </div>
                    {!selectedMembers.has(member.id) && (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 whitespace-nowrap">
                        {t("profile.labels.toDelete")}
                      </span>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setIsEditTeamOpen(false);
                  setEditingTeamId(null);
                  setEditTeamName("");
                  setEditTeamHospital("");
                  setEditTeamService("");
                  setSelectedMembers(new Set());
                }}
              >
                {t("common.buttons.cancel")}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
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
                        description: team.service
                          ? `Service: ${team.service}`
                          : team.hospital
                            ? `Hôpital: ${team.hospital}`
                            : "Équipe",
                        teamMembers: team.members?.map((member: any) => {
                          const firstName = member.firstName?.trim() || "";
                          const lastName = member.lastName?.trim() || "";
                          const username = member.username?.trim() || "";
                          const displayName = firstName && lastName ? `${firstName} ${lastName}` : username || "N/A";
                          const avatarInitials =
                            `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || username[0]?.toUpperCase() || "?";
                          return {
                            id: member.id.toString(),
                            name: displayName,
                            avatar: avatarInitials,
                            role: team.adminId === member.id ? "Admin" : "Membre",
                            specialty: member.specialty || "",
                          };
                        }),
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

    {/* Delete Team Modal */}
    {isDeleteTeamOpen && deletingTeamId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md border border-slate-200 bg-white shadow-2xl rounded-[10px]">
          <CardHeader className="pb-3">
            <CardTitle>{t("profile.modals.deleteTeamTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {t("profile.messages.deleteWarning")}
            </div>
            {teamDeleteError && (
              <div className="flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {teamDeleteError}
              </div>
            )}
            <p className="text-sm text-slate-700">
              {t("profile.messages.deleteConfirm")} <span className="font-semibold">&ldquo;{userTeams.find((t) => t.id === deletingTeamId)?.name}&rdquo;</span>?
            </p>
          </CardContent>
          <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setIsDeleteTeamOpen(false);
                setDeletingTeamId(null);
                setTeamDeleteError(null);
              }}
              disabled={isDeletingTeam}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-red-600 hover:bg-red-700"
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

                  setUserTeams(userTeams.filter((team) => team.id !== deletingTeamId));
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
  );
}
