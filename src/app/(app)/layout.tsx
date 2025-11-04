"use client";

import { useState } from "react";
import { DesktopSidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AppHeader } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleClose = () => setSidebarOpen(false);

  return (
    <div className="h-screen overflow-hidden">
      <MobileSidebar open={sidebarOpen} onClose={handleClose} />

      <div className="flex h-full px-2 pb-20 pt-2 sm:px-4 lg:px-6 lg:pb-12 lg:pt-6">
        <DesktopSidebar />

        <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[28px] bg-white/55 shadow-[0_25px_65px_-35px_rgba(79,70,229,0.45)] backdrop-blur-2xl lg:rounded-[36px]">
          <AppHeader onToggleSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto pb-12 lg:pb-8">
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
