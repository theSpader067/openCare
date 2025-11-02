"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Microscope,
} from "lucide-react";

const navLinks = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users,
  },
  {
    href: "/analyses",
    label: "Analyses",
    icon: Microscope,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageCircle,
  },
  {
    href: "/statistiques",
    label: "Statistiques",
    icon: BarChart3,
  },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        "hover:bg-primary/10 hover:text-primary",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background px-4 py-6 shadow-lg transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              OpenCare Pro
            </p>
            <p className="text-lg font-semibold">Centre médical</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fermer la navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-8 flex-1 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <SidebarLink
                key={link.href}
                {...link}
                isActive={pathname === link.href}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
          <div className="mt-auto pt-8">
            <SidebarLink
              href="/parametres"
              label="Paramètres"
              icon={Settings}
              isActive={pathname === "/parametres"}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 shadow-sm lg:hidden">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              OpenCare Pro
            </p>
            <p className="text-base font-semibold">Espace praticien</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
