"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  PediatricATCDSData,
  RegimeNourrissonData,
  DeveloppementPsychomotorData,
  FamilyATCDSData,
} from "@/types/fdrs";

/**
 * Format pediatric ATCDS data into a comprehensive paragraph for storage in atcdsMedicaux field
 * This consolidates: Grossesse, Accouchement, Nutrition, Développement, and Medical History
 */
export function formatPediatricATCDSParagraph(
  data: PediatricATCDSData
): string {
  if (!data || Object.keys(data).length === 0) return "";

  const sections: string[] = [];

  // SECTION 1: GROSSESSE ET NAISSANCE
  if (data.grossesse || data.accouchement || data.etatNaissance) {
    const parts: string[] = [];

    if (data.grossesse) {
      const g = data.grossesse;
      const grossesseText = g.suivi === false ? "non suivi" : "suivi";
      parts.push(`Grossesse ${grossesseText}`);
      if (g.suivi && g.conditionsDeVie)
        parts.push(`conditions de vie: ${g.conditionsDeVie}`);
      if (g.surveillance) parts.push(`surveillance: ${g.surveillance}`);
      if (g.examenesComplementaires)
        parts.push(`examens: ${g.examenesComplementaires}`);
      if (g.traitements) parts.push(`traitements: ${g.traitements}`);
    }

    if (data.accouchement) {
      const a = data.accouchement;
      if (a.aTerme === true) {
        parts.push("Accouchement à terme");
      } else if (a.aTerme === false) {
        const sa = a.semainesAmenorrhee ? ` à ${a.semainesAmenorrhee} SA` : "";
        parts.push(`Accouchement prématuré${sa}`);
      }
      if (a.circonstances)
        parts.push(`circonstances: ${a.circonstances}`);
      if (a.indication) parts.push(`indication: ${a.indication}`);
    }

    if (data.etatNaissance) {
      const e = data.etatNaissance;
      const etatDetails: string[] = [];
      if (e.apgarMin) etatDetails.push(`Apgar 1min ${e.apgarMin}`);
      if (e.apgarMax) etatDetails.push(`Apgar 5min ${e.apgarMax}`);
      if (e.poids) etatDetails.push(`${e.poids}g`);
      if (e.taille) etatDetails.push(`${e.taille}cm`);
      if (e.perimetre) etatDetails.push(`PC ${e.perimetre}cm`);
      if (etatDetails.length > 0) {
        parts.push(`État à la naissance: ${etatDetails.join(", ")}`);
      }
    }

    if (parts.length > 0) {
      sections.push(`GROSSESSE ET NAISSANCE: ${parts.join("; ")}`);
    }
  }

  // SECTION 2: RÉGIME DU NOURRISSON
  if (data.regimeNourisson) {
    const r = data.regimeNourisson;
    const parts: string[] = [];

    if (r.premierAlimentType) {
      if (r.premierAlimentType === "lait_mere") {
        parts.push("Premier aliment: lait maternel");
        if (r.allaitement?.modalites)
          parts.push(`modalités: ${r.allaitement.modalites}`);
        if (r.allaitement?.duree) parts.push(`durée: ${r.allaitement.duree}`);
      } else if (r.premierAlimentType === "preparation") {
        parts.push("Premier aliment: préparations pour nourrisson");
        if (r.preparation?.dateIntroductionProteines)
          parts.push(`introduction protéines: ${r.preparation.dateIntroductionProteines}`);
      }
    }

    if (r.regimeActuel) {
      const ra = r.regimeActuel;
      if (ra.typeLait) parts.push(`Lait actuel: ${ra.typeLait}`);

      const diversif: string[] = [];
      if (ra.gluten) diversif.push(`gluten ${ra.gluten}`);
      if (ra.legumes) diversif.push(`légumes ${ra.legumes}`);
      if (ra.fruits) diversif.push(`fruits ${ra.fruits}`);
      if (ra.viandes) diversif.push(`viandes ${ra.viandes}`);
      if (diversif.length > 0)
        parts.push(`Diversification: ${diversif.join(", ")}`);

      if (ra.repas) {
        const repasDetails: string[] = [];
        if (ra.repas.nombre) repasDetails.push(`${ra.repas.nombre} repas`);
        if (ra.repas.horaires) repasDetails.push(`${ra.repas.horaires}`);
        if (ra.repas.duree) repasDetails.push(`durée ${ra.repas.duree}`);
        if (ra.repas.volume) repasDetails.push(`${ra.repas.volume}`);
        if (repasDetails.length > 0) parts.push(`Repas: ${repasDetails.join(", ")}`);
      }
    }

    if (r.complementRegime) {
      const c = r.complementRegime;
      const compl: string[] = [];
      if (c.vitaminD?.nom) compl.push(`Vit D ${c.vitaminD.dose || c.vitaminD.nom}`);
      if (c.vitaminK?.nom) compl.push(`Vit K ${c.vitaminK.dose || c.vitaminK.nom}`);
      if (c.fluor?.nom) compl.push(`Fluor ${c.fluor.dose || c.fluor.nom}`);
      if (c.fer?.nom) compl.push(`Fer ${c.fer.dose || c.fer.nom}`);
      if (compl.length > 0) parts.push(`Compléments: ${compl.join(", ")}`);
    }

    if (parts.length > 0) {
      sections.push(`RÉGIME DU NOURRISSON: ${parts.join("; ")}`);
    }
  }

  // SECTION 3: DÉVELOPPEMENT PSYCHOMOTEUR
  if (data.developpementPsychomotor) {
    const d = data.developpementPsychomotor;
    const parts: string[] = [];

    if (d.deambulation?.ageMois)
      parts.push(`Marche: ${d.deambulation.ageMois} mois`);
    if (d.deambulation?.notes)
      parts.push(`remarques déambulation: ${d.deambulation.notes}`);

    if (d.langage?.premiersMotsAgeMois)
      parts.push(`Premiers mots: ${d.langage.premiersMotsAgeMois} mois`);
    if (d.langage?.phrasesAgeMois)
      parts.push(`Premières phrases: ${d.langage.phrasesAgeMois} mois`);
    if (d.langage?.notes)
      parts.push(`remarques langage: ${d.langage.notes}`);

    if (d.acquisitionsMotrices)
      parts.push(`Acquisitions motrices: ${d.acquisitionsMotrices}`);
    if (d.acquisitionsIntellectuelles)
      parts.push(
        `Acquisitions intellectuelles: ${d.acquisitionsIntellectuelles}`
      );
    if (d.comportement)
      parts.push(`Comportement: ${d.comportement}`);
    if (d.notes) parts.push(`Notes: ${d.notes}`);

    if (parts.length > 0) {
      sections.push(`DÉVELOPPEMENT PSYCHOMOTEUR: ${parts.join("; ")}`);
    }
  }

  // SECTION 4: ANTÉCÉDENTS MÉDICAUX
  if (data.medicalHistory) {
    sections.push(`ANTÉCÉDENTS MÉDICAUX: ${data.medicalHistory}`);
  }

  return sections.join(". ");
}

/**
 * Parse pediatric ATCDS paragraph back into structured data
 */
export function parsePediatricATCDSParagraph(
  paragraph: string
): PediatricATCDSData {
  if (!paragraph) return {};

  const data: PediatricATCDSData = {};

  // Parse GROSSESSE ET NAISSANCE section
  const grossesseMatch = paragraph.match(
    /GROSSESSE ET NAISSANCE:\s*(.+?)(?=RÉGIME NOURRISSON:|DÉVELOPPEMENT PSYCHOMOTEUR:|$)/is
  );
  if (grossesseMatch) {
    const text = grossesseMatch[1];
    const grossesse: any = {};
    const accouchement: any = {};
    const etatNaissance: any = {};

    // Grossesse parsing
    if (text.match(/Grossesse\s+non\s+suivi/i))
      grossesse.suivi = false;
    else if (text.match(/Grossesse\s+suivi/i))
      grossesse.suivi = true;

    const conditionsMatch = text.match(/Conditions\s+de\s+vie:\s*([^.]+?)(?=\.|,|$)/i);
    if (conditionsMatch) grossesse.conditionsDeVie = conditionsMatch[1].trim();

    const surveillanceMatch = text.match(/Surveillance:\s*([^.]+?)(?=\.|,|$)/i);
    if (surveillanceMatch) grossesse.surveillance = surveillanceMatch[1].trim();

    const examensMatch = text.match(/Examens:\s*([^.]+?)(?=\.|,|$)/i);
    if (examensMatch) grossesse.examenesComplementaires = examensMatch[1].trim();

    const traitementsMatch = text.match(/Traitements:\s*([^.]+?)(?=\.|,|$)/i);
    if (traitementsMatch) grossesse.traitements = traitementsMatch[1].trim();

    if (Object.keys(grossesse).length > 0) data.grossesse = grossesse;

    // Accouchement parsing
    if (text.match(/Accouchement\s+à\s+terme/i))
      accouchement.aTerme = true;
    else if (text.match(/Accouchement\s+prématuré/i)) {
      accouchement.aTerme = false;
      const saMatch = text.match(/Accouchement\s+prématuré\s*\((\d+)\s*SA\)/i);
      if (saMatch) accouchement.semainesAmenorrhee = saMatch[1];
    }

    const circonstancesMatch = text.match(/Circonstances:\s*([^.]+?)(?=\.|,|$)/i);
    if (circonstancesMatch)
      accouchement.circonstances = circonstancesMatch[1].trim();

    const indicationMatch = text.match(/Indication:\s*([^.]+?)(?=\.|,|$)/i);
    if (indicationMatch) accouchement.indication = indicationMatch[1].trim();

    if (Object.keys(accouchement).length > 0) data.accouchement = accouchement;

    // État naissance parsing
    const apgarMinMatch = text.match(/Apgar\s+1min:\s*(\d+)/i);
    if (apgarMinMatch) etatNaissance.apgarMin = apgarMinMatch[1];

    const apgarMaxMatch = text.match(/Apgar\s+5min:\s*(\d+)/i);
    if (apgarMaxMatch) etatNaissance.apgarMax = apgarMaxMatch[1];

    const poidsMatch = text.match(/Poids:\s*(\d+)g/i);
    if (poidsMatch) etatNaissance.poids = poidsMatch[1];

    const tailleMatch = text.match(/Taille:\s*(\d+)cm/i);
    if (tailleMatch) etatNaissance.taille = tailleMatch[1];

    const pcMatch = text.match(/PC:\s*(\d+)cm/i);
    if (pcMatch) etatNaissance.perimetre = pcMatch[1];

    if (Object.keys(etatNaissance).length > 0) data.etatNaissance = etatNaissance;
  }

  // Parse RÉGIME NOURRISSON section
  const regimeMatch = paragraph.match(
    /RÉGIME NOURRISSON:\s*(.+?)(?=DÉVELOPPEMENT PSYCHOMOTEUR:|$)/is
  );
  if (regimeMatch) {
    const text = regimeMatch[1];
    const regimeNourisson: any = {};

    if (text.match(/Premier\s+aliment:\s*Lait\s+maternel/i)) {
      regimeNourisson.premierAlimentType = "lait_mere";
      const allaitementData: any = {};

      const modalitesMatch = text.match(/Modalités:\s*([^.]+?)(?=\.|,|$)/i);
      if (modalitesMatch)
        allaitementData.modalites = modalitesMatch[1].trim();

      const dureeMatch = text.match(/Durée:\s*([^.]+?)(?=\.|,|$)/i);
      if (dureeMatch) allaitementData.duree = dureeMatch[1].trim();

      if (Object.keys(allaitementData).length > 0)
        regimeNourisson.allaitement = allaitementData;
    } else if (text.match(/Premier\s+aliment:\s*Préparations\s+pour\s+nourrisson/i)) {
      regimeNourisson.premierAlimentType = "preparation";
      const preparationData: any = {};

      const proteinesMatch = text.match(/Protéines:\s*([^.]+?)(?=\.|,|$)/i);
      if (proteinesMatch)
        preparationData.dateIntroductionProteines = proteinesMatch[1].trim();

      if (Object.keys(preparationData).length > 0)
        regimeNourisson.preparation = preparationData;
    }

    // Parse Régime actuel
    const regimeActuelData: any = {};

    const laitActuelMatch = text.match(/Lait\s+actuel:\s*([^.]+?)(?=\.|,|$)/i);
    if (laitActuelMatch) regimeActuelData.typeLait = laitActuelMatch[1].trim();

    // Diversification - extract each item separated by comma or newline
    const diversifMatch = text.match(/Diversification:\s*([^.]+?)(?=\.|$)/i);
    if (diversifMatch) {
      const diversifText = diversifMatch[1];
      const diversifData: any = {};

      const glutenMatch = diversifText.match(/Gluten\s+([^,]+)/i);
      if (glutenMatch) diversifData.gluten = glutenMatch[1].trim();

      const legumesMatch = diversifText.match(/Légumes\s+([^,]+)/i);
      if (legumesMatch) diversifData.legumes = legumesMatch[1].trim();

      const fruitsMatch = diversifText.match(/Fruits\s+([^,]+)/i);
      if (fruitsMatch) diversifData.fruits = fruitsMatch[1].trim();

      const viandesMatch = diversifText.match(/Viandes\s+([^,]+)/i);
      if (viandesMatch) diversifData.viandes = viandesMatch[1].trim();

      if (Object.keys(diversifData).length > 0) {
        regimeActuelData.diversificationNotes = Object.entries(diversifData)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ");
      }
    }

    // Repas details
    const repasMatch = text.match(/Repas:\s*([^.]+?)(?=\.|$)/i);
    if (repasMatch) {
      const repasText = repasMatch[1];
      const repasData: any = {};

      const repasNombreMatch = repasText.match(/(\d+)/);
      if (repasNombreMatch) repasData.nombre = repasNombreMatch[1].trim();

      const horairesMatch = repasText.match(/(\d{1,2}h\d{2}[^,]*)/i);
      if (horairesMatch) repasData.horaires = horairesMatch[1].trim();

      const dureeRepasMatch = repasText.match(/Durée[^:]*:\s*([^,]+)/i);
      if (dureeRepasMatch) repasData.duree = dureeRepasMatch[1].trim();

      const volumeMatch = repasText.match(/Volume[^:]*:\s*([^,]+)/i);
      if (volumeMatch) repasData.volume = volumeMatch[1].trim();

      const compositionMatch = repasText.match(/Composition[^:]*:\s*([^.]+)/i);
      if (compositionMatch) repasData.composition = compositionMatch[1].trim();

      if (Object.keys(repasData).length > 0) regimeActuelData.repas = repasData;
    }

    if (Object.keys(regimeActuelData).length > 0)
      regimeNourisson.regimeActuel = regimeActuelData;

    // Parse Compléments
    const complementsMatch = text.match(/Compléments:\s*([^.]+?)(?=\.|$)/i);
    if (complementsMatch) {
      const complementText = complementsMatch[1];
      const complementData: any = {};

      const vitDMatch = complementText.match(/Vit\s+D:\s*([^,]+?)(?:\s+(\d+[^,]*))?\s*,?/i);
      if (vitDMatch) {
        complementData.vitaminD = {
          nom: vitDMatch[1].trim(),
          dose: vitDMatch[2] ? vitDMatch[2].trim() : undefined,
        };
      }

      const vitKMatch = complementText.match(/Vit\s+K:\s*([^,]+?)(?:\s+(\d+[^,]*))?\s*,?/i);
      if (vitKMatch) {
        complementData.vitaminK = {
          nom: vitKMatch[1].trim(),
          dose: vitKMatch[2] ? vitKMatch[2].trim() : undefined,
        };
      }

      const fluorMatch = complementText.match(/Fluor:\s*([^,]+?)(?:\s+(\d+[^,]*))?\s*,?/i);
      if (fluorMatch) {
        complementData.fluor = {
          nom: fluorMatch[1].trim(),
          dose: fluorMatch[2] ? fluorMatch[2].trim() : undefined,
        };
      }

      const ferMatch = complementText.match(/Fer:\s*([^,]+?)(?:\s+(\d+[^,]*))?\s*,?/i);
      if (ferMatch) {
        complementData.fer = {
          nom: ferMatch[1].trim(),
          dose: ferMatch[2] ? ferMatch[2].trim() : undefined,
        };
      }

      if (Object.keys(complementData).length > 0)
        regimeNourisson.complementRegime = complementData;
    }

    if (Object.keys(regimeNourisson).length > 0) data.regimeNourisson = regimeNourisson;
  }

  // Parse DÉVELOPPEMENT PSYCHOMOTEUR section
  const devMatch = paragraph.match(/DÉVELOPPEMENT PSYCHOMOTEUR:\s*(.+?)$/is);
  if (devMatch) {
    const text = devMatch[1];
    const dev: any = {};

    const marcheMatch = text.match(/Marche:\s*(\d+)\s*mois/i);
    if (marcheMatch) {
      dev.deambulation = { ageMois: marcheMatch[1] };
    }

    const premiersMotsMatch = text.match(/Premiers\s+mots:\s*(\d+)\s*mois/i);
    if (premiersMotsMatch) {
      if (!dev.langage) dev.langage = {};
      dev.langage.premiersMotsAgeMois = premiersMotsMatch[1];
    }

    const premieresPhrasesMatch = text.match(
      /Premières\s+phrases:\s*(\d+)\s*mois/i
    );
    if (premieresPhrasesMatch) {
      if (!dev.langage) dev.langage = {};
      dev.langage.phrasesAgeMois = premieresPhrasesMatch[1];
    }

    const motricesMatch = text.match(/Acquisitions\s+motrices:\s*([^.]+?)(?=\.|,|$)/i);
    if (motricesMatch) dev.acquisitionsMotrices = motricesMatch[1].trim();

    const intellectuellesMatch = text.match(
      /Acquisitions\s+intellectuelles:\s*([^.]+?)(?=\.|,|$)/i
    );
    if (intellectuellesMatch)
      dev.acquisitionsIntellectuelles = intellectuellesMatch[1].trim();

    const comportementMatch = text.match(/Comportement:\s*([^.]+?)(?=\.|,|$)/i);
    if (comportementMatch) dev.comportement = comportementMatch[1].trim();

    if (Object.keys(dev).length > 0) data.developpementPsychomotor = dev;
  }

  // Parse ATCDS MÉDICAUX section
  const medicalMatch = paragraph.match(/ATCDS\s+MÉDICAUX:\s*([^.]+?)(?=\.|$)/i);
  if (medicalMatch) {
    data.medicalHistory = medicalMatch[1].trim();
  }

  return data;
}

/**
 * Parse family ATCDS paragraph back into structured data
 */
export function parseFamilyATCDSParagraph(
  paragraph: string
): FamilyATCDSData {
  if (!paragraph) return {};

  const data: FamilyATCDSData = {};

  // Parse Père section
  const pereMatch = paragraph.match(/Père[^,]*,?\s*([^.]*?)(?=Mère|Consanguinité|Fratrie|Antécédents|$)/i);
  if (pereMatch) {
    const pereText = pereMatch[1];
    const pere: any = {};

    const ageMatch = pereText.match(/âge:\s*(\d+)/i);
    if (ageMatch) pere.age = ageMatch[1];

    const profMatch = pereText.match(/profession:\s*([^,]+?)(?=,|$)/i);
    if (profMatch) pere.profession = profMatch[1].trim();

    const originMatch = pereText.match(/pays\s+d'?origine:\s*([^,]+?)(?=,|$)/i);
    if (originMatch) pere.origin = originMatch[1].trim();

    if (Object.keys(pere).length > 0) data.pere = pere;
  }

  // Parse Mère section
  const mereMatch = paragraph.match(/Mère[^,]*,?\s*([^.]*?)(?=Consanguinité|Fratrie|Antécédents|$)/i);
  if (mereMatch) {
    const mereText = mereMatch[1];
    const mere: any = {};

    const ageMatch = mereText.match(/âge:\s*(\d+)/i);
    if (ageMatch) mere.age = ageMatch[1];

    const profMatch = mereText.match(/profession:\s*([^,]+?)(?=,|$)/i);
    if (profMatch) mere.profession = profMatch[1].trim();

    const originMatch = mereText.match(/pays\s+d'?origine:\s*([^,]+?)(?=,|$)/i);
    if (originMatch) mere.origin = originMatch[1].trim();

    if (Object.keys(mere).length > 0) data.mere = mere;
  }

  // Parse Consanguinité
  const consMatch = paragraph.match(/Consanguinité:\s*(Oui|Non|yes|no)(?:\s*\(([^)]+)\))?/i);
  if (consMatch) {
    const consValue = consMatch[1].toLowerCase();
    data.consanguinity = (consValue === "oui" || consValue === "yes") ? "yes" : "no";
    if (consMatch[2]) {
      data.consanguinityDegree = consMatch[2].trim();
    }
  }

  // Parse Antécédents personnels
  const pathoMatch = paragraph.match(/Antécédents\s+personnels:\s*([^.]+?)(?=\.|Fratrie|$)/i);
  if (pathoMatch) {
    data.pathologies = pathoMatch[1].trim();
  }

  // Parse Fratrie
  const fraterieMatch = paragraph.match(/Fratrie:\s*(\d+)\s*frères\s*\/\s*sœurs/i);
  if (fraterieMatch) {
    data.siblingsCount = fraterieMatch[1];
  }

  const fraterieInfoMatch = paragraph.match(/Antécédents\s+fratrie:\s*([^.]+?)(?=\.|$)/i);
  if (fraterieInfoMatch) {
    data.siblingsInfo = fraterieInfoMatch[1].trim();
  }

  return data;
}

interface ATCDSTabsProps {
  medicalHistory: string;
  surgicalHistory: string;
  onMedicalHistoryChange: (value: string) => void;
  onSurgicalHistoryChange: (value: string) => void;
  pediatricData?: PediatricATCDSData;
  onPediatricDataChange?: (data: PediatricATCDSData) => void;
  activeTab?: "adulte" | "enfant";
  onActiveTabChange?: (tab: "adulte" | "enfant") => void;
}

export function ATCDSTabs({
  medicalHistory,
  surgicalHistory,
  onMedicalHistoryChange,
  onSurgicalHistoryChange,
  pediatricData = {},
  onPediatricDataChange,
  activeTab: externalActiveTab,
  onActiveTabChange,
}: ATCDSTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<"adulte" | "enfant">("adulte");
  // Use external tab if provided, otherwise use internal state
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = onActiveTabChange ? onActiveTabChange : setInternalActiveTab;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["grossesse", "regime", "developpement", "chirurgical", "medical"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePediatricChange = (newData: PediatricATCDSData) => {
    if (onPediatricDataChange) {
      onPediatricDataChange(newData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs Navigation - Clean Pill Shape Style */}
      <div className="flex gap-4 bg-white p-1 border border-slate-200 rounded-full inline-flex">
        <button
          type="button"
          onClick={() => setActiveTab("adulte")}
          className={`px-8 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2 ${
            activeTab === "adulte"
              ? "bg-cyan-600 text-white border-cyan-600"
              : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
          }`}
        >
          <span className="hidden sm:inline">👨‍⚕️ </span>Adulte
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("enfant")}
          className={`px-8 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2 ${
            activeTab === "enfant"
              ? "bg-cyan-600 text-white border-cyan-600"
              : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
          }`}
        >
          <span className="hidden sm:inline">👶 </span>Enfant
        </button>
      </div>

      {/* Adulte Tab */}
      {activeTab === "adulte" && (
        <div className="space-y-4">
          {/* Medical History Section */}
          <div>
            <label className="text-sm font-medium text-[#221b5b]">
              ATCDs médicaux
            </label>
            <div className="mt-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "HTA",
                  "Diabète",
                  "Hépatopathie",
                  "Néphropathie",
                  "Cardiopathie",
                  "Asthme",
                  "BPCO",
                  "Obésité",
                  "Dyslipidémie",
                  "Hypercholestérolémie",
                  "Hypothyroïdie",
                  "Hyperthyroïdie",
                  "Épilepsie",
                  "Migraines",
                  "Dépression",
                  "Anxiété",
                  "VIH",
                  "Hépatite",
                  "Tuberculose",
                  "Autres maladies chroniques",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentText = medicalHistory.trim();
                      const newText = currentText
                        ? `${currentText}, ${tag}`
                        : tag;
                      onMedicalHistoryChange(newText);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={medicalHistory}
              onChange={(e) => onMedicalHistoryChange(e.target.value)}
              placeholder="Décrivez les antécédents médicaux (séparez par des lignes ou des virgules)"
              rows={4}
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
            />
          </div>

          {/* Surgical History Section */}
          <div>
            <label className="text-sm font-medium text-[#221b5b]">
              ATCDs chirurgicaux
            </label>
            <div className="mt-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "Appendicectomie",
                  "Cholécystectomie",
                  "Laparoscopie",
                  "Coeliostomie",
                  "Hystérectomie",
                  "Césarienne",
                  "Cure hernie",
                  "Ligature trompe",
                  "Vasectomie",
                  "Prostatectomie",
                  "Néphrectomie",
                  "Thyroïdectomie",
                  "Mastectomie",
                  "Tumorectomie",
                  "Péridural",
                  "Chirurgie bariatrique",
                  "Chirurgie cardiaque",
                  "Chirurgie vasculaire",
                  "Chirurgie ORL",
                  "Autres chirurgies",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentText = surgicalHistory.trim();
                      const newText = currentText
                        ? `${currentText}, ${tag}`
                        : tag;
                      onSurgicalHistoryChange(newText);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border border-amber-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={surgicalHistory}
              onChange={(e) => onSurgicalHistoryChange(e.target.value)}
              placeholder="Décrivez les antécédents chirurgicaux (séparez par des lignes ou des virgules)"
              rows={4}
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
            />
          </div>
        </div>
      )}

      {/* Enfant Tab */}
      {activeTab === "enfant" && (
        <div className="space-y-4">
          {/* Section 1: Grossesse, Accouchement et État à la Naissance */}
          <CollapsibleSection
            title="Grossesse, accouchement et état à la naissance"
            isExpanded={expandedSections.has("grossesse")}
            onToggle={() => toggleSection("grossesse")}
            icon="🤰"
          >
            <GrossesseAccouchementSection
              data={pediatricData}
              onChange={handlePediatricChange}
            />
          </CollapsibleSection>

          {/* Section 2: Régime du Nourrisson */}
          <CollapsibleSection
            title="Régime du nourrisson"
            isExpanded={expandedSections.has("regime")}
            onToggle={() => toggleSection("regime")}
            icon="🍼"
          >
            <RegimeNourrissonSection
              data={pediatricData}
              onChange={handlePediatricChange}
            />
          </CollapsibleSection>

          {/* Section 3: Développement Psychomoteur */}
          <CollapsibleSection
            title="Développement psychomoteur"
            isExpanded={expandedSections.has("developpement")}
            onToggle={() => toggleSection("developpement")}
            icon="👶"
          >
            <DeveloppementPsychomotorSection
              data={pediatricData}
              onChange={handlePediatricChange}
            />
          </CollapsibleSection>

          {/* Section 4: ATCDs Médicaux Pédiatriques */}
          <CollapsibleSection
            title="ATCDs médicaux"
            isExpanded={expandedSections.has("medical")}
            onToggle={() => toggleSection("medical")}
            icon="🏥"
          >
            <PediatricMedicalHistorySection
              data={pediatricData}
              onChange={handlePediatricChange}
            />
          </CollapsibleSection>

          {/* Section 5: ATCDs Chirurgicaux Pédiatriques */}
          <CollapsibleSection
            title="ATCDs chirurgicaux pédiatriques"
            isExpanded={expandedSections.has("chirurgical")}
            onToggle={() => toggleSection("chirurgical")}
            icon="⚕️"
          >
            <PediatricSurgicalHistorySection
              surgicalHistory={surgicalHistory}
              onSurgicalHistoryChange={onSurgicalHistoryChange}
            />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

/* ==================== COLLAPSIBLE SECTION COMPONENT ==================== */
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  icon?: string;
}

function CollapsibleSection({
  title,
  children,
  isExpanded,
  onToggle,
  icon,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <h4 className="font-semibold text-slate-900 text-left">{title}</h4>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-600 transition-transform ${
            isExpanded ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-5 py-4 space-y-4 bg-slate-50/50">{children}</div>
      )}
    </div>
  );
}

/* ==================== SECTION 1: GROSSESSE ET ACCOUCHEMENT ==================== */
function GrossesseAccouchementSection({
  data,
  onChange,
}: {
  data: PediatricATCDSData;
  onChange: (data: PediatricATCDSData) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Grossesse */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">Grossesse</h5>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Suivi de la grossesse
            </label>
            <div className="flex gap-3">
              <ToggleButton
                label="Suivi"
                isActive={data.grossesse?.suivi === true}
                onClick={() => {
                  onChange({
                    ...data,
                    grossesse: {
                      ...(data.grossesse || { suivi: false }),
                      suivi: true,
                    },
                  });
                }}
              />
              <ToggleButton
                label="Non suivi"
                isActive={data.grossesse?.suivi === false}
                onClick={() => {
                  onChange({
                    ...data,
                    grossesse: {
                      ...(data.grossesse || { suivi: false }),
                      suivi: false,
                    },
                  });
                }}
              />
            </div>
          </div>

          {data.grossesse?.suivi && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <FormInput
                  label="Conditions de vie"
                  placeholder="Ex: Stable, précaire, monoparentale"
                  value={data.grossesse?.conditionsDeVie || ""}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      grossesse: {
                        ...data.grossesse!,
                        conditionsDeVie: value,
                      },
                    });
                  }}
                />
                <FormInput
                  label="Surveillance médicale"
                  placeholder="Ex: 8 visites, suivi régulier sans complications"
                  value={data.grossesse?.surveillance || ""}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      grossesse: {
                        ...data.grossesse!,
                        surveillance: value,
                      },
                    });
                  }}
                />
                <FormInput
                  label="Examens complémentaires"
                  placeholder="Ex: 3 échographies normales, GGT négatif"
                  value={data.grossesse?.examenesComplementaires || ""}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      grossesse: {
                        ...data.grossesse!,
                        examenesComplementaires: value,
                      },
                    });
                  }}
                />
                <FormInput
                  label="Traitements"
                  placeholder="Ex: Fer, acide folique, pas d'antibiotiques"
                  value={data.grossesse?.traitements || ""}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      grossesse: {
                        ...data.grossesse!,
                        traitements: value,
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accouchement */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          Accouchement
        </h5>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Terme
            </label>
            <div className="flex gap-3 flex-wrap">
              <ToggleButton
                label="À terme"
                isActive={data.accouchement?.aTerme === true}
                onClick={() => {
                  onChange({
                    ...data,
                    accouchement: {
                      ...(data.accouchement || { aTerme: null }),
                      aTerme: true,
                    },
                  });
                }}
              />
              <ToggleButton
                label="Prématuré"
                isActive={data.accouchement?.aTerme === false}
                onClick={() => {
                  onChange({
                    ...data,
                    accouchement: {
                      ...(data.accouchement || { aTerme: null }),
                      aTerme: false,
                    },
                  });
                }}
              />
            </div>
          </div>

          {data.accouchement?.aTerme === false && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4">
              <FormInput
                label="Nombre de SA (semaines d'aménorrhée)"
                placeholder="Ex: 32, 34, 36"
                value={data.accouchement?.semainesAmenorrhee || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    accouchement: {
                      ...data.accouchement!,
                      semainesAmenorrhee: value,
                    },
                  });
                }}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Circonstances de l'accouchement
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {["Voie basse", "Anoxie périnatale", "Césarienne"].map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        accouchement: {
                          ...data.accouchement,
                          aTerme: data.accouchement?.aTerme ?? null,
                          circonstances:
                            data.accouchement?.circonstances === option
                              ? ""
                              : option,
                        },
                      });
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                      data.accouchement?.circonstances === option
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>

          {data.accouchement?.circonstances === "Césarienne" && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4">
              <FormInput
                label="Indication de la césarienne"
                placeholder="Dystocie, souffrance fœtale, etc."
                value={data.accouchement?.indication || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    accouchement: {
                      ...data.accouchement!,
                      indication: value,
                    },
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* État de l'enfant à la naissance */}
      <div>
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          État de l'enfant à la naissance
        </h5>
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <FormInput
              label="Apgar 1 min"
              value={data.etatNaissance?.apgarMin || ""}
              onChange={(value) => {
                onChange({
                  ...data,
                  etatNaissance: {
                    ...data.etatNaissance,
                    apgarMin: value,
                  },
                });
              }}
              placeholder="Ex: 8"
              type="number"
            />
            <FormInput
              label="Apgar 5 min"
              value={data.etatNaissance?.apgarMax || ""}
              onChange={(value) => {
                onChange({
                  ...data,
                  etatNaissance: {
                    ...data.etatNaissance,
                    apgarMax: value,
                  },
                });
              }}
              placeholder="Ex: 9"
              type="number"
            />
            <FormInput
              label="Poids (g)"
              value={data.etatNaissance?.poids || ""}
              onChange={(value) => {
                onChange({
                  ...data,
                  etatNaissance: {
                    ...data.etatNaissance,
                    poids: value,
                  },
                });
              }}
              placeholder="Ex: 3500"
            />
            <FormInput
              label="Taille (cm)"
              value={data.etatNaissance?.taille || ""}
              onChange={(value) => {
                onChange({
                  ...data,
                  etatNaissance: {
                    ...data.etatNaissance,
                    taille: value,
                  },
                });
              }}
              placeholder="Ex: 50"
            />
            <FormInput
              label="Périmètre crânien (cm)"
              value={data.etatNaissance?.perimetre || ""}
              onChange={(value) => {
                onChange({
                  ...data,
                  etatNaissance: {
                    ...data.etatNaissance,
                    perimetre: value,
                  },
                });
              }}
              placeholder="Ex: 35"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== SECTION 2: RÉGIME DU NOURRISSON ==================== */
function RegimeNourrissonSection({
  data,
  onChange,
}: {
  data: PediatricATCDSData;
  onChange: (data: PediatricATCDSData) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Nature du premier aliment */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          Nature du premier aliment
        </h5>

        <div className="space-y-3">
          <div className="flex gap-3">
            <ToggleButton
              label="Lait de mère"
              isActive={data.regimeNourisson?.premierAlimentType === "lait_mere"}
              onClick={() => {
                onChange({
                  ...data,
                  regimeNourisson: {
                    ...(data.regimeNourisson || {}),
                    premierAlimentType: "lait_mere",
                  },
                });
              }}
            />
            <ToggleButton
              label="Préparations pour nourrisson"
              isActive={
                data.regimeNourisson?.premierAlimentType === "preparation"
              }
              onClick={() => {
                onChange({
                  ...data,
                  regimeNourisson: {
                    ...(data.regimeNourisson || {}),
                    premierAlimentType: "preparation",
                  },
                });
              }}
            />
          </div>

          {data.regimeNourisson?.premierAlimentType === "lait_mere" && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  label="Modalités de l'allaitement"
                  placeholder="Ex: Exclusif, mixte avec biberon"
                  value={data.regimeNourisson?.allaitement?.modalites || ""}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      regimeNourisson: {
                        ...data.regimeNourisson!,
                        allaitement: {
                          ...(data.regimeNourisson?.allaitement || {}),
                          modalites: value,
                        },
                      },
                    });
                  }}
                />
                <FormInput
                  label="Durée de l'allaitement"
                  placeholder="Ex: 6 mois, jusqu'à 2 ans"
                  value={data.regimeNourisson?.allaitement?.duree || ""}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      regimeNourisson: {
                        ...data.regimeNourisson!,
                        allaitement: {
                          ...(data.regimeNourisson?.allaitement || {}),
                          duree: value,
                        },
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}

          {data.regimeNourisson?.premierAlimentType === "preparation" && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4">
              <FormInput
                label="Date d'introduction des protéines du lait de vache"
                placeholder="Ex: À partir de 6 mois, dès la naissance, etc."
                value={
                  data.regimeNourisson?.preparation
                    ?.dateIntroductionProteines || ""
                }
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      preparation: {
                        ...(data.regimeNourisson?.preparation || {}),
                        dateIntroductionProteines: value,
                      },
                    },
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Régime actuel */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          Régime actuel
        </h5>

        <div className="space-y-3">
          <FormInput
            label="Type de lait actuel"
            placeholder="Lait maternel, lait 1er âge, lait 2e âge, lait de vache, etc."
            value={data.regimeNourisson?.regimeActuel?.typeLait || ""}
            onChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  regimeActuel: {
                    ...(data.regimeNourisson?.regimeActuel || {}),
                    typeLait: value,
                  },
                },
              });
            }}
          />

          <div>
            <h6 className="text-sm font-medium text-slate-700 mb-3">
              Diversification alimentaire
            </h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormInput
                label="Gluten"
                placeholder="Date/Âge introduction"
                value={data.regimeNourisson?.regimeActuel?.gluten || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        gluten: value,
                      },
                    },
                  });
                }}
              />
              <FormInput
                label="Légumes"
                placeholder="Date/Âge introduction"
                value={data.regimeNourisson?.regimeActuel?.legumes || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        legumes: value,
                      },
                    },
                  });
                }}
              />
              <FormInput
                label="Fruits"
                placeholder="Date/Âge introduction"
                value={data.regimeNourisson?.regimeActuel?.fruits || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        fruits: value,
                      },
                    },
                  });
                }}
              />
              <FormInput
                label="Viandes"
                placeholder="Date/Âge introduction"
                value={data.regimeNourisson?.regimeActuel?.viandes || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        viandes: value,
                      },
                    },
                  });
                }}
              />
            </div>
          </div>

          <div>
            <h6 className="text-sm font-medium text-slate-700 mb-3">
              Détails des repas
            </h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <FormInput
                label="Nombre de repas"
                placeholder="Ex: 4 repas/jour"
                value={data.regimeNourisson?.regimeActuel?.repas?.nombre || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        repas: {
                          ...(data.regimeNourisson?.regimeActuel?.repas || {}),
                          nombre: value,
                        },
                      },
                    },
                  });
                }}
              />
              <FormInput
                label="Horaires"
                placeholder="Ex: 8h, 12h, 16h, 20h"
                value={data.regimeNourisson?.regimeActuel?.repas?.horaires || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        repas: {
                          ...(data.regimeNourisson?.regimeActuel?.repas || {}),
                          horaires: value,
                        },
                      },
                    },
                  });
                }}
              />
              <FormInput
                label="Durée des repas"
                placeholder="Ex: 20-30 min"
                value={data.regimeNourisson?.regimeActuel?.repas?.duree || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        repas: {
                          ...(data.regimeNourisson?.regimeActuel?.repas || {}),
                          duree: value,
                        },
                      },
                    },
                  });
                }}
              />
              <FormInput
                label="Volume par repas"
                placeholder="Ex: 200 ml"
                value={data.regimeNourisson?.regimeActuel?.repas?.volume || ""}
                onChange={(value) => {
                  onChange({
                    ...data,
                    regimeNourisson: {
                      ...data.regimeNourisson!,
                      regimeActuel: {
                        ...(data.regimeNourisson?.regimeActuel || {}),
                        repas: {
                          ...(data.regimeNourisson?.regimeActuel?.repas || {}),
                          volume: value,
                        },
                      },
                    },
                  });
                }}
              />
            </div>
          </div>

          <FormInput
            label="Composition des repas"
            placeholder="Describe the general composition"
            value={data.regimeNourisson?.regimeActuel?.repas?.composition || ""}
            onChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  regimeActuel: {
                    ...(data.regimeNourisson?.regimeActuel || {}),
                    repas: {
                      ...(data.regimeNourisson?.regimeActuel?.repas || {}),
                      composition: value,
                    },
                  },
                },
              });
            }}
            rows={3}
          />
        </div>
      </div>

      {/* Compléments au régime */}
      <div>
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          Compléments au régime
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitaminInput
            label="Vitamine D"
            nomValue={data.regimeNourisson?.complementRegime?.vitaminD?.nom || ""}
            doseValue={
              data.regimeNourisson?.complementRegime?.vitaminD?.dose || ""
            }
            onNomChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    vitaminD: {
                      ...(data.regimeNourisson?.complementRegime?.vitaminD ||
                        {}),
                      nom: value,
                    },
                  },
                },
              });
            }}
            onDoseChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    vitaminD: {
                      ...(data.regimeNourisson?.complementRegime?.vitaminD ||
                        {}),
                      dose: value,
                    },
                  },
                },
              });
            }}
          />

          <VitaminInput
            label="Vitamine K"
            nomValue={data.regimeNourisson?.complementRegime?.vitaminK?.nom || ""}
            doseValue={
              data.regimeNourisson?.complementRegime?.vitaminK?.dose || ""
            }
            onNomChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    vitaminK: {
                      ...(data.regimeNourisson?.complementRegime?.vitaminK ||
                        {}),
                      nom: value,
                    },
                  },
                },
              });
            }}
            onDoseChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    vitaminK: {
                      ...(data.regimeNourisson?.complementRegime?.vitaminK ||
                        {}),
                      dose: value,
                    },
                  },
                },
              });
            }}
          />

          <VitaminInput
            label="Fluor"
            nomValue={data.regimeNourisson?.complementRegime?.fluor?.nom || ""}
            doseValue={
              data.regimeNourisson?.complementRegime?.fluor?.dose || ""
            }
            onNomChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    fluor: {
                      ...(data.regimeNourisson?.complementRegime?.fluor || {}),
                      nom: value,
                    },
                  },
                },
              });
            }}
            onDoseChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    fluor: {
                      ...(data.regimeNourisson?.complementRegime?.fluor || {}),
                      dose: value,
                    },
                  },
                },
              });
            }}
          />

          <VitaminInput
            label="Fer"
            nomValue={data.regimeNourisson?.complementRegime?.fer?.nom || ""}
            doseValue={data.regimeNourisson?.complementRegime?.fer?.dose || ""}
            onNomChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    fer: {
                      ...(data.regimeNourisson?.complementRegime?.fer || {}),
                      nom: value,
                    },
                  },
                },
              });
            }}
            onDoseChange={(value) => {
              onChange({
                ...data,
                regimeNourisson: {
                  ...data.regimeNourisson!,
                  complementRegime: {
                    ...(data.regimeNourisson?.complementRegime || {}),
                    fer: {
                      ...(data.regimeNourisson?.complementRegime?.fer || {}),
                      dose: value,
                    },
                  },
                },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ==================== SECTION 3: DÉVELOPPEMENT PSYCHOMOTEUR ==================== */
function DeveloppementPsychomotorSection({
  data,
  onChange,
}: {
  data: PediatricATCDSData;
  onChange: (data: PediatricATCDSData) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Déambulation */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          Déambulation (Marche)
        </h5>

        <div className="space-y-3">
          <FormInput
            label="Âge de la première marche (mois)"
            placeholder="Ex: 12, 14, 18, etc."
            value={data.developpementPsychomotor?.deambulation?.ageMois || ""}
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  deambulation: {
                    ...(data.developpementPsychomotor?.deambulation || {}),
                    ageMois: value,
                  },
                },
              });
            }}
            type="number"
          />
          <FormInput
            label="Notes supplémentaires"
            placeholder="Difficultés, particularités, etc."
            value={data.developpementPsychomotor?.deambulation?.notes || ""}
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  deambulation: {
                    ...(data.developpementPsychomotor?.deambulation || {}),
                    notes: value,
                  },
                },
              });
            }}
            rows={2}
          />
        </div>
      </div>

      {/* Langage */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">Langage</h5>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormInput
              label="Premiers mots (mois)"
              placeholder="Ex: 10, 12, 15, etc."
              value={
                data.developpementPsychomotor?.langage?.premiersMotsAgeMois ||
                ""
              }
              onChange={(value) => {
                onChange({
                  ...data,
                  developpementPsychomotor: {
                    ...(data.developpementPsychomotor || {}),
                    langage: {
                      ...(data.developpementPsychomotor?.langage || {}),
                      premiersMotsAgeMois: value,
                    },
                  },
                });
              }}
              type="number"
            />
            <FormInput
              label="Premières phrases (mois)"
              placeholder="Ex: 18, 20, 24, etc."
              value={
                data.developpementPsychomotor?.langage?.phrasesAgeMois || ""
              }
              onChange={(value) => {
                onChange({
                  ...data,
                  developpementPsychomotor: {
                    ...(data.developpementPsychomotor || {}),
                    langage: {
                      ...(data.developpementPsychomotor?.langage || {}),
                      phrasesAgeMois: value,
                    },
                  },
                });
              }}
              type="number"
            />
          </div>
          <FormInput
            label="Notes sur le langage"
            placeholder="Qualité de la langue, bilinguisme, difficultés, etc."
            value={data.developpementPsychomotor?.langage?.notes || ""}
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  langage: {
                    ...(data.developpementPsychomotor?.langage || {}),
                    notes: value,
                  },
                },
              });
            }}
            rows={2}
          />
        </div>
      </div>

      {/* Autres acquisitions */}
      <div className="border-b border-slate-200 pb-5">
        <h5 className="font-semibold text-slate-800 mb-3 text-sm">
          Autres acquisitions
        </h5>

        <div className="space-y-3">
          <FormInput
            label="Acquisitions motrices"
            placeholder="Rouler, s'asseoir, ramper, etc."
            value={data.developpementPsychomotor?.acquisitionsMotrices || ""}
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  acquisitionsMotrices: value,
                },
              });
            }}
            rows={2}
          />
          <FormInput
            label="Acquisitions intellectuelles"
            placeholder="Reconnaissance, jeu, compréhension, etc."
            value={
              data.developpementPsychomotor?.acquisitionsIntellectuelles || ""
            }
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  acquisitionsIntellectuelles: value,
                },
              });
            }}
            rows={2}
          />
          <FormInput
            label="Comportement et socialisation"
            placeholder="Interactions sociales, autonomie, comportement, etc."
            value={data.developpementPsychomotor?.comportement || ""}
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  comportement: value,
                },
              });
            }}
            rows={2}
          />
          <FormInput
            label="Notes générales"
            placeholder="Observations supplémentaires sur le développement global"
            value={data.developpementPsychomotor?.notes || ""}
            onChange={(value) => {
              onChange({
                ...data,
                developpementPsychomotor: {
                  ...(data.developpementPsychomotor || {}),
                  notes: value,
                },
              });
            }}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

/* ==================== UI HELPER COMPONENTS ==================== */

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  rows?: number;
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rows,
}: FormInputProps) {
  if (rows) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
      />
    </div>
  );
}

interface ToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ToggleButton({ label, isActive, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border flex-1 ${
        isActive
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
      }`}
    >
      {label}
    </button>
  );
}

interface VitaminInputProps {
  label: string;
  nomValue: string;
  doseValue: string;
  onNomChange: (value: string) => void;
  onDoseChange: (value: string) => void;
}

function VitaminInput({
  label,
  nomValue,
  doseValue,
  onNomChange,
  onDoseChange,
}: VitaminInputProps) {
  return (
    <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
      <h6 className="font-medium text-slate-800 text-sm">{label}</h6>
      <FormInput
        label="Nom du produit"
        value={nomValue}
        onChange={onNomChange}
        placeholder="Ex: Adrigyl, Adeona, etc."
      />
      <FormInput
        label="Dose"
        value={doseValue}
        onChange={onDoseChange}
        placeholder="Ex: 1 goutte/jour, 1 ampoule/mois, etc."
      />
    </div>
  );
}

/* ==================== SECTION 4: ATCDS CHIRURGICAUX PÉDIATRIQUES ==================== */
function PediatricSurgicalHistorySection({
  surgicalHistory,
  onSurgicalHistoryChange,
}: {
  surgicalHistory: string;
  onSurgicalHistoryChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-800 block mb-3">
          Interventions chirurgicales pédiatriques
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Adénoïdectomie",
            "Amygdalectomie",
            "Appendicectomie",
            "Hernioplastie",
            "Circoncision",
            "Pose de tympanostomie",
            "Chirurgie de l'hypospadias",
            "Correction de fistule anale",
            "Ablation de polype nasal",
            "Chirurgie du frenulum",
            "Autres chirurgies",
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const currentText = surgicalHistory.trim();
                const newText = currentText ? `${currentText}, ${tag}` : tag;
                onSurgicalHistoryChange(newText);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border border-amber-200"
            >
              {tag}
            </button>
          ))}
        </div>
        <textarea
          value={surgicalHistory}
          onChange={(e) => onSurgicalHistoryChange(e.target.value)}
          placeholder="Décrivez les interventions chirurgicales pédiatriques..."
          rows={4}
          className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
        />
      </div>
    </div>
  );
}

/* ==================== SECTION 5: ATCDs MÉDICAUX PÉDIATRIQUES ==================== */
function PediatricMedicalHistorySection({
  data,
  onChange,
}: {
  data: PediatricATCDSData;
  onChange: (data: PediatricATCDSData) => void;
}) {
  const medicalHistory = data.medicalHistory || "";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-800 block mb-3">
          Antécédents médicaux pédiatriques
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Prématurité",
            "Hypotrophie",
            "Ictère néonatal",
            "Infections néonatales",
            "Convulsions fébriles",
            "Asthme",
            "Dermatite atopique",
            "Allergies alimentaires",
            "Otites moyennes récurrentes",
            "Gastroentérite",
            "Pneumonie",
            "Bronchiolite",
            "Anémie",
            "Malnutrition",
            "Reflux gastro-œsophagien",
            "Pathologie cardiaque congénitale",
            "Pathologie rénale",
            "Pathologie neurologique",
            "Autres affections chroniques",
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const currentText = medicalHistory.trim();
                const newText = currentText
                  ? `${currentText}, ${tag}`
                  : tag;
                onChange({ ...data, medicalHistory: newText });
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200"
            >
              {tag}
            </button>
          ))}
        </div>
        <textarea
          value={medicalHistory}
          onChange={(e) =>
            onChange({ ...data, medicalHistory: e.target.value })
          }
          placeholder="Décrivez les antécédents médicaux pédiatriques (séparez par des lignes ou des virgules)"
          rows={4}
          className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#dcd0ff]"
        />
      </div>
    </div>
  );
}
