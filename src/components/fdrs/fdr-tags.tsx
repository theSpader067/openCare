"use client";

import { Check } from "lucide-react";
import { FDRData, FDRType } from "@/types/fdrs";

interface FDRTagsProps {
  fdrs: FDRData[];
  onToggle: (type: FDRType) => void;
}

const FDR_METADATA: Record<FDRType, { label: string; icon: string; bgColor: string; borderColor: string }> = {
  tabac: { label: "Tabagisme", icon: "🚬", bgColor: "bg-amber-50", borderColor: "border-amber-300" },
  alcool: { label: "Alcool", icon: "🍷", bgColor: "bg-red-50", borderColor: "border-red-300" },
  HTA: { label: "HTA", icon: "💓", bgColor: "bg-rose-50", borderColor: "border-rose-300" },
  dyslipidémie: { label: "Dyslipidémie", icon: "🧬", bgColor: "bg-purple-50", borderColor: "border-purple-300" },
  diabète: { label: "Diabète", icon: "🩺", bgColor: "bg-blue-50", borderColor: "border-blue-300" },
};

export function FDRTags({ fdrs, onToggle }: FDRTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {fdrs.map((fdr) => {
        const meta = FDR_METADATA[fdr.type];
        return (
          <button
            key={fdr.type}
            type="button"
            onClick={() => onToggle(fdr.type)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all flex items-center gap-2 ${
              fdr.selected
                ? `${meta.bgColor} ${meta.borderColor} ring-2 ring-offset-1 ring-indigo-400 shadow-sm`
                : `bg-white border-slate-200 text-slate-600 hover:${meta.borderColor} hover:border-current`
            }`}
          >
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
            {fdr.selected && <Check className="h-3.5 w-3.5" />}
          </button>
        );
      })}
    </div>
  );
}
