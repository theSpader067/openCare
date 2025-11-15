import type { Patient } from "@/types/document";

export type Avis = {
  id: string;
  title: string;
  date: string;
  patient?: Patient;
  specialty: string;
  opinion: string;
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
    specialty: "Cardiologie",
    opinion:
      "Patiente présentant des facteurs de risque cardiovasculaires multiples (obésité, diabète type 2). EFG normal. Léger épaississement du VG au repos. Pas de signes d'ischémie myocardique à l'effort. Recommandation : démarrer statin haute dose pour prévention cardiovasculaire.",
    createdAt: "2024-03-15T14:30:00",
    createdBy: "Vous",
    direction: "incoming",
  },
  {
    id: "AV-002",
    title: "Avis oncologique",
    date: "2024-03-14",
    patient: mockPatients[1],
    specialty: "Oncologie",
    opinion:
      "Patiente atteinte de cholangiocarcinome intra-hépatique en stade avancé. Bonne tolérance de la chimiothérapie FOLFIRINOX. Marqueurs tumoraux en diminution. TDM de suivi favorable. Recommandation : poursuite du FOLFIRINOX pour 2 cycles supplémentaires.",
    createdAt: "2024-03-14T11:00:00",
    createdBy: "Vous",
    direction: "outgoing",
  },
  {
    id: "AV-003",
    title: "Avis orthopédique",
    date: "2024-03-13",
    patient: mockPatients[2],
    specialty: "Orthopédie",
    opinion:
      "Patient avec métastases osseuses multiples (bassin, rachis, fémur proximal). Risque de fracture pathologique modéré. Mobilité préservée actuellement. Recommandation : Zolédronate IV mensuel pour prévention des événements osseux.",
    createdAt: "2024-03-13T09:15:00",
    createdBy: "Vous",
    direction: "outgoing",
  },
];
