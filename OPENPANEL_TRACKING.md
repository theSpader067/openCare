# OpenPanel Event Tracking Implementation Guide

## Overview

This document describes how OpenPanel analytics has been integrated into the OpenCare application to track user events, task management, and activity creation **on the backend**.

All event tracking happens server-side in the API routes when data is actually created, updated, or deleted in the database. This ensures accurate tracking and reduces client-side complexity.

## Setup

OpenPanel is configured in your application:

- **Location**: `src/app/layout.tsx`
- **Configuration**:
  ```tsx
  import { OpenPanelComponent } from '@openpanel/nextjs';

  <OpenPanelComponent
    clientId={process.env.OPENPANEL_CLIENT_ID!}
    trackScreenViews={true}
  />
  ```
- **Environment Variable**: `OPENPANEL_CLIENT_ID` in `.env`

## Event Tracking Architecture

### Backend Analytics Utilities (`src/lib/server-analytics.ts`)

The event tracking is centralized in `src/lib/server-analytics.ts` which provides server-side analytics functions that send events directly to OpenPanel via HTTP requests.

**Key Benefits of Backend Tracking**:
- ✅ Guaranteed to track actual database operations
- ✅ No client-side dependencies or complexity
- ✅ More reliable and accurate data
- ✅ Events sent even if client network fails
- ✅ Cleaner frontend code

#### 1. Task Analytics (`taskServerAnalytics`)

Track task-related events:

```typescript
import { taskServerAnalytics } from '@/lib/server-analytics';

// Track task creation (in POST /api/tasks)
await taskServerAnalytics.trackTaskCreated({
  id: task.id,
  title: task.title,
  isPrivate: task.isPrivate,
  creatorId: task.creatorId,
  patientId: task.patientId,
  patientName: task.patientName,
});

// Track task update (in PUT /api/tasks/[taskId])
await taskServerAnalytics.trackTaskUpdated({
  id: task.id,
  title: task.title,
  isPrivate: task.isPrivate,
  updatedAt: task.updatedAt,
});

// Track task completion (in POST /api/tasks/[taskId]/toggle)
await taskServerAnalytics.trackTaskCompleted(taskId);

// Track task deletion (in DELETE /api/tasks/[taskId])
await taskServerAnalytics.trackTaskDeleted(taskId);
```

**Events Tracked**:
- `task_created` - When a new task is created
- `task_updated` - When a task is edited
- `task_completed` - When a task is marked as done
- `task_deleted` - When a task is deleted

#### 2. Activity Analytics (`activityServerAnalytics`)

Track activity-related events:

```typescript
import { activityServerAnalytics } from '@/lib/server-analytics';

// Track activity creation (in POST /api/activities)
await activityServerAnalytics.trackActivityCreated({
  id: activity.id,
  title: activity.title,
  category: activity.category,
  creatorId: activity.creatorId,
  place: activity.place,
  équipe: activity.équipe,
});

// Track activity update (in PUT /api/activities/[activityId])
await activityServerAnalytics.trackActivityUpdated({
  id: activity.id,
  title: activity.title,
  category: activity.category,
});

// Track activity deletion (in DELETE /api/activities/[activityId])
await activityServerAnalytics.trackActivityDeleted(activityId);
```

**Events Tracked**:
- `activity_created` - When a new activity is created
- `activity_updated` - When an activity is edited
- `activity_deleted` - When an activity is deleted

#### 3. User Analytics (`userServerAnalytics`)

Track general user actions on the backend:

```typescript
import { userServerAnalytics } from '@/lib/server-analytics';

// Track custom action
await userServerAnalytics.trackAction('user_exported_patients', {
  export_format: 'pdf',
  patient_count: 10,
});

// Track error
await userServerAnalytics.trackError('patient_export_failed', error, {
  retry_count: 2,
});
```

## Implementation Details

### How Events Are Sent

Events are sent via HTTP POST requests to OpenPanel's API endpoint:

```typescript
// Happens automatically in sendEventToOpenPanel()
POST https://api.openpanel.dev/events
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {OPENPANEL_CLIENT_ID}'
}
Body: {
  event: 'event_name',
  properties: {
    // custom properties
    timestamp: '2025-11-22T...'
  }
}
```

### Where Tracking Is Implemented

**Task API Routes**:
- `src/app/api/tasks/route.ts` - Creates tasks (POST)
- `src/app/api/tasks/[taskId]/route.ts` - Updates and deletes tasks (PUT, DELETE)
- `src/app/api/tasks/[taskId]/toggle/route.ts` - Toggles task completion (POST)

**Activity API Routes**:
- `src/app/api/activities/route.ts` - Creates activities (POST)
- `src/app/api/activities/[activityId]/route.ts` - Updates and deletes activities (PUT, DELETE)

## Event Properties Reference

### Task Events

| Property | Type | Description |
|----------|------|-------------|
| `task_id` | number | Task ID |
| `title` | string | Task title |
| `task_type` | 'team' \| 'private' | Task type |
| `patient_id` | number | Associated patient ID (optional) |
| `patient_name` | string | Associated patient name (optional) |
| `user_id` | number | Creator user ID |

### Activity Events

| Property | Type | Description |
|----------|------|-------------|
| `activity_id` | number | Activity ID |
| `title` | string | Activity title |
| `type` | string | Activity type (consultation, chirurgie, staff, tournee) |
| `location` | string | Activity location (optional) |
| `team` | string | Team/participants (optional) |
| `user_id` | number | Creator user ID |

### All Events

- `timestamp` - Added automatically (ISO 8601 format)

## Error Handling

If tracking fails (network error, API issue, etc.), the application continues normally. Tracking is non-blocking:

```typescript
try {
  const task = await prisma.task.create(/* ... */);

  // This won't crash the app if it fails
  await taskServerAnalytics.trackTaskCreated({...});

  return NextResponse.json({ success: true, data: task });
} catch (error) {
  // Application error handling
}
```

## OpenPanel Dashboard

To view your tracked events:

1. Go to [OpenPanel Dashboard](https://openpanel.dev)
2. Sign in with your account
3. Select your project
4. Navigate to "Events" to see all tracked events
5. Create dashboards and filters based on event data

## What You Can Do With Events

Once events are flowing to OpenPanel, you can:

- View real-time event streams
- Create custom dashboards and visualizations
- Filter events by properties (task type, user, etc.)
- Track user journeys and workflows
- Analyze task/activity creation patterns
- Monitor system health and error rates
- Create alerts for specific events

## Testing Event Tracking

### In Development

1. Check browser DevTools Network tab for requests to `api.openpanel.dev`
2. Create a task or activity
3. Look for POST request with event data

### In OpenPanel Dashboard

1. After creating a task/activity, wait 1-2 seconds
2. Go to OpenPanel Events page
3. Look for your event in the list

### Example Event Log

When you create a task, you should see an event like:

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

## Best Practices

1. **Async Tracking**: Tracking is async and non-blocking, but placed after database operations to ensure data consistency
2. **Include Context**: Always include relevant IDs and metadata to identify what happened
3. **Consistent Naming**: Event names use snake_case, properties use snake_case
4. **No Sensitive Data**: Never track passwords, tokens, or personal information beyond names
5. **Graceful Failures**: Tracking failures don't break the application

## Adding Tracking to New Features

To add tracking to a new feature:

1. Import the appropriate analytics utility:
   ```typescript
   import { taskServerAnalytics } from '@/lib/server-analytics';
   ```

2. Call the tracking function after a successful database operation:
   ```typescript
   const createdItem = await prisma.yourModel.create({...});

   await taskServerAnalytics.trackTaskCreated({
     id: createdItem.id,
     title: createdItem.title,
     // ... other properties
   });
   ```

3. Verify the event appears in OpenPanel dashboard within 2 seconds

## Environment Variables

Ensure these are set in your `.env` file:

```
OPENPANEL_CLIENT_ID=your_client_id_here
```

If not set, tracking silently fails and logs a warning to console without affecting application functionality.

## Troubleshooting

### Events Not Appearing in OpenPanel

1. ✅ Check `OPENPANEL_CLIENT_ID` is set in `.env`
2. ✅ Verify you can see the client ID in OpenPanel project settings
3. ✅ Check browser DevTools for network errors
4. ✅ Wait 2-3 seconds before checking OpenPanel (slight delay is normal)

### Events Appearing with Wrong Data

1. ✅ Verify property names use snake_case
2. ✅ Check that correct data is passed to tracking function
3. ✅ Ensure IDs are numbers (not strings) when expected

### Function Not Found Error

Make sure you imported from the correct module:
```typescript
import { taskServerAnalytics } from '@/lib/server-analytics'; // ✅ Correct
import { taskAnalytics } from '@/lib/analytics'; // ❌ Wrong (frontend only)
```

## Future Enhancements

Potential areas for expanded tracking:

- Patient view/search tracking
- Document upload/download tracking
- Search queries and filters used
- User preferences changes
- Authentication events (login/logout)
- Performance metrics
- Feature usage statistics

## Additional Resources

- [OpenPanel Documentation](https://docs.openpanel.dev)
- [OpenPanel Events API](https://docs.openpanel.dev/api/events)
- [Best Practices for Event Tracking](https://docs.openpanel.dev/best-practices)

---

**Last Updated**: 2025-11-22
**OpenPanel Version**: 1.0.17
**Next.js Version**: 15.5.4
**Tracking Type**: Backend (Server-side only)
