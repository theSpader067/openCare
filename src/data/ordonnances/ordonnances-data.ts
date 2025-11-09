import type { Patient } from "@/types/document";

export type Ordonnance = {
  id: string;
  title: string;
  date: string;
  patient?: Patient;
  clinicalInfo: string;
  prescriptionDetails: string;
  createdAt: string;
  createdBy: string;
  age?: number;
};

export const mockPatients: Patient[] = [
  {
    id: "P-001",
    fullName: "Awa Ndiaye",
    age: 52,
    histoire: "Patiente hospitalisée pour obésité morbide. Antécédents de diabète type 2. Allergie à la pénicilline.",
  },
  {
    id: "P-002",
    fullName: "Lamia Saïd",
    age: 58,
    histoire: "Patiente suivie pour cholangiocarcinome. Chimiothérapie FOLFIRINOX en cours. Bonne tolérance générale.",
  },
  {
    id: "P-003",
    fullName: "Mamadou Carter",
    age: 64,
    histoire: "Patient présentant des métastases osseuses. Suivi en oncologie. Performance status ECOG 1.",
  },
  {
    id: "P-004",
    fullName: "Nadine Morel",
    age: 72,
    histoire: "Patiente avec sténose biliaire. Prise en charge palliative. Bon état général.",
  },
];

export const mockOrdonnances: Ordonnance[] = [
  {
    id: "ORD-001",
    title: "Traitement post-opératoire",
    date: "2024-11-08",
    patient: mockPatients[0],
    clinicalInfo:
      "Patiente en période post-opératoire immédiate. Diabète type 2 équilibré. Allergie confirmée à la pénicilline.",
    prescriptionDetails:
      "1. Amoxicilline-acide clavulanique 875mg - 1 cp × 3/jour pendant 7 jours\n2. Paracétamol 500mg - 1-2 cp toutes les 4-6 heures en cas de douleur, max 3000mg/jour\n3. Métformine 1000mg - 1 cp × 2/jour avec les repas\n4. Oméprazole 20mg - 1 cp chaque matin à jeun\n5. Bas de contention classe II - à porter pendant 3 semaines",
    createdAt: "2024-11-08T14:30:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-002",
    title: "Gestion de la douleur oncologique",
    date: "2024-11-07",
    patient: mockPatients[1],
    clinicalInfo:
      "Patiente en traitement chimothérapique. Performance status stable. Bonne compliance thérapeutique.",
    prescriptionDetails:
      "1. Morphine LP 30mg - 1 cp × 2/jour\n2. Morphine IR 10mg - 1-2 cp toutes les 2-4 heures en cas de douleur intercalaire\n3. Métoclopramide 10mg - 1 cp × 3/jour avant les repas\n4. Laxatif osmotique (Polyéthylène glycol 4000) - 1 sachet/jour le soir\n5. Acide folique 5mg - 1 cp/jour",
    createdAt: "2024-11-07T11:00:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-003",
    title: "Traitement métabolique",
    date: "2024-11-06",
    patient: mockPatients[2],
    clinicalInfo:
      "Patient avec métastases osseuses. Suivi oncologique régulier. Douleur articulaire modérée.",
    prescriptionDetails:
      "1. Ibuprofène 400mg - 1 cp × 3/jour avec les repas\n2. Zolédronate IV - 1 perfusion/mois (prochaine visite: semaine prochaine)\n3. Calcium + Vitamine D3 - 1 cp/jour\n4. Bisacodyl 5mg - 1-2 cp au coucher si besoin\n5. Antiacide (Hydroxyde d'aluminium) - 1 cp après les repas",
    createdAt: "2024-11-06T09:15:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-004",
    title: "Support paliatif",
    date: "2024-11-05",
    patient: mockPatients[3],
    clinicalInfo:
      "Patiente en soins palliatifs. Icterus modéré. Soutien nutritionnel en place.",
    prescriptionDetails:
      "1. Morphine LP 60mg - 1 cp × 2/jour\n2. Morphine IR 20mg - à disposition pour douleur intercalaire\n3. Dompéridone 10mg - 1 cp × 3/jour avant les repas\n4. Supplements nutritionnels protéinés - 2-3 par jour entre les repas\n5. Soins infirmiers - passages quotidiens pour surveillance et soutien",
    createdAt: "2024-11-05T16:45:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-005",
    title: "Traitement antihypertenseur",
    date: "2024-11-04",
    patient: mockPatients[0],
    clinicalInfo:
      "Patient hypertendu avec antécédents cardiovasculaires. Bon contrôle tensionnel. Pas d'allergie rapportée.",
    prescriptionDetails:
      "1. Lisinopril 10mg - 1 cp/jour le matin\n2. Amlodipine 5mg - 1 cp/jour le soir\n3. Aténolol 50mg - 1 cp × 2/jour\n4. Atorvastatine 40mg - 1 cp/jour le soir\n5. Aspirine 100mg - 1 cp/jour le matin",
    createdAt: "2024-11-04T10:20:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-006",
    title: "Traitement antibiotique infection respiratoire",
    date: "2024-11-03",
    patient: mockPatients[1],
    clinicalInfo:
      "Patient atteint de bronchite aiguë. Saturation O2 correcte. Pas de comorbidités graves.",
    prescriptionDetails:
      "1. Amoxicilline 500mg - 1 cp × 3/jour pendant 10 jours\n2. Paracétamol 1000mg - 1 cp × 3/jour en cas de fièvre\n3. Codéine 15mg - 1-2 cp × 3/jour en cas de toux\n4. Inhalations avec soluté physiologique - 2 × par jour\n5. Repos strict recommandé",
    createdAt: "2024-11-03T15:45:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-007",
    title: "Gestion du diabète type 2",
    date: "2024-11-02",
    patient: mockPatients[2],
    clinicalInfo:
      "Patient diabétique depuis 8 ans. HbA1c bien contrôlée. Légère protéinurie détectée.",
    prescriptionDetails:
      "1. Metformine 1000mg - 1 cp × 2/jour avec les repas\n2. Glimépiride 2mg - 1 cp/jour le matin\n3. Lisinopril 10mg - 1 cp/jour pour protection rénale\n4. Atorvastatine 20mg - 1 cp/jour le soir\n5. Aspirine 100mg - 1 cp/jour\n6. Contrôle glycémique à domicile 2 × par jour",
    createdAt: "2024-11-02T13:10:00",
    createdBy: "Vous",
  },
  {
    id: "ORD-008",
    title: "Traitement anti-inflammatoire douleur lombaire",
    date: "2024-11-01",
    patient: mockPatients[3],
    clinicalInfo:
      "Patient souffrant de lombalgies chroniques. IRM sans lésions graves. Bonne mobilité retrouvée.",
    prescriptionDetails:
      "1. Ibuprofène 400mg - 1 cp × 3/jour après les repas pendant 2 semaines\n2. Paracétamol 500mg - 1-2 cp toutes les 6 heures si besoin\n3. Décontractile musculaire (Thiocolchicoside 4mg) - 1 cp × 2/jour pendant 5 jours\n4. Kinésithérapie - 3 séances/semaine pendant 4 semaines\n5. Port d'une ceinture lombaire lors des efforts",
    createdAt: "2024-11-01T09:30:00",
    createdBy: "Vous",
  },
];
