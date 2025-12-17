"use client";

import { useEffect, useState } from "react";
import { DesktopSidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AppHeader } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleClose = () => setSidebarOpen(false);

  const { status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Show loading state instead of blank screen
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null // avoid rendering UI before redirect

  return (
    <div className="h-screen overflow-hidden">
      <MobileSidebar open={sidebarOpen} onClose={handleClose} />

      <div className="flex h-full px-2 pb-6 pt-2 sm:px-1 lg:px-2 lg:pb-6 lg:pt-4">
        <DesktopSidebar />
        <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[28px] bg-white/55 shadow-[0_25px_65px_-35px_rgba(79,70,229,0.45)] backdrop-blur-2xl lg:rounded-[36px]">
          <AppHeader onToggleSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto pb-24 md:pb-20 lg:pb-8">
            <div className="mx-auto flex h-full w-full flex-col px-2 py-2 sm:px-2 lg:px-4 xl:px-6">
                {children}
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
