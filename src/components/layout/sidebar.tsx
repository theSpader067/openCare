"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronDown,
  Diamond,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Settings2,
  Stethoscope,
  Users2,
  Users,
  Circle,
} from "lucide-react";
import { useState } from "react";
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
    href: "/documents",
    label: "Mes documents",
    icon: FileText,
    subitems: [
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
        href: "/ordonnances",
        label: "Ordonnances",
        icon: FileText,
      },
    ],
  },
];

export const bottomNav = [
  {
    href: "/profile",
    label: "Profil",
    icon: Users2,
  },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/documents"]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isItemActive = (item: any) => {
    if (item.subitems) {
      return item.subitems.some(
        (subitem: any) =>
          pathname === subitem.href ||
          (subitem.href !== "/dashboard" && pathname.startsWith(subitem.href))
      );
    }
    return (
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
    );
  };

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
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.href);

          return (
            <div
              key={item.href}
              className={item.href === "/dashboard" ? "hidden sm:block" : ""}
            >
              {item.subitems ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      "w-full group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-slate-100 text-[#1d184f] shadow-sm"
                        : "text-[#454562] hover:bg-slate-100 hover:text-[#1d184f]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-[#6d28d9]" : "text-[#5f5aa5]",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : "",
                        isActive ? "text-[#6d28d9]" : "text-[#5f5aa5]",
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-6">
                      {item.subitems.map((subitem: any) => {
                        const SubIcon = subitem.icon;
                        const isSubActive =
                          pathname === subitem.href ||
                          (subitem.href !== "/dashboard" &&
                            pathname.startsWith(subitem.href));

                        return (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            onClick={onNavigate}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all hover:border-b-2",
                              isSubActive
                                ? "bg-transparent border-b-[#6d28d9] text-[#1d184f]"
                                : "border-b-transparent text-[#454562] hover:text-[#1d184f]",
                            )}
                          >
                            {isSubActive && (
                              <Circle className="h-3 w-3 fill-[#6d28d9] text-[#6d28d9]" />
                            )}
                            {!isSubActive && (
                              <div className="h-3 w-3" />
                            )}
                            <span>{subitem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
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
              )}
            </div>
          );
        })}
      </nav>

      <div>
        <Separator className="mb-3" />
        <div className="space-y-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-slate-100 text-[#1d184f] shadow-sm"
                    : "text-[#63637e] hover:bg-slate-100 hover:text-[#1d184f]",
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#6d28d9]" : "text-[#9ca3af] group-hover:text-[#4f46e5]",
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
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
