"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  LayoutDashboard,
  Mail,
  PieChart,
  Settings2,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users2 },
  { href: "/analyses", label: "Analyses", icon: FlaskConical },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/statistiques", label: "Stats", icon: PieChart },
  { href: "/settings", label: "Réglages", icon: Settings2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-violet-200/70 bg-white/80 px-3 py-2 shadow-[0_-6px_18px_rgba(99,102,241,0.15)] backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium transition",
              isActive
                ? "text-[#5b4be7]"
                : "text-[#6c64b5] hover:bg-white/70 hover:text-[#2d2674]",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
