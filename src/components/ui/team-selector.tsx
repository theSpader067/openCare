"use client";

import { useEffect, useState } from "react";
import { Check, Users, Lock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface Team {
  id: number;
  name: string;
}

interface TeamSelectorProps {
  onTeamsChange: (teams: Team[]) => void;
  selectedTeams?: Team[];
  className?: string;
  disabled?: boolean;
}

export function TeamSelector({
  onTeamsChange,
  selectedTeams = [],
  className,
  disabled = false,
}: TeamSelectorProps) {
  const [selectionMode, setSelectionMode] = useState<"private" | "team">("private");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [localSelectedTeams, setLocalSelectedTeams] = useState<Team[]>(selectedTeams);

  // Fetch teams when mode changes to "team"
  useEffect(() => {
    if (selectionMode === "team" && teams.length === 0 && !isLoadingTeams) {
      loadTeams();
    }
  }, [selectionMode]);

  const loadTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const response = await fetch("/api/teams", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setTeams(result.data);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleTeamToggle = (team: Team) => {
    setLocalSelectedTeams((prev) => {
      const isSelected = prev.some((t) => t.id === team.id);
      const updated = isSelected
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team];

      onTeamsChange(updated);
      return updated;
    });
  };

  const handleModeChange = (mode: "private" | "team") => {
    setSelectionMode(mode);
    // Clear selected teams when switching to private
    if (mode === "private") {
      setLocalSelectedTeams([]);
      onTeamsChange([]);
    }
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Mode Toggle */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleModeChange("team")}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition duration-200",
              selectionMode === "team"
                ? "bg-indigo-600 text-white shadow-md hover:shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            <Users className="h-4.5 w-4.5" />
            Équipe
          </button>
          <button
            onClick={() => handleModeChange("private")}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition duration-200",
              selectionMode === "private"
                ? "bg-slate-800 text-white shadow-md hover:shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            <Lock className="h-4.5 w-4.5" />
            Privée
          </button>
        </div>
      </div>

      {/* Teams List - Only show when in "team" mode */}
      {selectionMode === "team" && (
        <div className="px-6 py-4 bg-slate-50/50 rounded-xl space-y-4">
          {isLoadingTeams ? (
            <div className="flex items-center justify-center py-8">
              <Spinner label="Chargement des équipes..." />
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 font-medium">
                Aucune équipe trouvée
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Sélectionnez vos équipes
              </p>
              <div className="space-y-2.5">
                {teams.map((team) => {
                  const isSelected = localSelectedTeams.some((t) => t.id === team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => handleTeamToggle(team)}
                      disabled={disabled}
                      type="button"
                      className={cn(
                        "w-full px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 flex items-center justify-between",
                        isSelected
                          ? "bg-white border-indigo-400 ring-2 ring-offset-2 ring-indigo-400 shadow-md hover:shadow-lg"
                          : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                      )}
                    >
                      <span className={isSelected ? "text-indigo-700 font-semibold" : ""}>
                        {team.name}
                      </span>
                      {isSelected && (
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Teams Display */}
          {localSelectedTeams.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                {localSelectedTeams.length} équipe{localSelectedTeams.length > 1 ? "s" : ""} sélectionnée{localSelectedTeams.length > 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {localSelectedTeams.map((team) => (
                  <div
                    key={team.id}
                    className="inline-flex items-center gap-2.5 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <span>{team.name}</span>
                    <button
                      onClick={() => handleTeamToggle(team)}
                      disabled={disabled}
                      type="button"
                      className="text-white hover:text-indigo-100 transition duration-200 font-bold ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
