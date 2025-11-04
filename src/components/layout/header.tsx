"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { patientsSeed } from "@/app/(app)/patients/data";

interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  category: "Patient" | "Analyse" | "Message";
}

const SEARCH_DATA: SearchSuggestion[] = [
  {
    id: "PAT-FD",
    title: "Fatou Diop",
    subtitle: "Patient · Chirurgie digestive",
    category: "Patient",
  },
  {
    id: "PAT-LM",
    title: "Louis Martin",
    subtitle: "Patient · Pré-op bloc 5",
    category: "Patient",
  },
  {
    id: "LAB-IONO",
    title: "Ionogramme patient Costa",
    subtitle: "Analyse critique · Laboratoire central",
    category: "Analyse",
  },
  {
    id: "MSG-CARDIO",
    title: "Message Dr. Evans",
    subtitle: "Équipe cardiologie · Avis ECG",
    category: "Message",
  },
  {
    id: "MSG-BLOC",
    title: "Brief bloc opératoire",
    subtitle: "Bloc 5 · Planning de demain",
    category: "Message",
  },
];

type PatientOption = {
  id: string;
  name: string;
  birthDate: string;
  service: string;
};

type RendezvousFormState = {
  mode: "existing" | "new";
  patientId: string;
  newPatientName: string;
  newPatientBirthDate: string;
  newPatientService: string;
  rendezvousType: string;
  date: string;
  time: string;
  location: string;
  notes: string;
};

const RDV_TYPES = [
  "Consultation",
  "Suivi post-op",
  "Préadmission",
  "Bilan complémentaire",
  "Visite d'équipe",
] as const;

const createEmptyRdvForm = (defaultPatientId: string): RendezvousFormState => ({
  mode: "existing",
  patientId: defaultPatientId,
  newPatientName: "",
  newPatientBirthDate: "",
  newPatientService: "",
  rendezvousType: RDV_TYPES[0],
  date: "",
  time: "",
  location: "",
  notes: "",
});

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
  const { theme, toggleTheme, isReady: isThemeReady } = useTheme();
  const isDarkMode = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rdvSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [rdvPatients, setRdvPatients] = useState<PatientOption[]>(() =>
    patientsSeed.map((patient) => ({
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate,
      service: patient.service,
    })),
  );
  const [rdvForm, setRdvForm] = useState<RendezvousFormState>(() =>
    createEmptyRdvForm(patientsSeed[0]?.id ?? ""),
  );
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);
  const [isSavingRdv, setIsSavingRdv] = useState(false);
  const [rdvSuccess, setRdvSuccess] = useState<string | null>(null);

  const clearPendingSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  };

  const clearPendingRdvSave = () => {
    if (rdvSaveTimeoutRef.current) {
      clearTimeout(rdvSaveTimeoutRef.current);
      rdvSaveTimeoutRef.current = null;
    }
  };

  useEffect(
    () => () => {
      clearPendingSearch();
      clearPendingRdvSave();
    },
    [],
  );

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
    if (!rdvSuccess) {
      return;
    }
    const timer = window.setTimeout(() => setRdvSuccess(null), 3800);
    return () => window.clearTimeout(timer);
  }, [rdvSuccess]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearPendingSearch();

    if (!value.trim()) {
      setIsSearching(false);
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    searchTimeoutRef.current = setTimeout(() => {
      const lowercaseValue = value.toLowerCase();
      const results = SEARCH_DATA.filter(
        (item) =>
          item.title.toLowerCase().includes(lowercaseValue) ||
          item.subtitle.toLowerCase().includes(lowercaseValue),
      ).slice(0, 5);

      setSuggestions(results);
      setIsSearching(false);
    }, 900);
  };

  const selectedRdvPatient = useMemo(
    () => rdvPatients.find((patient) => patient.id === rdvForm.patientId) ?? null,
    [rdvPatients, rdvForm.patientId],
  );

  const isRdvFormValid = useMemo(() => {
    const hasPatient =
      rdvForm.mode === "existing"
        ? Boolean(rdvForm.patientId)
        : Boolean(
            rdvForm.newPatientName.trim() &&
              rdvForm.newPatientBirthDate &&
              rdvForm.newPatientService.trim(),
          );
    return (
      hasPatient &&
      Boolean(rdvForm.rendezvousType.trim()) &&
      Boolean(rdvForm.date) &&
      Boolean(rdvForm.time)
    );
  }, [rdvForm]);

  const handleOpenRdvModal = () => {
    clearPendingRdvSave();
    setRdvForm(createEmptyRdvForm(rdvPatients[0]?.id ?? ""));
    setIsRdvModalOpen(true);
    setIsSavingRdv(false);
  };

  const handleCloseRdvModal = () => {
    clearPendingRdvSave();
    setIsRdvModalOpen(false);
    setIsSavingRdv(false);
    setRdvForm(createEmptyRdvForm(rdvPatients[0]?.id ?? ""));
  };

  const handleSwitchRdvMode = (mode: "existing" | "new") => {
    setRdvForm((previous) => {
      if (previous.mode === mode) {
        return previous;
      }
      if (mode === "existing") {
        const fallbackId = rdvPatients[0]?.id ?? "";
        return {
          ...previous,
          mode,
          patientId: previous.patientId || fallbackId,
        };
      }
      return {
        ...previous,
        mode,
        patientId: "",
        newPatientName: "",
        newPatientBirthDate: "",
        newPatientService: "",
      };
    });
  };

  const handleSaveRendezvous = () => {
    if (!isRdvFormValid || isSavingRdv) {
      return;
    }

    clearPendingRdvSave();
    setIsSavingRdv(true);

    const patientName =
      rdvForm.mode === "existing"
        ? selectedRdvPatient?.name ?? "Patient"
        : rdvForm.newPatientName.trim();
    const patientService =
      rdvForm.mode === "existing"
        ? selectedRdvPatient?.service ?? ""
        : rdvForm.newPatientService.trim();

    const newPatientPayload =
      rdvForm.mode === "new"
        ? {
            id: `P-${Date.now()}`,
            name: rdvForm.newPatientName.trim(),
            birthDate: rdvForm.newPatientBirthDate,
            service: rdvForm.newPatientService.trim(),
          }
        : null;

    rdvSaveTimeoutRef.current = setTimeout(() => {
      let nextDefaultId = rdvPatients[0]?.id ?? "";
      if (newPatientPayload) {
        nextDefaultId = newPatientPayload.id;
        setRdvPatients((previous) => [newPatientPayload, ...previous]);
      }

      setRdvSuccess(
        `Rendez-vous planifié pour ${patientName}${
          patientService ? ` · ${patientService}` : ""
        }`,
      );
      setIsSavingRdv(false);
      setIsRdvModalOpen(false);
      setRdvForm(createEmptyRdvForm(nextDefaultId));
      rdvSaveTimeoutRef.current = null;
    }, 520);
  };

  const suggestionBadge = useMemo(
    () => ({
      Patient: "bg-emerald-100 text-emerald-700",
      Analyse: "bg-indigo-100 text-indigo-700",
      Message: "bg-amber-100 text-amber-700",
    }),
    [],
  );

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
          <div className="hidden flex-col lg:flex">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Centre Hospitalier Moulay Youssef
            </span>
            <h1 className="text-lg font-semibold text-slate-900">
              Bonjour Dr. Bouziane
            </h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative hidden w-full max-w-md md:block">
            <div className="flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/50 px-4 py-2 text-sm text-[#6157b0] shadow-inner shadow-white/60">
              <Search className="h-4 w-4 text-[#8a81d6]" />
              <input
                type="search"
                placeholder="Rechercher un patient, une analyse, un message..."
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 120);
                }}
                className="w-full bg-transparent text-sm text-[#403b78] placeholder:text-[#8a81d6] focus:outline-none"
              />
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-[#8a81d6]" /> : null}
            </div>

            {showSuggestions && (isSearching || searchQuery.trim()) ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-violet-200/70 bg-white/95 p-2 shadow-xl backdrop-blur">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-[#6157b0]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Recherche en cours...</span>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-500">
                    Aucun résultat pour « {searchQuery} »
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {suggestions.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-violet-50"
                          onMouseDown={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#352f72]">{item.title}</span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                suggestionBadge[item.category],
                              )}
                            >
                              {item.category}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#6b63b5]">{item.subtitle}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenRdvModal}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Nouveau rendez-vous
            </Button>
            {rdvSuccess ? (
              <div className="rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm shadow-emerald-100/60 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-100">
                {rdvSuccess}
              </div>
            ) : null}
          </div>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-[#5f5aa5]" />
            <span className="absolute -right-1 -top-1 block h-2.5 w-2.5 rounded-full bg-rose-500"></span>
          </Button>

          <div className="relative hidden md:flex" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className={cn(
                "flex items-center gap-3 rounded-full border border-violet-200/60 bg-white/60 px-4 py-1.5 text-left shadow-inner shadow-white/70 transition",
                "hover:border-violet-300 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-violet-200/80",
              )}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a81d6]">
                  Aujourd&apos;hui
                </p>
                <p className="text-sm font-medium text-[#352f72]">
                  {today}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c4b5fd] to-[#a5b4fc] text-sm font-semibold text-[#1d184f] shadow-sm shadow-indigo-200/60">
                DD
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
                    DD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2f2961]">
                      Dr. Bouziane
                    </p>
                    <p className="text-xs text-[#6a66b1]">
                      Urologie @ CHU Ibn Sina
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-violet-200/70 bg-white/70 p-3 shadow-inner shadow-white/60">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                          Apparence
                        </p>
                       
                      </div>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        disabled={!isThemeReady}
                        className={cn(
                          "group relative flex h-11 w-24 shrink-0 items-center rounded-full border border-violet-200/70 bg-white/80 p-1 text-xs font-semibold text-[#352f72] shadow-sm transition",
                          "hover:border-violet-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200/60",
                          !isThemeReady && "cursor-wait opacity-70",
                        )}
                        aria-label="Basculer le thème clair/sombre"
                      >
                        <span
                          className={cn(
                            "absolute inset-y-1 w-1/2 rounded-full bg-gradient-to-r from-[#7c3aed]/80 to-[#6366f1]/80 shadow-sm transition-all",
                            isDarkMode ? "right-1" : "left-1",
                          )}
                        />
                        <span className="relative flex h-9 w-1/2 items-center justify-center text-white">
                          <Sun
                            className={cn(
                              "h-4 w-4 transition-opacity",
                              isDarkMode ? "opacity-40" : "opacity-100",
                            )}
                          />
                        </span>
                        <span className="relative flex h-9 w-1/2 items-center justify-center text-white">
                          <Moon
                            className={cn(
                              "h-4 w-4 transition-opacity",
                              isDarkMode ? "opacity-100" : "opacity-30",
                            )}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-rose-500/90 via-rose-500/80 to-rose-500/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition hover:shadow-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-200/80"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/login");
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
      <Modal
        open={isRdvModalOpen}
        onClose={handleCloseRdvModal}
        title="Planifier un rendez-vous"
        description="Coordonnez un nouveau créneau patient avec toutes les informations clés."
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseRdvModal}
              disabled={isSavingRdv}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveRendezvous}
              disabled={!isRdvFormValid || isSavingRdv}
              isLoading={isSavingRdv}
            >
              {isSavingRdv ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Planifier
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSwitchRdvMode("existing")}
              className={cn(
                "rounded-2xl border border-violet-200/70 px-4 py-3 text-sm font-semibold transition",
                "hover:border-violet-300 hover:bg-indigo-50/60 focus:outline-none focus:ring-2 focus:ring-violet-200/70",
                rdvForm.mode === "existing"
                  ? "bg-gradient-to-r from-[#ede9ff] via-white to-[#eef2ff] text-[#352f72] shadow-md shadow-indigo-100"
                  : "bg-white/70 text-[#5f5aa5]",
              )}
            >
              Patient existant
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRdvMode("new")}
              className={cn(
                "rounded-2xl border border-violet-200/70 px-4 py-3 text-sm font-semibold transition",
                "hover:border-violet-300 hover:bg-indigo-50/60 focus:outline-none focus:ring-2 focus:ring-violet-200/70",
                rdvForm.mode === "new"
                  ? "bg-gradient-to-r from-[#fde4ff] via-white to-[#fce7f3] text-[#352f72] shadow-md shadow-rose-100"
                  : "bg-white/70 text-[#5f5aa5]",
              )}
            >
              Nouveau patient
            </button>
          </div>

          {rdvForm.mode === "existing" ? (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                Sélection du patient
              </label>
              <select
                value={rdvForm.patientId}
                onChange={(event) =>
                  setRdvForm((previous) => ({
                    ...previous,
                    patientId: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm font-medium text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
              >
                <option value="">Sélectionnez un patient</option>
                {rdvPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} · {patient.service}
                  </option>
                ))}
              </select>
              {selectedRdvPatient ? (
                <div className="flex items-start justify-between rounded-2xl border border-violet-200/70 bg-white/60 px-4 py-3 text-sm text-[#352f72] shadow-inner shadow-white/40">
                  <div>
                    <p className="font-semibold text-[#2f2961]">
                      {selectedRdvPatient.name}
                    </p>
                    <p className="text-xs text-[#6a66b1]">
                      Né(e) le {formatBirthDate(selectedRdvPatient.birthDate)}
                    </p>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700">
                    {selectedRdvPatient.service}
                  </Badge>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={rdvForm.newPatientName}
                    onChange={(event) =>
                      setRdvForm((previous) => ({
                        ...previous,
                        newPatientName: event.target.value,
                      }))
                    }
                    placeholder="Nom du patient"
                    className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={rdvForm.newPatientBirthDate}
                    onChange={(event) =>
                      setRdvForm((previous) => ({
                        ...previous,
                        newPatientBirthDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                  Service de prise en charge
                </label>
                <input
                  type="text"
                  value={rdvForm.newPatientService}
                  onChange={(event) =>
                    setRdvForm((previous) => ({
                      ...previous,
                      newPatientService: event.target.value,
                    }))
                  }
                  placeholder="Ex : Chirurgie digestive"
                  className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
                />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                Type de rendez-vous
              </label>
              <select
                value={rdvForm.rendezvousType}
                onChange={(event) =>
                  setRdvForm((previous) => ({
                    ...previous,
                    rendezvousType: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm font-medium text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
              >
                {RDV_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                Lieu
              </label>
              <input
                type="text"
                value={rdvForm.location}
                onChange={(event) =>
                  setRdvForm((previous) => ({
                    ...previous,
                    location: event.target.value,
                  }))
                }
                placeholder="Ex : Bloc 5 · Salle 2"
                className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                Date
              </label>
              <input
                type="date"
                value={rdvForm.date}
                onChange={(event) =>
                  setRdvForm((previous) => ({
                    ...previous,
                    date: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
                Heure
              </label>
              <input
                type="time"
                value={rdvForm.time}
                onChange={(event) =>
                  setRdvForm((previous) => ({
                    ...previous,
                    time: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#6a66b1]">
              Notes et objectifs
            </label>
            <textarea
              value={rdvForm.notes}
              onChange={(event) =>
                setRdvForm((previous) => ({
                  ...previous,
                  notes: event.target.value,
                }))
              }
              rows={3}
              placeholder="Précisez les examens, préparations ou documents à prévoir."
              className="w-full rounded-2xl border border-violet-200/70 bg-white px-3 py-2.5 text-sm text-[#352f72] shadow-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
