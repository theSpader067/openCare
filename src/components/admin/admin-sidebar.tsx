"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Stethoscope,
  FileText,
  DollarSign,
  Users,
  Building2,
  ChevronDown,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children?: NavItem[];
}

const adminNavItems: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Vue d'ensemble de l'administration",
  },
  {
    label: "Actes et Gestes",
    href: "/admin/catalog/acts",
    icon: Stethoscope,
    description: "Catalogue des actes et gestes médicaux",
  },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: FileText,
    description: "Design des documents imprimables",
    children: [
      {
        label: "Ordonnances",
        href: "/admin/documents/prescriptions",
        icon: FileText,
      },
      {
        label: "Rapports",
        href: "/admin/documents/reports",
        icon: FileText,
      },
      {
        label: "Modèles",
        href: "/admin/documents/templates",
        icon: FileText,
      },
    ],
  },
  {
    label: "Finances",
    href: "/admin/finances",
    icon: DollarSign,
    description: "Gestion des actes et paiements",
    children: [
      {
        label: "Actes facturables",
        href: "/admin/finances/acts",
        icon: DollarSign,
      },
      {
        label: "Paiements",
        href: "/admin/finances/payments",
        icon: DollarSign,
      },
      {
        label: "Rapports",
        href: "/admin/finances/reports",
        icon: FileText,
      },
    ],
  },
  {
    label: "Organisation",
    href: "/admin/organization",
    icon: Building2,
    description: "Paramètres de l'hôpital/clinique",
    children: [
      {
        label: "Informations",
        href: "/admin/organization/info",
        icon: Building2,
      },
      {
        label: "Équipes",
        href: "/admin/organization/teams",
        icon: Users,
      },
      {
        label: "Utilisateurs",
        href: "/admin/organization/users",
        icon: Users,
      },
    ],
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    description: "Configuration générale",
  },
];

interface AdminSidebarProps {
  theme?: "light" | "dark";
}

export function AdminSidebar({ theme = "light" }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Catalogue", "Documents", "Finances", "Organisation"]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transition-all duration-300 lg:static lg:translate-x-0",
          theme === "dark"
            ? "bg-slate-900 text-white border-r border-slate-800"
            : "bg-white text-slate-900 border-r border-slate-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={cn(
              "relative px-6 py-8 overflow-hidden border-b transition-all duration-300",
              theme === "dark"
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                : "bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-slate-200 shadow-[0_4px_12px_rgba(79,70,229,0.08)]"
            )}
          >
            {/* Animated Background Elements */}
            <div
              className={cn(
                "absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 animate-pulse",
                theme === "dark"
                  ? "bg-indigo-600"
                  : "bg-indigo-400"
              )}
            />
            <div
              className={cn(
                "absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-15 animate-pulse",
                theme === "dark"
                  ? "bg-blue-600"
                  : "bg-blue-300"
              )}
              style={{ animationDelay: "1s" }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              {/* Logo Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-6",
                  theme === "dark"
                    ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_4px_12px_rgba(79,70,229,0.4)]"
                    : "bg-gradient-to-br from-indigo-600 to-blue-500 shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                )}
              >
                <Heart className="h-6 w-6 text-white animate-pulse" />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h1
                  className={cn(
                    "text-2xl font-bold tracking-tight bg-clip-text transition-colors duration-300",
                    theme === "dark"
                      ? "text-white"
                      : "text-transparent bg-gradient-to-r from-indigo-600 to-blue-600"
                  )}
                >
                  OpenCare
                </h1>
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-widest mt-0.5 transition-colors duration-300",
                    theme === "dark"
                      ? "text-slate-400"
                      : "text-indigo-600"
                  )}
                >
                  Admin panel
                </p>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-50",
                theme === "dark"
                  ? "from-transparent via-indigo-500 to-transparent"
                  : "from-transparent via-indigo-400 to-transparent"
              )}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {adminNavItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 relative px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer group",
                      isParentActive(item)
                        ? theme === "dark"
                          ? "text-white"
                          : "text-indigo-600"
                        : theme === "dark"
                        ? "text-slate-400 group-hover:text-slate-200"
                        : "text-slate-700 group-hover:text-slate-900"
                    )}
                  >
                    {/* Background Accent */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg transition-all duration-200",
                        isParentActive(item)
                          ? theme === "dark"
                            ? "bg-indigo-600/10"
                            : "bg-indigo-50"
                          : "group-hover:bg-slate-900/5"
                      )}
                    />

                    {/* Left Border Accent */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-r transition-all duration-200",
                        isParentActive(item)
                          ? "bg-gradient-to-b from-indigo-500 to-indigo-600"
                          : "bg-transparent"
                      )}
                    />

                    {/* Content */}
                    <div className="relative flex items-center gap-3 z-10">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 relative z-10",
                        expandedItems.includes(item.label) && "rotate-180"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 group block",
                      isActive(item.href)
                        ? theme === "dark"
                          ? "text-white"
                          : "text-indigo-600"
                        : theme === "dark"
                        ? "text-slate-400 group-hover:text-slate-200"
                        : "text-slate-700 group-hover:text-slate-900"
                    )}
                  >
                    {/* Background Accent */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg transition-all duration-200",
                        isActive(item.href)
                          ? theme === "dark"
                            ? "bg-indigo-600/10"
                            : "bg-indigo-50"
                          : "group-hover:bg-slate-900/5"
                      )}
                    />

                    {/* Left Border Accent */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-r transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-b from-indigo-500 to-indigo-600"
                          : "bg-transparent"
                      )}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )}

                {/* Submenu */}
                {item.children && expandedItems.includes(item.label) && (
                  <div
                    className={cn(
                      "ml-4 space-y-1 py-2 pl-3 border-l-2 transition-all duration-200",
                      theme === "dark" ? "border-slate-700" : "border-slate-200"
                    )}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all duration-200 group rounded",
                          isActive(child.href)
                            ? theme === "dark"
                              ? "text-indigo-400"
                              : "text-indigo-600"
                            : theme === "dark"
                            ? "text-slate-400 group-hover:text-slate-200"
                            : "text-slate-600 group-hover:text-slate-900"
                        )}
                      >
                        {/* Background Accent */}
                        <div
                          className={cn(
                            "absolute inset-0 rounded transition-all duration-200",
                            isActive(child.href)
                              ? theme === "dark"
                                ? "bg-indigo-600/10"
                                : "bg-indigo-50"
                              : "group-hover:bg-slate-900/5"
                          )}
                        />

                        {/* Dot Accent */}
                        <div
                          className={cn(
                            "relative z-10 h-1.5 w-1.5 rounded-full transition-all duration-200",
                            isActive(child.href)
                              ? "bg-indigo-600"
                              : theme === "dark"
                              ? "bg-slate-600 group-hover:bg-slate-500"
                              : "bg-slate-300 group-hover:bg-slate-400"
                          )}
                        />
                        <span className="relative z-10">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div
            className={cn(
              "border-t px-6 py-4",
              theme === "dark" ? "border-slate-800" : "border-slate-200"
            )}
          >
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 text-sm",
                theme === "dark"
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              ← Retour à l'app
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={cn(
            "fixed inset-0 z-20 lg:hidden",
            theme === "dark" ? "bg-black/50" : "bg-black/30"
          )}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
