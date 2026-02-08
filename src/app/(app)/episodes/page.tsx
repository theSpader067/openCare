"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Calendar,
  Clock,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Loader,
  Trash2,
  Download,
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

type EpisodeStatus = "CREATED" | "ACTIVE" | "PAUSED" | "CLOSED";

type Block = {
  id: string;
  type: "ACTION" | "CONDITION" | "WAIT";
  tasks?: Array<{ id: string; text: string }>;
  condition?: string;
  options?: Array<{ id: string; resultat: string; decision: string }>;
  duration?: number;
  completedAt?: string;
  parentBlockIds?: string[];
  childBlockIds?: string[];
};

type CAT = {
  id: string;
  blocks: Block[];
  allBlocksCount?: number;
};

type Episode = {
  id: string;
  entryAt: string;
  exitAt?: string;
  motif: string;
  status: EpisodeStatus;
  fullname: string;
  sex?: string;
  age?: number;
  origin?: string;
  patientId?: number;
  patientName?: string;
  cat?: CAT;
};

type Patient = {
  id: number;
  fullName: string;
  dateOfBirth?: string;
  age?: number;
};

const statusBadgeMap: Record<EpisodeStatus, { color: string; label: string }> = {
  CREATED: {
    color: "bg-blue-100 text-blue-800 border border-blue-300",
    label: "Created",
  },
  ACTIVE: {
    color: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    label: "Active",
  },
  PAUSED: {
    color: "bg-amber-100 text-amber-800 border border-amber-300",
    label: "Paused",
  },
  CLOSED: {
    color: "bg-gray-100 text-gray-800 border border-gray-300",
    label: "Closed",
  },
};

function formatEpisodeDateTime(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function calculateDuration(entryAt: string, exitAt?: string): string {
  const start = new Date(entryAt);
  const end = exitAt ? new Date(exitAt) : new Date();

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}j ${diffHours}h ${diffMinutes}m`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
}

function getBlockStateDisplay(block: Block): string {
  if (block.type === "ACTION") {
    const firstTask = block.tasks?.[0];
    return firstTask ? `Action: ${firstTask.text}` : "Action";
  } else if (block.type === "CONDITION") {
    return block.condition ? `Condition: ${block.condition.substring(0, 40)}${block.condition.length > 40 ? "..." : ""}` : "Condition";
  } else if (block.type === "WAIT") {
    return `Attente: ${block.duration || 0}min`;
  }
  return "";
}

function calculateCATCompletion(cat: CAT | null): number {
  if (!cat || !cat.blocks || cat.blocks.length === 0) return 0;
  const completedBlocks = cat.blocks.filter((block) => block.completedAt).length;
  return Math.round((completedBlocks / cat.blocks.length) * 100);
}

export default function EpisodesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    from: "",
    to: "",
  });

  // Modal and form state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [patientMode, setPatientMode] = useState<"select" | "new">("select");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEpisodeIds, setSelectedEpisodeIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [runningEpisodes, setRunningEpisodes] = useState<Set<string>>(new Set());
  const [episodeCats, setEpisodeCats] = useState<Record<string, CAT | null>>({});
  const [newEpisodeForm, setNewEpisodeForm] = useState({
    motif: "",
    atcds: "",
    clinique: "",
    paraclinique: "",
  });
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: "",
    age: "",
    origin: "",
  });
  const [showCATModal, setShowCATModal] = useState(false);
  const [selectedEpisodeForCAT, setSelectedEpisodeForCAT] = useState<Episode | null>(null);
  const [currentBlockIndexInModal, setCurrentBlockIndexInModal] = useState(0);
  const [episodeTimers, setEpisodeTimers] = useState<Record<string, number>>({});
  const [episodeTimerRunning, setEpisodeTimerRunning] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Record<string, Set<string>>>({}); // blockId -> Set of task ids

  const PAGE_SIZE = 8;
  const hasLoadedRef = useRef(false);

  // Load available patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch("/api/patients", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAvailablePatients(result.data);
        } else {
          setAvailablePatients([]);
        }
      } catch (error) {
        console.error("Error loading patients:", error);
        setAvailablePatients([]);
      }
    };

    loadPatients();
  }, []);

  // Load episodes from API - only once per session
  useEffect(() => {
    const loadEpisodes = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/episodes", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Convert API data to Episode format
          const convertedEpisodes: Episode[] = result.data.map((ep: any) => ({
            id: ep.id,
            entryAt: ep.entryAt,
            exitAt: ep.exitAt,
            motif: ep.motif,
            status: ep.status,
            fullname: ep.fullname,
            sex: ep.sex,
            age: ep.age,
            origin: ep.origin,
            patientId: ep.patientId,
            patientName: ep.fullname,
          }));
          setEpisodes(convertedEpisodes);

          // Load CAT data for each episode - only current block initially
          const catsData: Record<string, CAT | null> = {};
          for (const episode of convertedEpisodes) {
            try {
              const catResponse = await fetch(`/api/cat?episodeId=${episode.id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              });

              if (!catResponse.ok) {
                console.error(`Error fetching CAT for episode ${episode.id}: ${catResponse.status}`);
                catsData[episode.id] = null;
              } else {
                const catResult = await catResponse.json();
                console.log(`CAT data for episode ${episode.id}:`, catResult);

                if (catResult.success && catResult.data) {
                  const allBlocks = catResult.data.blocks || [];
                  console.log(`Found ${allBlocks.length} blocks for episode ${episode.id}`);

                  // Determine current block: use currentBlockId if set, otherwise first block
                  let currentBlockId = catResult.data.currentBlockId;
                  if (!currentBlockId && allBlocks.length > 0) {
                    currentBlockId = allBlocks[0].id;
                    console.log(`No currentBlockId set, using first block: ${currentBlockId}`);
                  }

                  // Find and load only the current block
                  const currentBlock = allBlocks.find((b: any) => b.id === currentBlockId);
                  console.log(`Current block:`, currentBlock);

                  const blocks = currentBlock ? [(() => {
                    const parsed = JSON.parse(currentBlock.content || "{}");
                    return {
                      id: currentBlock.id,
                      type: currentBlock.type,
                      tasks: parsed.tasks,
                      condition: parsed.condition,
                      options: parsed.options,
                      duration: parsed.duration,
                      completedAt: currentBlock.completedAt,
                      parentBlockIds: currentBlock.parentBlockIds,
                      childBlockIds: currentBlock.childBlockIds,
                    };
                  })()] : [];

                  catsData[episode.id] = { id: catResult.data.id, blocks, allBlocksCount: allBlocks.length };
                  console.log(`Loaded ${blocks.length} block(s) for episode ${episode.id}`);
                } else {
                  console.warn(`No CAT data found for episode ${episode.id}`);
                  catsData[episode.id] = null;
                }
              }
            } catch (error) {
              console.error(`Error loading CAT for episode ${episode.id}:`, error);
              catsData[episode.id] = null;
            }
          }
          setEpisodeCats(catsData);
          hasLoadedRef.current = true;
        } else {
          setEpisodes([]);
        }
      } catch (error) {
        console.error("Error loading episodes:", error);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && !hasLoadedRef.current) {
      loadEpisodes();
    } else if (!session?.user) {
      setLoading(false);
    }
  }, [session?.user]);

  // Timer countdown effect for episodes
  useEffect(() => {
    if (episodeTimerRunning.size === 0) return;

    const interval = setInterval(() => {
      setEpisodeTimers((prev) => {
        const updated = { ...prev };
        episodeTimerRunning.forEach((episodeId) => {
          if (updated[episodeId] && updated[episodeId] > 0) {
            updated[episodeId]--;
            // Auto-advance modal when timer finishes
            if (updated[episodeId] === 0 && showCATModal && selectedEpisodeForCAT?.id === episodeId) {
              setEpisodeTimerRunning(new Set([...episodeTimerRunning].filter(id => id !== episodeId)));
              if (currentBlockIndexInModal + 1 < (episodeCats[episodeId]?.blocks?.length ?? 0)) {
                setCurrentBlockIndexInModal(currentBlockIndexInModal + 1);
              }
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [episodeTimerRunning, showCATModal, selectedEpisodeForCAT, currentBlockIndexInModal, episodeCats]);

  // Reset modal states when episode changes
  useEffect(() => {
    if (selectedEpisodeForCAT) {
      setCurrentBlockIndexInModal(0);
      setCompletedTasks({});
    }
  }, [selectedEpisodeForCAT]);

  // Update current block in database when block index changes
  useEffect(() => {
    if (!showCATModal || !selectedEpisodeForCAT) return;

    const cat = episodeCats[selectedEpisodeForCAT.id];
    if (!cat || !cat.blocks) return;

    // Only update if within bounds (don't update for completion state)
    if (currentBlockIndexInModal < 0 || currentBlockIndexInModal >= cat.blocks.length) return;

    const currentBlock = cat.blocks[currentBlockIndexInModal];
    if (!currentBlock) return;

    const updateCurrentBlock = async () => {
      try {
        await fetch("/api/cat", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "updateCAT",
            catId: cat.id,
            currentBlockId: currentBlock.id,
          }),
        });
      } catch (error) {
        console.error("Error updating current block:", error);
      }
    };

    updateCurrentBlock();
  }, [currentBlockIndexInModal, showCATModal, selectedEpisodeForCAT, episodeCats]);

  // Helper function to advance to next block (useEffect handles database update)
  const advanceToBlock = (newBlockIndex: number) => {
    setCurrentBlockIndexInModal(newBlockIndex);
  };

  // Load all blocks for the selected episode when modal opens
  const loadAllBlocksForEpisode = async (episodeId: string) => {
    const cat = episodeCats[episodeId];
    if (!cat) return;

    try {
      const catResponse = await fetch(`/api/cat?episodeId=${episodeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const catResult = await catResponse.json();
      if (catResult.success && catResult.data && catResult.data.blocks) {
        // Convert all blocks
        const allBlocks = catResult.data.blocks.map((block: any) => {
          const parsed = JSON.parse(block.content || "{}");
          return {
            id: block.id,
            type: block.type,
            tasks: parsed.tasks,
            condition: parsed.condition,
            options: parsed.options,
            duration: parsed.duration,
            completedAt: block.completedAt,
            parentBlockIds: block.parentBlockIds,
            childBlockIds: block.childBlockIds,
          };
        });

        // Update the episodeCats with all blocks
        setEpisodeCats((prev) => ({
          ...prev,
          [episodeId]: { id: cat.id, blocks: allBlocks },
        }));

        // Reset block index to current block position
        const currentBlockId = catResult.data.currentBlockId;
        const currentIndex = currentBlockId
          ? allBlocks.findIndex((b: Block) => b.id === currentBlockId)
          : 0;
        setCurrentBlockIndexInModal(Math.max(0, currentIndex));
      }
    } catch (error) {
      console.error(`Error loading all blocks for episode ${episodeId}:`, error);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) {
      return availablePatients;
    }
    return availablePatients.filter((patient) => {
      return patient.fullName.toLowerCase().includes(query);
    });
  }, [patientSearch, availablePatients]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientMode("select");
    setPatientSearch("");
  };

  const handleCheckboxChange = (episodeId: string) => {
    const newSelected = new Set(selectedEpisodeIds);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodeIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEpisodeIds.size === paginatedEpisodes.length) {
      setSelectedEpisodeIds(new Set());
    } else {
      setSelectedEpisodeIds(new Set(paginatedEpisodes.map((ep) => ep.id)));
    }
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedEpisodeIds);

      // Delete each episode
      const deletePromises = idsToDelete.map((id) =>
        fetch(`/api/episodes?id=${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        })
      );

      const results = await Promise.all(deletePromises);
      const allSuccess = results.every((res) => res.ok);

      if (!allSuccess) {
        console.error("Some episodes failed to delete");
        return;
      }

      // Remove episodes from list
      setEpisodes((prev) =>
        prev.filter((ep) => !selectedEpisodeIds.has(ep.id))
      );
      setSelectedEpisodeIds(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting episodes:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEpisode = async () => {
    if (!newEpisodeForm.motif) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motif: newEpisodeForm.motif,
          fullname: selectedPatient?.fullName || newPatientForm.fullName,
          age: selectedPatient?.age || newPatientForm.age,
          origin: newPatientForm.origin,
          sex: "",
          patientId: selectedPatient?.id,
          atcds: newEpisodeForm.atcds,
          clinique: newEpisodeForm.clinique,
          paraclinique: newEpisodeForm.paraclinique,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Error creating episode:", result.error);
        return;
      }

      // Add new episode to list
      const newEpisode: Episode = {
        id: result.data.id,
        entryAt: result.data.entryAt,
        exitAt: result.data.exitAt,
        motif: result.data.motif,
        status: result.data.status,
        fullname: result.data.fullname,
        age: result.data.age,
        origin: result.data.origin,
        patientId: result.data.patientId,
        patientName: result.data.fullname,
      };

      setEpisodes((prev) => [newEpisode, ...prev]);

      // Reset form
      setCreateModalOpen(false);
      setPatientMode("select");
      setPatientSearch("");
      setSelectedPatient(null);
      setNewEpisodeForm({
        motif: "",
        atcds: "",
        clinique: "",
        paraclinique: "",
      });
      setNewPatientForm({
        fullName: "",
        age: "",
        origin: "",
      });
    } catch (error) {
      console.error("Error saving episode:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEpisodes = useMemo(
    () =>
      episodes.filter((episode) => {
        const query = filters.query.trim().toLowerCase();
        if (
          query &&
          !episode.fullname.toLowerCase().includes(query) &&
          !episode.motif.toLowerCase().includes(query) &&
          !episode.id.toLowerCase().includes(query)
        ) {
          return false;
        }

        if (filters.status !== "all" && episode.status !== filters.status) {
          return false;
        }

        const entryTime = new Date(episode.entryAt).getTime();

        if (filters.from) {
          const fromTime = new Date(filters.from).setHours(0, 0, 0, 0);
          if (entryTime < fromTime) {
            return false;
          }
        }

        if (filters.to) {
          const toTime = new Date(filters.to).setHours(23, 59, 59, 999);
          if (entryTime > toTime) {
            return false;
          }
        }

        return true;
      }),
    [episodes, filters]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEpisodes.length / PAGE_SIZE) || 1
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const paginatedEpisodes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEpisodes.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredEpisodes]);

  const startItem =
    filteredEpisodes.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem =
    filteredEpisodes.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, filteredEpisodes.length);

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () =>
    setFilters({
      query: filters.query,
      status: "all",
      from: "",
      to: "",
    });

  const isFilterActive =
    Boolean(filters.query.trim()) ||
    filters.status !== "all" ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("episodes.page.title")}
          </h1>
          <p className="text-sm text-slate-500">{t("episodes.page.subtitle")}</p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("episodes.buttons.newEpisode")}
        </Button>
      </section>

      <Card className="flex flex-col overflow-hidden">
        <CardContent className="flex-1 p-0">
          {/* Search and Filters Section */}
          <div className="border-b border-slate-200 bg-white px-6 py-4 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-500 focus-within:bg-white transition-all">
                <input
                  type="text"
                  placeholder={t("episodes.filters.searchPlaceholder")}
                  value={filters.query}
                  onChange={(e) =>
                    handleFilterChange("query", e.target.value)
                  }
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                {filters.query && (
                  <button
                    onClick={() => handleFilterChange("query", "")}
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {}}
                className="flex items-center justify-center rounded-lg px-3 py-3 bg-cyan-600 text-white border-2 border-cyan-600 hover:bg-cyan-700 hover:border-cyan-700 transition-all flex-shrink-0"
                aria-label="Search"
                title="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center justify-center rounded-lg px-3 py-3 text-sm font-semibold transition-all border-2 whitespace-nowrap flex-shrink-0",
                  showFilters
                    ? "bg-slate-100 text-slate-900 border-slate-400"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
                aria-label={t("episodes.aria.openFilters")}
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    showFilters ? "rotate-180" : ""
                  )}
                />
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      {t("episodes.filters.status")}
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all"
                    >
                      <option value="all">
                        {t("episodes.filters.allStatus")}
                      </option>
                      <option value="ACTIVE">
                        {t("episodes.statuses.ACTIVE")}
                      </option>
                      <option value="CLOSED">
                        {t("episodes.statuses.CLOSED")}
                      </option>
                    </select>
                  </div>

                  {/* From Date Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      {t("episodes.filters.from")}
                    </label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) =>
                        handleFilterChange("from", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all"
                    />
                  </div>

                  {/* To Date Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      {t("episodes.filters.to")}
                    </label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => handleFilterChange("to", e.target.value)}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all"
                    />
                  </div>

                  {/* Reset Button */}
                  {isFilterActive && (
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="w-full rounded-lg border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t("episodes.emptyStates.clearFilters")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          {selectedEpisodeIds.size > 0 && (
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {selectedEpisodeIds.size} selected
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-3 py-2 text-sm font-medium transition hover:bg-slate-800"
                >
                  Actions
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showActionsMenu ? "rotate-180" : ""
                    )}
                  />
                </button>
                {showActionsMenu && (
                  <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        // Start selected episodes
                        selectedEpisodeIds.forEach((episodeId) => {
                          setRunningEpisodes(new Set([...runningEpisodes, episodeId]));
                        });
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 first:rounded-t-lg font-medium border-b border-slate-100"
                    >
                      <Play className="h-4 w-4" />
                      Démarrer
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                    <button
                      onClick={() => {
                        console.log("Export selected episodes");
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 last:rounded-b-lg"
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table Section */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner label={t("episodes.loading.fetchingEpisodes")} />
            </div>
          ) : filteredEpisodes.length === 0 ? (
            episodes.length === 0 ? (
              <EmptyState
                icon={Activity}
                title={t("episodes.emptyStates.noEpisodes")}
                description={t("episodes.emptyStates.noEpisodesDesc")}
                action={
                  <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("episodes.buttons.newEpisode")}
                  </Button>
                }
              />
            ) : (
              <div className="flex h-48 items-center justify-center px-6 py-10 text-sm text-slate-500">
                <div className="text-center">
                  <p>{t("episodes.emptyStates.noResults")}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={resetFilters}
                  >
                    {t("episodes.emptyStates.clearFilters")}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700 w-12">
                        <input
                          type="checkbox"
                          checked={
                            paginatedEpisodes.length > 0 &&
                            selectedEpisodeIds.size === paginatedEpisodes.length
                          }
                          onChange={handleSelectAll}
                          className="rounded border-slate-300"
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {t("episodes.table.headers.patient")}
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {t("episodes.table.headers.motif")}
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {t("episodes.table.headers.entryDate")}
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {t("episodes.table.headers.duration")}
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {t("episodes.table.headers.status")}
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        État
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedEpisodes.map((episode) => (
                      <tr
                        key={episode.id}
                        className="transition hover:bg-slate-50 cursor-pointer"
                        onClick={(e) => {
                          // Don't open modal if clicking on checkbox or action buttons
                          const target = e.target as HTMLElement;
                          if ((target as HTMLInputElement)?.type !== "checkbox" &&
                              !target.closest('button')) {
                            setSelectedEpisodeForCAT(episode);
                            setCurrentBlockIndexInModal(0);
                            setShowCATModal(true);
                            // Load all blocks for this episode
                            loadAllBlocksForEpisode(episode.id);
                          }
                        }}
                      >
                        <td
                          className="px-6 py-3 w-12"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEpisodeIds.has(episode.id)}
                            onChange={() => handleCheckboxChange(episode.id)}
                            className="rounded border-slate-300"
                            aria-label={`Select ${episode.fullname}`}
                          />
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-900">
                          {episode.fullname}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                          {episode.motif}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatEpisodeDateTime(episode.entryAt)}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {episode.status === "ACTIVE"
                              ? t("episodes.table.ongoingStatus")
                              : calculateDuration(episode.entryAt, episode.exitAt)}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <Badge
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold",
                              statusBadgeMap[episode.status].color
                            )}
                          >
                            {t(`episodes.statuses.${episode.status}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                          <div className="space-y-3">
                            {episode.status === "CLOSED" ? (
                              <>
                                {episodeCats[episode.id]?.blocks && episodeCats[episode.id]!.blocks.length > 0 && (() => {
                                  const blocks = episodeCats[episode.id]!.blocks;
                                  const lastBlock = blocks[blocks.length - 1];
                                  return (
                                    <>
                                      <span className="text-xs bg-slate-100 px-2 py-1 rounded inline-block max-w-xs truncate">
                                        {getBlockStateDisplay(lastBlock)}
                                      </span>
                                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full"
                                          style={{ width: "100%" }}
                                        />
                                      </div>
                                      <span className="text-xs text-slate-500">100% complété</span>
                                    </>
                                  );
                                })()}
                              </>
                            ) : episodeCats[episode.id]?.blocks?.[0] ? (
                              <>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded inline-block max-w-xs truncate">
                                  {getBlockStateDisplay(episodeCats[episode.id]?.blocks?.[0]!)}
                                </span>
                                {episodeCats[episode.id]?.blocks?.[0]?.type === "WAIT" && (
                                  <div className="flex items-center gap-1">
                                    <div className="flex-1">
                                      <div className="text-xs font-semibold text-amber-600">
                                        {episodeTimers[episode.id] !== undefined
                                          ? `${String(Math.floor(episodeTimers[episode.id] / 60)).padStart(2, "0")}:${String(episodeTimers[episode.id] % 60).padStart(2, "0")}`
                                          : `${String(Math.floor((episodeCats[episode.id]?.blocks?.[0]?.duration || 0) / 60)).padStart(2, "0")}:${String((episodeCats[episode.id]?.blocks?.[0]?.duration || 0) % 60).padStart(2, "0")}`}
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const duration = episodeCats[episode.id]?.blocks?.[0]?.duration || 0;
                                        if (!episodeTimerRunning.has(episode.id)) {
                                          if (episodeTimers[episode.id] === undefined || episodeTimers[episode.id] === 0) {
                                            setEpisodeTimers({ ...episodeTimers, [episode.id]: duration });
                                          }
                                          setEpisodeTimerRunning(new Set([...episodeTimerRunning, episode.id]));
                                        }
                                      }}
                                      disabled={episodeTimerRunning.has(episode.id)}
                                      className="p-1 rounded text-slate-600 hover:bg-slate-100 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                      title="Démarrer"
                                    >
                                      <Play className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEpisodeTimerRunning(new Set([...episodeTimerRunning].filter(id => id !== episode.id)));
                                      }}
                                      disabled={!episodeTimerRunning.has(episode.id)}
                                      className="p-1 rounded text-slate-600 hover:bg-slate-100 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                      title="Pause"
                                    >
                                      <Pause className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const duration = episodeCats[episode.id]?.blocks?.[0]?.duration || 0;
                                        setEpisodeTimerRunning(new Set([...episodeTimerRunning].filter(id => id !== episode.id)));
                                        setEpisodeTimers({ ...episodeTimers, [episode.id]: duration });
                                      }}
                                      className="p-1 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-all"
                                      title="Recommencer"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">Aucun bloc</span>
                            )}
                            {episode.status !== "CLOSED" && episodeCats[episode.id]?.blocks && (
                              <>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-300"
                                    style={{
                                      width: `${calculateCATCompletion(episodeCats[episode.id])}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
                                  {calculateCATCompletion(episodeCats[episode.id])}% completé
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {startItem === 0
                    ? t("episodes.emptyStates.noResults")
                    : t("episodes.pagination.showing", {
                        startItem,
                        endItem,
                        total: filteredEpisodes.length,
                      })}
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    {t("episodes.buttons.previous")}
                  </Button>
                  <span className="text-xs text-slate-500">
                    {t("episodes.pagination.pageOf", {
                      current:
                        filteredEpisodes.length === 0 ? 0 : currentPage,
                      total:
                        filteredEpisodes.length === 0 ? 0 : totalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={currentPage === totalPages || endItem === 0}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                  >
                    {t("episodes.buttons.next")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
        }}
        title={t("episodes.deleteConfirm.title")}
        size="sm"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              {t("episodes.buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {t("episodes.loading.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t("episodes.deleteConfirm.confirm")}
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            {t("episodes.deleteConfirm.message")}
          </p>
          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
            <span className="font-medium">{selectedEpisodeIds.size}</span> {t("episodes.deleteConfirm.willDelete")}
          </p>
          <p className="text-xs text-slate-500">
            {t("episodes.deleteConfirm.warning")}
          </p>
        </div>
      </Modal>

      {/* CAT Modal - Shows CAT Blocks */}
      <Modal
        open={showCATModal}
        onClose={() => {
          setShowCATModal(false);
          setSelectedEpisodeForCAT(null);
          setCurrentBlockIndexInModal(0);
          setCompletedTasks({});
        }}
        title={`CAT - ${selectedEpisodeForCAT?.fullname || ""}`}
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCATModal(false);
                setSelectedEpisodeForCAT(null);
                setCurrentBlockIndexInModal(0);
                setCompletedTasks({});
              }}
            >
              {t("episodes.buttons.close")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowCATModal(false);
                setSelectedEpisodeForCAT(null);
                setCurrentBlockIndexInModal(0);
                setCompletedTasks({});
                router.push(`/episodes/${selectedEpisodeForCAT?.id}`);
              }}
            >
              {t("episodes.buttons.episodeDetails")}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {selectedEpisodeForCAT && episodeCats[selectedEpisodeForCAT.id]?.blocks && episodeCats[selectedEpisodeForCAT.id]!.blocks.length > 0 ? (
            <>
              {currentBlockIndexInModal < (episodeCats[selectedEpisodeForCAT.id]?.blocks?.length || 0) && (
                <>
                  {/* Progress Bar */}
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-300"
                      style={{
                        width: `${((currentBlockIndexInModal + 1) / (episodeCats[selectedEpisodeForCAT.id]?.allBlocksCount || episodeCats[selectedEpisodeForCAT.id]?.blocks?.length || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </>
              )}

              {currentBlockIndexInModal < (episodeCats[selectedEpisodeForCAT.id]?.blocks?.length || 0) && (() => {
                const cat = episodeCats[selectedEpisodeForCAT.id];
                const currentBlock = cat?.blocks[currentBlockIndexInModal];

                return (
                  <>
                    {/* Current Block */}
                    <div className="rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <Badge className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            currentBlock?.type === "ACTION"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : currentBlock?.type === "CONDITION"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}>
                            {currentBlock?.type === "ACTION"
                              ? "✓ Action"
                              : currentBlock?.type === "CONDITION"
                              ? "? Condition"
                              : "⏱ Attente"}
                          </Badge>
                        </div>
                      </div>

                      {/* Block Content */}
                      <div className="space-y-2 px-4 py-3">
                        {currentBlock?.type === "ACTION" && (
                          <div className="space-y-1.5">
                            {currentBlock.tasks && currentBlock.tasks.length > 0 ? (
                              <ul className="space-y-1">
                                {currentBlock.tasks.map((task: any, idx: number) => {
                                  const taskId = task.id || `task-${idx}`;
                                  const blockCompletedTasks = completedTasks[currentBlock.id] || new Set();
                                  const isCompleted = blockCompletedTasks.has(taskId);

                                  return (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                      <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={(e) => {
                                          const updated = new Set(blockCompletedTasks);
                                          if (e.target.checked) {
                                            updated.add(taskId);
                                          } else {
                                            updated.delete(taskId);
                                          }

                                          const newCompletedTasks = { ...completedTasks, [currentBlock.id]: updated };
                                          setCompletedTasks(newCompletedTasks);

                                          // Check if all tasks are completed
                                          if (currentBlock.tasks && updated.size === currentBlock.tasks.length) {
                                            // Auto-advance to next block
                                            advanceToBlock(currentBlockIndexInModal + 1);
                                          }
                                        }}
                                        className="h-3.5 w-3.5 rounded border-slate-300 mt-0.5 flex-shrink-0 cursor-pointer"
                                      />
                                      <span className={isCompleted ? "line-through text-slate-400" : ""}>{task.text}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-400">Aucune tâche</p>
                            )}
                          </div>
                        )}

                        {currentBlock?.type === "CONDITION" && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Condition</p>
                              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                                {currentBlock.condition || "Non définie"}
                              </p>
                            </div>
                            {currentBlock.options && currentBlock.options.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Résultats</p>
                                <div className="space-y-2">
                                  {currentBlock.options.map((option: any, idx: number) => {
                                    const childBlockId = currentBlock.childBlockIds?.[idx];
                                    const childBlock = childBlockId ? cat?.blocks?.find((b: any) => b.id === childBlockId) : null;
                                    const childBlockIndex = childBlock ? cat?.blocks?.indexOf(childBlock) : -1;

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          if (childBlockIndex !== -1 && typeof childBlockIndex === 'number') {
                                            // If current block is the last block, show completion state
                                            const isLastBlock = currentBlockIndexInModal >= (cat?.blocks?.length ?? 1) - 1;
                                            if (isLastBlock) {
                                              setCurrentBlockIndexInModal((cat?.blocks?.length ?? 0));
                                            } else {
                                              advanceToBlock(childBlockIndex as number);
                                            }
                                          }
                                        }}
                                        className="w-full text-left px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center gap-2 text-xs text-slate-700"
                                      >
                                        <span className="text-blue-600 font-bold">→</span>
                                        <span>{option.resultat} <span className="text-slate-500">{" => "}</span> {option.decision}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                        {currentBlock?.type === "WAIT" && (
                          <div className="space-y-2 bg-amber-50 border border-amber-100 rounded p-3">
                            <div className="text-center">
                              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">Durée d'attente</p>
                              <p className="text-3xl font-bold text-amber-600 font-mono">
                                {String(Math.floor((episodeTimers[selectedEpisodeForCAT.id] || ((currentBlock.duration || 0) * 60)) / 60)).padStart(2, "0")}:{String((episodeTimers[selectedEpisodeForCAT.id] || ((currentBlock.duration || 0) * 60)) % 60).padStart(2, "0")} <span className="text-sm">min</span>
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const durationInSeconds = (currentBlock.duration || 0) * 60;
                                  if (!episodeTimerRunning.has(selectedEpisodeForCAT.id)) {
                                    if (episodeTimers[selectedEpisodeForCAT.id] === undefined || episodeTimers[selectedEpisodeForCAT.id] === 0) {
                                      setEpisodeTimers({ ...episodeTimers, [selectedEpisodeForCAT.id]: durationInSeconds });
                                    }
                                    setEpisodeTimerRunning(new Set([...episodeTimerRunning, selectedEpisodeForCAT.id]));
                                  } else {
                                    setEpisodeTimerRunning(new Set([...episodeTimerRunning].filter(id => id !== selectedEpisodeForCAT.id)));
                                  }
                                }}
                                className="p-2 rounded text-amber-600 hover:bg-white transition-all"
                                title={episodeTimerRunning.has(selectedEpisodeForCAT.id) ? "Pause" : "Démarrer"}
                              >
                                {episodeTimerRunning.has(selectedEpisodeForCAT.id) ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const durationInSeconds = (currentBlock.duration || 0) * 60;
                                  setEpisodeTimerRunning(new Set([...episodeTimerRunning].filter(id => id !== selectedEpisodeForCAT.id)));
                                  setEpisodeTimers({ ...episodeTimers, [selectedEpisodeForCAT.id]: durationInSeconds });
                                }}
                                className="p-2 rounded text-slate-600 hover:bg-white transition-all"
                                title="Rembobiner"
                              >
                                <RotateCcw className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Mark timer as complete and advance
                                  setEpisodeTimerRunning(new Set([...episodeTimerRunning].filter(id => id !== selectedEpisodeForCAT.id)));
                                  setEpisodeTimers({ ...episodeTimers, [selectedEpisodeForCAT.id]: 0 });
                                  // Advance to next block
                                  advanceToBlock(currentBlockIndexInModal + 1);
                                }}
                                className="p-2 rounded text-emerald-600 hover:bg-white transition-all"
                                title="Passer"
                              >
                                <FastForward className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Next Block Preview or Completion State */}
                    {currentBlockIndexInModal + 1 < cat!.blocks.length && (() => {
                      const nextBlock = cat!.blocks[currentBlockIndexInModal + 1];
                      return (
                        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 opacity-70">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold text-slate-500">
                              {currentBlockIndexInModal + 2}
                            </div>
                            <Badge className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                              nextBlock?.type === "ACTION"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : nextBlock?.type === "CONDITION"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}>
                              {nextBlock?.type === "ACTION"
                                ? "✓ Action"
                                : nextBlock?.type === "CONDITION"
                                ? "? Condition"
                                : "⏱ Attente"}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {nextBlock && getBlockStateDisplay(nextBlock)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Completion State - Show only after moving past last block */}
                    {currentBlockIndexInModal >= cat!.blocks.length && (
                      <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                          <h3 className="text-sm font-semibold text-emerald-700">Épisode terminé</h3>
                        </div>
                        <p className="text-xs text-emerald-600 mb-4">Tous les blocs ont été complétés avec succès.</p>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch("/api/episodes", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: selectedEpisodeForCAT?.id,
                                  status: "CLOSED",
                                  exitAt: new Date().toISOString(),
                                }),
                              });
                              if (response.ok) {
                                setShowCATModal(false);
                                setSelectedEpisodeForCAT(null);
                                setCurrentBlockIndexInModal(0);
                                // Reload episodes
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error("Error closing episode:", error);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-all"
                        >
                          Marquer comme terminé
                        </button>
                      </div>
                    )}

                    {/* Block Counter */}
                    <div className="text-center px-4 py-2 border-t border-slate-100 bg-slate-50">
                      <span className="text-xs text-slate-500 font-medium">
                        {currentBlockIndexInModal + 1} / {cat!.allBlocksCount || cat!.blocks.length}
                      </span>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-slate-500 mb-4">Aucun bloc créé</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowCATModal(false);
                  setSelectedEpisodeForCAT(null);
                  setCurrentBlockIndexInModal(0);
                  router.push(`/episodes/${selectedEpisodeForCAT?.id}`);
                }}
              >
                Créer le premier bloc
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Create Episode Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setPatientMode("select");
          setPatientSearch("");
          setSelectedPatient(null);
          setNewEpisodeForm({
            motif: "",
            atcds: "",
            clinique: "",
            paraclinique: "",
          });
          setNewPatientForm({
            fullName: "",
            age: "",
            origin: "",
          });
        }}
        title={t("episodes.modal.title")}
        size="lg"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                setPatientMode("select");
                setPatientSearch("");
                setSelectedPatient(null);
                setNewEpisodeForm({
                  motif: "",
                  atcds: "",
                  clinique: "",
                  paraclinique: "",
                });
                setNewPatientForm({
                  fullName: "",
                  age: "",
                  origin: "",
                });
              }}
            >
              {t("episodes.buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEpisode}
              disabled={
                isSaving ||
                !newEpisodeForm.motif ||
                (!selectedPatient && !newPatientForm.fullName)
              }
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {t("episodes.loading.saving")}
                </>
              ) : (
                t("episodes.buttons.save")
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Patient Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-800">
              {t("episodes.modal.patient")}
            </label>
            {!selectedPatient ? (
              <div className="space-y-3">
                {/* Search for existing patient */}
                <div className="space-y-2">
                  <label htmlFor="patient-search" className="text-xs font-medium text-slate-600">
                    {t("episodes.modal.searchPatient")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="patient-search"
                      type="text"
                      placeholder={t("episodes.modal.searchPlaceholder")}
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  {patientSearch && filteredPatients.length > 0 && (
                    <div className="rounded-lg border border-slate-300 bg-white max-h-40 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-200 last:border-b-0 transition"
                        >
                          <p className="font-medium text-slate-900">{patient.fullName}</p>
                          {patient.age && (
                            <p className="text-xs text-slate-500">{patient.age} {t("episodes.modal.ageUnit")}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Or create new patient */}
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    {t("episodes.modal.orCreateNew")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder={t("episodes.modal.fullName") + " *"}
                      value={newPatientForm.fullName}
                      onChange={(e) =>
                        setNewPatientForm((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                    <input
                      type="number"
                      placeholder={t("episodes.modal.age")}
                      value={newPatientForm.age}
                      onChange={(e) =>
                        setNewPatientForm((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                    <input
                      type="text"
                      placeholder={t("episodes.modal.origin")}
                      value={newPatientForm.origin}
                      onChange={(e) =>
                        setNewPatientForm((prev) => ({
                          ...prev,
                          origin: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    {t("episodes.modal.selectedPatient")}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedPatient.fullName}
                  </p>
                  {selectedPatient.age && (
                    <p className="text-xs text-slate-500">
                      {selectedPatient.age} {t("episodes.modal.ageUnit")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch("");
                  }}
                  className="w-full text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  {t("episodes.buttons.changePatient")}
                </button>
              </div>
            )}
          </div>

          {/* Motif Field */}
          <div className="space-y-2">
            <label htmlFor="episode-motif" className="text-sm font-semibold text-slate-800">
              {t("episodes.modal.motif")} <span className="text-red-500">*</span>
            </label>
            <input
              id="episode-motif"
              type="text"
              placeholder={t("episodes.modal.motifPlaceholder")}
              value={newEpisodeForm.motif}
              onChange={(e) =>
                setNewEpisodeForm((prev) => ({
                  ...prev,
                  motif: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          {/* ATCDs Textarea */}
          <div className="space-y-2">
            <label htmlFor="episode-atcds" className="text-sm font-semibold text-slate-800">
              {t("episodes.modal.atcds")}
            </label>
            <textarea
              id="episode-atcds"
              rows={3}
              placeholder={t("episodes.modal.atcdsPlaceholder")}
              value={newEpisodeForm.atcds}
              onChange={(e) =>
                setNewEpisodeForm((prev) => ({
                  ...prev,
                  atcds: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
            />
          </div>

          {/* Clinique Textarea */}
          <div className="space-y-2">
            <label htmlFor="episode-clinique" className="text-sm font-semibold text-slate-800">
              {t("episodes.modal.clinique")}
            </label>
            <textarea
              id="episode-clinique"
              rows={3}
              placeholder={t("episodes.modal.cliniquePlaceholder")}
              value={newEpisodeForm.clinique}
              onChange={(e) =>
                setNewEpisodeForm((prev) => ({
                  ...prev,
                  clinique: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
            />
          </div>

          {/* Paraclinique Textarea */}
          <div className="space-y-2">
            <label htmlFor="episode-paraclinique" className="text-sm font-semibold text-slate-800">
              {t("episodes.modal.paraclinique")}
            </label>
            <textarea
              id="episode-paraclinique"
              rows={3}
              placeholder={t("episodes.modal.paracliniquePlaceholder")}
              value={newEpisodeForm.paraclinique}
              onChange={(e) =>
                setNewEpisodeForm((prev) => ({
                  ...prev,
                  paraclinique: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
