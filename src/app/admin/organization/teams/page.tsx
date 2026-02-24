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
    ],
  },
];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0]);
  const [isAddTeamModal, setIsAddTeamModal] = useState(false);
  const [isAddMemberModal, setIsAddMemberModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const departments = useMemo(() => {
    return Array.from(new Set(teams.map((t) => t.department))).sort();
  }, [teams]);

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
            onClick={() => setIsAddTeamModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold w-fit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Équipe
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Total Équipes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{teams.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Équipes Actives</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {teams.filter((t) => t.status === "active").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Total Membres</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {teams.reduce((sum, t) => sum + t.memberCount, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Départements</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{departments.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une équipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
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
        {/* Teams List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 px-2">
            Équipes ({filteredTeams.length})
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filteredTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`w-full text-left rounded-lg border-2 transition-all p-4 ${
                  selectedTeam?.id === team.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{team.name}</h3>
                      {team.status === "active" && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 truncate">{team.department}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Users className="h-3 w-3" />
                      {team.memberCount} membres
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
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
              <div className="space-y-2">
                {selectedTeam.members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Avatar */}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${selectedTeam.color} text-white font-semibold text-sm flex-shrink-0`}>
                          {member.avatar}
                        </div>

                        {/* Info */}
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

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === member.id ? null : member.id)
                          }
                          className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </button>

                        {openMenuId === member.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                            <button className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-lg">
                              Modifier le rôle
                            </button>
                            <button className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                              Envoyer un message
                            </button>
                            <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg">
                              Retirer de l'équipe
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      {selectedTeam.status === "active" ? "Cette équipe est actuellement active" : "Désactivée"}
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
    </div>
  );
}
