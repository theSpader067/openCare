import type { Team } from "@/components/ui/team-selector";

/**
 * Get all teams for the current user
 */
export async function getTeams(): Promise<{
  success: boolean;
  data?: Team[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/teams", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch teams",
    };
  }
}

/**
 * Get a single team by ID
 */
export async function getTeamById(teamId: number): Promise<{
  success: boolean;
  data?: Team;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/teams/${teamId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching team:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch team",
    };
  }
}
