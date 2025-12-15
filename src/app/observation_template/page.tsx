"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import clinicalExams from "@/data/clinical-exams.json";

const ATCD_OPTIONS = {
  medical: [
    "Hypertension",
    "Diabète",
    "Asthme",
    "BPCO",
    "Cancer",
    "AVC",
    "Infarctus",
    "Épilepsie",
    "Dépression",
    "Anxiété",
  ],
  surgical: [
    "Appendicectomie",
    "Cholécystectomie",
    "Hystérectomie",
    "Prostatectomie",
    "Mastectomie",
    "Thyroïdectomie",
    "Arthroplastie",
    "Discectomie",
  ],
  familial: [
    "Cancer",
    "Diabète",
    "Hypertension",
    "AVC",
    "Maladie coronarienne",
    "Maladie psychiatrique",
    "Antécédents allergiques",
    "Asthme familial",
  ],
};

const CUTANEOUS_OPTIONS = [
  "Normale",
  "Ictère",
  "Déshydratation",
  "Pâleur",
  "Cyanose",
  "Œdèmes",
];

// Get dynamic exam sections from clinical-exams.json
const getDynamicExamSections = () => {
  const enfantExams = clinicalExams.profiles.enfant.exams;
  return Object.entries(enfantExams).map(([key, exam]: any) => ({
    key: key.toLowerCase(),
    label: exam.label,
    sections: exam.sections,
    content: exam.content,
  }));
};

function ObservationTemplateContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [formData, setFormData] = useState({
    // Identité
    fullName: "",
    age: "",
    profession: "",
    addressOrigin: "",
    addressHabitat: "",
    couvertureSociale: "",
    situationFamiliale: "",
    niveauScolaire: "",

    // Motif
    motif: "",

    // ATCDs
    atcdsMedical: [] as string[],
    atcdsChirurgical: [] as string[],
    atcdsFamiliaux: [] as string[],
    atcdsExtraMedical: "",
    atcdsExtraChirurgical: "",
    atcdsExtraFamilial: "",

    // Histoire de maladie
    remonteeA: "",
    signesRevelateurs: "",
    signesPositifs: "",
    signesNegatifs: "",
    contexte: "",
    suite: "",
    bilansDemandes: "",
    traitementRecu: "",

    // Examen Clinique - Examen Général
    planHemodynamiqueFC: "",
    planHemodynamiqueTA: "",
    planHemodynamiqueTRC: "",
    planRespiratoire_SaO2: "",
    planRespiratoire_FR: "",
    planNeurologique_GCS: "",
    temperature: "",
    dextro: "",
    bu: "",
    poids: "",
    taille: "",
    imc: "",
    etatGeneral: "",
    etatCutaneomuqueux: [] as string[],
    etatCutaneomusqueuxExtra: "",

    // Examen Clinique - Other exams (dynamic from JSON)
    clinicalExamSelections: {} as Record<string, Record<string, string[]>>,
    clinicalExamNotes: {} as Record<string, string>,
  });

  const [dynamicExams] = useState(() => getDynamicExamSections());

  const [isLoading, setIsLoading] = useState(false);

  // Load patient data when patientId is provided
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) {
        console.error("Failed to fetch patient data");
        return;
      }

      const data = await response.json();
      const patient = data.data;

      // Populate form with patient data
      setFormData((prev) => ({
        ...prev,
        fullName: patient.fullName || "",
        age: patient.age ? patient.age.toString() : "",
        profession: patient.profession || "",
        addressOrigin: patient.addressOrigin || "",
        addressHabitat: patient.addressHabitat || "",
        couvertureSociale: patient.couvertureSociale || "",
        situationFamiliale: patient.situationFamiliale || "",
        niveauScolaire: patient.niveauScolaire || "",
        // ATCDs
        atcdsMedical: patient.atcdsMedical || [],
        atcdsChirurgical: patient.atcdsChirurgical || [],
        atcdsFamiliaux: patient.atcdsFamiliaux || [],
      }));
    } catch (error) {
      console.error("Error loading patient data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleAtcdTag = (type: "medical" | "surgical" | "familial", tag: string) => {
    const fieldKey = `atcds${type.charAt(0).toUpperCase() + type.slice(1)}` as
      | "atcdsMedical"
      | "atcdsChirurgical"
      | "atcdsFamiliaux";

    setFormData((prev) => {
      const current = prev[fieldKey] as string[];
      const isSelected = current.includes(tag);
      return {
        ...prev,
        [fieldKey]: isSelected ? current.filter((t) => t !== tag) : [...current, tag],
      };
    });
  };

  const toggleCutaneousTag = (tag: string) => {
    setFormData((prev) => {
      const current = prev.etatCutaneomuqueux;
      const isSelected = current.includes(tag);
      return {
        ...prev,
        etatCutaneomuqueux: isSelected
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      };
    });
  };

  const toggleClinicalExamTag = (examKey: string, sectionKey: string, tag: string) => {
    setFormData((prev) => {
      const examSelections = { ...prev.clinicalExamSelections };
      if (!examSelections[examKey]) {
        examSelections[examKey] = {};
      }
      if (!examSelections[examKey][sectionKey]) {
        examSelections[examKey][sectionKey] = [];
      }

      const current = examSelections[examKey][sectionKey];
      const isSelected = current.includes(tag);
      examSelections[examKey][sectionKey] = isSelected
        ? current.filter((t) => t !== tag)
        : [...current, tag];

      return {
        ...prev,
        clinicalExamSelections: examSelections,
      };
    });
  };

  const handleExamNotesChange = (examKey: string, notes: string) => {
    setFormData((prev) => {
      const examNotes = { ...prev.clinicalExamNotes };
      examNotes[examKey] = notes;
      return {
        ...prev,
        clinicalExamNotes: examNotes,
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      {/* Print Button */}
      <div className="max-w-6xl mx-auto mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Imprimer / PDF
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 print:space-y-5 print:max-w-full">
        {/* TITLE */}
        <div className="print:mb-4 print:text-center">
          <h1 className="text-4xl font-bold text-slate-900 print:text-3xl print:mt-0">
            Observation Médicale
          </h1>
        </div>

        {/* IDENTITÉ Section */}
        <section className="border border-slate-200 rounded-lg p-6 print:border-0 print:p-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 print:text-xl print:border-b print:border-slate-400">
            I. IDENTITÉ
          </h2>

          <div className="space-y-4">
            {/* Row 1: Nom complet and Âge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Âge
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>
            </div>

            {/* Row 2: Profession and Niveau scolaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => handleInputChange("profession", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Niveau scolaire
                </label>
                <input
                  type="text"
                  value={formData.niveauScolaire}
                  onChange={(e) => handleInputChange("niveauScolaire", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>
            </div>

            {/* Row 3: Both addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Adresse d'origine
                </label>
                <input
                  type="text"
                  value={formData.addressOrigin}
                  onChange={(e) => handleInputChange("addressOrigin", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Adresse d'habitat
                </label>
                <input
                  type="text"
                  value={formData.addressHabitat}
                  onChange={(e) => handleInputChange("addressHabitat", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>
            </div>

            {/* Row 4: Couverture sociale and Situation familiale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Couverture sociale
                </label>
                <input
                  type="text"
                  value={formData.couvertureSociale}
                  onChange={(e) =>
                    handleInputChange("couvertureSociale", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Situation familiale
                </label>
                <input
                  type="text"
                  value={formData.situationFamiliale}
                  onChange={(e) =>
                    handleInputChange("situationFamiliale", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MOTIF Section */}
        <section className="border border-slate-200 rounded-lg p-6 print:border-0 print:p-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 print:text-xl print:border-b print:border-slate-400">
            II. MOTIF DE CONSULTATION
          </h2>

          <textarea
            value={formData.motif}
            onChange={(e) => handleInputChange("motif", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
            rows={3}
          />
        </section>

        {/* ATCDs Section with Tags */}
        <section className="border border-slate-200 rounded-lg p-6 print:border-0 print:p-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 print:text-xl print:border-b print:border-slate-400">
            III. ANTÉCÉDENTS
          </h2>

          <div className="space-y-6">
            {/* Antécédents Médicaux */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Antécédents médicaux
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ATCD_OPTIONS.medical.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleAtcdTag("medical", tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.atcdsMedical.includes(tag)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={formData.atcdsExtraMedical}
                onChange={(e) =>
                  handleInputChange("atcdsExtraMedical", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            {/* Antécédents Chirurgicaux */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Antécédents chirurgicaux
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ATCD_OPTIONS.surgical.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleAtcdTag("surgical", tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.atcdsChirurgical.includes(tag)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={formData.atcdsExtraChirurgical}
                onChange={(e) =>
                  handleInputChange("atcdsExtraChirurgical", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            {/* Antécédents Familiaux */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Antécédents familiaux
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ATCD_OPTIONS.familial.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleAtcdTag("familial", tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.atcdsFamiliaux.includes(tag)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={formData.atcdsExtraFamilial}
                onChange={(e) =>
                  handleInputChange("atcdsExtraFamilial", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* HISTOIRE DE MALADIE Section */}
        <section className="border border-slate-200 rounded-lg p-6 print:border-0 print:p-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 print:text-xl print:border-b print:border-slate-400">
            IV. HISTOIRE DE MALADIE
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Remontée à ?
              </label>
              <input
                type="text"
                value={formData.remonteeA}
                onChange={(e) => handleInputChange("remonteeA", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Signes révélateurs
              </label>
              <textarea
                value={formData.signesRevelateurs}
                onChange={(e) =>
                  handleInputChange("signesRevelateurs", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Signes positifs (accompagnateurs)
              </label>
              <textarea
                value={formData.signesPositifs}
                onChange={(e) =>
                  handleInputChange("signesPositifs", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Signes négatifs
              </label>
              <textarea
                value={formData.signesNegatifs}
                onChange={(e) =>
                  handleInputChange("signesNegatifs", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contexte
              </label>
              <textarea
                value={formData.contexte}
                onChange={(e) => handleInputChange("contexte", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Suite
              </label>
              <textarea
                value={formData.suite}
                onChange={(e) => handleInputChange("suite", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bilans demandés
              </label>
              <textarea
                value={formData.bilansDemandes}
                onChange={(e) =>
                  handleInputChange("bilansDemandes", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Traitement reçu
              </label>
              <textarea
                value={formData.traitementRecu}
                onChange={(e) =>
                  handleInputChange("traitementRecu", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg print:border-0 print:border-b"
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* EXAMEN CLINIQUE Section */}
        <section className="border border-slate-200 rounded-lg p-6 print:border-0 print:p-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 print:text-xl print:border-b print:border-slate-400">
            V. EXAMEN CLINIQUE
          </h2>

          <div className="space-y-6">
            {/* EXAMEN GÉNÉRAL */}
            <div className="border border-slate-200 rounded-lg p-4 print:border-0">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 print:text-base">
                Examen Général
              </h3>

              {/* Row 1: Plan Hémodynamique */}
              <div className="mb-4 print:mb-3">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      Plan Hémodynamique - FC
                    </label>
                    <input
                      type="text"
                      value={formData.planHemodynamiqueFC}
                      onChange={(e) =>
                        handleInputChange("planHemodynamiqueFC", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      TA
                    </label>
                    <input
                      type="text"
                      value={formData.planHemodynamiqueTA}
                      onChange={(e) =>
                        handleInputChange("planHemodynamiqueTA", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      TRC
                    </label>
                    <input
                      type="text"
                      value={formData.planHemodynamiqueTRC}
                      onChange={(e) =>
                        handleInputChange("planHemodynamiqueTRC", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Plan Respiratoire */}
              <div className="mb-4 print:mb-3">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      Plan Respiratoire - SaO₂
                    </label>
                    <input
                      type="text"
                      value={formData.planRespiratoire_SaO2}
                      onChange={(e) =>
                        handleInputChange("planRespiratoire_SaO2", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      FR
                    </label>
                    <input
                      type="text"
                      value={formData.planRespiratoire_FR}
                      onChange={(e) =>
                        handleInputChange("planRespiratoire_FR", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Plan Neurologique */}
              <div className="mb-4 print:mb-3">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      Plan Neurologique - GCS
                    </label>
                    <input
                      type="text"
                      value={formData.planNeurologique_GCS}
                      onChange={(e) =>
                        handleInputChange("planNeurologique_GCS", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Temperature, Dextro, BU */}
              <div className="mb-4 print:mb-3">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      T°
                    </label>
                    <input
                      type="text"
                      value={formData.temperature}
                      onChange={(e) =>
                        handleInputChange("temperature", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      Dextro
                    </label>
                    <input
                      type="text"
                      value={formData.dextro}
                      onChange={(e) => handleInputChange("dextro", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      BU
                    </label>
                    <input
                      type="text"
                      value={formData.bu}
                      onChange={(e) => handleInputChange("bu", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Poids, Taille, IMC */}
              <div className="mb-4 print:mb-3">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      Poids
                    </label>
                    <input
                      type="text"
                      value={formData.poids}
                      onChange={(e) => handleInputChange("poids", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      Taille
                    </label>
                    <input
                      type="text"
                      value={formData.taille}
                      onChange={(e) => handleInputChange("taille", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1 print:text-xs">
                      IMC
                    </label>
                    <input
                      type="text"
                      value={formData.imc}
                      onChange={(e) => handleInputChange("imc", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: État Général */}
              <div className="mb-4 print:mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-2 print:text-xs">
                  État Général
                </label>
                <textarea
                  value={formData.etatGeneral}
                  onChange={(e) =>
                    handleInputChange("etatGeneral", e.target.value)
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                  rows={2}
                />
              </div>

              {/* Row 7: État Cutanéomuqueux with tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 print:text-xs">
                  État Cutanéomuqueux
                </label>
                <div className="flex flex-wrap gap-2 mb-3 print:mb-2">
                  {CUTANEOUS_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleCutaneousTag(tag)}
                      className={`px-2 py-1 text-xs font-medium transition-colors border print:border print:border-slate-400 ${
                        formData.etatCutaneomuqueux.includes(tag)
                          ? "bg-indigo-600 text-white border-indigo-600 print:bg-slate-400 print:text-white"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300 print:bg-white print:text-slate-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <textarea
                  value={formData.etatCutaneomusqueuxExtra}
                  onChange={(e) =>
                    handleInputChange("etatCutaneomusqueuxExtra", e.target.value)
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded print:border-0 print:border-b text-sm"
                  rows={2}
                />
              </div>
            </div>

            {/* DYNAMIC EXAMS FROM JSON */}
            {dynamicExams.map((exam) => (
              <div key={exam.key} className="border border-slate-200 rounded-lg p-4 print:border-0 mt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 print:text-base">
                  {exam.label}
                </h3>

                {/* Render sections and tags for this exam */}
                {exam.sections.map((sectionKey: string) => {
                  const sectionLabel = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
                  const tags = exam.content[sectionKey] || [];
                  const selected = formData.clinicalExamSelections[exam.key]?.[sectionKey] || [];

                  return (
                    <div key={sectionKey} className="mb-3 print:mb-1.5">
                      <label className="block text-sm font-medium text-slate-700 mb-2 print:text-xs">
                        {sectionLabel}
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2 print:mb-1">
                        {tags.map((tag: string) => (
                          <button
                            key={tag}
                            onClick={() => toggleClinicalExamTag(exam.key, sectionKey, tag)}
                            className={`px-2 py-1 text-xs font-medium transition-colors border print:border print:border-slate-400 rounded ${
                              selected.includes(tag)
                                ? "bg-indigo-600 text-white border-indigo-600 print:bg-slate-400 print:text-white"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300 print:bg-white print:text-slate-700"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Extra notes for this exam */}
                <div className="mt-4 print:mt-2 pt-3 print:pt-1.5 border-t border-slate-200 print:border-t">
                  <label className="block text-sm font-medium text-slate-700 mb-2 print:text-xs">
                    Notes supplémentaires - {exam.label}
                  </label>
                  <textarea
                    value={formData.clinicalExamNotes[exam.key] || ""}
                    onChange={(e) => handleExamNotesChange(exam.key, e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border-0 text-sm print:border-0 print:border-b"
                    rows={4}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Print Styles */}
      <style>{`
        @page {
          margin: 0 !important;
          padding: 0 !important;
        }

        @page {
          @top-center {
            content: "" !important;
          }
          @bottom-center {
            content: "" !important;
          }
          @top-left {
            content: "" !important;
          }
          @top-right {
            content: "" !important;
          }
          @bottom-left {
            content: "" !important;
          }
          @bottom-right {
            content: "" !important;
          }
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 60px 12mm 100px 12mm !important;
            width: 100% !important;
            height: auto !important;
          }

          /* Hide browser headers and footers */
          @page {
            margin: 100px 0 100px 0 !important;
            size: A4 !important;
          }

          @page :first {
            margin: 100px 0 100px 0 !important;
          }

          head, title, meta {
            display: none !important;
          }

          .min-h-screen {
            min-height: auto !important;
            height: auto !important;
          }

          section, .border {
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin-bottom: 1mm !important;
          }

          .rounded-lg, .rounded, .rounded-full {
            border-radius: 0 !important;
          }

          .space-y-4 > *, .space-y-6 > * {
            margin-bottom: 0.5mm !important;
          }

          .print\\:mt-12 {
            margin-top: 2mm !important;
          }

          .print\\:space-y-5 > * + * {
            margin-top: 0.5mm !important;
          }

          .gap-4, .gap-2, .gap-6 {
            gap: 2mm !important;
          }

          .mb-4 {
            margin-bottom: 0.5mm !important;
          }

          .mb-3 {
            margin-bottom: 0.25mm !important;
          }

          .mb-2 {
            margin-bottom: 0.15mm !important;
          }

          .mb-1 {
            margin-bottom: 0 !important;
          }

          input, textarea {
            border: none !important;
            border-bottom: 1px solid #000 !important;
            background: transparent !important;
            padding: 1mm 0.5mm !important;
            margin: 0 !important;
            font-family: Arial, sans-serif !important;
            font-size: 9pt !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          input::placeholder, textarea::placeholder {
            display: none;
          }

          textarea {
            min-height: 9mm !important;
            resize: none !important;
            line-height: 3mm !important;
          }

          label {
            display: block !important;
            font-weight: 700 !important;
            margin-bottom: 0.25mm !important;
            font-size: 8pt !important;
          }

          .print\\:text-xs {
            font-size: 7pt !important;
          }

          h2 {
            font-size: 11pt !important;
            margin-bottom: 1mm !important;
            margin-top: 0 !important;
            border-bottom: 0.75px solid #000 !important;
            padding-bottom: 0.5mm !important;
          }

          h3 {
            font-size: 9.5pt !important;
            margin-bottom: 0.75mm !important;
            margin-top: 0 !important;
          }

          p {
            margin: 0 !important;
            font-size: 8pt !important;
          }

          button {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Tag styling for print - better design */
          button {
            display: none !important;
          }

          .px-2.py-1,
          .px-3.py-1 {
            display: inline-block !important;
            padding: 1.5mm 3mm !important;
            margin: 1mm 1.5mm 1mm 0 !important;
            border: 0.5px solid #d1d5db !important;
            background: #f3f4f6 !important;
            color: #374151 !important;
            font-size: 7.5pt !important;
            border-radius: 3mm !important;
            font-weight: 500 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
          }

          .print\\:border {
            border: 0.5px solid #9ca3af !important;
          }

          .print\\:bg-slate-400 {
            background: #9ca3af !important;
            border-color: #9ca3af !important;
            color: white !important;
          }

          .print\\:text-white {
            color: white !important;
          }

          .print\\:bg-white {
            background: #f3f4f6 !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
          }

          .print\\:text-slate-700 {
            color: #374151 !important;
          }

          .flex.flex-wrap {
            display: flex !important;
            flex-wrap: wrap !important;
            margin-bottom: 0.5mm !important;
          }

          .flex-1 {
            flex: 1 !important;
            min-width: 25mm !important;
          }

          /* Grid layout for print */
          .md\\:grid-cols-3 {
            display: grid !important;
            grid-template-columns: 2fr 1fr !important;
            gap: 12mm !important;
          }

          .md\\:col-span-2 {
            grid-column: span 1 !important;
          }

          .md\\:grid-cols-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12mm !important;
          }

          .grid {
            display: grid !important;
            gap: 12mm !important;
          }

          .flex {
            display: flex !important;
          }

          .text-sm {
            font-size: 8.5pt !important;
          }

          .text-xs {
            font-size: 7.5pt !important;
          }

          .text-lg {
            font-size: 10pt !important;
          }

          .text-base {
            font-size: 9pt !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ObservationTemplatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <ObservationTemplateContent />
    </Suspense>
  );
}
