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
import { useLanguage } from "@/contexts/LanguageContext";


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
  const { t, language, setLanguage } = useLanguage();
  const today = new Intl.DateTimeFormat(language === 'fr' ? "fr-FR" : "en-US", {
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

  const { data: session, status } = useSession()
  if (status === 'unauthenticated') return null;
  if (!session) return null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onToggleSidebar}
              aria-label={t('dashboard.header.openNavMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {(session.user as any).hospital}
              </span>
              <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                {t('dashboard.header.greeting').replace('{{name}}', (session.user as any).username)}
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
                  {t('dashboard.header.create')}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      createDropdownOpen && "rotate-180",
                    )}
                  />
                </Button>

                {createDropdownOpen ? (
                  <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded border border-slate-200 bg-white p-2 shadow-lg">
                    <ul className="space-y-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/ordonnances");
                          }}
                          className="flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FileText className="h-5 w-5 text-cyan-600" />
                          {t('dashboard.header.prescription')}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/analyses");
                          }}
                          className="flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Beaker className="h-5 w-5 text-cyan-600" />
                          {t('dashboard.header.analyses')}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/comptes-rendus");
                          }}
                          className="flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FileText className="h-5 w-5 text-cyan-600" />
                          {t('dashboard.header.report')}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateDropdownOpen(false);
                            router.push("/avis");
                          }}
                          className="flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Stethoscope className="h-5 w-5 text-cyan-600" />
                          {t('dashboard.header.opinion')}
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
                "relative text-slate-500",
                notificationsOpen && "bg-cyan-50 text-cyan-700",
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
              <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded border border-slate-200 bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('dashboard.header.notifications')}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('dashboard.header.realTime')}
                  </span>
                </div>
                <div className="mt-3 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                      <Bell className="h-5 w-5 text-slate-400" />
                      {t('dashboard.header.noNotifications')}
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
                    {t('dashboard.header.markAllAsRead')}
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold text-[#4338ca] transition hover:text-[#2d2674]"
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/notifications");
                    }}
                  >
                    {t('dashboard.header.viewAll')}
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
                "flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-left shadow-sm transition",
                "hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500",
              )}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white shadow-sm">
              {(session.user as any).firstName && (session.user as any).lastName ? `${(session.user as any).firstName[0]}${(session.user as any).lastName[0]}` : (session.user as any).username ? (session.user as any).username[0] : "" }
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  profileOpen && "rotate-180",
                )}
              />
            </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded border border-slate-200 bg-white p-4 shadow-lg">
                  {/* Language Switcher */}
                  <div className="mb-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 px-2">
                      {t('dashboard.header.language') || 'Language'}
                    </p>
                    <div className="flex gap-2">
                      {[
                        { code: 'en', label: 'English', flag: 'en' },
                        { code: 'fr', label: 'Français', flag: 'fr' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as 'en' | 'fr');
                          }}
                          className={cn(
                            "flex-1 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2",
                            language === lang.code
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-white'
                          )}
                        >
                          {lang.flag === 'fr' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                              <path fill="#fff" d="M10 4H22V28H10z"></path>
                              <path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#092050"></path>
                              <path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#be2a2c"></path>
                              <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path>
                              <path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                              <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect>
                              <path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path>
                              <path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path>
                              <path fill="#a62842" d="M2 11.385H31V13.231H2z"></path>
                              <path fill="#a62842" d="M2 15.077H31V16.923H2z"></path>
                              <path fill="#a62842" d="M1 18.769H31V20.615H1z"></path>
                              <path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path>
                              <path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path>
                              <path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path>
                              <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path>
                              <path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path>
                              <path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path>
                              <path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path>
                              <path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path>
                              <path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path>
                              <path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path>
                              <path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path>
                              <path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path>
                              <path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path>
                              <path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path>
                              <path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path>
                              <path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path>
                              <path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path>
                              <path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path>
                              <path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path>
                              <path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path>
                              <path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path>
                              <path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path>
                              <path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path>
                            </svg>
                          )}
                          <span>{lang.code.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-b border-slate-200 pb-3 mb-3"></div>

                  <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-cyan-600 text-lg font-semibold text-white shadow-sm">
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
                        {t('dashboard.header.myProfile')}
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
                        {t('dashboard.header.logout')}
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
