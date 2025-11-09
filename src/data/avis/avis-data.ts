import type { Patient } from "@/types/document";

export type Avis = {
  id: string;
  title: string;
  date: string;
  patient?: Patient;
  specialist: string;
  specialty: string;
  opinion: string;
  recommendations: string;
  createdAt: string;
  createdBy: string;
  direction: "incoming" | "outgoing";
  response?: string;
};

export const mockPatients: Patient[] = [
  {
    id: "P-001",
    fullName: "Awa Ndiaye",
    histoire: "Patiente hospitalisée pour obésité morbide. Antécédents de diabète type 2. Allergie à la pénicilline.",
  },
  {
    id: "P-002",
    fullName: "Lamia Saïd",
    histoire: "Patiente suivie pour cholangiocarcinome. Chimiothérapie FOLFIRINOX en cours. Bonne tolérance générale.",
  },
  {
    id: "P-003",
    fullName: "Mamadou Carter",
    histoire: "Patient présentant des métastases osseuses. Suivi en oncologie. Performance status ECOG 1.",
  },
];

export const mockAvis: Avis[] = [
  {
    id: "AV-001",
    title: "Avis cardiologique",
    date: "2024-03-15",
    patient: mockPatients[0],
    specialist: "Dr. Sophie Bernard",
    specialty: "Cardiologie",
    opinion:
      "Patiente présentant des facteurs de risque cardiovasculaires multiples (obésité, diabète type 2). EFG normal. Léger épaississement du VG au repos. Pas de signes d'ischémie myocardique à l'effort.",
    recommendations:
      "1. Démarrer statin haute dose (atorvastatine 40mg) pour prévention cardiovasculaire\n2. ACE inhibiteur recommandé pour protection cardiaque et rénale\n3. Programme de réhabilitation cardiaque et perte de poids\n4. Suivi tensionnel et lipidique tous les 3 mois\n5. Épreuve d'effort de suivi dans 6 mois",
    createdAt: "2024-03-15T14:30:00",
    createdBy: "Dr. Sophie Bernard",
    direction: "incoming",
  },
  {
    id: "AV-002",
    title: "Avis oncologique",
    date: "2024-03-14",
    patient: mockPatients[1],
    specialist: "Dr. Michel Durand",
    specialty: "Oncologie",
    opinion:
      "Patiente atteinte de cholangiocarcinome intra-hépatique en stade avancé. Bonne tolérance de la chimiothérapie FOLFIRINOX. Marqueurs tumoraux en diminution. TDM de suivi favorable.",
    recommendations:
      "1. Poursuite du FOLFIRINOX pour 2 cycles supplémentaires\n2. TDM/IRM de suivi tous les 2 mois\n3. Marqueurs tumoraux et biologie hépatique mensuels\n4. Soutien nutritionnel et suivi diététique\n5. Évaluation pour immunothérapie ajuvante si réponse complète\n6. Gestion active des effets secondaires",
    createdAt: "2024-03-14T11:00:00",
    createdBy: "Dr. Michel Durand",
    direction: "outgoing",
  },
  {
    id: "AV-003",
    title: "Avis orthopédique",
    date: "2024-03-13",
    patient: mockPatients[2],
    specialist: "Dr. Jean-Claude Moreau",
    specialty: "Orthopédie",
    opinion:
      "Patient avec métastases osseuses multiples (bassin, rachis, fémur proximal). Risque de fracture pathologique modéré. Mobilité préservée actuellement.",
    recommendations:
      "1. Zolédronate IV mensuel pour prévention des événements osseuxet gestion de l'hypercalcémie\n2. Port d'une ceinture lombaire pour protection rachidienne\n3. Fisiotkérapie douce - amplitude de mouvement et renforcement musculaire\n4. Prévention des chutes - évaluation ergonomique du domicile\n5. Antalgiques adaptés au repos nocturne\n6. Réévaluation radiologique tous les 3 mois\n7. Évaluation pour radiothérapie métastase lombaire si douleur",
    createdAt: "2024-03-13T09:15:00",
    createdBy: "Dr. Jean-Claude Moreau",
    direction: "outgoing",
  },
];
