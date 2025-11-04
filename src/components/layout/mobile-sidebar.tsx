"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "@/components/layout/sidebar";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <aside
        className={`absolute left-0 top-0 h-full w-80 max-w-full translate-x-0 bg-white shadow-2xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-end px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}
