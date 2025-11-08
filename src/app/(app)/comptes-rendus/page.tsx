"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Stethoscope,
  Users,
  X,
  ArrowLeft,
  User,
  FilePlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Patient = {
  id: string;
  fullName: string;
  histoire: string;
};

type Operation = {
  id: string;
  type: string;
  date: string;
  duration: number;
  operators: Operator[];
  details: string;
  patient?: Patient;
  createdAt: string;
  createdBy: string;
};

type Operator = {
  id: string;
  name: string;
  role: string;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

const operationTypes = [
  "Chirurgie générale",
  "Chirurgie digestive",
  "Chirurgie vasculaire",
  "Urologie",
  "Orthopédie",
  "Cardiologie interventionnelle",
  "Neurochirurgie",
  "Chirurgie thoracique",
];

const teamMembers: TeamMember[] = [
  { id: "TM1", name: "Dr. Marie Dupont", role: "Chirurgien" },
  { id: "TM2", name: "Dr. Jean Martin", role: "Chirurgien" },
  { id: "TM3", name: "IDE Sarah Laurent", role: "Infirmière" },
  { id: "TM4", name: "IDE Claire Moreau", role: "Infirmière" },
  { id: "TM5", name: "Dr. Pierre Lefebvre", role: "Anesthésiste" },
  { id: "TM6", name: "IDE Marc Bertrand", role: "Infirmier" },
];

const mockPatients: Patient[] = [
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

const mockOperations: Operation[] = [
  {
    id: "OP-001",
    type: "Chirurgie digestive",
    date: "2024-03-15",
    duration: 120,
    operators: [
      { id: "TM1", name: "Dr. Marie Dupont", role: "Chirurgien" },
      { id: "TM3", name: "IDE Sarah Laurent", role: "Infirmière" },
    ],
    patient: mockPatients[0],
    details:
      "Cholécystectomie laparoscopique. Intervention sans incident. Patient stable tout au long de la procédure. Hémostase complète. Sutures réalisées sans complication.",
    createdAt: "2024-03-15T14:30:00",
    createdBy: "Dr. Marie Dupont",
  },
  {
    id: "OP-002",
    type: "Chirurgie vasculaire",
    date: "2024-03-14",
    duration: 180,
    operators: [
      { id: "TM2", name: "Dr. Jean Martin", role: "Chirurgien" },
      { id: "TM5", name: "Dr. Pierre Lefebvre", role: "Anesthésiste" },
      { id: "TM4", name: "IDE Claire Moreau", role: "Infirmière" },
    ],
    patient: mockPatients[1],
    details:
      "Bypass fémoro-poplité. Sutures vasculaires réalisées avec succès. Hémostase complète. Patient stable en post-opératoire.",
    createdAt: "2024-03-14T11:00:00",
    createdBy: "Dr. Jean Martin",
  },
  {
    id: "OP-003",
    type: "Chirurgie générale",
    date: "2024-03-13",
    duration: 90,
    operators: [
      { id: "TM1", name: "Dr. Marie Dupont", role: "Chirurgien" },
      { id: "TM6", name: "IDE Marc Bertrand", role: "Infirmier" },
    ],
    patient: mockPatients[2],
    details:
      "Hernioplastie inguinale unilatérale. Pose de prothèse sans complication. Intervention classique, patient en bon état.",
    createdAt: "2024-03-13T09:15:00",
    createdBy: "Dr. Marie Dupont",
  },
];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ComptesRendusPage() {
  const [operations, setOperations] = useState<Operation[]>(mockOperations);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(
    mockOperations[0]?.id ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(
    null
  );
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientMode, setPatientMode] = useState<"select" | "new">("select");
  const [patientSearch, setPatientSearch] = useState("");

  const [createForm, setCreateForm] = useState({
    type: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    operators: [] as Operator[],
    patient: null as Patient | null,
    details: "",
  });
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: "",
    histoire: "",
  });
  const [showOperatorSelect, setShowOperatorSelect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOperations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return operations.filter((op) => {
      return (
        !query ||
        op.type.toLowerCase().includes(query) ||
        op.createdBy.toLowerCase().includes(query) ||
        op.details.toLowerCase().includes(query) ||
        op.patient?.fullName.toLowerCase().includes(query) ||
        op.operators.some((o) => o.name.toLowerCase().includes(query))
      );
    });
  }, [operations, searchTerm]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) {
      return mockPatients;
    }
    return mockPatients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(query) ||
        patient.histoire.toLowerCase().includes(query)
      );
    });
  }, [patientSearch]);

  useEffect(() => {
    if (!isCreateMode && !activeOperationId && filteredOperations.length > 0) {
      setActiveOperationId(filteredOperations[0].id);
    }
  }, [activeOperationId, filteredOperations, isCreateMode]);

  const activeOperation = useMemo(() => {
    if (!activeOperationId) {
      return null;
    }
    return operations.find((op) => op.id === activeOperationId) ?? null;
  }, [activeOperationId, operations]);

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectOperation = (operationId: string) => {
    setActiveOperationId(operationId);
    setIsCreateMode(false);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setActiveOperationId(null);
    setCreateForm({
      type: "",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      operators: [],
      patient: null,
      details: "",
    });
    setNewPatientForm({ fullName: "", histoire: "" });
    setShowOperatorSelect(false);
    setPatientSearch("");
    setPatientMode("select");

    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("create");
    }
  };

  const handleAddOperator = (member: TeamMember) => {
    const alreadyAdded = createForm.operators.some((op) => op.id === member.id);
    if (!alreadyAdded) {
      setCreateForm((prev) => ({
        ...prev,
        operators: [
          ...prev.operators,
          { id: member.id, name: member.name, role: member.role },
        ],
      }));
    }
    setShowOperatorSelect(false);
  };

  const handleRemoveOperator = (id: string) => {
    setCreateForm((prev) => ({
      ...prev,
      operators: prev.operators.filter((op) => op.id !== id),
    }));
  };

  const handleSelectPatient = (patient: Patient) => {
    setCreateForm((prev) => ({ ...prev, patient }));
    setShowPatientModal(false);
    setPatientSearch("");
  };

  const handleCreateNewPatient = () => {
    if (!newPatientForm.fullName.trim()) {
      return;
    }
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      fullName: newPatientForm.fullName,
      histoire: newPatientForm.histoire,
    };
    setCreateForm((prev) => ({ ...prev, patient: newPatient }));
    setShowPatientModal(false);
    setNewPatientForm({ fullName: "", histoire: "" });
    setPatientSearch("");
  };

  const handleCreateOperation = () => {
    if (
      !createForm.type ||
      !createForm.date ||
      !createForm.duration ||
      !createForm.details ||
      createForm.operators.length === 0 ||
      !createForm.patient
    ) {
      return;
    }
    setIsSubmitting(true);
    const newOperation: Operation = {
      id: `OP-${Date.now()}`,
      type: createForm.type,
      date: createForm.date,
      duration: parseInt(createForm.duration),
      operators: createForm.operators,
      patient: createForm.patient,
      details: createForm.details,
      createdAt: new Date().toISOString(),
      createdBy: "Dr. Marie Dupont",
    };
    setTimeout(() => {
      setOperations((previous) => [newOperation, ...previous]);
      setIsCreateMode(false);
      if (typeof window !== "undefined" && window.innerWidth < 1280) {
        setMobilePanelMode("view");
        setIsMobilePanelOpen(true);
      }
      setActiveOperationId(newOperation.id);
      setIsSubmitting(false);
    }, 350);
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
    if (operations.length > 0) {
      setActiveOperationId(operations[0].id);
    }
    closeMobilePanel();
  };

  const availableOperators = teamMembers.filter(
    (member) => !createForm.operators.some((op) => op.id === member.id)
  );

  const renderCreateFormContent = () => (
    <div className="grid gap-4">
      {/* Patient Selection */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Patient
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowPatientModal(true)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {createForm.patient ? "Modifier" : "Ajouter"}
          </Button>
        </div>
        {createForm.patient && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-sm font-semibold text-slate-900">
              {createForm.patient.fullName}
            </p>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {createForm.patient.histoire}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Type d&apos;intervention
        </label>
        <select
          value={createForm.type}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, type: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Sélectionner un type…</option>
          {operationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Date
          </label>
          <input
            type="date"
            value={createForm.date}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, date: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Durée (min)
          </label>
          <input
            type="number"
            value={createForm.duration}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                duration: event.target.value,
              }))
            }
            placeholder="120"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Opérateurs
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOperatorSelect(!showOperatorSelect)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        </div>

        {showOperatorSelect && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-40 overflow-y-auto">
            {availableOperators.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Tous les opérateurs ont été ajoutés
              </p>
            ) : (
              availableOperators.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleAddOperator(member)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition text-sm"
                >
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </button>
              ))
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {createForm.operators.map((operator) => (
            <Badge
              key={operator.id}
              variant="muted"
              className="rounded-full pl-3 pr-1.5 py-1"
            >
              {operator.name}
              <button
                onClick={() => handleRemoveOperator(operator.id)}
                className="ml-1.5 hover:text-slate-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Détails de l&apos;intervention
        </label>
        <textarea
          value={createForm.details}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, details: event.target.value }))
          }
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Décrivez les détails de l'intervention…"
        />
      </div>
    </div>
  );

  const detailView = isCreateMode ? (
    <>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Nouveau compte rendu</CardTitle>
            <CardDescription>Enregistrez une nouvelle intervention</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-4">
          {renderCreateFormContent()}
        </div>
      </CardContent>
      <div className="border-t border-slate-200/70 bg-white/90 p-4 space-y-3">
        <Button
          variant="ghost"
          className="w-full"
          onClick={handleCancelCreate}
        >
          Annuler
        </Button>
        <Button
          className="w-full"
          onClick={handleCreateOperation}
          disabled={
            !createForm.type ||
            !createForm.date ||
            !createForm.duration ||
            !createForm.details ||
            createForm.operators.length === 0 ||
            !createForm.patient ||
            isSubmitting
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </>
  ) : !activeOperation ? (
    <CardContent className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={Stethoscope}
        title="Sélectionnez un compte rendu"
        description="Choisissez un compte rendu dans la liste pour afficher les détails."
      />
    </CardContent>
  ) : (
    <>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{activeOperation.type}</CardTitle>
            <CardDescription className="text-xs text-slate-500 pt-2">
              {formatDateTime(activeOperation.createdAt)}
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {/* Patient Card */}
          {activeOperation.patient && (
            <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
              <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                <User className="h-4 w-4" />
                Patient
              </header>
              <p className="text-sm font-semibold text-slate-900">
                {activeOperation.patient.fullName}
              </p>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {activeOperation.patient.histoire}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
            <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Calendar className="h-4 w-4" />
              Informations générales
            </header>
            <div className="grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Créé par
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {activeOperation.createdBy}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(activeOperation.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Durée
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {activeOperation.duration}m
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Opérateurs ({activeOperation.operators.length})
            </header>
            <div className="flex flex-wrap gap-2">
              {activeOperation.operators.map((operator) => (
                <div
                  key={operator.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                    {operator.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{operator.name}</p>
                    <p className="text-xs text-slate-500">{operator.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Détails de l&apos;intervention
            </header>
            <p className="text-sm leading-relaxed text-slate-700">
              {activeOperation.details}
            </p>
          </section>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Desktop View */}
      <section className="hidden xl:grid xl:flex-1 xl:gap-6 xl:grid-cols-[1.3fr_2fr]">
        <Card className="flex h-full flex-col border-none bg-white/95">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Comptes rendus</CardTitle>
              <Badge variant="muted" className="bg-slate-100 text-slate-600">
                {filteredOperations.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un type, un créateur ou une opération"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 px-6 pb-6">
            {filteredOperations.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="Aucun compte rendu"
                description="Créez votre premier compte rendu pour commencer à documenter vos interventions."
              />
            ) : (
              <div className="flex h-full flex-col overflow-y-auto pt-4">
                <ul className="flex flex-col gap-3">
                  {filteredOperations.map((operation) => {
                    const isActive = operation.id === activeOperationId && !isCreateMode;
                    return (
                      <li key={operation.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectOperation(operation.id)}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition",
                            "hover:-translate-y-[1px] hover:shadow-md",
                            isActive
                              ? "border-indigo-200 bg-indigo-50/80"
                              : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {operation.type}
                              </p>
                              <p className="text-xs text-slate-500">
                                Créé par {operation.createdBy}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatDate(operation.date)}
                            </span>
                          </div>
                          <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            {operation.patient && (
                              <p className="font-semibold text-slate-700 mb-1">
                                {operation.patient.fullName}
                              </p>
                            )}
                            <p className="font-semibold text-slate-700">
                              {operation.duration}m • {operation.operators.length} opérateurs
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                              {operation.operators.map((o) => o.name).join(", ")}
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                            {operation.details}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col border-none bg-white/95">
          {detailView}
        </Card>
      </section>

      {/* Mobile & Tablet List View */}
      <section className="flex flex-1 xl:hidden">
        <Card className="flex w-full flex-col border-none bg-white/95">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Comptes rendus</CardTitle>
              <Badge variant="muted" className="bg-slate-100 text-slate-600">
                {filteredOperations.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher…"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 px-6 pb-6">
            {filteredOperations.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="Aucun compte rendu"
                description="Créez votre premier compte rendu pour commencer à documenter vos interventions."
              />
            ) : (
              <div className="flex h-full flex-col overflow-y-auto pt-4">
                <ul className="flex flex-col gap-3">
                  {filteredOperations.map((operation) => {
                    const isActive = operation.id === activeOperationId && !isCreateMode;
                    return (
                      <li key={operation.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectOperation(operation.id)}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition",
                            "hover:-translate-y-[1px] hover:shadow-md",
                            isActive
                              ? "border-indigo-200 bg-indigo-50/80"
                              : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {operation.type}
                              </p>
                              <p className="text-xs text-slate-500">
                                Créé par {operation.createdBy}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatDate(operation.date)}
                            </span>
                          </div>
                          <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            {operation.patient && (
                              <p className="font-semibold text-slate-700 mb-1">
                                {operation.patient.fullName}
                              </p>
                            )}
                            <p className="font-semibold text-slate-700">
                              {operation.duration}m • {operation.operators.length} opérateurs
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                              {operation.operators.map((o) => o.name).join(", ")}
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                            {operation.details}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Mobile Floating Button */}
      {!isMobilePanelOpen && (
        <div className="fixed bottom-24 right-4 xl:hidden z-40">
          <Button
            onClick={handleOpenCreate}
            size="lg"
            className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <FilePlus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Sliding Panel */}
      {isMobilePanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 xl:hidden flex items-end">
          <div className="w-full rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col h-[95vh]">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <button
                onClick={closeMobilePanel}
                className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              {mobilePanelMode === "view" && activeOperation && (
                <h3 className="font-semibold text-slate-900 truncate flex-1 mx-4">
                  {activeOperation.type}
                </h3>
              )}
              {mobilePanelMode === "create" && (
                <h3 className="font-semibold text-slate-900">Nouveau compte rendu</h3>
              )}
            </div>

            {/* Panel Content */}
            {mobilePanelMode === "view" && activeOperation ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 pb-24">
                    <div className="space-y-4">
                      {/* Patient Card */}
                      {activeOperation.patient && (
                        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
                          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                            <User className="h-4 w-4" />
                            Patient
                          </header>
                          <p className="text-sm font-semibold text-slate-900">
                            {activeOperation.patient.fullName}
                          </p>
                          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                            {activeOperation.patient.histoire}
                          </p>
                        </section>
                      )}

                      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                        <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <Calendar className="h-4 w-4" />
                          Informations générales
                        </header>
                        <div className="grid gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Créé par
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {activeOperation.createdBy}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Date
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {formatDate(activeOperation.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Durée
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {activeOperation.duration}m
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-2xl bg-white p-4 shadow-sm">
                        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Opérateurs ({activeOperation.operators.length})
                        </header>
                        <div className="flex flex-wrap gap-2">
                          {activeOperation.operators.map((operator) => (
                            <div
                              key={operator.id}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                            >
                              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                                {operator.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">
                                  {operator.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {operator.role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                        <header className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                          Détails de l&apos;intervention
                        </header>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {activeOperation.details}
                        </p>
                      </section>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : mobilePanelMode === "create" ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 pb-24">
                    <div className="space-y-4">
                      {renderCreateFormContent()}
                    </div>
                  </div>
                </ScrollArea>
                <div className="border-t border-slate-200/70 bg-white/90 p-4 space-y-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleCancelCreate}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleCreateOperation}
                    disabled={
                      !createForm.type ||
                      !createForm.date ||
                      !createForm.duration ||
                      !createForm.details ||
                      createForm.operators.length === 0 ||
                      !createForm.patient ||
                      isSubmitting
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 xl:hidden">
          <Card className="w-full max-w-md border-none shadow-2xl">
            <CardHeader className="relative pb-3">
              <CardTitle>Sélectionner ou créer un patient</CardTitle>
              <button
                onClick={() => setShowPatientModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mode Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                <button
                  onClick={() => setPatientMode("select")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition",
                    patientMode === "select"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600"
                  )}
                >
                  Existants
                </button>
                <button
                  onClick={() => setPatientMode("new")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition",
                    patientMode === "new"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600"
                  )}
                >
                  Nouveau
                </button>
              </div>

              {patientMode === "select" ? (
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un patient..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {/* Patients List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                        >
                          <p className="font-medium text-slate-900">
                            {patient.fullName}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {patient.histoire}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-sm text-slate-500 py-4">
                        Aucun patient trouvé
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={newPatientForm.fullName}
                      onChange={(e) =>
                        setNewPatientForm({
                          ...newPatientForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Entrez le nom du patient"
                      className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Histoire clinique
                    </label>
                    <textarea
                      value={newPatientForm.histoire}
                      onChange={(e) =>
                        setNewPatientForm({
                          ...newPatientForm,
                          histoire: e.target.value,
                        })
                      }
                      placeholder="Antécédents, allergie, histoire clinique..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPatientModal(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateNewPatient}
                      disabled={!newPatientForm.fullName.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Créer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desktop Patient Modal */}
      {showPatientModal && (
        <div className="hidden xl:fixed xl:inset-0 xl:z-50 xl:bg-black/30 xl:flex xl:items-center xl:justify-center xl:p-4">
          <Card className="w-full max-w-md border-none shadow-2xl">
            <CardHeader className="relative pb-3">
              <CardTitle>Sélectionner ou créer un patient</CardTitle>
              <button
                onClick={() => setShowPatientModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mode Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                <button
                  onClick={() => setPatientMode("select")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition",
                    patientMode === "select"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600"
                  )}
                >
                  Existants
                </button>
                <button
                  onClick={() => setPatientMode("new")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition",
                    patientMode === "new"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600"
                  )}
                >
                  Nouveau
                </button>
              </div>

              {patientMode === "select" ? (
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un patient..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {/* Patients List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                        >
                          <p className="font-medium text-slate-900">
                            {patient.fullName}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {patient.histoire}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-sm text-slate-500 py-4">
                        Aucun patient trouvé
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={newPatientForm.fullName}
                      onChange={(e) =>
                        setNewPatientForm({
                          ...newPatientForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Entrez le nom du patient"
                      className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Histoire clinique
                    </label>
                    <textarea
                      value={newPatientForm.histoire}
                      onChange={(e) =>
                        setNewPatientForm({
                          ...newPatientForm,
                          histoire: e.target.value,
                        })
                      }
                      placeholder="Antécédents, allergie, histoire clinique..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPatientModal(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateNewPatient}
                      disabled={!newPatientForm.fullName.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Créer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
