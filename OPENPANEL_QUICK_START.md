# OpenPanel Event Tracking - Backend Setup Guide

## What's Been Implemented

Your application now has **backend-only** event tracking for:

✅ **Task Management**
- Task creation
- Task updates
- Task completion (toggle done status)
- Task deletion

✅ **Activity Management**
- Activity creation
- Activity updates
- Activity deletion

All events are tracked server-side in the API routes when data is actually saved to the database.

## Files Created/Modified

### New Files
- `src/lib/server-analytics.ts` - Backend analytics utilities

### Modified Files
- `src/app/api/tasks/route.ts` - Added task creation tracking
- `src/app/api/tasks/[taskId]/route.ts` - Added task update and deletion tracking
- `src/app/api/tasks/[taskId]/toggle/route.ts` - Added task completion tracking
- `src/app/api/activities/route.ts` - Added activity creation tracking
- `src/app/api/activities/[activityId]/route.ts` - Added activity update and deletion tracking

## How It Works

When a user creates, updates, or deletes a task/activity:

1. The frontend sends a request to the API route
2. The API validates the request and modifies the database
3. **If the database operation succeeds**, the tracking event is sent to OpenPanel
4. The response is sent back to the client

Example flow for task creation:

```
Client (create task) → API Route (/api/tasks POST)
                          ↓
                    Validate request
                          ↓
                    Save to database (Prisma)
                          ↓
                    Track event → OpenPanel (async)
                          ↓
                    Return success response
```

## Using Backend Analytics

### Import the utilities

```typescript
import { taskServerAnalytics } from '@/lib/server-analytics';
import { activityServerAnalytics } from '@/lib/server-analytics';
```

### Track task events

```typescript
// In API route after creating a task
const task = await prisma.task.create({ ... });

await taskServerAnalytics.trackTaskCreated({
  id: task.id,
  title: task.title,
  isPrivate: task.isPrivate,
  creatorId: task.creatorId,
  patientId: task.patientId,
  patientName: task.patientName,
});
```

### Track activity events

```typescript
// In API route after creating an activity
const activity = await prisma.activity.create({ ... });

await activityServerAnalytics.trackActivityCreated({
  id: activity.id,
  title: activity.title,
  category: activity.category,
  creatorId: activity.creatorId,
  place: activity.place,
  équipe: activity.équipe,
});
```

## Events Being Tracked

### Task Events
- `task_created` - New task created
- `task_updated` - Task modified
- `task_completed` - Task marked as done
- `task_deleted` - Task deleted

### Activity Events
- `activity_created` - New activity created
- `activity_updated` - Activity modified
- `activity_deleted` - Activity deleted

## Viewing Your Events

1. Go to [OpenPanel Dashboard](https://openpanel.dev)
2. Log in to your account
3. Select your project
4. Go to **Events** section
5. Create a new task or activity
6. Look for your event in the list (may take 1-2 seconds to appear)

## Where Tracking Happens

### Task API Routes

| Route | Method | Event |
|-------|--------|-------|
| `/api/tasks` | POST | `task_created` |
| `/api/tasks/[id]` | PUT | `task_updated` |
| `/api/tasks/[id]` | DELETE | `task_deleted` |
| `/api/tasks/[id]/toggle` | POST | `task_completed` |

### Activity API Routes

| Route | Method | Event |
|-------|--------|-------|
| `/api/activities` | POST | `activity_created` |
| `/api/activities/[id]` | PUT | `activity_updated` |
| `/api/activities/[id]` | DELETE | `activity_deleted` |

## Adding Tracking to New Features

### Step 1: Import the analytics utility

```typescript
// In your API route file
import { taskServerAnalytics } from '@/lib/server-analytics';
```

### Step 2: Track after successful database operation

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... validation and setup ...

    // Create in database
    const item = await prisma.yourModel.create({
      data: { /* ... */ }
    });

    // Track the event
    await taskServerAnalytics.trackTaskCreated({
      id: item.id,
      title: item.title,
      isPrivate: false,
      creatorId: userId,
    });

    // Return success
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    // Handle error
  }
}
```

### Step 3: Verify in OpenPanel

1. Trigger the action in your app
2. Check OpenPanel dashboard within 2 seconds
3. Look for the event in the Events list

## Example Event Properties

When you create a task, OpenPanel receives:

```json
{
  "event": "task_created",
  "properties": {
    "task_id": 42,
    "title": "Complete review",
    "task_type": "team",
    "patient_id": 10,
    "patient_name": "John Doe",
    "user_id": 5,
    "timestamp": "2025-11-22T10:30:45.123Z"
  }
}
```

## Environment Setup

Make sure `OPENPANEL_CLIENT_ID` is set in your `.env` file:

```bash
OPENPANEL_CLIENT_ID=913189e0-98b8-4974-9884-b285e289373c
```

If not set:
- Tracking will be disabled
- A warning will be logged to console
- The application will work normally (tracking is non-blocking)

## Why Backend Tracking?

✅ **More Reliable**: Events only sent when database operations actually succeed
✅ **Simpler Code**: No tracking logic in frontend components
✅ **Better Data**: Single source of truth - what's in the database
✅ **Non-Blocking**: If OpenPanel is down, your app still works
✅ **Secure**: API credentials are server-side only

## Troubleshooting

### Events not appearing in OpenPanel

1. Check that `OPENPANEL_CLIENT_ID` is set in `.env`
2. Create a task/activity in your app
3. Wait 1-2 seconds (slight network delay)
4. Check OpenPanel Events page
5. Look for your event (newest ones are at top)

### Events appearing with incomplete data

1. Check the tracking call includes all necessary properties
2. Verify property names use snake_case
3. Make sure data types are correct (numbers, strings, etc.)

## Next Steps

✅ Events are now being tracked on the backend
✅ Check OpenPanel dashboard to see them
✅ Use the events to understand user behavior
✅ Create custom dashboards and alerts

See `OPENPANEL_TRACKING.md` for detailed documentation.

## Additional Resources

- [OpenPanel Dashboard](https://openpanel.dev)
- [OpenPanel Docs](https://docs.openpanel.dev)
- Detailed guide: `OPENPANEL_TRACKING.md`

---

**Backend Tracking Active!** Your events are flowing to OpenPanel. 🚀
