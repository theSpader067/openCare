"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { bottomNav, primaryNav } from "./sidebar";

export function MobileNav() {
  const pathname = usePathname();
  const navItems = [...primaryNav, bottomNav];

  return (
    <nav className="no-scrollbar fixed bottom-0 left-0 right-0 z-30 overflow-x-auto border-t border-violet-200/70 bg-white/85 px-2 py-2 shadow-[0_-6px_18px_rgba(99,102,241,0.15)] backdrop-blur-xl lg:hidden">
      <div className="flex w-full min-w-max items-stretch gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const displayLabel =
            item.label === "Tableau de bord" ? "Accueil" : item.label;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[76px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition",
                isActive
                  ? "bg-gradient-to-br from-[#eef2ff] via-[#ede9fe] to-white text-[#4338ca] shadow-sm shadow-indigo-200/60"
                  : "text-[#6c64b5] hover:bg-white/70 hover:text-[#2d2674]",
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{displayLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
