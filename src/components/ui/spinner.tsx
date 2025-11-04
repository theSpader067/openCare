"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label, className }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      {label ? (
        <span className="text-xs font-medium text-slate-500">{label}</span>
      ) : null}
    </div>
  );
}
