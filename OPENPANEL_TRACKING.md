# OpenPanel Event Tracking Implementation Guide

## Overview

This document describes how OpenPanel analytics has been integrated into the OpenCare application to track user events, task management, and activity creation.

## Setup

OpenPanel is already configured in your application:

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

### Analytics Utilities (`src/lib/analytics.ts`)

The event tracking is centralized in `src/lib/analytics.ts` which provides three main analytics modules:

#### 1. Task Analytics (`taskAnalytics`)

Track task-related events:

```typescript
import { taskAnalytics } from '@/lib/analytics';
import { useOpenPanel } from '@openpanel/nextjs';

const MyComponent = () => {
  const op = useOpenPanel();

  // Track when user opens add task modal
  taskAnalytics.trackAddTaskModalOpened(op);

  // Track task creation
  taskAnalytics.trackTaskCreated(op, {
    taskId: task.id,
    title: task.title,
    taskType: 'team', // or 'private'
    patientId: patient?.id,
    patientName: patient?.name,
    isMultiple: false,
    taskCount: 1,
  });

  // Track task update
  taskAnalytics.trackTaskUpdated(op, {
    taskId: task.id,
    title: task.title,
    taskType: 'team',
    status: 'updated',
  });

  // Track task completion (toggle)
  taskAnalytics.trackTaskCompleted(op, taskId);

  // Track task deletion
  taskAnalytics.trackTaskDeleted(op, taskId);
};
```

**Events Tracked**:
- `task_created` - When a new task is created
- `task_updated` - When a task is edited
- `task_completed` - When a task is marked as done
- `task_deleted` - When a task is deleted
- `add_task_modal_opened` - When the add task dialog is opened

#### 2. Activity Analytics (`activityAnalytics`)

Track activity-related events:

```typescript
import { activityAnalytics } from '@/lib/analytics';
import { useOpenPanel } from '@openpanel/nextjs';

const MyComponent = () => {
  const op = useOpenPanel();

  // Track when user opens add activity modal
  activityAnalytics.trackAddActivityModalOpened(op);

  // Track activity creation
  activityAnalytics.trackActivityCreated(op, {
    activityId: activity.id,
    title: activity.title,
    type: 'consultation', // or 'chirurgie', 'staff', 'tournee'
    location: activity.location,
    team: activity.team,
  });

  // Track activity update
  activityAnalytics.trackActivityUpdated(op, {
    activityId: activity.id,
    title: activity.title,
    type: 'consultation',
    status: 'updated',
  });

  // Track activity completion
  activityAnalytics.trackActivityCompleted(op, activityId);

  // Track activity deletion
  activityAnalytics.trackActivityDeleted(op, activityId);
};
```

**Events Tracked**:
- `activity_created` - When a new activity is created
- `activity_updated` - When an activity is edited
- `activity_completed` - When an activity is marked as done
- `activity_deleted` - When an activity is deleted
- `add_activity_modal_opened` - When the add activity dialog is opened

#### 3. User Analytics (`userAnalytics`)

Track general user actions and page views:

```typescript
import { userAnalytics } from '@/lib/analytics';
import { useOpenPanel } from '@openpanel/nextjs';

const MyComponent = () => {
  const op = useOpenPanel();

  // Track page view
  userAnalytics.trackPageView(op, 'dashboard');
  userAnalytics.trackPageView(op, 'patients');
  userAnalytics.trackPageView(op, 'tasks');

  // Track custom action
  userAnalytics.trackAction(op, 'user_exported_data', {
    export_format: 'pdf',
    data_type: 'patients',
  });

  // Track error
  const error = new Error('Failed to create task');
  userAnalytics.trackError(op, 'task_creation_failed', error);
};
```

**Events Tracked**:
- `page_viewed` - When user navigates to a page
- `[custom_action]` - Custom user actions (e.g., 'user_exported_data')
- `error_occurred` - When an error happens in the app

## Implementation Examples

### Example 1: Task Creation Tracking (TasksSection.tsx)

```typescript
import { taskAnalytics } from '@/lib/analytics';
import { useOpenPanel } from '@openpanel/nextjs';

export const TasksSection = forwardRef<TasksSectionRef, TasksSectionProps>(
  function TasksSection({ onTaskAdd, ...props }, ref) {
    const op = useOpenPanel();

    const handleSaveTask = async () => {
      const createdTasks = await onTaskAdd(taskData);

      if (createdTasks && createdTasks.length > 0) {
        // Track each created task
        createdTasks.forEach((task) => {
          taskAnalytics.trackTaskCreated(op, {
            taskId: task.id,
            title: task.title,
            taskType: task.taskType,
            patientId: task.patientId,
            patientName: task.patientName,
            isMultiple: createdTasks.length > 1,
            taskCount: createdTasks.length,
          });
        });

        setIsAddTaskModalOpen(false);
        await loadTasks();
      }
    };

    const handleOpenAddTaskModal = () => {
      setIsAddTaskModalOpen(true);
      taskAnalytics.trackAddTaskModalOpened(op);
    };

    const handleConfirmDeleteTask = async () => {
      if (taskToDelete) {
        await onTaskDelete(taskToDelete.id);
        taskAnalytics.trackTaskDeleted(op, taskToDelete.id);
        // ... rest of delete logic
      }
    };

    // ... rest of component
  }
);
```

### Example 2: Activity Creation Tracking (Dashboard)

```typescript
import { activityAnalytics } from '@/lib/analytics';

export default function DashboardPage() {
  const op = useOpenPanel();

  const handleAddActivity = async () => {
    const result = await createActivity({
      title: activityForm.title,
      type: activityForm.type,
      // ... other properties
    });

    if (result.success && result.data) {
      activityAnalytics.trackActivityCreated(op, {
        activityId: result.data.id,
        title: result.data.title,
        type: result.data.type,
        location: result.data.location,
        team: result.data.team,
      });

      setIsAddActivityModalOpen(false);
      await activitySectionRef.current?.refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      const result = await deleteActivity(parseInt(activityToDelete.id));
      if (result.success) {
        activityAnalytics.trackActivityDeleted(op, parseInt(activityToDelete.id));
        // ... rest of delete logic
      }
    }
  };

  return (
    // ... JSX
  );
}
```

### Example 3: Page View Tracking

```typescript
import { userAnalytics } from '@/lib/analytics';

export default function DashboardPage() {
  const op = useOpenPanel();

  // Track page view on mount
  useEffect(() => {
    userAnalytics.trackPageView(op, 'dashboard');
  }, [op]);

  return (
    // ... JSX
  );
}
```

## Event Properties Reference

### Task Events

| Property | Type | Description |
|----------|------|-------------|
| `taskId` | string \| number | Task ID |
| `title` | string | Task title |
| `taskType` | 'team' \| 'private' | Task type |
| `patientId` | string \| number | Associated patient ID (optional) |
| `patientName` | string | Associated patient name (optional) |
| `isMultiple` | boolean | Whether multiple tasks were created |
| `taskCount` | number | Number of tasks created |
| `status` | string | Task status |

### Activity Events

| Property | Type | Description |
|----------|------|-------------|
| `activityId` | string \| number | Activity ID |
| `title` | string | Activity title |
| `type` | string | Activity type (consultation, chirurgie, staff, tournee) |
| `location` | string | Activity location (optional) |
| `team` | string | Team/participants (optional) |
| `status` | string | Activity status |

### User Action Events

| Property | Type | Description |
|----------|------|-------------|
| `page_name` | string | Page name (for page views) |
| `error_action` | string | Action that caused error (for errors) |
| `error_message` | string | Error message (for errors) |
| Custom properties | any | Any custom properties |

## OpenPanel Dashboard

To view your tracked events:

1. Go to [OpenPanel Dashboard](https://openpanel.dev)
2. Sign in with your account
3. Select your project
4. Navigate to "Events" to see all tracked events
5. Create dashboards and filters based on event data

## Event Data Available in OpenPanel

Once events are sent to OpenPanel, you can:

- View real-time event streams
- Create custom dashboards
- Filter events by properties
- Track user journeys
- Analyze task/activity creation patterns
- Monitor error rates
- Create alerts for specific events

## Pages with Tracking Implemented

✅ **Dashboard** (`src/app/(app)/dashboard/page.tsx`)
- Page view tracking
- Task creation/update/delete/complete tracking
- Activity creation/update/delete/complete tracking

✅ **TasksSection Component** (`src/components/tasks/TasksSection.tsx`)
- Add task modal opened
- Task created
- Task updated
- Task completed
- Task deleted

✅ **ActivitySection Component** (via Dashboard)
- Add activity modal opened
- Activity created
- Activity updated
- Activity completed
- Activity deleted

## Best Practices

1. **Track at the Right Time**: Track events after confirmation of success, not before
2. **Include Relevant Context**: Always include properties that help identify what happened
3. **Use Consistent Naming**: Use snake_case for event names and properties
4. **Avoid Sensitive Data**: Never track passwords, tokens, or personal information
5. **Test Your Tracking**: Check OpenPanel dashboard to verify events are being sent
6. **Use Timestamps**: All events are automatically timestamped by the SDK

## Troubleshooting

### Events Not Appearing in OpenPanel

1. Check that `OPENPANEL_CLIENT_ID` environment variable is set
2. Verify OpenPanel component is initialized in `src/app/layout.tsx`
3. Open browser DevTools to see if network requests are being made
4. Check OpenPanel dashboard for any errors in project settings

### Events Appearing with Wrong Data

1. Verify property names match expected format (snake_case)
2. Check that data is being correctly passed to tracking functions
3. Ensure timestamps are being sent with events

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
- [Next.js SDK Documentation](https://docs.openpanel.dev/sdks/nextjs)
- [Event Best Practices](https://docs.openpanel.dev/best-practices)

---

**Last Updated**: 2025-11-22
**OpenPanel Version**: 1.0.17
**Next.js Version**: 15.5.4
