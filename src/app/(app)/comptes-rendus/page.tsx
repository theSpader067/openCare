"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ClipboardPenLine,
  CloudSun,
  FileBox,
  FilePlus2,
  Link2,
  Search,
  Sparkles,
  Stars,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

type ReportStatus = "draft" | "finalized" | "needs-review";
type ReportMood = "luminous" | "serene" | "urgent";

type Report = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  mood: ReportMood;
  specialty: string;
  author: {
    name: string;
    role: string;
  };
  patient: {
    id: string;
    name: string;
    age: number;
    service: string;
    diagnosis: string;
  };
  sections: {
    clinicalContext: string;
    observations: string;
    plan: string;
    nextSteps: string;
  };
  keywords: string[];
};

type ReportTemplate = {
  id: string;
  label: string;
  title: string;
  summary: string;
  specialty: string;
  mood: ReportMood;
  sections: Report["sections"];
  keywords: string[];
};

type DraftReport = {
  title: string;
  summary: string;
  patientId: string;
  specialty: string;
  mood: ReportMood;
  sections: Report["sections"];
  keywords: string[];
};

const createdReportsSeed: Report[] = [
  {
    id: "CR-2024-091",
    title: "Bilan post-opératoire · Sleeve gastrectomie",
    summary: "Suivi immédiat J+1 avec point hémodynamique rassurant et recommandations nutritionnelles.",
    createdAt: "2024-03-12T08:15:00+01:00",
    updatedAt: "2024-03-12T12:32:00+01:00",
    status: "finalized",
    mood: "luminous",
    specialty: "Chirurgie bariatrique",
    author: {
      name: "Dr. Adama Faye",
      role: "Chef de clinique",
    },
    patient: {
      id: "P-2024-0201",
      name: "Awa Ndiaye",
      age: 47,
      service: "Chirurgie viscérale",
      diagnosis: "Obésité morbide · sleeve gastrectomie",
    },
    sections: {
      clinicalContext:
        "Patiente opérée la veille par sleeve gastrectomie laparoscopique. Suites opératoires immédiates simples. Surveillance en service de chirurgie avec protocole Enhanced Recovery After Surgery (ERAS).",
      observations:
        "Douleurs correctement soulagées (EVA 3/10). Transit non repris, absence de nausées. Pansement sec, pas de signe d'hémorragie. Biologie matinale rassurante (Hb 12,1 g/dL, CRP 18 mg/L).",
      plan:
        "Poursuite du protocole d'hydratation par paliers. Mobilisation précoce accompagnée. Héparine bas poids moléculaire maintenue 7 jours.",
      nextSteps:
        "Consultation diététique à J+7 programmée. Contrôle vitaminique à 1 mois. Téléconsultation de suivi à prévoir à J+30.",
    },
    keywords: ["ERAS", "post-opératoire", "nutrition"],
  },
  {
    id: "CR-2024-088",
    title: "Compte rendu consultation cardio-oncologie",
    summary: "Optimisation thérapeutique pré-chimiothérapie avec ajustement bêta-bloquant.",
    createdAt: "2024-03-11T16:05:00+01:00",
    updatedAt: "2024-03-11T17:10:00+01:00",
    status: "needs-review",
    mood: "serene",
    specialty: "Cardiologie",
    author: {
      name: "Dr. Malick Sarr",
      role: "Praticien hospitalier",
    },
    patient: {
      id: "P-2024-0142",
      name: "Lamia Saïd",
      age: 58,
      service: "Oncologie",
      diagnosis: "Cholangiocarcinome · chimiothérapie FOLFIRINOX",
    },
    sections: {
      clinicalContext:
        "Patiente suivie en cardio-oncologie pour optimisation avant mise en route d'une chimiothérapie potentiellement cardiotoxique. Antécédents d'hypertension équilibrée.",
      observations:
        "ECG : rythme sinusal, QTc 440 ms. Echo cardiaque : FE 58 %, GLS -18 %. TA 145/90 mmHg. Pas de signes cliniques d'insuffisance cardiaque.",
      plan:
        "Augmentation du bisoprolol à 5 mg. Surveillance tensionnelle hebdomadaire. Contrôle biologique (NFS, iono, BNP) avant chaque cycle.",
      nextSteps:
        "Nouveau point cardio à J+21 après premier cycle. Télémonitoring tensionnel via appli OpenCare.",
    },
    keywords: ["cardio-oncologie", "chimiothérapie", "surveillance"],
  },
  {
    id: "CR-2024-082",
    title: "Synthèse pluridisciplinaire RCP sein",
    summary: "Décision collégiale de mastectomie totale avec reconstruction immédiate.",
    createdAt: "2024-03-08T11:00:00+01:00",
    updatedAt: "2024-03-09T09:45:00+01:00",
    status: "draft",
    mood: "urgent",
    specialty: "RCP Sein",
    author: {
      name: "Dr. Sokhna Diallo",
      role: "Coordinatrice RCP",
    },
    patient: {
      id: "P-2024-0185",
      name: "Mamadou Carter",
      age: 64,
      service: "Oncologie",
      diagnosis: "Métastases osseuses suspectées",
    },
    sections: {
      clinicalContext:
        "Réunion de concertation pluridisciplinaire du 8 mars 2024. Présence des services chirurgie, oncologie médicale, radiologie, anatomopathologie et soins de support.",
      observations:
        "Résultats d'imagerie : atteinte quadrants externes. Biopsie confirmant carcinome infiltrant G3. Score de 7/9 (Nottingham).",
      plan:
        "Indication collégiale de mastectomie totale droite avec reconstruction immédiate DIEP.",
      nextSteps:
        "Programmation bloc à J+14. Consultation anesthésique à organiser. Entretien soutien psycho-oncologie à proposer.",
    },
    keywords: ["RCP", "chirurgie", "oncologie"],
  },
];

const favoriteTemplates: ReportTemplate[] = [
  {
    id: "template-post-op-digestif",
    label: "Post-op digestif premium",
    title: "Suivi post-opératoire programme ERAS",
    summary: "Compte rendu structuré des suites opératoires avec priorités ERAS.",
    specialty: "Chirurgie digestive",
    mood: "luminous",
    keywords: ["ERAS", "mobilisation", "douleur"],
    sections: {
      clinicalContext:
        "Patient hospitalisé en chirurgie digestive, sous protocole Enhanced Recovery After Surgery. Intervention réalisée sans incident majeur.",
      observations:
        "Constantes stables. Douleur bien contrôlée. Absence de fièvre. Période post-opératoire conforme aux attentes. Pansements secs.",
      plan:
        "Hydratation orale progressive, mobilisation accompagnée, prophylaxie thromboembolique maintenue, surveillance biologique J+2.",
      nextSteps:
        "Consultation diététique sous 5 jours, appel infirmier à domicile planifié, contrôle chirurgical à J+10.",
    },
  },
  {
    id: "template-consult-cardio",
    label: "Consultation cardio",
    title: "Compte rendu consultation cardio-thérapeutique",
    summary: "Structure focus sur adaptation thérapeutique et éducation.",
    specialty: "Cardiologie",
    mood: "serene",
    keywords: ["suivi", "éducation", "thérapeutique"],
    sections: {
      clinicalContext:
        "Consultation programmée dans le cadre du suivi cardiologique. Historique d'hypertension et de cardiopathie ischémique stabilisée.",
      observations:
        "Examens complémentaires récents satisfaisants. Patient symptomatique de classe NYHA II. Observance médicamenteuse partielle.",
      plan:
        "Optimiser bêta-bloquant, renforcer l'éducation thérapeutique et adapter l'activité physique.",
      nextSteps:
        "Bilan sanguin dans 2 semaines, téléconsultation de contrôle dans 1 mois, atelier éducation cardiaque collectif.",
    },
  },
  {
    id: "template-radiologie",
    label: "Intervention radiologie",
    title: "Compte rendu post-acte radiologie interventionnelle",
    summary: "Trame rapide pour gestes mini-invasifs et monitoring post-acte.",
    specialty: "Radiologie interventionnelle",
    mood: "urgent",
    keywords: ["check-list", "monitoring"],
    sections: {
      clinicalContext:
        "Acte radiologique interventionnel réalisé sous guidage fluoroscopique. Indication validée en RCP dédiée.",
      observations:
        "Gestes techniques effectués selon le plan. Tolérance satisfaisante. Surveillance immédiate sans anomalie.",
      plan:
        "Antibioprophylaxie respectée. Analgésie adaptée. Surveillance clinique et biologique renforcée les premières 24 heures.",
      nextSteps:
        "Contrôle imagerie à J+7, contact téléphonique pour symptômes d'alerte, consultation chirurgicale si complication suspectée.",
    },
  },
];

const patientsDirectory = [
  {
    id: "P-2024-0201",
    name: "Awa Ndiaye",
    age: 47,
    service: "Chirurgie viscérale",
    diagnosis: "Obésité morbide · sleeve gastrectomie",
  },
  {
    id: "P-2024-0142",
    name: "Lamia Saïd",
    age: 58,
    service: "Oncologie",
    diagnosis: "Cholangiocarcinome · chimiothérapie FOLFIRINOX",
  },
  {
    id: "P-2024-0185",
    name: "Mamadou Carter",
    age: 64,
    service: "Oncologie",
    diagnosis: "Métastases osseuses suspectées",
  },
  {
    id: "P-2024-0110",
    name: "Fatou Diop",
    age: 52,
    service: "Endocrinologie",
    diagnosis: "Diabète type 2 · surveillance annuelle",
  },
  {
    id: "P-2024-0103",
    name: "Nadine Morel",
    age: 72,
    service: "Hépato-gastro-entérologie",
    diagnosis: "Sténose biliaire · suivi palliative",
  },
];

const reportStatusBadgeMap: Record<ReportStatus, string> = {
  draft: "bg-violet-500/10 text-violet-600 shadow-sm shadow-violet-200/80",
  "needs-review": "bg-amber-500/15 text-amber-700 shadow-sm shadow-amber-200/80",
  finalized: "bg-emerald-500/15 text-emerald-700 shadow-sm shadow-emerald-200/80",
};

const reportMoodGradient: Record<ReportMood, string> = {
  luminous: "from-[#f8f7ff] via-[#f1f5ff] to-[#ecfdf5]",
  serene: "from-[#f4f3ff] via-[#eef5ff] to-[#fdf7ff]",
  urgent: "from-[#fff4f4] via-[#fff7ed] to-[#fef3ff]",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ComptesRendusPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>(createdReportsSeed);
  const [search, setSearch] = useState("");
  const [activeReportId, setActiveReportId] = useState<string | null>(
    createdReportsSeed[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create">("view");
  const initialTemplate = favoriteTemplates[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    initialTemplate?.id ?? null,
  );
  const [draft, setDraft] = useState<DraftReport>(() => ({
    title: initialTemplate?.title ?? "",
    summary: initialTemplate?.summary ?? "",
    specialty: initialTemplate?.specialty ?? "",
    mood: initialTemplate?.mood ?? "serene",
    sections: initialTemplate?.sections ?? {
      clinicalContext: "",
      observations: "",
      plan: "",
      nextSteps: "",
    },
    keywords: initialTemplate?.keywords ?? [],
    patientId: patientsDirectory[0]?.id ?? "",
  }));

  const filteredReports = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return reports;
    }
    return reports.filter((report) => {
      const haystack = [
        report.title,
        report.summary,
        report.specialty,
        report.patient.name,
        report.patient.service,
        ...report.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [reports, search]);

  const activeReport = useMemo(() => {
    if (!activeReportId) {
      return null;
    }
    return reports.find((report) => report.id === activeReportId) ?? null;
  }, [activeReportId, reports]);

  useEffect(() => {
    if (mode === "create") {
      return;
    }
    if (filteredReports.length === 0) {
      setActiveReportId(null);
      return;
    }
    if (!activeReportId || !filteredReports.some((report) => report.id === activeReportId)) {
      setActiveReportId(filteredReports[0]?.id ?? null);
    }
  }, [filteredReports, activeReportId, mode]);

  function handleOpenCreation(templateId?: string | null) {
    const template =
      favoriteTemplates.find((item) => item.id === templateId) ?? favoriteTemplates[0];

    setMode("create");
    setActiveReportId(null);
    setSelectedTemplateId(template?.id ?? null);
    setDraft({
      title: template?.title ?? "",
      summary: template?.summary ?? "",
      specialty: template?.specialty ?? "",
      mood: template?.mood ?? "serene",
      sections: template?.sections ?? {
        clinicalContext: "",
        observations: "",
        plan: "",
        nextSteps: "",
      },
      keywords: template?.keywords ?? [],
      patientId: patientsDirectory[0]?.id ?? "",
    });
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    const template =
      favoriteTemplates.find((item) => item.id === templateId) ?? null;
    if (!template) {
      return;
    }
    // Replace the current draft with the newly selected favourite template.
    setDraft((previous) => ({
      ...previous,
      title: template.title,
      summary: template.summary,
      specialty: template.specialty,
      mood: template.mood,
      sections: template.sections,
      keywords: template.keywords,
    }));
  }

  function handleSaveDraft() {
    if (!draft.title.trim() || !draft.patientId) {
      return;
    }
    const patient = patientsDirectory.find((item) => item.id === draft.patientId);
    if (!patient) {
      return;
    }

    const createdAt = new Date().toISOString();
    const newReport: Report = {
      id: `CR-${Date.now()}`,
      title: draft.title,
      summary: draft.summary,
      createdAt,
      updatedAt: createdAt,
      status: "draft",
      mood: draft.mood,
      specialty: draft.specialty || patient.service,
      author: {
        name: "Vous",
        role: "Rédacteur",
      },
      patient,
      sections: draft.sections,
      keywords: draft.keywords,
    };

    setReports((previous) => [newReport, ...previous]);
    setMode("view");
    setActiveReportId(newReport.id);
    setSearch("");
  }

  function handleCancelCreation() {
    setMode("view");
    setSelectedTemplateId(null);
    if (reports.length > 0) {
      setActiveReportId(reports[0].id);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f5aa5]">
            Espace rédaction
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1d184f]">
            Comptes rendus cliniques
          </h1>
          <p className="text-sm text-slate-500">
            Une boîte créative pour vos synthèses, suivis personnalisés et décisions de RCP.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm shadow-slate-200 sm:flex">
            <Stars className="h-4 w-4 text-violet-500" />
            <span>{reports.length} comptes rendus</span>
          </div>
          <Button
            onClick={() => handleOpenCreation(selectedTemplateId)}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#22d3ee] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:brightness-110"
          >
            <FilePlus2 className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Nouveau compte rendu
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-[#f8f7ff] via-[#eef2ff] to-[#f2fbff] p-5 shadow-lg shadow-indigo-100/40">
            <div className="absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1d184f]">Historique personnalisé</h2>
                <CloudSun className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="group relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400 transition group-focus-within:text-indigo-600" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher patient, spécialité, mot-clé..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-11 py-2.5 text-sm text-slate-600 outline-none transition focus:border-indigo-300 focus:bg-white focus:shadow-md focus:shadow-indigo-200/40"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 font-medium text-indigo-500 shadow-sm shadow-indigo-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Filtre intelligent
                </span>
                <span>{filteredReports.length} résultats</span>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 border-none bg-transparent p-0 shadow-none" height="calc(100vh - 260px)">
            <div className="flex flex-col gap-3 pb-2">
              {filteredReports.length === 0 ? (
                <EmptyState
                  icon={ClipboardPenLine}
                  title="Aucun compte rendu trouvé"
                  description="Ajustez les mots-clés ou relancez une création à partir d'un favori."
                  className="min-h-[320px] bg-white/80 py-16"
                  action={
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => handleOpenCreation(selectedTemplateId)}
                    >
                      Composer un nouveau
                    </Button>
                  }
                />
              ) : (
                filteredReports.map((report) => {
                  const isActive = mode === "view" && report.id === activeReportId;
                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setMode("view");
                        setActiveReportId(report.id);
                      }}
                      className={cn(
                        "relative flex flex-col gap-3 rounded-3xl border p-4 text-left transition-all",
                        "border-slate-200/60 bg-white/95 shadow-sm shadow-slate-200/50 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/40",
                        isActive &&
                          "border-transparent bg-gradient-to-br from-[#6d28d9]/80 via-[#7c3aed]/70 to-[#22d3ee]/80 text-white shadow-xl shadow-indigo-200/50 hover:border-transparent hover:shadow-indigo-200/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium",
                            reportStatusBadgeMap[report.status],
                            isActive && "bg-white/20 text-white shadow-none",
                          )}
                        >
                          {report.status === "draft"
                            ? "Brouillon"
                            : report.status === "needs-review"
                              ? "À relire"
                              : "Signé"}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs font-medium text-slate-400",
                            isActive && "text-white/80",
                          )}
                        >
                          {formatDateTime(report.updatedAt)}
                        </span>
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "text-sm font-semibold text-[#1d184f]",
                            isActive && "text-white",
                          )}
                        >
                          {report.title}
                        </h3>
                        <p
                          className={cn(
                            "mt-1 text-xs text-slate-500",
                            isActive && "text-white/80",
                          )}
                        >
                          {report.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600",
                            isActive && "bg-white/20 text-white",
                          )}
                        >
                          <UserRound className="h-3.5 w-3.5" />
                          {report.patient.name}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600",
                            isActive && "bg-white/20 text-white",
                          )}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {report.specialty}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/95 shadow-xl shadow-indigo-100/40">
          {mode === "create" ? (
            <div className="flex flex-1 flex-col gap-6 p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                    Studio créatif
                  </p>
                  <h2 className="text-xl font-semibold text-[#1d184f]">
                    Nouveau compte rendu
                  </h2>
                  <p className="text-sm text-slate-500">
                    Choisissez un favori, liez un patient et laissez libre cours à votre narration clinique.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelCreation}
                    className="rounded-full border-slate-200 px-4 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    className="rounded-full bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#22d3ee] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200/70 hover:brightness-110"
                  >
                    Enregistrer le brouillon
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-[#fdfcff] p-4 shadow-inner shadow-white">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                    Favori
                  </span>
                  <select
                    value={selectedTemplateId ?? ""}
                    onChange={(event) => handleTemplateChange(event.target.value)}
                    className="rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    {favoriteTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    Inspirez-vous de vos meilleures trames et personnalisez-les instantanément.
                  </p>
                </label>

                <label className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-[#fdfcff] p-4 shadow-inner shadow-white">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                    Patient
                  </span>
                  <select
                    value={draft.patientId}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        patientId: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    {patientsDirectory.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} · {patient.service}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    Reliez ce compte rendu à un dossier pour qu’il rayonne partout dans OpenCare.
                  </p>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Titre inspirant
                  </span>
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((previous) => ({ ...previous, title: event.target.value }))
                    }
                    placeholder="Ex. Suivi post-opératoire jour 2 · protocole personnalisé"
                    className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Spécialité / Filière
                  </span>
                  <input
                    value={draft.specialty}
                    onChange={(event) =>
                      setDraft((previous) => ({ ...previous, specialty: event.target.value }))
                    }
                    placeholder="Ex. Cardiologie interventionnelle"
                    className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Accroche lumineuse
                </span>
                <textarea
                  value={draft.summary}
                  onChange={(event) =>
                    setDraft((previous) => ({ ...previous, summary: event.target.value }))
                  }
                  placeholder="Résumez en une phrase la tonalité de votre message clinique."
                  className="min-h-[86px] rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm leading-relaxed text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-slate-200/70 shadow-md shadow-indigo-100/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold text-[#1d184f]">
                        Contexte clinique
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Posez le décor thérapeutique.
                      </CardDescription>
                    </div>
                    <FileBox className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={draft.sections.clinicalContext}
                      onChange={(event) =>
                        setDraft((previous) => ({
                          ...previous,
                          sections: {
                            ...previous.sections,
                            clinicalContext: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[140px] w-full rounded-2xl border border-slate-200/70 bg-[#fafbff] px-4 py-3 text-sm leading-relaxed text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                    />
                  </CardContent>
                </Card>
                <Card className="border-slate-200/70 shadow-md shadow-indigo-100/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold text-[#1d184f]">
                        Observations clés
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Mettez en lumière les constantes et les examens.
                      </CardDescription>
                    </div>
                    <ClipboardPenLine className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={draft.sections.observations}
                      onChange={(event) =>
                        setDraft((previous) => ({
                          ...previous,
                          sections: {
                            ...previous.sections,
                            observations: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[140px] w-full rounded-2xl border border-slate-200/70 bg-[#fafbff] px-4 py-3 text-sm leading-relaxed text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-slate-200/70 shadow-md shadow-indigo-100/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold text-[#1d184f]">
                        Plan & traitements
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Décrivez la stratégie thérapeutique proposée.
                      </CardDescription>
                    </div>
                    <Link2 className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={draft.sections.plan}
                      onChange={(event) =>
                        setDraft((previous) => ({
                          ...previous,
                          sections: {
                            ...previous.sections,
                            plan: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[120px] w-full rounded-2xl border border-slate-200/70 bg-[#fafbff] px-4 py-3 text-sm leading-relaxed text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                    />
                  </CardContent>
                </Card>
                <Card className="border-slate-200/70 shadow-md shadow-indigo-100/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold text-[#1d184f]">
                        Prochaines étapes
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Anticipez les actions de suivi et les alertes.
                      </CardDescription>
                    </div>
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={draft.sections.nextSteps}
                      onChange={(event) =>
                        setDraft((previous) => ({
                          ...previous,
                          sections: {
                            ...previous.sections,
                            nextSteps: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[120px] w-full rounded-2xl border border-slate-200/70 bg-[#fafbff] px-4 py-3 text-sm leading-relaxed text-slate-600 outline-none transition focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-200/40"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeReport ? (
            <div className="relative flex-1 space-y-8 overflow-hidden rounded-3xl">
              <div
                className={cn(
                  "relative overflow-hidden rounded-3xl border border-slate-200/70 p-8 shadow-xl shadow-indigo-100/50",
                  "bg-gradient-to-br",
                  reportMoodGradient[activeReport.mood],
                )}
              >
                <div className="absolute -left-20 top-24 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
                <div className="absolute -right-16 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Badge className={cn("rounded-full px-3 py-1 text-xs font-medium", reportStatusBadgeMap[activeReport.status])}>
                        {activeReport.status === "draft"
                          ? "Brouillon lumineux"
                          : activeReport.status === "needs-review"
                            ? "À valider"
                            : "Signé et diffusé"}
                      </Badge>
                      <h2 className="mt-3 text-2xl font-semibold text-[#1d184f]">
                        {activeReport.title}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {activeReport.summary}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-500">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-slate-600 shadow-sm shadow-indigo-200/40">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        {formatDateTime(activeReport.updatedAt)}
                      </div>
                      <div className="text-[11px]">
                        <span className="font-semibold text-slate-700">
                          {activeReport.author.name}
                        </span>{" "}
                        · {activeReport.author.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm shadow-indigo-100/40">
                      <UserRound className="h-3.5 w-3.5 text-indigo-500" />
                      {activeReport.patient.name} · {activeReport.patient.age} ans
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm shadow-indigo-100/40">
                      <Link2 className="h-3.5 w-3.5 text-indigo-500" />
                      {activeReport.patient.service}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm shadow-indigo-100/40">
                      <ClipboardPenLine className="h-3.5 w-3.5 text-indigo-500" />
                      {activeReport.specialty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeReport.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-indigo-500 shadow-sm shadow-indigo-100/40"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      className="rounded-full border-indigo-200 bg-white/80 px-4 text-xs font-semibold text-indigo-600 shadow-sm shadow-indigo-100/50 hover:bg-indigo-50"
                      onClick={() => router.push(`/patients/dossier?id=${activeReport.patient.id}`)}
                    >
                      Ouvrir le dossier patient
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 px-1 pb-8 xl:grid-cols-2">
                <Card className="border-slate-200/70 shadow-lg shadow-indigo-100/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-[#1d184f]">
                      Contexte clinique
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Le fil narratif du dossier.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {activeReport.sections.clinicalContext}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200/70 shadow-lg shadow-indigo-100/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-[#1d184f]">
                      Observations
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Votre regard clinique du moment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {activeReport.sections.observations}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200/70 shadow-lg shadow-indigo-100/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-[#1d184f]">
                      Plan & traitements
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      L’architecture thérapeutique recommandée.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {activeReport.sections.plan}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200/70 shadow-lg shadow-indigo-100/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-[#1d184f]">
                      Prochaines étapes
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Actions concrètes et moments clés à surveiller.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {activeReport.sections.nextSteps}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Composez votre premier compte rendu"
              description="Sélectionnez un élément dans l’historique ou lancez une création inspirée."
              action={
                <Button
                  onClick={() => handleOpenCreation(selectedTemplateId)}
                  className="rounded-full bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#22d3ee] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200/70 hover:brightness-110"
                >
                  Dévoiler un nouveau récit clinique
                </Button>
              }
              className="m-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
