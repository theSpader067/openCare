"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileText,
  FlaskConical,
  LayoutDashboard,
  PieChart,
  Settings2,
  Stethoscope,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export const primaryNav = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users2,
  },
  {
    href: "/analyses",
    label: "Analyses",
    icon: FlaskConical,
  },
  {
    href: "/messages",
    label: "Avis",
    icon: Stethoscope,
  },
  {
    href: "/comptes-rendus",
    label: "Comptes rendus",
    icon: FileText,
  },
  {
    href: "/statistiques",
    label: "Statistiques",
    icon: PieChart,
  },
];

const bottomNav = {
  href: "/settings",
  label: "Paramètres",
  icon: Settings2,
};

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white px-5 py-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#4f46e5] text-base font-semibold text-white shadow-lg shadow-indigo-300/60">
          OC
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#1d184f]">
            OpenCare
          </span>
          <span className="flex items-center gap-1 text-xs text-[#5f5aa5]">
            <Activity className="h-3.5 w-3.5 text-[#4f46e5]" />
            SaaS clinique
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-slate-100 text-[#1d184f] shadow-sm"
                  : "text-[#454562] hover:bg-slate-100 hover:text-[#1d184f]",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#6d28d9]" : "text-[#5f5aa5]",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div>
        <Separator className="mb-3" />
        <Link
          href={bottomNav.href}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#63637e] transition hover:bg-slate-100 hover:text-[#1d184f]"
        >
          <bottomNav.icon className="h-5 w-5 text-[#9ca3af] group-hover:text-[#4f46e5]" />
          <span>{bottomNav.label}</span>
        </Link>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden h-full w-72 flex-col px-4 py-6 lg:flex">
      <SidebarContent />
    </aside>
  );
}
