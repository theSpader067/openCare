export interface TeamMemberUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  specialty: string;
}

export interface TeamMember {
  id: string;
  name: string;
  members: number;
  joined?: boolean;
  requestPending?: boolean;
  description: string;
  teamMembers?: TeamMemberUser[];
}

export interface JoinRequest {
  id: string;
  residentId: string;
  residentName: string;
  residentAvatar: string;
  residentRole: string;
  teamId: string;
  teamName: string;
  requestDate: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  specialty: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  joinedDate: string;
}

export interface Hospital {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
}

export const userProfile: UserProfile = {
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

export const pendingJoinRequests: JoinRequest[] = [
  {
    id: "REQ-001",
    residentId: "RES-01",
    residentName: "Dr. Léa Martin",
    residentAvatar: "LM",
    residentRole: "Interne",
    teamId: "TEAM-001",
    teamName: "Service Urologie B",
    requestDate: "2024-11-05",
  },
  {
    id: "REQ-002",
    residentId: "RES-03",
    residentName: "Dr. Hugo Tessier",
    residentAvatar: "HT",
    residentRole: "Interne senior",
    teamId: "TEAM-002",
    teamName: "Chirurgie digestive",
    requestDate: "2024-11-04",
  },
  {
    id: "REQ-003",
    residentId: "RES-05",
    residentName: "Dr. Maxime Benali",
    residentAvatar: "MB",
    residentRole: "Interne",
    teamId: "TEAM-001",
    teamName: "Service Urologie B",
    requestDate: "2024-11-03",
  },
];

export const availableTeams: TeamMember[] = [
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

export const hospitals: Hospital[] = [
  { id: "H1", name: "Hôpital Central Paris" },
  { id: "H2", name: "Hôpital Universitaire Lyon" },
  { id: "H3", name: "Hôpital Régional Marseille" },
  { id: "H4", name: "Clinique Private Bordeaux" },
];

export const services: Service[] = [
  { id: "S1", name: "Chirurgie générale" },
  { id: "S2", name: "Chirurgie digestive" },
  { id: "S3", name: "Urologie" },
  { id: "S4", name: "Cardiologie" },
  { id: "S5", name: "Orthopédie" },
  { id: "S6", name: "Neurochirurgie" },
  { id: "S7", name: "Oncologie" },
  { id: "S8", name: "Traumatologie" },
];
