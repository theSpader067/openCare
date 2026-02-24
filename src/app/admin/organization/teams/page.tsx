"use client";

import {
  Plus,
  Search,
  Users,
  Settings,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  UserPlus,
  X,
  Edit2,
  ChevronRight,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "head" | "member" | "coordinator";
  specialty: string;
  joinDate: string;
  avatar: string;
}

interface Team {
  id: string;
  name: string;
  department: string;
  description: string;
  headId: string;
  members: TeamMember[];
  createdAt: string;
  memberCount: number;
  status: "active" | "inactive";
  color: string;
}

const MOCK_TEAMS: Team[] = [
  {
    id: "1",
    name: "Cardiologie",
    department: "Médecine",
    description: "Équipe de cardiologie spécialisée en soins cardiaques",
    headId: "1",
    createdAt: "2024-01-15",
    memberCount: 5,
    status: "active",
    color: "from-red-500 to-pink-500",
    members: [
      {
        id: "1",
        name: "Dr. Ahmed Hassan",
        email: "ahmed.hassan@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "head",
        specialty: "Cardiologie",
        joinDate: "2024-01-15",
        avatar: "AH",
      },
      {
        id: "2",
        name: "Dr. Fatima Benali",
        email: "fatima.benali@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "member",
        specialty: "Cardiologie Interventionnelle",
        joinDate: "2024-02-01",
        avatar: "FB",
      },
      {
        id: "3",
        name: "Infirmière Leila",
        email: "leila@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "member",
        specialty: "Soins Paramédicaux",
        joinDate: "2024-02-10",
        avatar: "LM",
      },
    ],
  },
  {
    id: "2",
    name: "Neurochirurgie",
    department: "Chirurgie",
    description: "Équipe spécialisée en interventions neurochirurgicales",
    headId: "4",
    createdAt: "2024-01-20",
    memberCount: 4,
    status: "active",
    color: "from-purple-500 to-indigo-500",
    members: [
      {
        id: "4",
        name: "Dr. Mohamed Rachid",
        email: "m.rachid@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "head",
        specialty: "Neurochirurgie",
        joinDate: "2024-01-20",
        avatar: "MR",
      },
      {
        id: "5",
        name: "Dr. Sophie Martin",
        email: "sophie.martin@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "member",
        specialty: "Neurochirurgie Fonctionnelle",
        joinDate: "2024-02-05",
        avatar: "SM",
      },
      {
        id: "7",
        name: "Infirmier Karim",
        email: "karim.tech@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "member",
        specialty: "Soins Spécialisés",
        joinDate: "2024-02-15",
        avatar: "KT",
      },
    ],
  },
  {
    id: "3",
    name: "Pédiatrie",
    department: "Médecine",
    description: "Soins pédiatriques et développement de l'enfant",
    headId: "6",
    createdAt: "2024-02-01",
    memberCount: 6,
    status: "active",
    color: "from-blue-400 to-cyan-500",
    members: [
      {
        id: "6",
        name: "Dr. Leila Sabrina",
        email: "leila.sabrina@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "head",
        specialty: "Pédiatrie Générale",
        joinDate: "2024-02-01",
        avatar: "LS",
      },
      {
        id: "8",
        name: "Dr. Amal Khoury",
        email: "amal.khoury@hopital.com",
        phone: "+212 6XX XXX XXX",
        role: "member",
        specialty: "Pédiatrie Néonatale",
        joinDate: "2024-02-12",
        avatar: "AK",
      },
    ],
  },
];

const ITEMS_PER_PAGE = 10;

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [activeTab, setActiveTab] = useState<"users" | "teams">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0]);
  const [isAddTeamModal, setIsAddTeamModal] = useState(false);
  const [isAddMemberModal, setIsAddMemberModal] = useState(false);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get all users from teams
  const allUsers = useMemo(() => {
    const users: (TeamMember & { teamName: string })[] = [];
    teams.forEach((team) => {
      team.members.forEach((member) => {
        users.push({ ...member, teamName: team.name });
      });
    });
    return users;
  }, [teams]);

  const departments = useMemo(() => {
    return Array.from(new Set(teams.map((t) => t.department))).sort();
  }, [teams]);

  const specialties = useMemo(() => {
    return Array.from(new Set(allUsers.map((u) => u.specialty))).sort();
  }, [allUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesSpecialty = filterSpecialty === "all" || user.specialty === filterSpecialty;

      // Date range filtering
      const userDate = new Date(user.joinDate);
      const startDate = dateRangeStart ? new Date(dateRangeStart) : null;
      const endDate = dateRangeEnd ? new Date(dateRangeEnd) : null;
      const matchesDateRange =
        (!startDate || userDate >= startDate) && (!endDate || userDate <= endDate);

      return matchesSearch && matchesRole && matchesSpecialty && matchesDateRange;
    });
  }, [allUsers, searchTerm, filterRole, filterSpecialty, dateRangeStart, dateRangeEnd]);

  // Paginate users
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Filter teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || team.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [teams, searchTerm, filterDepartment]);

  const getRoleLabel = (role: string) => {
    const labels = {
      head: "Chef d'équipe",
      member: "Membre",
      coordinator: "Coordinateur",
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      head: "bg-amber-100 text-amber-800",
      member: "bg-blue-100 text-blue-800",
      coordinator: "bg-purple-100 text-purple-800",
    };
    return colors[role as keyof typeof colors] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Équipes Médicales</h1>
            <p className="text-slate-600 mt-2">Gérez vos équipes et les membres du personnel</p>
          </div>
          <Button
            onClick={() => {
              if (activeTab === "users") {
                setIsAddUserModal(true);
              } else {
                setIsAddTeamModal(true);
              }
            }}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold w-fit"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "users" ? "Nouvel Utilisateur" : "Nouvelle Équipe"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 bg-white rounded-t-lg">
        <button
          onClick={() => {
            setActiveTab("users");
            setCurrentPage(1);
            setSearchTerm("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          Utilisateurs
        </button>
        <button
          onClick={() => {
            setActiveTab("teams");
            setCurrentPage(1);
            setSearchTerm("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "teams"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shield className="h-4 w-4" />
          Équipes
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou spécialité..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">Tous les rôles</option>
              <option value="head">Chef d'équipe</option>
              <option value="coordinator">Coordinateur</option>
              <option value="member">Membre</option>
            </select>

            {/* Specialty Filter */}
            <select
              value={filterSpecialty}
              onChange={(e) => {
                setFilterSpecialty(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">Toutes les spécialités</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            {/* Date Range Start */}
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => {
                setDateRangeStart(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
              placeholder="Date début"
            />

            {/* Date Range End */}
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => {
                setDateRangeEnd(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
              placeholder="Date fin"
            />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""} trouvé
              {filteredUsers.length !== 1 ? "s" : ""}
              {searchTerm || filterRole !== "all" ? " (filtrés)" : ""}
            </p>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 flex flex-col items-center justify-center">
              <Users className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium mb-2">Aucun utilisateur trouvé</p>
              <p className="text-slate-500 text-sm">
                {searchTerm || filterRole !== "all"
                  ? "Essayez d'ajuster vos critères de recherche"
                  : "Commencez par ajouter des membres à vos équipes"}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Utilisateur</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Créé le</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Contact</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Rôle</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Équipe</th>
                      <th className="px-6 py-4 text-right font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? "" : "bg-slate-50/30"
                        }`}
                      >
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-semibold text-sm flex-shrink-0">
                              {user.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.specialty}</p>
                            </div>
                          </div>
                        </td>

                        {/* Creation Date */}
                        <td className="px-6 py-4 text-sm text-slate-600">{user.joinDate}</td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {user.phone}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </td>

                        {/* Team */}
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
                            {user.teamName}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="rounded-lg p-2 hover:bg-blue-100 transition-colors" title="Éditer">
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                            <button className="rounded-lg p-2 hover:bg-red-100 transition-colors" title="Supprimer">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Suivant
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TEAMS TAB */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une équipe..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="all">Tous les départements</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Teams Table */}
            <div className="lg:col-span-1">
              {filteredTeams.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 flex flex-col items-center justify-center">
                  <Shield className="h-8 w-8 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600">Aucune équipe trouvée</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Équipe</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Dept</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Membres</th>
                      </tr>
                    </thead>
                  </table>
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {filteredTeams.map((team, index) => (
                          <tr
                            key={team.id}
                            onClick={() => setSelectedTeam(team)}
                            className={`border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                              selectedTeam?.id === team.id
                                ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                                : index % 2 === 0
                                ? ""
                                : "bg-slate-50/30"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-semibold text-slate-900">{team.name}</p>
                                  <p className="text-xs text-slate-500">{team.status === "active" ? "Actif" : "Inactif"}</p>
                                </div>
                                {team.status === "active" && (
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">{team.department}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                {team.memberCount}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Team Details */}
            {selectedTeam && (
              <div className="lg:col-span-2 space-y-6">
                {/* Team Header Card */}
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedTeam.color} p-8 text-white shadow-xl`}
                >
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl" />
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold">{selectedTeam.name}</h2>
                        <p className="mt-1 text-white/90">{selectedTeam.department}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-colors">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-colors">
                          <Settings className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-white/80 text-sm">{selectedTeam.description}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                      <div>
                        <p className="text-xs text-white/70">Créée le</p>
                        <p className="font-semibold">{selectedTeam.createdAt}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/70">Membres</p>
                        <p className="font-semibold">{selectedTeam.memberCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Member Button */}
                <Button
                  onClick={() => setIsAddMemberModal(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un Membre
                </Button>

                {/* Members List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Membres de l'équipe</h3>
                  {selectedTeam.members.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-6 flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Aucun membre dans cette équipe</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.id}
                          className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${selectedTeam.color} text-white font-semibold text-sm flex-shrink-0`}
                              >
                                {member.avatar}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-slate-900">{member.name}</h4>
                                  <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                                    {getRoleLabel(member.role)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600">{member.specialty}</p>
                                <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    {member.email}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {member.phone}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button className="rounded-lg p-2 hover:bg-blue-100 transition-colors">
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </button>
                              <button className="rounded-lg p-2 hover:bg-red-100 transition-colors">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team Settings Card */}
                <Card className="border-slate-200 shadow-md">
                  <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Settings className="h-4 w-4" />
                      Paramètres de l'Équipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Équipe Active</p>
                        <p className="text-sm text-slate-600">
                          {selectedTeam.status === "active"
                            ? "Cette équipe est actuellement active"
                            : "Désactivée"}
                        </p>
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedTeam.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                    </div>
                    <button className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 className="inline h-4 w-4 mr-2" />
                      Supprimer l'équipe
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Créer une Nouvelle Équipe</h2>
              <button
                onClick={() => setIsAddTeamModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chirurgie Viscérale"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Département
                </label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option>Médecine</option>
                  <option>Chirurgie</option>
                  <option>Soins Paramédicaux</option>
                  <option>Administration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Décrivez le rôle et les responsabilités..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsAddTeamModal(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  Créer l'équipe
                </Button>
                <Button
                  onClick={() => setIsAddTeamModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Ajouter un Membre</h2>
              <button
                onClick={() => setIsAddMemberModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sélectionner un Utilisateur
                </label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option>Dr. Hassan Saïd</option>
                  <option>Infirmière Karim</option>
                  <option>Dr. Amal Khoury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rôle dans l'équipe
                </label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option value="member">Membre</option>
                  <option value="coordinator">Coordinateur</option>
                  <option value="head">Chef d'équipe</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsAddMemberModal(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  Ajouter le Membre
                </Button>
                <Button
                  onClick={() => setIsAddMemberModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Ajouter un Nouvel Utilisateur</h2>
              <button
                onClick={() => setIsAddUserModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  placeholder="Dr. John Doe"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@hopital.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Spécialité
                </label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option>Cardiologie</option>
                  <option>Neurochirurgie</option>
                  <option>Pédiatrie</option>
                  <option>Chirurgie Viscérale</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsAddUserModal(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  Créer l'Utilisateur
                </Button>
                <Button
                  onClick={() => setIsAddUserModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
