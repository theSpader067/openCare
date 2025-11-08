"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, FilePlus, Pill, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";

type Ordonnance = {
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

const mockPatients: Patient[] = [
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

const mockOrdonnances: Ordonnance[] = [
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

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function OrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>(mockOrdonnances);
  const [activeOrdonnanceId, setActiveOrdonnanceId] = useState<string | null>(
    mockOrdonnances[0]?.id ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(
    null
  );
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    patient: null as Patient | null,
    clinicalInfo: "",
    prescriptionDetails: "",
  });

  const userOrdonnances = useMemo(() => {
    return ordonnances.filter((ord) => ord.createdBy === "Vous");
  }, [ordonnances]);

  const filteredOrdonnances = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return userOrdonnances.filter((ord) => {
      return (
        !query ||
        ord.title.toLowerCase().includes(query) ||
        ord.prescriptionDetails.toLowerCase().includes(query) ||
        ord.patient?.fullName.toLowerCase().includes(query)
      );
    });
  }, [userOrdonnances, searchTerm]);

  useEffect(() => {
    if (!isCreateMode && !activeOrdonnanceId && filteredOrdonnances.length > 0) {
      setActiveOrdonnanceId(filteredOrdonnances[0].id);
    }
  }, [activeOrdonnanceId, filteredOrdonnances, isCreateMode]);

  const activeOrdonnance = useMemo(() => {
    if (!activeOrdonnanceId) {
      return null;
    }
    return ordonnances.find((ord) => ord.id === activeOrdonnanceId) ?? null;
  }, [activeOrdonnanceId, ordonnances]);

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectOrdonnance = (ordonnanceId: string) => {
    setActiveOrdonnanceId(ordonnanceId);
    setIsCreateMode(false);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setActiveOrdonnanceId(null);
    setCreateForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      patient: null,
      clinicalInfo: "",
      prescriptionDetails: "",
    });

    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("create");
    }
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
    closeMobilePanel();
  };

  const handleSelectPatient = (patient: Patient) => {
    setCreateForm((prev) => ({ ...prev, patient }));
    setShowPatientModal(false);
  };

  const handleCreateNewPatient = (formData: Record<string, string>) => {
    if (!formData.fullName?.trim() || !formData.age) {
      return;
    }
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      fullName: formData.fullName.trim(),
      age: parseInt(formData.age, 10),
      histoire: formData.histoire?.trim() || "",
    };
    setCreateForm((prev) => ({ ...prev, patient: newPatient }));
    setShowPatientModal(false);
  };

  const handleCreateOrdonnance = () => {
    if (
      !createForm.title ||
      !createForm.date ||
      !createForm.patient ||
      !createForm.clinicalInfo ||
      !createForm.prescriptionDetails
    ) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newOrdonnance: Ordonnance = {
        id: `ORD-${Date.now()}`,
        title: createForm.title,
        date: createForm.date,
        patient: createForm.patient ?? undefined,
        clinicalInfo: createForm.clinicalInfo,
        prescriptionDetails: createForm.prescriptionDetails,
        createdAt: new Date().toISOString(),
        createdBy: "Vous",
      };

      setOrdonnances((prev) => [newOrdonnance, ...prev]);
      setIsSubmitting(false);
      setIsCreateMode(false);
      closeMobilePanel();
      setActiveOrdonnanceId(newOrdonnance.id);
      setCreateForm({
        title: "",
        date: new Date().toISOString().split("T")[0],
        patient: null,
        clinicalInfo: "",
        prescriptionDetails: "",
      });
    }, 520);
  };

  const isFormValid =
    createForm.title &&
    createForm.date &&
    createForm.patient &&
    createForm.clinicalInfo &&
    createForm.prescriptionDetails;

  const createFormContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Titre de l'ordonnance
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ex: Traitement post-opératoire"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Date
        </label>
        <input
          type="date"
          value={createForm.date}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Patient Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Patient
        </label>
        <button
          type="button"
          onClick={() => setShowPatientModal(true)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {createForm.patient ? (
            <span className="font-medium text-slate-900">
              {createForm.patient.fullName}
            </span>
          ) : (
            <span className="text-slate-500">Sélectionner un patient</span>
          )}
        </button>
      </div>

      {/* Clinical Info */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Renseignement clinique
        </label>
        <textarea
          value={createForm.clinicalInfo}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              clinicalInfo: e.target.value,
            }))
          }
          placeholder="Contexte clinique et antécédents pertinents..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Prescription Details */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Détails de la prescription
        </label>
        <textarea
          value={createForm.prescriptionDetails}
          onChange={(e) =>
            setCreateForm((prev) => ({
              ...prev,
              prescriptionDetails: e.target.value,
            }))
          }
          placeholder="1. Médicament A - dosage × fréquence..."
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );

  const detailViewContent = activeOrdonnance ? (
    <>
      {/* Header with Patient ID and Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            ID Patient
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {activeOrdonnance.patient?.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Date
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {formatDate(activeOrdonnance.date)}
          </p>
        </div>
      </div>

      {/* Ordonnance Title */}
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-2">
          Ordonnance
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          {activeOrdonnance.title}
        </h2>
      </div>

      {/* Patient Info */}
      {activeOrdonnance.patient && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            Patient
          </header>
          <p className="text-sm font-semibold text-slate-900">
            {activeOrdonnance.patient.fullName}
          </p>
          <p className="text-sm text-slate-700 mt-2">
            {(activeOrdonnance.patient as any).age} ans
          </p>
        </section>
      )}

      {/* Clinical Information */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Renseignement clinique
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {activeOrdonnance.clinicalInfo}
        </p>
      </section>

      {/* Prescription Details */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm flex-1">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Détails de la prescription
        </header>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-mono">
          {activeOrdonnance.prescriptionDetails}
        </p>
      </section>
    </>
  ) : null;

  const renderListItemContent = (ordonnance: Ordonnance) => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">
            {ordonnance.title}
          </p>
          <p className="text-xs text-slate-500">
            Créé par {ordonnance.createdBy}
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {formatDate(ordonnance.date)}
        </span>
      </div>
      {ordonnance.patient && (
        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">
            {ordonnance.patient.fullName}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {(ordonnance.patient as any).age} ans
          </p>
        </div>
      )}
      <p className="mt-3 text-sm text-slate-600 line-clamp-2">
        {ordonnance.prescriptionDetails}
      </p>
    </>
  );

  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ordonnances</h1>
          <p className="text-sm text-slate-500">
            Gérez vos prescriptions médicales et consultez l'historique des ordonnances.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Nouvelle ordonnance
        </Button>
      </section>
      <DataListLayout
        items={ordonnances}
        filteredItems={filteredOrdonnances}
        activeItemId={activeOrdonnanceId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: Ordonnance) => handleSelectOrdonnance(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title="Ordonnances"
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={detailViewContent ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={Pill}
        emptyTitle="Aucune ordonnance"
        emptyDescription="Créez votre première ordonnance"
        searchPlaceholder="Rechercher une ordonnance..."
        isSubmitting={isSubmitting}
        createTitle="Nouvelle ordonnance"
        createDescription="Enregistrez une nouvelle prescription"
        saveButtonText="Enregistrer"
        isFormValid={isFormValid as unknown as boolean}
        onSave={handleCreateOrdonnance}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={mockPatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName", "age", "histoire"]}
        onCreatePatient={handleCreateNewPatient}
      />
    </>
  );
}
