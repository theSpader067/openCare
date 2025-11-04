"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
}

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount, 1);
  return next;
};
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export function Calendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  className,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState<Date>(
    startOfMonth(month ?? selected),
  );

  useEffect(() => {
    if (month) {
      setInternalMonth(startOfMonth(month));
    }
  }, [month]);

  useEffect(() => {
    if (!month && !isSameMonth(selected, internalMonth)) {
      setInternalMonth(startOfMonth(selected));
    }
  }, [selected, month, internalMonth]);

  const currentMonth = month ? startOfMonth(month) : internalMonth;

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth],
  );

  const days = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const weekday = (firstDay.getDay() + 6) % 7; // Monday as first
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - weekday);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [currentMonth]);

  const goToMonth = (amount: number) => {
    const next = addMonths(currentMonth, amount);
    if (onMonthChange) {
      onMonthChange(next);
    } else {
      setInternalMonth(next);
    }
  };

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold capitalize text-slate-800">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const outsideMonth = !isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(new Date(day))}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition",
                outsideMonth && "text-slate-300",
                isSelected
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-200"
                  : isToday
                  ? "border border-[#4f46e5] text-[#4f46e5]"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
