import { ObservationEntry } from "./data";
import { cn } from "@/lib/utils";

function formatObservationTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

interface ObservationTimelineProps {
  entries: ObservationEntry[];
  className?: string;
  emptyMessage?: string;
}

export function ObservationTimeline({
  entries,
  className,
  emptyMessage = "Aucune observation enregistrée.",
}: ObservationTimelineProps) {
  if (!entries.length) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-sm text-slate-500",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div
      className={cn(
        "max-h-72 overflow-y-auto pr-2 text-sm text-slate-700",
        className,
      )}
    >
      <div className="relative pl-6">
        <span
          className="pointer-events-none absolute left-[7px] top-0 block h-full w-px bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent"
          aria-hidden="true"
        />
        <div className="space-y-6">
          {sortedEntries.map((entry, index) => (
            <article key={entry.id ?? `${entry.timestamp}-${index}`} className="relative">
              <span
                className="absolute -left-[11px] top-0 flex h-3 w-3 items-center justify-center"
                aria-hidden="true"
              >
                <span className="h-3 w-3 rounded-full border border-white bg-indigo-500 shadow-md shadow-indigo-200" />
              </span>
              <header className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {formatObservationTimestamp(entry.timestamp)}
                </p>
              </header>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {entry.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
