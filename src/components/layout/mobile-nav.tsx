"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FileText, Stethoscope, FlaskConical, ListChecks, ClipboardPlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { primaryNav, bottomNav } from "./sidebar";

const createMenuItems = [
  {
    href: "/ordonnances",
    label: "Ordonnance",
    icon: FileText,
  },
  {
    href: "/analyses",
    label: "analyses",
    icon: FlaskConical,
  },
  {
    href: "/comptes-rendus",
    label: "Compte rendu",
    icon: FileText,
  },
  {
    href: "/avis",
    label: "Avis",
    icon: Stethoscope,
  },
];

// Mobile nav items for tablet and up (md and up)
const mobileNavItemsTablet = [
  {
    href: "/patients",
    label: "Patients",
    icon: primaryNav[1].icon,
  },
  {
    isDropdown: true,
    label: "Créer",
    icon: ClipboardPlus,
  },
  {
    href: "/tasks",
    label: "Tâches",
    icon: ListChecks,
  },
];

// Mobile nav items for phone screens (< md)
const mobileNavItemsPhone = [
  {
    href: "/patients",
    label: "Patients",
    icon: primaryNav[1].icon,
  },
  {
    isDropdown: true,
    label: "Créer",
    icon: ClipboardPlus,
  },
  {
    href: "/tasks",
    label: "Tâches",
    icon: ListChecks,
  },
];

function NavItemRenderer({ items, pathname, dropdownOpen, setDropdownOpen }: { items: any[]; pathname: string; dropdownOpen: boolean; setDropdownOpen: (open: boolean) => void }) {
  return (
    <>
      {items.map((item, index) => {
        const Icon = item.icon;

        if (item.isDropdown) {
          return (
            <div key={`create-${index}`} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  "relative -top-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition hover:shadow-xl",
                  "bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white hover:shadow-indigo-400/60 shadow-indigo-400/50",
                )}
                aria-label={item.label}
              >
                <Icon className="h-7 w-7" />
              </button>

              {dropdownOpen && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 rounded-2xl bg-white shadow-lg border border-slate-200/60 overflow-hidden z-50">
                  {createMenuItems.map((menuItem) => {
                    const MenuIcon = menuItem.icon;
                    return (
                      <Link
                        key={menuItem.href}
                        href={menuItem.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#454562] hover:bg-slate-100 transition border-b border-slate-100 last:border-b-0"
                      >
                        <MenuIcon className="h-4 w-4 text-[#6d28d9]" />
                        <span>{menuItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // At this point, item is not a dropdown item, so item.href should exist
        const itemHref = (item as any).href as string;

        const isActive =
          pathname === itemHref ||
          (itemHref !== "/dashboard" && itemHref !== "/tasks" && pathname?.startsWith(itemHref));

        return (
          <Link
            key={itemHref}
            href={itemHref}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-1 text-[10px] font-medium transition duration-200",
              isActive
                ? "bg-gradient-to-br from-[#eef2ff] via-[#ede9fe] to-white text-[#4338ca] shadow-sm shadow-indigo-200/60"
                : "text-[#6c64b5] hover:bg-white/70 hover:text-[#2d2674]",
            )}
            aria-label={item.label}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-violet-200/70 bg-white/85 px-4 shadow-[0_-6px_18px_rgba(99,102,241,0.15)] backdrop-blur-xl lg:hidden">
      <div className="flex w-full items-center justify-evenly">
        {/* Phone screens (< md) */}
        <div className="flex w-full items-center justify-evenly md:hidden">
          <NavItemRenderer
            items={mobileNavItemsPhone}
            pathname={pathname}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />
        </div>

        {/* Tablet screens (md and up) */}
        <div className="hidden md:flex w-full items-center justify-evenly">
          <NavItemRenderer
            items={mobileNavItemsTablet}
            pathname={pathname}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />
        </div>
      </div>
    </nav>
  );
}
