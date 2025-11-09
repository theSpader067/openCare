import type { LucideIcon } from "lucide-react";

export type DateRange = {
  start: Date;
  end: Date;
};

export type StatMetric = {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: LucideIcon;
};

export type WeeklyPoint = {
  label: string;
  operations: number;
  nationalOperations: number;
  consultations: number;
  nationalConsultations: number;
};

export type ComparisonMetric = {
  label: string;
  local: number;
  national: number;
  unit: string;
  delta: string;
  positive: boolean;
};

export type BreakdownItem = {
  label: string;
  value: number;
  color: string;
};

export type SatisfactionMetric = {
  score: number;
  national: number;
  trend: string;
  positive: boolean;
};

export type PeriodDataset = {
  stats: StatMetric[];
  weekly: WeeklyPoint[];
  comparisons: ComparisonMetric[];
  breakdown: BreakdownItem[];
  satisfaction: SatisfactionMetric;
  totalActs: number;
};

export const colorHexMap: Record<string, string> = {
  "bg-indigo-500": "#6366f1",
  "bg-emerald-500": "#10b981",
  "bg-amber-500": "#f59e0b",
  "bg-rose-500": "#f43f5e",
};

export const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function normalizeDate(input: Date): Date {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function ensureRange(range: DateRange): DateRange {
  const start = normalizeDate(range.start);
  const end = normalizeDate(range.end);
  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
}

export function differenceInDays(range: DateRange): number {
  const diff = range.end.getTime() - range.start.getTime();
  return Math.max(0, Math.round(diff / millisecondsPerDay));
}

export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

export function rangeSeed(range: DateRange): number {
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

export function computeDelta(
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

export function formatRangeLabel(range: DateRange): string {
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
