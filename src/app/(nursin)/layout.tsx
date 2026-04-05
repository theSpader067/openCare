"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NursingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

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
    <div className="h-screen flex flex-col overflow-hidden bg-cover bg-center relative" style={{ backgroundImage: 'url(/bg-02.jpg)' }}>
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative z-10">
        {children}
      </main>
    </div>
  );
}
