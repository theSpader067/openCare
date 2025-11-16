"use client";
import { signOut, useSession } from "next-auth/react"
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  Beaker,
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";


const formatBirthDate = (value: string) => {
  if (!value) {
    return "Date inconnue";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

type NotificationType = "avis" | "task" | "bilan";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  source: string;
}

const NOTIFICATION_META: Record<
  NotificationType,
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
    badgeClass: string;
    iconClass: string;
  }
> = {
  avis: {
    label: "Avis",
    icon: Stethoscope,
    badgeClass: "bg-emerald-100 text-emerald-700",
    iconClass: "bg-emerald-500/15 text-emerald-600",
  },
  task: {
    label: "Tâche",
    icon: ListChecks,
    badgeClass: "bg-indigo-100 text-indigo-700",
    iconClass: "bg-indigo-500/15 text-indigo-600",
  },
  bilan: {
    label: "Bilan",
    icon: Beaker,
    badgeClass: "bg-amber-100 text-amber-700",
    iconClass: "bg-amber-500/15 text-amber-600",
  },
};


interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement | null>(null);
  const notifications:NotificationItem[] = [];
  const unreadCount = notifications.length;
  const unreadBadge = unreadCount > 9 ? "9+" : `${unreadCount}`;


  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }
    const handleClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  useEffect(() => {
    if (!notificationsOpen) {
      return undefined;
    }
    const handleClick = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!createDropdownOpen) {
      return undefined;
    }
    const handleClick = (event: MouseEvent) => {
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node)
      ) {
        setCreateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [createDropdownOpen]);




  const suggestionBadge = useMemo(
    () => ({
      Patient: "bg-emerald-100 text-emerald-700",
      Analyse: "bg-indigo-100 text-indigo-700",
      Message: "bg-amber-100 text-amber-700",
    }),
    [],
  );

  const { data: session } = useSession()
  if (!session) return null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-violet-200/60 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onToggleSidebar}
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {(session.user as any).hospital}
              </span>
              <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                Bonjour {(session.user as any).username}
              </h1>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            

           

            <div className="hidden items-center gap-3 xl:flex">
              <div className="relative" ref={createDropdownRef}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setProfileOpen(false);
                    setNotificationsOpen(false);
                    setCreateDropdownOpen((open) => !open);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Créer
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      createDropdownOpen && "rotate-180",
                    )}
                  />
                </Button>

                {createDropdownOpen ? (
                  <div className="absolute right-0 top-full z-40 mt-3 w-56 rounded-3xl border border-violet-200/70 bg-white/95 p-2 shadow-2xl shadow-indigo-200/60 backdrop-blur">
                    <ul className="space-y-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/ordonnances");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#352f72] transition hover:bg-indigo-50/80 hover:text-[#2f2961]"
                        >
                          <FileText className="h-5 w-5 text-indigo-600" />
                          Ordonnance
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/analyses");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#352f72] transition hover:bg-indigo-50/80 hover:text-[#2f2961]"
                        >
                          <Beaker className="h-5 w-5 text-indigo-600" />
                          analyses
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/comptes-rendus");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#352f72] transition hover:bg-indigo-50/80 hover:text-[#2f2961]"
                        >
                          <FileText className="h-5 w-5 text-indigo-600" />
                          Compte rendu
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/avis");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#352f72] transition hover:bg-indigo-50/80 hover:text-[#2f2961]"
                        >
                          <Stethoscope className="h-5 w-5 text-indigo-600" />
                          Avis
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "relative text-[#5f5aa5]",
                notificationsOpen && "bg-indigo-50/80 text-[#4338ca]",
              )}
              onClick={() => {
                setProfileOpen(false);
                // On lg screens and larger, show dropdown; on smaller screens, navigate to page
                if (window.innerWidth >= 1024) {
                  setNotificationsOpen((open) => !open);
                } else {
                  router.push("/notifications");
                }
              }}
              aria-haspopup="menu"
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {unreadBadge}
                </span>
              ) : null}
            </Button>

            {notificationsOpen && window.innerWidth >= 1024 ? (
              <div className="absolute right-0 top-full z-40 mt-3 w-80 rounded-3xl border border-violet-200/70 bg-white/95 p-4 shadow-2xl shadow-indigo-200/60 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a81d6]">
                      Notifications
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-[#4338ca]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Temps réel
                  </span>
                </div>
                <div className="mt-3 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200/70 bg-white/80 px-4 py-10 text-center text-sm text-slate-500">
                      <Bell className="h-5 w-5 text-slate-400" />
                      Aucun nouveau signal, tout est sous contrôle.
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {notifications.map((notification) => {
                        const meta = NOTIFICATION_META[notification.type];
                        const Icon = meta.icon;
                        return (
                          <li key={notification.id}>
                            <div className="flex items-start gap-3 rounded-2xl border border-violet-100/70 bg-white/90 p-3 shadow-sm shadow-indigo-100/40 transition hover:border-violet-200 hover:shadow-indigo-100/60">
                              <span
                                className={cn(
                                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl",
                                  meta.iconClass,
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="flex flex-1 flex-col gap-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-[#1f184f]">
                                    {notification.title}
                                  </p>
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                      meta.badgeClass,
                                    )}
                                  >
                                    {meta.label}
                                  </span>
                                </div>
                                <p className="text-xs text-[#5f5aa5]">
                                  {notification.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-[#8a81d6]">
                                  <span>{notification.time}</span>
                                  <span className="flex items-center gap-1 text-[#6157b0]">
                                    <Sparkles className="h-3 w-3" />
                                    {notification.source}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-wide text-[#5f5aa5] transition hover:text-[#4338ca]"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Marquer tout comme lu
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold text-[#4338ca] transition hover:text-[#2d2674]"
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/notifications");
                    }}
                  >
                    Voir tout
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative flex" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-full border border-violet-200/60 bg-white/60 px-4 py-1.5 text-left shadow-inner shadow-white/70 transition",
                "hover:border-violet-300 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-violet-200/80",
              )}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
             
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c4b5fd] to-[#a5b4fc] text-sm font-semibold text-[#1d184f] shadow-sm shadow-indigo-200/60">
              {(session.user as any).firstName && (session.user as any).lastName ? `${(session.user as any).firstName[0]}${(session.user as any).lastName[0]}` : (session.user as any).username ? (session.user as any).username[0] : "" }
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#8a81d6] transition-transform",
                  profileOpen && "rotate-180",
                )}
              />
            </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full z-40 mt-3 w-72 rounded-3xl border border-violet-200/60 bg-gradient-to-br from-white via-[#f8f7ff] to-[#ede9ff] p-4 shadow-2xl shadow-indigo-200/50 backdrop-blur">
                  <div className="flex items-center gap-3 border-b border-violet-100/70 pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] via-[#6366f1] to-[#4f46e5] text-lg font-semibold text-white shadow-md shadow-indigo-300/40">
                    {(session.user as any).firstName && (session.user as any).lastName ? `${(session.user as any).firstName[0]}${(session.user as any).lastName[0]}` : (session.user as any).username ? (session.user as any).username[0] : "" }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2f2961]">
                        Dr. {(session.user as any).username}
                      </p>
                      <p className="text-xs text-[#6a66b1]">
                        {(session.user as any).specialty} @ {(session.user as any).hospital}
                      </p>
                      
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      className="flex w-full items-center hover:cursor-pointer rounded-2xl bg-gradient-to-r from-indigo-500/90 via-indigo-500/80 to-indigo-500/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:shadow-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-200/80"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/profile");
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                          <User className="h-4 w-4" />
                        </span>
                        Mon profil
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center hover:cursor-pointer rounded-2xl bg-gradient-to-r from-rose-500/90 via-rose-500/80 to-rose-500/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition hover:shadow-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-200/80"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: process.env.NEXTAUTH_REDIRECT_AFTER_LOGOUT! });
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                          <LogOut className="h-4 w-4" />
                        </span>
                        Déconnexion
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        
      </header>
    </>
  );
}
