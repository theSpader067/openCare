# TeamSelector Component Integration Guide

## Overview

The `TeamSelector` component is a reusable UI component that allows users to:
- Toggle between "Privée" (private) and "Équipe" (team) modes
- When "Équipe" is selected, displays a loading spinner and fetches user's teams
- Select/deselect multiple teams with visual feedback
- Display selected teams as removable tags

## Files Created

1. **`src/components/ui/team-selector.tsx`** - The reusable component
2. **`src/lib/api/teams.ts`** - API service for fetching teams

## Component API

### Props

```typescript
interface TeamSelectorProps {
  onTeamsChange: (teams: Team[]) => void;  // Callback when teams selection changes
  selectedTeams?: Team[];                   // Pre-selected teams (optional)
  className?: string;                       // Additional CSS classes
  disabled?: boolean;                       // Disable the selector
}

interface Team {
  id: number;
  name: string;
}
```

### Returns

The component calls `onTeamsChange` with an array of selected `Team` objects whenever the selection changes.

## Integration Examples

### Example 1: In TasksSection Component

Replace the current task type toggle with the TeamSelector:

```tsx
import { TeamSelector } from "@/components/ui/team-selector";
import type { Team } from "@/components/ui/team-selector";

// In component state:
const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
const [taskType, setTaskType] = useState<"team" | "private">("team");

// In the modal form:
<TeamSelector
  onTeamsChange={(teams) => {
    setSelectedTeams(teams);
    setTaskType(teams.length > 0 ? "team" : "private");
  }}
  selectedTeams={selectedTeams}
/>

// When saving task:
const taskData = {
  titles: validTitles,
  taskType: selectedTeams.length > 0 ? "team" : "private",
  teamIds: selectedTeams.map(t => t.id),  // Add this
  // ... other fields
};
```

### Example 2: In PatientCreate Component

```tsx
import { TeamSelector } from "@/components/ui/team-selector";
import type { Team } from "@/components/ui/team-selector";

export function PatientCreate() {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  return (
    <div className="space-y-4">
      <TeamSelector
        onTeamsChange={setSelectedTeams}
        selectedTeams={selectedTeams}
      />

      {/* Rest of the form */}
    </div>
  );
}
```

### Example 3: In ActivityForm

```tsx
import { TeamSelector } from "@/components/ui/team-selector";
import type { Team } from "@/components/ui/team-selector";

export function ActivityForm() {
  const [activity, setActivity] = useState({
    title: "",
    // ... other fields
  });
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const handleSave = async () => {
    const data = {
      ...activity,
      teamIds: selectedTeams.map(t => t.id),
    };

    await createActivity(data);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={activity.title}
        onChange={(e) => setActivity({ ...activity, title: e.target.value })}
        placeholder="Activity title"
      />

      <TeamSelector
        onTeamsChange={setSelectedTeams}
        selectedTeams={selectedTeams}
      />

      <button onClick={handleSave}>Save Activity</button>
    </div>
  );
}
```

## Backend Integration

### 1. Update API Routes

Create/update `app/api/teams/route.ts`:

```typescript
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { adminId: parseInt(session.user.id) },
          { members: { some: { id: parseInt(session.user.id) } } }
        ]
      },
      select: {
        id: true,
        name: true,
      }
    });

    return Response.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return Response.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
```

### 2. Update Task API to Accept Teams

Update `app/api/tasks/route.ts`:

```typescript
export async function POST(request: Request) {
  // ... existing code ...

  const { title, isPrivate, patientId, patientName, patientAge, patientHistory, teamIds } = await request.json();

  // Create task with team connections
  const task = await prisma.task.create({
    data: {
      title,
      isPrivate,
      creatorId: session.user.id,
      patientId: patientId ? parseInt(patientId) : null,
      patientName,
      patientAge,
      patientHistory,
      teams: {
        connect: (teamIds || []).map((id: number) => ({ id }))
      }
    },
    include: {
      teams: true
    }
  });

  return Response.json({ success: true, data: task });
}
```

### 3. Update Task Type (TaskFormData Interface)

In types or the component, update `TaskFormData`:

```typescript
interface TaskFormData {
  titles: string[];
  taskType?: "team" | "private";
  teamIds?: number[];  // Add this
  patientId?: string;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
}
```

## Component Features

### Visual States

1. **Privée (Private) Mode**
   - Teams list hidden
   - Selected teams cleared
   - Teams selection is not relevant

2. **Équipe (Team) Mode**
   - Shows loading spinner while fetching teams
   - Displays list of available teams
   - Teams can be toggled on/off
   - Selected teams shown as colored badges below

### Loading Behavior

- Teams are fetched on first switch to "Équipe" mode
- Results are cached in component state
- Spinner shows during loading with "Chargement des équipes..." text

### Selected Teams Display

- Shows count of selected teams: "1 équipe sélectionnée", "2 équipes sélectionnées"
- Displays selected teams as removable badges
- Click the ✕ on a badge to deselect the team

## Styling

The component uses Tailwind CSS with the following color scheme:
- **Active button**: `bg-indigo-600 text-white`
- **Inactive button**: `bg-slate-200 text-slate-700`
- **Selected team tag**: `bg-indigo-100 border-indigo-300 ring-indigo-400`
- **Team badges**: `bg-indigo-100 text-indigo-700`

## Translation Keys

If using i18n, consider adding these keys to your translation files:

```json
{
  "team": {
    "label": "Équipe",
    "private": "Privée",
    "loading": "Chargement des équipes...",
    "noTeams": "Aucune équipe trouvée",
    "selected": "équipe sélectionnée",
    "selectedPlural": "équipes sélectionnées"
  }
}
```

## Notes

- The component is client-side only (`"use client"`)
- Teams are fetched using the standard fetch API
- The component manages local state internally
- Parent receives updates via the `onTeamsChange` callback
- No external dependencies beyond React and Lucide icons
