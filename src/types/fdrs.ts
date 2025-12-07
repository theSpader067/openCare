export type FDRType = "tabac" | "alcool" | "HTA" | "dyslipidémie" | "diabète";

export type TabacData = {
  duréeExposition?: string; // en années
  quantitéPaquetAnnée?: string; // nombre de paquet-années
  évaluationDépendance?: string; // score Fagerstrom ou texte
  fagerstromScore?: number; // 0-10 score
};

export type AlcoolData = {
  quantité?: string;
  fréquence?: string;
};

export type HTAData = {
  description?: string;
};

export type DyslipidémieData = {
  description?: string;
};

export type DiabèteData = {
  description?: string;
};

// Pediatric ATCDS Types
export type GrossesseData = {
  suivi: boolean; // suivi ou non
  conditionsDeVie?: string; // conditions de vie
  surveillance?: string; // surveillance
  examenesComplementaires?: string; // examens complémentaires
  traitements?: string; // traitements éventuels
};

export type AccouchementData = {
  aTerme: boolean | null; // à terme ou non
  semainesAmenorrhee?: string; // nombre de SA si prématuré
  circonstances?: string; // anoxie périnatale, voie basse, césarienne, etc.
  indication?: string; // indication de la césarienne si applicable
};

export type EtatNaissanceData = {
  apgarMin?: string; // Apgar à 1 min
  apgarMax?: string; // Apgar à 5 min
  poids?: string; // poids en grammes
  taille?: string; // taille en cm
  perimetre?: string; // périmètre crânien en cm
};

export type RegimeNourrissonData = {
  // Régime du nourrisson - Nature du premier aliment
  premierAlimentType?: "lait_mere" | "preparation"; // lait de mère ou préparations
  allaitement?: {
    modalites?: string; // modalités de l'allaitement
    duree?: string; // durée de l'allaitement
  };
  preparation?: {
    dateIntroductionProteines?: string; // date d'introduction des protéines du lait de vache
  };
  // Régime actuel
  regimeActuel?: {
    typeLait?: string; // type de lait actuel
    diversificationNotes?: string; // notes sur la diversification
    gluten?: string; // date introduction gluten
    legumes?: string; // date introduction légumes
    fruits?: string; // date introduction fruits
    viandes?: string; // date introduction viandes
    repas?: {
      nombre?: string; // nombre de repas
      horaires?: string; // horaires des repas
      duree?: string; // durée des repas
      volume?: string; // volume des repas
      composition?: string; // composition des repas
    };
  };
  // Complément au régime
  complementRegime?: {
    vitaminD?: {
      nom?: string; // nom du produit
      dose?: string; // dose
    };
    vitaminK?: {
      nom?: string;
      dose?: string;
    };
    fluor?: {
      nom?: string;
      dose?: string;
    };
    fer?: {
      nom?: string;
      dose?: string;
    };
  };
};

export type DeveloppementPsychomotorData = {
  deambulation?: {
    ageMois?: string; // age en mois quand a commencé à marcher
    notes?: string;
  };
  langage?: {
    premiersMotsAgeMois?: string; // age des premiers mots
    phrasesAgeMois?: string; // age des phrases
    notes?: string;
  };
  acquisitionsMotrices?: string; // Autres acquisitions motrices
  acquisitionsIntellectuelles?: string; // Acquisitions intellectuelles
  comportement?: string; // Comportement et socialisation
  notes?: string; // Notes générales
};

export type PediatricATCDSData = {
  grossesse?: GrossesseData;
  accouchement?: AccouchementData;
  etatNaissance?: EtatNaissanceData;
  regimeNourisson?: RegimeNourrissonData;
  developpementPsychomotor?: DeveloppementPsychomotorData;
};

export type ParentData = {
  age?: string;
  profession?: string;
  origin?: string;
};

export type FamilyATCDSData = {
  pere?: ParentData;
  mere?: ParentData;
  consanguinity?: "yes" | "no";
  consanguinityDegree?: string; // e.g., "2e degré", "3e degré", "cousins au 2e degré"
  pathologies?: string;
  siblingsCount?: string;
  siblingsInfo?: string;
};

export type FDRData = {
  type: FDRType;
  selected: boolean;
  tabac?: TabacData;
  alcool?: AlcoolData;
  HTA?: HTAData;
  dyslipidémie?: DyslipidémieData;
  diabète?: DiabèteData;
};

export type FDRsState = {
  fdrs: FDRData[];
};

export function initializeFDRs(): FDRData[] {
  return [
    { type: "tabac", selected: false },
    { type: "alcool", selected: false },
    { type: "HTA", selected: false },
    { type: "dyslipidémie", selected: false },
    { type: "diabète", selected: false },
  ];
}
