"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  HandIcon,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type DateRange = {
  start: Date;
  end: Date;
};

type StatMetric = {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: LucideIcon;
};

type WeeklyPoint = {
  label: string;
  operations: number;
  nationalOperations: number;
  consultations: number;
  nationalConsultations: number;
};

type ComparisonMetric = {
  label: string;
  local: number;
  national: number;
  unit: string;
  delta: string;
  positive: boolean;
};

type BreakdownItem = {
  label: string;
  value: number;
  color: string;
};

type SatisfactionMetric = {
  score: number;
  national: number;
  trend: string;
  positive: boolean;
};

type PeriodDataset = {
  stats: StatMetric[];
  weekly: WeeklyPoint[];
  comparisons: ComparisonMetric[];
  breakdown: BreakdownItem[];
  satisfaction: SatisfactionMetric;
  totalActs: number;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");
const colorHexMap: Record<string, string> = {
  "bg-indigo-500": "#6366f1",
  "bg-emerald-500": "#10b981",
  "bg-amber-500": "#f59e0b",
  "bg-rose-500": "#f43f5e",
};
const millisecondsPerDay = 24 * 60 * 60 * 1000;

function normalizeDate(input: Date): Date {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

function ensureRange(range: DateRange): DateRange {
  const start = normalizeDate(range.start);
  const end = normalizeDate(range.end);
  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
}

function differenceInDays(range: DateRange): number {
  const diff = range.end.getTime() - range.start.getTime();
  return Math.max(0, Math.round(diff / millisecondsPerDay));
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function rangeSeed(range: DateRange): number {
  const startKey =
    range.start.getFullYear() * 10000 +
    (range.start.getMonth() + 1) * 100 +
    range.start.getDate();
  const endKey =
    range.end.getFullYear() * 10000 +
    (range.end.getMonth() + 1) * 100 +
    range.end.getDate();
  return startKey * 1.37 + endKey * 0.91 + differenceInDays(range);
}

function computeDelta(
  local: number,
  national: number,
  suffix: string,
  invert = false,
): { text: string; positive: boolean } {
  if (national === 0) {
    return {
      text: `Aligné avec la moyenne nationale`,
      positive: !invert,
    };
  }
  const delta = ((local - national) / national) * 100;
  if (Math.abs(delta) < 0.1) {
    return { text: `Aligné avec la moyenne nationale`, positive: !invert };
  }
  const rounded = parseFloat(delta.toFixed(1));
  return {
    text: `${rounded > 0 ? "+" : ""}${rounded}% ${suffix}`,
    positive: invert ? rounded < 0 : rounded > 0,
  };
}

function formatRangeLabel(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const startLabel = range.start
    .toLocaleDateString("fr-FR", options)
    .replace(/\./g, "");
  const endLabel = range.end
    .toLocaleDateString("fr-FR", options)
    .replace(/\./g, "");
  return `${startLabel} → ${endLabel}`;
}

function generateDataset(range: DateRange): PeriodDataset {
  const days = differenceInDays(range) + 1;
  const weeksFactor = days / 7;
  const seed = rangeSeed(range);

  const operations = Math.max(
    20,
    Math.round(140 * weeksFactor * (0.85 + pseudoRandom(seed) * 0.35)),
  );
  const nationalOperations = Math.max(
    18,
    Math.round(operations * (0.9 + pseudoRandom(seed + 1) * 0.15)),
  );

  const consultations = Math.max(
    40,
    Math.round(operations * (2.3 + pseudoRandom(seed + 2) * 0.35)),
  );
  const nationalConsultations = Math.max(
    35,
    Math.round(consultations * (0.92 + pseudoRandom(seed + 3) * 0.12)),
  );

  const completions = Math.max(
    25,
    Math.round(62 * weeksFactor * (0.88 + pseudoRandom(seed + 4) * 0.4)),
  );


  const totalActs = operations + consultations + completions;

  let operationsShare = Math.round(32 + pseudoRandom(seed + 120) * 12);
  let consultationShare = Math.round(42 + pseudoRandom(seed + 121) * 10);
  const urgentShare = Math.round(10 + pseudoRandom(seed + 122) * 6);
  let followUpShare = 100 - operationsShare - consultationShare - urgentShare;

  if (followUpShare < 8) {
    const diff = 8 - followUpShare;
    followUpShare = 8;
    if (consultationShare - diff >= 20) {
      consultationShare -= diff;
    } else {
      const remainder = diff - (consultationShare - 20);
      consultationShare = 20;
      operationsShare = Math.max(20, operationsShare - remainder);
    }
  }

  const urgentAdmissions = Math.max(
    12,
    Math.round(
      totalActs * (urgentShare / 100) * (0.5 + pseudoRandom(seed + 130)),
    ),
  );
  const nationalUrgentAdmissions = Math.max(
    10,
    Math.round(
      urgentAdmissions * (0.9 + pseudoRandom(seed + 131) * 0.15),
    ),
  );

  const followUpPatients = Math.max(
    18,
    Math.round(
      totalActs * (followUpShare / 100) * (0.6 + pseudoRandom(seed + 132)),
    ),
  );
  const nationalFollowUpPatients = Math.max(
    15,
    Math.round(
      followUpPatients * (0.9 + pseudoRandom(seed + 133) * 0.15),
    ),
  );

  const stats: StatMetric[] = [
    (() => {
      const delta = computeDelta(
        operations,
        nationalOperations,
        "vs moyenne nationale",
      );
      return {
        title: "Opérations réalisées",
        value: numberFormatter.format(operations),
        delta: delta.text,
        positive: delta.positive,
        icon: HandIcon,
      };
    })(),
    (() => {
      const delta = computeDelta(
        consultations,
        nationalConsultations,
        "vs moyenne nationale",
      );
      return {
        title: "Consultations assurées",
        value: numberFormatter.format(consultations),
        delta: delta.text,
        positive: delta.positive,
        icon: Stethoscope,
      };
    })(),
    (() => {
      const delta = computeDelta(
        urgentAdmissions,
        nationalUrgentAdmissions,
        "vs moyenne nationale",
      );
      return {
        title: "Admissions urgentes",
        value: numberFormatter.format(urgentAdmissions),
        delta: delta.text,
        positive: delta.positive,
        icon: AlertTriangle,
      };
    })(),
    (() => {
      const delta = computeDelta(
        followUpPatients,
        nationalFollowUpPatients,
        "vs moyenne nationale",
      );
      return {
        title: "Patients suivis à domicile",
        value: numberFormatter.format(followUpPatients),
        delta: delta.text,
        positive: delta.positive,
        icon: Users,
      };
    })(),
  ];

  const operationsPerDay = operations / days;
  const consultationsPerDay = consultations / days;
  const nationalOpsPerDay = nationalOperations / days;
  const nationalConsultPerDay = nationalConsultations / days;

  const daysToShow = Math.min(days, 7);
  const startSlice = new Date(range.end);
  startSlice.setDate(range.end.getDate() - (daysToShow - 1));

  const weekly: WeeklyPoint[] = Array.from({ length: daysToShow }, (_, index) => {
    const current = new Date(startSlice);
    current.setDate(startSlice.getDate() + index);
    const label = current
      .toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      })
      .replace(/\./g, "");
    const op =
      Math.round(
        operationsPerDay * (0.85 + pseudoRandom(seed + 20 + index) * 0.45),
      ) || 1;
    const nationalOp =
      Math.round(
        nationalOpsPerDay * (0.85 + pseudoRandom(seed + 40 + index) * 0.45),
      ) || 1;
    const consult =
      Math.round(
        consultationsPerDay * (0.85 + pseudoRandom(seed + 60 + index) * 0.45),
      ) || 1;
    const nationalConsult =
      Math.round(
        nationalConsultPerDay * (0.85 + pseudoRandom(seed + 80 + index) * 0.45),
      ) || 1;

    return {
      label,
      operations: op,
      nationalOperations: nationalOp,
      consultations: consult,
      nationalConsultations: nationalConsult,
    };
  });

  const blockTime = Math.round(
    78 * (0.9 + pseudoRandom(seed + 100) * 0.25),
  );
  const nationalBlockTime = Math.round(
    blockTime * (0.95 + pseudoRandom(seed + 101) * 0.1),
  );
  const consultWait = Math.round(
    34 * (0.85 + pseudoRandom(seed + 102) * 0.3),
  );
  const nationalConsultWait = Math.round(
    consultWait * (0.95 + pseudoRandom(seed + 103) * 0.12),
  );
  const stayDuration =
    3.5 + pseudoRandom(seed + 104) * 1.1;
  const nationalStayDuration =
    stayDuration * (0.95 + pseudoRandom(seed + 105) * 0.12);

  const comparisons: ComparisonMetric[] = [
    {
      label: "Temps moyen au bloc",
      local: blockTime,
      national: nationalBlockTime,
      unit: "min",
      delta: `${blockTime - nationalBlockTime > 0 ? "+" : ""}${(
        blockTime - nationalBlockTime
      ).toFixed(0)} min vs national`,
      positive: blockTime <= nationalBlockTime,
    },
    {
      label: "Attente consultation",
      local: consultWait,
      national: nationalConsultWait,
      unit: "min",
      delta: `${consultWait - nationalConsultWait > 0 ? "+" : ""}${(
        consultWait - nationalConsultWait
      ).toFixed(0)} min vs national`,
      positive: consultWait <= nationalConsultWait,
    },
    {
      label: "Durée moyenne de séjour",
      local: parseFloat(stayDuration.toFixed(1)),
      national: parseFloat(nationalStayDuration.toFixed(1)),
      unit: "jours",
      delta: `${(stayDuration - nationalStayDuration > 0 ? "+" : "") + (
        stayDuration - nationalStayDuration
      ).toFixed(1)} j vs national`,
      positive: stayDuration <= nationalStayDuration,
    },
  ];

  const breakdown: BreakdownItem[] = [
    { label: "Consultations", value: consultationShare, color: "bg-indigo-500" },
    { label: "Activités bloc", value: operationsShare, color: "bg-emerald-500" },
    { label: "Suivi / télémédecine", value: followUpShare, color: "bg-amber-500" },
    { label: "Urgences", value: urgentShare, color: "bg-rose-500" },
  ];

  const satisfactionScore = 4.1 + pseudoRandom(seed + 140) * 0.6;
  const nationalSatisfaction = 4 + pseudoRandom(seed + 141) * 0.4;
  const satisfactionDelta = satisfactionScore - nationalSatisfaction;

  const satisfaction: SatisfactionMetric = {
    score: parseFloat(satisfactionScore.toFixed(2)),
    national: parseFloat(nationalSatisfaction.toFixed(2)),
    trend: `${satisfactionDelta >= 0 ? "+" : ""}${satisfactionDelta.toFixed(
      2,
    )} vs nationale`,
    positive: satisfactionDelta >= 0,
  };

  return {
    stats,
    weekly,
    comparisons,
    breakdown,
    satisfaction,
    totalActs,
  };
}

export default function StatistiquesPage() {
  const initialEnd = normalizeDate(new Date());
  const initialStart = normalizeDate(
    new Date(initialEnd.getTime() - 6 * millisecondsPerDay),
  );

  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });
  const [tempRange, setTempRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<PeriodDataset | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  const loadData = useCallback((range: DateRange) => {
    setStatsLoading(true);
    setWeeklyLoading(true);

    const normalized = ensureRange(range);
    const dataset = generateDataset(normalized);

    const statsTimer = setTimeout(() => {
      setData(dataset);
      setStatsLoading(false);
    }, 520);

    const weeklyTimer = setTimeout(() => {
      setWeeklyLoading(false);
    }, 740);

    return () => {
      clearTimeout(statsTimer);
      clearTimeout(weeklyTimer);
    };
  }, []);

  useEffect(() => {
    const cleanup = loadData(selectedRange);
    return cleanup;
  }, [loadData, selectedRange]);

  useEffect(() => {
    if (!rangePickerOpen) {
      return undefined;
    }
    const handleClick = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setTempRange(selectedRange);
        setRangePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [rangePickerOpen, selectedRange]);

  useEffect(() => {
    setTempRange(selectedRange);
  }, [selectedRange]);

  const periodLabel = formatRangeLabel(selectedRange);

  const weeklyMaxOperations = useMemo(() => {
    if (!data || data.weekly.length === 0) {
      return 1;
    }
    return Math.max(
      1,
      ...data.weekly.map((point) =>
        Math.max(point.operations, point.nationalOperations),
      ),
    );
  }, [data]);

  const weeklyMaxConsultations = useMemo(() => {
    if (!data || data.weekly.length === 0) {
      return 1;
    }
    return Math.max(
      1,
      ...data.weekly.map((point) =>
        Math.max(point.consultations, point.nationalConsultations),
      ),
    );
  }, [data]);

  const weeklyLinePaths = useMemo(() => {
    if (!data || data.weekly.length === 0) {
      return null;
    }
    const count = Math.max(1, data.weekly.length - 1);
    const local = data.weekly
      .map((point, index) => {
        const x = (index / count) * 100;
        const y =
          100 - Math.min(100, (point.consultations / weeklyMaxConsultations) * 100);
        return `${x},${y}`;
      })
      .join(" ");
    const national = data.weekly
      .map((point, index) => {
        const x = (index / count) * 100;
        const y =
          100 -
          Math.min(
            100,
            (point.nationalConsultations / weeklyMaxConsultations) * 100,
          );
        return `${x},${y}`;
      })
      .join(" ");
    return { local, national };
  }, [data, weeklyMaxConsultations]);

  const pieGradient = useMemo(() => {
    if (!data) {
      return "";
    }
    let cumulative = 0;
    return data.breakdown
      .map((item) => {
        const start = cumulative;
        cumulative += item.value;
        const color = colorHexMap[item.color] ?? "#6366f1";
        return `${color} ${start}% ${cumulative}%`;
      })
      .join(", ");
  }, [data]);

  const handleSelectStart = (date: Date) => {
    const normalized = normalizeDate(date);
    setTempRange((prev) => {
      const adjustedEnd =
        prev.end.getTime() < normalized.getTime() ? normalized : prev.end;
      return { start: normalized, end: adjustedEnd };
    });
  };

  const handleSelectEnd = (date: Date) => {
    const normalized = normalizeDate(date);
    setTempRange((prev) => {
      const adjustedStart =
        prev.start.getTime() > normalized.getTime() ? normalized : prev.start;
      return { start: adjustedStart, end: normalized };
    });
  };

  const applyNewRange = () => {
    const normalized = ensureRange(tempRange);
    setSelectedRange(normalized);
    setRangePickerOpen(false);
  };

  const renderStats = () => {
    if (statsLoading || !data) {
      return Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={`stat-skeleton-${index}`}
          className="flex h-40 items-center justify-center"
        >
          <Spinner label="Chargement..." />
        </Card>
      ));
    }

    return data.stats.map((stat) => {
      const Icon = stat.icon;
      return (
        <Card key={stat.title}>
          <CardContent className="flex flex-col gap-4 px-6 pb-6 pt-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {stat.title}
                </CardTitle>
                <p className="text-3xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
            <p
              className={cn(
                "text-sm font-medium",
                stat.positive ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {stat.delta}
            </p>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Statistiques
          </h1>
          <p className="text-sm text-slate-500">
            Analyse des performances opérationnelles et médicales avec repère national.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div ref={pickerRef} className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRangePickerOpen((open) => !open)}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Période : {periodLabel}</span>
            </Button>
            {rangePickerOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-[640px] max-w-[90vw] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-200/40">
                <h3 className="text-sm font-semibold text-slate-800">
                  Sélectionnez une période
                </h3>
                <div className="mt-3 grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Début
                    </p>
                    <Calendar
                      selected={tempRange.start}
                      onSelect={handleSelectStart}
                      month={tempRange.start}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Fin
                    </p>
                    <Calendar
                      selected={tempRange.end}
                      onSelect={handleSelectEnd}
                      month={tempRange.end}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setTempRange(selectedRange);
                      setRangePickerOpen(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="button" variant="primary" onClick={applyNewRange}>
                    Appliquer
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <Button variant="primary">
            <TrendingUp className="mr-2 h-4 w-4" />
            Exporter le rapport
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {renderStats()}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="flex h-full flex-col">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Performance hebdomadaire</CardTitle>
                <CardDescription>
                  Opérations et consultations comparées à la moyenne nationale.
                </CardDescription>
              </div>
              <Badge variant="muted">Comparaison nationale</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            {weeklyLoading || !data ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner label="Construction de la vue analytique..." />
              </div>
            ) : data.weekly.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Aucune donnée disponible"
                description="Sélectionnez une autre période pour afficher les activités enregistrées."
              />
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Opérations</span>
                      <span className="text-xs font-medium text-slate-500">
                        Centre vs national
                      </span>
                    </div>
                    <div className="mt-6 flex h-40 items-end gap-4">
                      {data.weekly.map((point) => {
                        const localHeight = Math.max(
                          10,
                          (point.operations / weeklyMaxOperations) * 100,
                        );
                        const nationalHeight = Math.max(
                          8,
                          (point.nationalOperations / weeklyMaxOperations) * 100,
                        );
                        return (
                          <div key={`ops-${point.label}`} className="flex flex-col items-center gap-2">
                            <div className="flex items-end gap-1">
                              <span
                                className="inline-block w-3 rounded-t bg-indigo-600"
                                style={{ height: `${localHeight}%` }}
                              />
                              <span
                                className="inline-block w-3 rounded-t bg-indigo-200"
                                style={{ height: `${nationalHeight}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500">{point.label}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        Centre
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-200" />
                        National
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Consultations</span>
                      <span className="text-xs font-medium text-slate-500">
                        Courbe sur la période
                      </span>
                    </div>
                    <div className="relative mt-6 h-40 w-full">
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                      >
                        <polyline
                          fill="none"
                          stroke="#c7d2fe"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={weeklyLinePaths?.national ?? ""}
                        />
                        <polyline
                          fill="none"
                          stroke="#4f46e5"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={weeklyLinePaths?.local ?? ""}
                        />
                      </svg>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        Centre
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-200" />
                        National
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Mix d&apos;activités</span>
                      <span className="text-xs font-medium text-slate-500">
                        Taux sur la période
                      </span>
                    </div>
                    <div className="mx-auto mt-5 flex h-40 w-40 items-center justify-center">
                      <div className="relative h-40 w-40">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{ background: `conic-gradient(${pieGradient})` }}
                        />
                        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
                          <p className="text-xs font-medium text-slate-500">
                            Total actes
                          </p>
                          <p className="text-lg font-semibold text-slate-900">
                            {numberFormatter.format(data.totalActs)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      {data.breakdown.map((item) => {
                        const color = colorHexMap[item.color] ?? "#6366f1";
                        return (
                          <div
                            key={`legend-${item.label}`}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              {item.label}
                            </div>
                            <span className="font-semibold text-slate-700">
                              {item.value}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Répartition des activités bloc</CardTitle>
            <CardDescription>
              Part des activités sur la période sélectionnée.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between gap-6 pt-0">
            {statsLoading || !data ? (
              <div className="flex h-full items-center justify-center">
                <Spinner label="Mise à jour des indicateurs..." />
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-slate-200 bg-indigo-50/60 p-6 text-center">
                  <PieChartIcon className="mx-auto h-10 w-10 text-indigo-600" />
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Répartition par activité
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Basé sur {numberFormatter.format(data.totalActs)} actes codés sur la période.
                  </p>
                  <p className="mt-4 text-lg font-semibold text-indigo-700">
                    {data.breakdown[0]?.value ?? 0}% {data.breakdown[0]?.label ?? "Consultations"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {data.breakdown[1]?.value ?? 0}% {data.breakdown[1]?.label ?? "Activités bloc"} · {data.breakdown[2]?.value ?? 0}% {data.breakdown[2]?.label ?? "Suivi"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Urgences {data.breakdown[3]?.value ?? 0}%
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-sm font-semibold text-slate-700">
                    Satisfaction patients
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-slate-900">
                        {data.satisfaction.score.toFixed(2)}
                        <span className="text-base font-medium text-slate-400">
                          / 5
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Moyenne nationale {data.satisfaction.national.toFixed(2)} / 5
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Users className="h-5 w-5" />
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-sm font-semibold",
                      data.satisfaction.positive
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {data.satisfaction.trend}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
