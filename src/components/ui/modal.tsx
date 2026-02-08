"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg";

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  hideClose?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  hideClose = false,
  footer,
  children,
}: ModalProps) {
  const generatedId = useId();
  const titleId = title ? `modal-${generatedId}` : undefined;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full transform rounded border border-slate-200 bg-white shadow-xl transition-all",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          sizeStyles[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-6 pb-2 pt-6">
          <div className="space-y-1">
            {title ? (
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {!hideClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              aria-label="Fermer la fenêtre modale"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <div className="px-6 pb-6">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 rounded-b bg-slate-50 px-6 py-4 border-t border-slate-200">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
