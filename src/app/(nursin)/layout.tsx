"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function NursingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  // Default service name (can be customized based on user assignment)
  const serviceName = "Cardiologie";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-sm font-medium text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Premium Header */}
      <header className="h-16 sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6">
        {/* Left: Professional OpenCare Logo */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            {/* Logo mark */}
            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              OC
            </div>
            {/* Logo text */}
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              OpenCare
            </span>
          </div>
        </div>

        {/* Right: User & Profile */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="hidden md:flex flex-col text-right pr-4 border-r border-slate-200">
            <p className="text-sm font-bold text-slate-900">
              {session?.user?.name || "Infirmier"}
            </p>
            <p className="text-xs text-slate-500">{serviceName}</p>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 group"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {(session?.user?.name?.[0] || "I").toUpperCase()}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-slate-600 transition-transform duration-200",
                profileOpen && "rotate-180"
              )} />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <p className="text-sm font-bold text-slate-900">
                    {session?.user?.name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {session?.user?.email || "infirmier@hopital.fr"}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/workstation/profile");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-slate-900 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200 group"
                  >
                    <User className="h-4 w-4" />
                    <span>Mon profil</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="px-2 py-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
