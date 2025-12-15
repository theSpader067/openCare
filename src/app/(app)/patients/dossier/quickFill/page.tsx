"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Plus,
  UserRound,
  Loader2,
  CheckSquare2,
  Square,
  Download,
  Save,
  Edit2,
  Wand2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Patient } from "@/data/patients/patients-data";
import { getPatientByPid } from "@/lib/api/patients";
import { QuillEditor } from "@/components/QuillEditor";
import clinicalExamsData from "@/data/clinical-exams.json";

// Examen général only (remains hardcoded, not from JSON)
const EXAMEN_GENERAL_DATA = {
  "Examen général": {
    sections: ["hemodynamique"],
    content: {},
  },
};

type ExamKey = string;
type HemodynamicsData = {
  fc: string;
  taSys: string;
  taDias: string;
  trc: string;
  gcs: string;
  fr: string;
  sao2: string;
  temperature: string;
  dextro: string;
  bandelette: string;
  weight: string;
  height: string;
  tourDeTaille: string;
  generalState: "conservée" | "altérée" | null;
  skinState: string[];
  additionalNotes: string;
};

type ExamSelectionState = {
  [key: string]: {
    inspection: string[];
    palpation: string[];
    percussion: string[];
    auscultation: string[];
    extraNotes: string;
  };
};

type AccordionState = {
  [key: string]: boolean;
};

const SKIN_STATE_OPTIONS = [
  { label: "normal", value: "normal" },
  { label: "déshydratation", value: "déshydratation" },
  { label: "ictère", value: "ictère" },
  { label: "paleur", value: "paleur" },
];

const GENERAL_STATE_OPTIONS = [
  { label: "conservée", value: "conservée" as const },
  { label: "altérée", value: "altérée" as const },
];

// Skeleton loader component
const SkeletonCard = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 rounded w-full"></div>
    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
  </div>
);

const SkeletonSection = () => (
  <div className="space-y-4">
    <div className="h-5 bg-slate-200 rounded w-1/2 animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
      <div className="h-3 bg-slate-200 rounded w-11/12 animate-pulse"></div>
      <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse"></div>
    </div>
  </div>
);

export default function QuickFillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const patientId = searchParams.get("id");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAccordions, setExpandedAccordions] = useState<AccordionState>({});
  const [examTabActive, setExamTabActive] = useState<'clinique' | 'paraclinique' | 'traitement'>('clinique');
  const [hemodynamicsData, setHemodynamicsData] = useState<HemodynamicsData>({
    fc: "",
    taSys: "",
    taDias: "",
    trc: "",
    gcs: "",
    fr: "",
    sao2: "",
    temperature: "",
    dextro: "",
    bandelette: "",
    weight: "",
    height: "",
    tourDeTaille: "",
    generalState: null,
    skinState: [],
    additionalNotes: "",
  });
  const [examSelections, setExamSelections] = useState<ExamSelectionState>({});
  const [isCreating, setIsCreating] = useState(false);
  const [observation, setObservation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [profileType, setProfileType] = useState<'enfant' | 'adulte' | 'enceinte'>('adulte');

  // Paraclinique state
  const [paracliniques, setParacliniques] = useState<Array<{ bilan: string; valeur: string }>>([]);
  const [showParaclinicalForm, setShowParaclinicalForm] = useState(false);
  const [paraClinicalForm, setParaClinicalForm] = useState({ bilan: '', valeur: '' });

  // Traitement state
  const [traitements, setTraitements] = useState<Array<{ name: string; administration: string; posologie: string; duree: string }>>([]);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({ name: '', administration: 'VO', posologie: '', duree: '' });

  // Get exams based on profile
  const getCurrentProfileExams = () => {
    const profile = clinicalExamsData.profiles[profileType as keyof typeof clinicalExamsData.profiles];
    if (!profile) return {};
    return profile.exams;
  };

  const currentProfileExams = useMemo(() => getCurrentProfileExams(), [profileType]);

  // Get sorted exam list (Examen général first, then alphabetical)
  const sortedExams = useMemo(() => {
    // Always include "Examen général" first (even though it's not in JSON), then JSON exams
    const exams = Object.keys(currentProfileExams).sort();
    return ["Examen général", ...exams];
  }, [currentProfileExams]);

  // Initialize all accordion states
  useEffect(() => {
    const initialState: AccordionState = {};
    sortedExams.forEach((exam) => {
      initialState[exam] = exam === "Examen général";
    });
    setExpandedAccordions(initialState);
  }, [sortedExams]);

  // Check if exam has been modified
  const isExamModified = (exam: string): boolean => {
    if (exam === "Examen général") {
      return (
        hemodynamicsData.fc !== "" ||
        hemodynamicsData.taSys !== "" ||
        hemodynamicsData.taDias !== "" ||
        hemodynamicsData.trc !== "" ||
        hemodynamicsData.gcs !== "" ||
        hemodynamicsData.fr !== "" ||
        hemodynamicsData.sao2 !== "" ||
        hemodynamicsData.temperature !== "" ||
        hemodynamicsData.dextro !== "" ||
        hemodynamicsData.bandelette !== "" ||
        hemodynamicsData.weight !== "" ||
        hemodynamicsData.height !== "" ||
        hemodynamicsData.tourDeTaille !== "" ||
        hemodynamicsData.generalState !== null ||
        hemodynamicsData.skinState.length > 0 ||
        hemodynamicsData.additionalNotes !== ""
      );
    }

    const examData = examSelections[exam];
    if (!examData) return false;

    return (
      examData.inspection.length > 0 ||
      examData.palpation.length > 0 ||
      examData.percussion.length > 0 ||
      examData.auscultation.length > 0 ||
      examData.extraNotes !== ""
    );
  };

  // Check if any exam has been modified
  const hasAnyModifiedExam = useMemo(() => {
    return sortedExams.some((exam) => isExamModified(exam));
  }, [sortedExams, examSelections, hemodynamicsData]);

  // Calculate patient age
  const getPatientAge = (): number => {
    if (!patient?.birthDate) return patient?.age || 0;
    const today = new Date();
    const birthDate = new Date(patient.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const patientAge = useMemo(() => getPatientAge(), [patient?.birthDate, patient?.age]);

  // Calculate IMC
  const imc = useMemo(() => {
    if (hemodynamicsData.weight && hemodynamicsData.height) {
      const weight = parseFloat(hemodynamicsData.weight);
      const heightM = parseFloat(hemodynamicsData.height) / 100;
      if (weight > 0 && heightM > 0) {
        return (weight / (heightM * heightM)).toFixed(1);
      }
    }
    return "";
  }, [hemodynamicsData.weight, hemodynamicsData.height]);

  // Pediatric reference data (simplified WHO reference)
  const getPediatricWeightReference = (ageYears: number): { mean: number; stdDev: number } => {
    const references: Record<number, { mean: number; stdDev: number }> = {
      1: { mean: 9.5, stdDev: 1.1 },
      2: { mean: 12.5, stdDev: 1.4 },
      3: { mean: 14.5, stdDev: 1.6 },
      4: { mean: 16.5, stdDev: 1.8 },
      5: { mean: 18.5, stdDev: 2.0 },
      6: { mean: 20.5, stdDev: 2.3 },
      7: { mean: 22.5, stdDev: 2.6 },
      8: { mean: 25.0, stdDev: 3.0 },
      9: { mean: 27.5, stdDev: 3.5 },
      10: { mean: 30.5, stdDev: 4.0 },
      11: { mean: 33.5, stdDev: 4.5 },
      12: { mean: 36.5, stdDev: 5.0 },
      13: { mean: 40.0, stdDev: 5.5 },
      14: { mean: 44.0, stdDev: 6.0 },
      15: { mean: 49.0, stdDev: 6.5 },
    };
    return references[ageYears] || { mean: 25, stdDev: 3 };
  };

  const getPediatricHeightReference = (ageYears: number): { mean: number; stdDev: number } => {
    const references: Record<number, { mean: number; stdDev: number }> = {
      1: { mean: 75, stdDev: 3.5 },
      2: { mean: 88, stdDev: 3.7 },
      3: { mean: 97, stdDev: 3.8 },
      4: { mean: 104, stdDev: 4.0 },
      5: { mean: 110, stdDev: 4.2 },
      6: { mean: 116, stdDev: 4.5 },
      7: { mean: 122, stdDev: 4.7 },
      8: { mean: 127, stdDev: 5.0 },
      9: { mean: 132, stdDev: 5.2 },
      10: { mean: 137, stdDev: 5.5 },
      11: { mean: 142, stdDev: 5.8 },
      12: { mean: 147, stdDev: 6.2 },
      13: { mean: 152, stdDev: 6.5 },
      14: { mean: 157, stdDev: 6.8 },
      15: { mean: 161, stdDev: 6.9 },
    };
    return references[ageYears] || { mean: 110, stdDev: 5 };
  };

  const calculateZScore = (value: number, reference: { mean: number; stdDev: number }): number => {
    return (value - reference.mean) / reference.stdDev;
  };

  const getWeightInterpretation = (): string => {
    if (!hemodynamicsData.weight || patientAge >= 16) return "";
    const weight = parseFloat(hemodynamicsData.weight);
    if (!weight || weight <= 0) return "";

    const ref = getPediatricWeightReference(Math.floor(patientAge));
    const zScore = calculateZScore(weight, ref);

    let status = "";
    if (zScore < -2) {
      status = "⚠️ Malnutrition modérée";
    } else if (zScore < -1) {
      status = "⚠️ Risque de malnutrition";
    } else if (zScore <= 1) {
      status = "✓ Normal";
    } else if (zScore <= 2) {
      status = "⚠️ Surpoids";
    } else {
      status = "⚠️ Obésité";
    }

    return `Z-score: ${zScore.toFixed(2)} - ${status}`;
  };

  const getHeightInterpretation = (): string => {
    if (!hemodynamicsData.height || patientAge >= 16) return "";
    const height = parseFloat(hemodynamicsData.height);
    if (!height || height <= 0) return "";

    const ref = getPediatricHeightReference(Math.floor(patientAge));
    const zScore = calculateZScore(height, ref);

    let status = "";
    if (zScore < -2) {
      status = "⚠️ Retard de croissance sévère";
    } else if (zScore < -1) {
      status = "⚠️ Retard de croissance";
    } else if (zScore <= 1) {
      status = "✓ Normal";
    } else if (zScore <= 2) {
      status = "✓ Croissance accélérée";
    } else {
      status = "✓ Très grand";
    }

    return `Z-score: ${zScore.toFixed(2)} - ${status}`;
  };

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const result = await getPatientByPid(patientId);
        if (result.success && result.data) {
          const transformedPatient: Patient = {
            id: result.data.id,
            pid: result.data.pid,
            name: result.data.name,
            birthDate: result.data.birthDate
              ? result.data.birthDate.split("T")[0]
              : "",
            age: result.data.dateOfBirth
              ? (() => {
                  const today = new Date();
                  const birthDate = new Date(result.data.dateOfBirth);
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                  ) {
                    age--;
                  }
                  return age;
                })()
              : 0,
            service: result.data.service || "",
            status: result.data.status || "Consultation",
            nextVisit: result.data.nextVisit,
            type: result.data.type,
            diagnosis: {
              code: result.data.diagnosis.code || "",
              label: result.data.diagnosis.label || "",
            },
            histories: {
              medical: result.data.histories.medical
                ? [result.data.histories.medical]
                : [],
              surgical: result.data.histories.surgical
                ? [result.data.histories.surgical]
                : [],
              other: result.data.histories.other
                ? [result.data.histories.other]
                : [],
            },
            observations: result.data.observations,
          };
          setPatient(transformedPatient);

          // Set profile based on patient age
          if ((transformedPatient.age ?? 0) < 16) {
            setProfileType('enfant');
          } else {
            setProfileType('adulte');
          }
        }
      } catch (error) {
        console.error("Error loading patient:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const toggleAccordion = (exam: string) => {
    setExpandedAccordions((prev) => {
      // If clicking the already open accordion, keep it open
      // Otherwise, close all and open only the clicked one
      const newState: AccordionState = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = key === exam;
      });
      return newState;
    });
  };

  const toggleSign = (exam: string, section: string, sign: string) => {
    setExamSelections((prev) => {
      const examData = prev[exam] || {
        inspection: [],
        palpation: [],
        percussion: [],
        auscultation: [],
        extraNotes: "",
      };

      const sectionKey = section as keyof typeof examData;
      const currentArray = examData[sectionKey];

      if (typeof currentArray === "string") {
        return prev;
      }

      const isSelected = currentArray?.includes(sign);

      return {
        ...prev,
        [exam]: {
          ...examData,
          [sectionKey]: isSelected
            ? currentArray?.filter((s) => s !== sign) || []
            : [...(currentArray || []), sign],
        },
      };
    });
  };

  const updateExtraNote = (exam: string, note: string) => {
    setExamSelections((prev) => ({
      ...prev,
      [exam]: {
        ...prev[exam],
        extraNotes: note,
      },
    }));
  };

  const toggleSkinState = (value: string) => {
    setHemodynamicsData((prev) => ({
      ...prev,
      skinState: prev.skinState.includes(value)
        ? prev.skinState.filter((item) => item !== value)
        : [...prev.skinState, value],
    }));
  };

  const getTodayDate = () => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  };

  const handleInputChange = (field: keyof HemodynamicsData, value: string) => {
    setHemodynamicsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getExamDisplayName = (examKey: string) => {
    const examTranslations: Record<string, string> = {
      "Examen général": t("patients.dossier.exams.examenGeneral"),
      "Abdominal": t("patients.dossier.exams.abdominal"),
      "Cardiorespiratoire": t("patients.dossier.exams.cardiorespiratoire"),
      "Pleuropulmonaire": t("patients.dossier.exams.pleuropulmonaire"),
      "Neurologique": t("patients.dossier.exams.neurologique"),
      "Cutanéomuqueux": t("patients.dossier.exams.cutaneomuqueux"),
      "Ostéoarticulaire": t("patients.dossier.exams.osteoarticulaire"),
      "Ganglionnaire": t("patients.dossier.exams.ganglionnaire"),
      "Stomatologique": t("patients.dossier.exams.stomatologique"),
      "Du nouveau-né": t("patients.dossier.exams.nouveaune"),
      "Gynécologique": t("patients.dossier.exams.gynecologique"),
    };

    return examTranslations[examKey] || examKey;
  };

  const generateMarkdownObservation = () => {
    let markdown = `# Observation Clinique

`;

    // Calculate age from birthDate
    const calculateAge = (birthDate: Date | string): number => {
      const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return age;
    };

    const calculatedAge = patient?.birthDate ? calculateAge(patient.birthDate) : patient?.age || 0;

    // Identité section with all demographic info
    const identityParts = [];
    if (patient?.name) identityParts.push(patient.name);
    if (calculatedAge) identityParts.push(`âgé(e) de ${calculatedAge} ans`);
    if (patient?.profession) identityParts.push(patient.profession);
    if (patient?.situationFamiliale) identityParts.push(patient.situationFamiliale);

    if (identityParts.length > 0) {
      markdown += `## Identité

`;
      markdown += `Il s'agit de ${identityParts.join(', ')}.

`;
    }

    // Motif d'hospitalisation / consultation
    if (patient?.motif) {
      markdown += `## Motif

${patient.motif}

`;
    }

    // ATCDs section
    const medicalHist = patient?.histories?.medical?.join(', ') || '';
    const surgicalHist = patient?.histories?.surgical?.join(', ') || '';
    const otherHist = patient?.histories?.other?.join(', ') || '';

    const atcdsExist = medicalHist || surgicalHist ||
                      patient?.atcdsGynObstetrique ||
                      patient?.atcdsFamiliaux ||
                      otherHist;

    if (atcdsExist) {
      markdown += `## Antécédents

`;

      // ATCDs Médicaux
      if (medicalHist && medicalHist.trim()) {
        markdown += `**Médicaux:** ${medicalHist}\n\n`;
      }

      // ATCDs Chirurgicaux
      if (surgicalHist && surgicalHist.trim()) {
        markdown += `**Chirurgicaux:** ${surgicalHist}\n\n`;
      }

      // ATCDs Familiaux
      if (patient?.atcdsFamiliaux && patient.atcdsFamiliaux.trim()) {
        markdown += `**Familiaux:** ${patient.atcdsFamiliaux}\n\n`;
      }

      // Autres éléments
      if (otherHist && otherHist.trim()) {
        markdown += `**Autres:** ${otherHist}\n\n`;
      }
    }

    // Histoire de maladie
    markdown += `## Histoire de Maladie

`;
    markdown += `





`;

    // Examen Clinique
    markdown += `## Examen Clinique

`;

    // Examen Général
    if (isExamModified("Examen général")) {
      markdown += `### Examen Général

`;
      markdown += `#### Plan Neurologique

`;
      if (hemodynamicsData.gcs) markdown += `- GCS à ${hemodynamicsData.gcs}/15
`;
      markdown += `
`;

      markdown += `#### Plan Hémodynamique

`;
      const hemoData = [];
      if (hemodynamicsData.fc) hemoData.push(`FC`);
      if (hemodynamicsData.taSys || hemodynamicsData.taDias) hemoData.push(`TA`);
      if (hemodynamicsData.trc) hemoData.push(`TRC`);
      if (hemoData.length > 0) markdown += `- ${hemoData.join(', ')}
`;
      markdown += `
`;

      markdown += `#### Plan Respiratoire

`;
      const respData = [];
      if (hemodynamicsData.fr) respData.push(`FR`);
      if (hemodynamicsData.sao2) respData.push(`SaO2`);
      if (respData.length > 0) markdown += `- ${respData.join(', ')}
`;
      markdown += `
`;

      markdown += `#### Anthropométrie et Autres

`;
      const otherData = [];
      if (hemodynamicsData.weight) otherData.push(`Poids`);
      if (hemodynamicsData.height) otherData.push(`Taille`);
      if (imc) otherData.push(`IMC`);
      if (hemodynamicsData.dextro) otherData.push(`Dextro`);
      if (hemodynamicsData.temperature) otherData.push(`T°`);
      if (otherData.length > 0) markdown += `- ${otherData.join(', ')}
`;
      markdown += `
`;

      if (hemodynamicsData.generalState) {
        markdown += `#### État Général

`;
        markdown += `${hemodynamicsData.generalState}

`;
      }

      if (hemodynamicsData.skinState.length > 0) {
        markdown += `#### État Cutanéomuqueux

`;
        markdown += hemodynamicsData.skinState.map(s => `- ${s}`).join("\n") + `

`;
      }
    }

    // Other exams (excluding Examen général)
    Object.entries(examSelections).forEach(([exam, data]) => {
      if (exam === "Examen général") return;

      const hasSelections =
        data.inspection?.length > 0 ||
        data.palpation?.length > 0 ||
        data.percussion?.length > 0 ||
        data.auscultation?.length > 0 ||
        data.extraNotes;

      if (!hasSelections) return;

      markdown += `### ${getExamDisplayName(exam)}

`;

      // Build a combined list of all selected items
      const allSelected = [];

      if (data.inspection?.length > 0) {
        allSelected.push(...data.inspection);
      }

      if (data.palpation?.length > 0) {
        allSelected.push(...data.palpation);
      }

      if (data.percussion?.length > 0) {
        allSelected.push(...data.percussion);
      }

      if (data.auscultation?.length > 0) {
        allSelected.push(...data.auscultation);
      }

      // Add listed items
      if (allSelected.length > 0) {
        markdown += allSelected.map(s => `- ${s}`).join("\n") + `

`;
      }

      // Add extra notes/textarea content
      if (data.extraNotes) {
        markdown += `${data.extraNotes}

`;
      }
    });

    // Conclusion
    markdown += `## Conclusion

`;

    const diagnosis = patient?.diagnosis?.label || patient?.motif || 'consultation';

    markdown += `Il s'agit de ${patient?.name}, agé(e) de ${calculatedAge}, admis pour ${diagnosis}, ayant comme ATCDs `;

    // Combine all ATCDs
    const allAtcds = [];
    if (medicalHist && medicalHist.trim()) allAtcds.push(medicalHist);
    if (surgicalHist && surgicalHist.trim()) allAtcds.push(surgicalHist);
    if (patient?.atcdsGynObstetrique && patient.atcdsGynObstetrique.trim()) allAtcds.push(patient.atcdsGynObstetrique);
    if (patient?.atcdsFamiliaux && patient.atcdsFamiliaux.trim()) allAtcds.push(patient.atcdsFamiliaux);
    if (otherHist && otherHist.trim()) allAtcds.push(otherHist);

    if (allAtcds.length > 0) {
      markdown += `${allAtcds.join(', ')}.

`;
    } else {
      markdown += `sans ATCDs notables.

`;
    }

    markdown += `L'histoire de maladie remonte à:




`;

    markdown += `Chez qui l'examen clinique trouve:

`;

    // Collect all exam findings from Examen Général and other exams
    const examFindingsDetail: string[] = [];

    // Add Examen Général findings
    if (isExamModified("Examen général")) {
      const generalFindings: string[] = [];
      if (hemodynamicsData.gcs) generalFindings.push(`GCS à ${hemodynamicsData.gcs}/15`);
      const hemoData = [];
      if (hemodynamicsData.fc) hemoData.push(`FC`);
      if (hemodynamicsData.taSys || hemodynamicsData.taDias) hemoData.push(`TA`);
      if (hemodynamicsData.trc) hemoData.push(`TRC`);
      if (hemoData.length > 0) generalFindings.push(hemoData.join(', '));
      const respData = [];
      if (hemodynamicsData.fr) respData.push(`FR`);
      if (hemodynamicsData.sao2) respData.push(`SaO2`);
      if (respData.length > 0) generalFindings.push(respData.join(', '));
      const otherData = [];
      if (hemodynamicsData.weight) otherData.push(`Poids`);
      if (hemodynamicsData.height) otherData.push(`Taille`);
      if (imc) otherData.push(`IMC`);
      if (hemodynamicsData.dextro) otherData.push(`Dextro`);
      if (hemodynamicsData.temperature) otherData.push(`T°`);
      if (otherData.length > 0) generalFindings.push(otherData.join(', '));
      if (hemodynamicsData.generalState) generalFindings.push(hemodynamicsData.generalState);
      if (hemodynamicsData.skinState.length > 0) generalFindings.push(hemodynamicsData.skinState.join(', '));

      if (generalFindings.length > 0) {
        examFindingsDetail.push(generalFindings.join(', '));
      }
    }

    // Add other exam findings
    Object.entries(examSelections).forEach(([exam, data]) => {
      if (exam === "Examen général") return;

      const allItems = [];
      if (data.inspection?.length > 0) allItems.push(...data.inspection);
      if (data.palpation?.length > 0) allItems.push(...data.palpation);
      if (data.percussion?.length > 0) allItems.push(...data.percussion);
      if (data.auscultation?.length > 0) allItems.push(...data.auscultation);

      if (allItems.length > 0) {
        examFindingsDetail.push(`${getExamDisplayName(exam)}: ${allItems.join(', ')}`);
      }
      if (data.extraNotes) {
        examFindingsDetail.push(data.extraNotes);
      }
    });

    if (examFindingsDetail.length > 0) {
      markdown += examFindingsDetail.join("\n");
    }

    return markdown;
  };

  const handleCreateObservation = async () => {
    setIsCreating(true);

    try {
      const requestPayload = {
        patientId: patient?.id,
        profileKey: profileType,
        clinicalExams: {},
        examSelections,
        hemodynamicsData,
        paracliniques,
        traitements,
      };

      console.log('DEBUG: Sending to API:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch("/api/generateQFobservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error generating observation:", errorData);
        alert(`Error: ${errorData.error || 'Failed to generate observation'}`);
        setIsCreating(false);
        return;
      }

      const result = await response.json();
      console.log('DEBUG: API Response:', result);

      if (result.success && result.data && result.data.observation) {
        console.log('DEBUG: Setting observation:', result.data.observation.substring(0, 100));
        setObservation(result.data.observation);
        // Don't set isSaved here - let user edit in Quill editor first
        // isSaved will be set to true only after clicking Save button
      } else {
        console.error('DEBUG: Unexpected response format:', result);
        alert('Observation generated but response format was unexpected');
      }
    } catch (error) {
      console.error("Error calling generateQFobservation API:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!observation) return;

    try {
      const today = new Date();
      const filename = `Observation_Medicale_${today.toISOString().split('T')[0]}.pdf`;

      // Call API to generate PDF
      const response = await fetch('/api/generatePDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent: observation,
          filename: filename,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleSaveObservation = async () => {
    if (!observation || !patient?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          text: observation,
        }),
      });

      if (!response.ok) {
        console.error("Error saving observation");
        return;
      }

      // Mark as saved
      setIsSaved(true);
      console.log("Observation saved successfully");
    } catch (error) {
      console.error("Error saving observation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("patients.dossier.quickFill")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("patients.dossier.quickFillDesc")}
          </p>
        </section>
        <EmptyState
          icon={UserRound}
          title={t("patients.dossier.notFound")}
          description={t("patients.dossier.notFoundDesc")}
          action={
            <Button
              variant="primary"
              onClick={() => router.push("/patients")}
            >
              {t("patients.dossier.backToPatientList")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with back button */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
          <button
            onClick={() => router.back()}
            className="inline-flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            aria-label={t("common.buttons.back")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">
              {t("patients.dossier.quickFill")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
              {t("patients.dossier.quickFillDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Patient Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#22d3ee] text-white shadow-lg">
              <UserRound className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                {patient.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                <span>
                  <span className="font-medium text-slate-700">{patient.pid}</span>
                </span>
                <span>
                  <span className="font-medium text-slate-700">
                    {(() => {
                      const calculateAge = (birthDate: Date | string): number => {
                        const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
                        const today = new Date();
                        let age = today.getFullYear() - date.getFullYear();
                        const monthDiff = today.getMonth() - date.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                          age--;
                        }
                        return age;
                      };
                      return patient.birthDate ? calculateAge(patient.birthDate) : (patient.age || 0);
                    })()} {t("common.labels.yearsOld")}
                  </span>
                </span>
                {patient.diagnosis.label && (
                  <span>
                    <span className="font-medium text-slate-700">
                      {patient.diagnosis.label}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {getTodayDate()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Clinical Exams with Tabs */}
        <div className="space-y-3 flex flex-col h-full min-h-screen lg:min-h-auto overflow-x-hidden">
          <h3 className="text-sm font-semibold text-slate-800 px-1">
            {t("patients.dossier.clinicalExams")}
          </h3>

          {/* Tab Navigation - Redesigned */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-1 flex gap-1 shadow-sm overflow-x-auto">
            <button
              onClick={() => setExamTabActive('clinique')}
              className={`flex-1 min-w-max md:min-w-0 px-3 md:px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ${
                examTabActive === 'clinique'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <span>📋</span>
                <span className="hidden sm:inline">Clinique</span>
              </div>
            </button>
            <button
              onClick={() => setExamTabActive('paraclinique')}
              className={`flex-1 min-w-max md:min-w-0 px-3 md:px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ${
                examTabActive === 'paraclinique'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <span>🔬</span>
                <span className="hidden sm:inline">Paraclinique</span>
              </div>
            </button>
            <button
              onClick={() => setExamTabActive('traitement')}
              className={`flex-1 min-w-max md:min-w-0 px-3 md:px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ${
                examTabActive === 'traitement'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <span>💊</span>
                <span className="hidden sm:inline">Traitement</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex-1 overflow-y-auto">
            {examTabActive === 'clinique' && (
              <>
              {sortedExams.map((exam) => {
              const isModified = isExamModified(exam);

              return (
                <div
                  key={exam}
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(exam)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isModified ? (
                        <CheckSquare2 className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-sm font-medium text-slate-700">
                        {getExamDisplayName(exam)}
                      </span>
                    </div>
                    {expandedAccordions[exam] ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </button>

                  {/* Examen Général - Special Hemodynamics Section */}
                  {expandedAccordions[exam] && exam === "Examen général" && (
                    <div className="px-4 py-4 bg-white border-t border-slate-200 space-y-4">
                      {/* Plan Hémodynamique */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {t("patients.dossier.planHemodynamique")}
                        </h4>
                        {/* Row 1: FC, TA (PAS/PAD), TRC */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              FC
                            </label>
                            <input
                              type="number"
                              placeholder="bpm"
                              value={hemodynamicsData.fc}
                              onChange={(e) =>
                                handleInputChange("fc", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              TA
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="PAS"
                                value={hemodynamicsData.taSys}
                                onChange={(e) =>
                                  handleInputChange("taSys", e.target.value)
                                }
                                className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                              <input
                                type="number"
                                placeholder="PAD"
                                value={hemodynamicsData.taDias}
                                onChange={(e) =>
                                  handleInputChange("taDias", e.target.value)
                                }
                                className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              TRC
                            </label>
                            <input
                              type="text"
                              placeholder="sec"
                              value={hemodynamicsData.trc}
                              onChange={(e) =>
                                handleInputChange("trc", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                        </div>

                        {/* Row 2: Plan Neurologique and Plan Respiratoire */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            {t("patients.dossier.planNeurologique")}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              GCS
                            </label>
                            <input
                              type="number"
                              placeholder="3-15"
                              min="3"
                              max="15"
                              value={hemodynamicsData.gcs}
                              onChange={(e) =>
                                handleInputChange("gcs", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              FR
                            </label>
                            <input
                              type="number"
                              placeholder="rpm"
                              value={hemodynamicsData.fr}
                              onChange={(e) =>
                                handleInputChange("fr", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              SaO2 %
                            </label>
                            <input
                              type="number"
                              placeholder="%"
                              min="0"
                              max="100"
                              value={hemodynamicsData.sao2}
                              onChange={(e) =>
                                handleInputChange("sao2", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                        </div>
                        </div>

                        {/* Row 3: Plan Autre (T°, Dextro, BU) */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Autres paramètres
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              T°
                            </label>
                            <input
                              type="number"
                              placeholder="°C"
                              step="0.1"
                              value={hemodynamicsData.temperature}
                              onChange={(e) =>
                                handleInputChange("temperature", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              Dextro
                            </label>
                            <input
                              type="number"
                              placeholder="mg/dL"
                              value={hemodynamicsData.dextro}
                              onChange={(e) =>
                                handleInputChange("dextro", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div></div>
                        </div>

                        {/* Row 3b: Bandelette Urinaire */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1 col-span-2">
                            <label className="text-xs font-medium text-slate-600">
                              Bandelette Urinaire
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Normal, protéinurie+, hématurie..."
                              value={hemodynamicsData.bandelette}
                              onChange={(e) =>
                                handleInputChange("bandelette", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div></div>
                        </div>

                        {/* Row 4: Poids, Taille, IMC/Tour de Taille */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              Poids (kg)
                            </label>
                            <input
                              type="number"
                              placeholder="kg"
                              step="0.1"
                              value={hemodynamicsData.weight}
                              onChange={(e) =>
                                handleInputChange("weight", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            {patientAge < 16 && hemodynamicsData.weight && (
                              <p className="text-xs text-slate-600 mt-1">
                                {getWeightInterpretation()}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                              Taille (cm)
                            </label>
                            <input
                              type="number"
                              placeholder="cm"
                              value={hemodynamicsData.height}
                              onChange={(e) =>
                                handleInputChange("height", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            {patientAge < 16 && hemodynamicsData.height && (
                              <p className="text-xs text-slate-600 mt-1">
                                {getHeightInterpretation()}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            {patientAge >= 16 ? (
                              <>
                                <label className="text-xs font-medium text-slate-600">
                                  IMC
                                </label>
                                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                                  {imc || "—"}
                                </div>
                              </>
                            ) : (
                              <>
                                <label className="text-xs font-medium text-slate-600">
                                  IMC
                                </label>
                                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                                  {imc || "—"}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Row 5: Tour de taille for adults */}
                        {patientAge >= 16 && (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1 col-span-2">
                              <label className="text-xs font-medium text-slate-600">
                                Tour de Taille (cm)
                              </label>
                              <input
                                type="number"
                                placeholder="cm"
                                value={hemodynamicsData.tourDeTaille}
                                onChange={(e) =>
                                  handleInputChange("tourDeTaille", e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                            </div>
                            <div></div>
                          </div>
                        )}
                      </div>
                    </div>

                      {/* État général */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {t("patients.dossier.generalState")}
                        </label>
                        <div className="flex gap-2">
                          {GENERAL_STATE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setHemodynamicsData((prev) => ({
                                  ...prev,
                                  generalState:
                                    prev.generalState === option.value
                                      ? null
                                      : option.value,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                hemodynamicsData.generalState === option.value
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* État cutanéomuqueuse */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {t("patients.dossier.skinState")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SKIN_STATE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => toggleSkinState(option.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                hemodynamicsData.skinState.includes(option.value)
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Observations supplémentaires */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {t("patients.dossier.additionalSigns")}
                        </label>
                        <textarea
                          placeholder={t("patients.dossier.additionalNotesPlaceholder")}
                          value={hemodynamicsData.additionalNotes}
                          onChange={(e) =>
                            handleInputChange("additionalNotes", e.target.value)
                          }
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Other Exams - 4-part sections */}
                  {expandedAccordions[exam] && exam !== "Examen général" && (
                    <div className="px-4 py-4 bg-white border-t border-slate-200 space-y-4 max-h-96 overflow-y-auto">
                      {((currentProfileExams as Record<string, any>)[exam])?.sections?.map((section: string) => {
                        const examContent = ((currentProfileExams as Record<string, any>)[exam])?.content;
                        const signs = examContent ? (examContent[section] || []) : [];

                        return (
                          <div key={section} className="space-y-2">
                            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                              {(() => {
                                const translationKey = `patients.dossier.${section.toLowerCase().replace(/ /g, '')}`;
                                const translatedName = t(translationKey, { defaultValue: section });
                                return translatedName === translationKey ? section.charAt(0).toUpperCase() + section.slice(1) : translatedName;
                              })()}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {signs.map((sign: string) => {
                                const examData = examSelections[exam];
                                const sectionData = examData?.[section as "inspection" | "palpation" | "percussion" | "auscultation"];
                                const isSelected = (typeof sectionData === "string" || !sectionData) ? false : sectionData.includes(sign);

                                return (
                                  <button
                                    key={sign}
                                    onClick={() => toggleSign(exam, section, sign)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                                      isSelected
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    {sign}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Extra notes for each exam */}
                      <div className="space-y-2 border-t border-slate-200 pt-3">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {t("patients.dossier.additionalSigns")}
                        </label>
                        <textarea
                          placeholder={t("patients.dossier.additionalNotesPlaceholder")}
                          value={examSelections[exam]?.extraNotes || ""}
                          onChange={(e) => updateExtraNote(exam, e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
              </>
            )}

            {examTabActive === 'paraclinique' && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParaclinicalForm(!showParaclinicalForm)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>

                {showParaclinicalForm && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1">
                            Bilan
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Hémoglobine"
                            value={paraClinicalForm.bilan}
                            onChange={(e) =>
                              setParaClinicalForm({
                                ...paraClinicalForm,
                                bilan: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1">
                            Valeur
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 13.5 g/dL"
                            value={paraClinicalForm.valeur}
                            onChange={(e) =>
                              setParaClinicalForm({
                                ...paraClinicalForm,
                                valeur: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (paraClinicalForm.bilan && paraClinicalForm.valeur) {
                              setParacliniques([
                                ...paracliniques,
                                paraClinicalForm,
                              ]);
                              setParaClinicalForm({ bilan: '', valeur: '' });
                              setShowParaclinicalForm(false);
                            }
                          }}
                        >
                          Ajouter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowParaclinicalForm(false);
                            setParaClinicalForm({ bilan: '', valeur: '' });
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {paracliniques.length > 0 && (
                  <div className="space-y-2">
                    {paracliniques.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {item.bilan}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.valeur}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setParacliniques(
                              paracliniques.filter((_, i) => i !== idx)
                            );
                          }}
                          className="text-slate-400 hover:text-red-600 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {paracliniques.length === 0 && !showParaclinicalForm && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-slate-500 font-medium text-sm">
                      Aucun bilan ajouté
                    </p>
                  </div>
                )}
              </div>
            )}

            {examTabActive === 'traitement' && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTreatmentForm(!showTreatmentForm)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>

                {showTreatmentForm && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Nom du traitement
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Amoxicilline"
                        value={treatmentForm.name}
                        onChange={(e) =>
                          setTreatmentForm({
                            ...treatmentForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Administration
                      </label>
                      <select
                        value={treatmentForm.administration}
                        onChange={(e) =>
                          setTreatmentForm({
                            ...treatmentForm,
                            administration: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="VO">VO (Voie Orale)</option>
                        <option value="IV">IV (Intraveineuse)</option>
                        <option value="IM">IM (Intramusculaire)</option>
                        <option value="SC">SC (Sous-cutanée)</option>
                        <option value="Topique">Topique</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Posologie quotidienne
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg x 3/jour"
                        value={treatmentForm.posologie}
                        onChange={(e) =>
                          setTreatmentForm({
                            ...treatmentForm,
                            posologie: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 7 jours"
                        value={treatmentForm.duree}
                        onChange={(e) =>
                          setTreatmentForm({
                            ...treatmentForm,
                            duree: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (treatmentForm.name) {
                            setTraitements([...traitements, treatmentForm]);
                            setTreatmentForm({
                              name: '',
                              administration: 'VO',
                              posologie: '',
                              duree: '',
                            });
                            setShowTreatmentForm(false);
                          }
                        }}
                      >
                        Ajouter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowTreatmentForm(false);
                          setTreatmentForm({
                            name: '',
                            administration: 'VO',
                            posologie: '',
                            duree: '',
                          });
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {traitements.length > 0 && (
                  <div className="space-y-2">
                    {traitements.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-slate-700">
                            {item.name}
                          </p>
                          <button
                            onClick={() => {
                              setTraitements(
                                traitements.filter((_, i) => i !== idx)
                              );
                            }}
                            className="text-slate-400 hover:text-red-600 transition"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <p>
                            <span className="font-medium">Administration:</span>{' '}
                            {item.administration}
                          </p>
                          <p>
                            <span className="font-medium">Posologie:</span>{' '}
                            {item.posologie}
                          </p>
                          <p>
                            <span className="font-medium">Durée:</span>{' '}
                            {item.duree}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {traitements.length === 0 && !showTreatmentForm && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-slate-500 font-medium text-sm">
                      Aucun traitement ajouté
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Observation Preview */}
        <div className="flex flex-col gap-3 h-full min-h-screen lg:min-h-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <h3 className="text-sm font-semibold text-slate-800">
              {t("patients.dossier.observation")}
            </h3>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {observation && isSaved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  title="Export as PDF"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
              {observation ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSaveObservation}
                  className={isSaving ? "opacity-75 cursor-not-allowed" : ""}
                  title="Save observation to database"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!hasAnyModifiedExam || isCreating}
                  onClick={handleCreateObservation}
                  className={isCreating ? "opacity-75 cursor-not-allowed" : ""}
                  title="Generate observation using AI"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("common.buttons.saving")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-slate-200/80 bg-slate-50 p-6 flex flex-col overflow-y-auto">
            {isCreating ? (
              <div className="w-full space-y-6">
                <SkeletonCard />
                <SkeletonSection />
                <SkeletonSection />
                <SkeletonSection />
                <SkeletonSection />
              </div>
            ) : isSaved ? (
              <div className="w-full bg-white rounded-lg border border-slate-200 p-8 flex flex-col overflow-y-auto">
                <style>{`
                  .observation-title {
                    text-align: center;
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 1rem 0;
                    letter-spacing: -0.02em;
                  }
                  .observation-display h1 {
                    text-align: center;
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 1rem 0;
                    letter-spacing: -0.02em;
                  }
                  .observation-display .observation-date {
                    text-align: right;
                    font-size: 0.875rem;
                    color: #475569;
                    margin-bottom: 2rem;
                    font-weight: 500;
                  }
                  .observation-display h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #334155;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                  }
                  .observation-display h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #475569;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                  }
                  .observation-display p {
                    font-size: 0.875rem;
                    line-height: 1.6;
                    color: #475569;
                    margin: 0.25rem 0;
                  }
                  .observation-display ul, .observation-display ol {
                    margin: 0.5rem 0;
                    padding-left: 1.5rem;
                  }
                  .observation-display li {
                    font-size: 0.875rem;
                    line-height: 1.6;
                    color: #475569;
                    margin: 0.25rem 0;
                  }
                `}</style>
                <div className="observation-display">
                  <div className="observation-date">
                    Fait le {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: observation || "" }} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden">
                <QuillEditor
                  value={observation || ""}
                  onChange={setObservation}
                  readOnly={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
