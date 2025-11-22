# OpenPanel Event Tracking - Quick Start Guide

## What's Been Set Up

Your application now has comprehensive event tracking for:

✅ **Task Management**
- Task creation (single and multiple)
- Task updates
- Task completion (toggle done status)
- Task deletion
- Add task modal opened

✅ **Activity Management**
- Activity creation (consultation, chirurgie, staff, tournee)
- Activity updates
- Activity completion
- Activity deletion
- Add activity modal opened

✅ **Page Views**
- Dashboard page tracking

✅ **Error Tracking**
- Application error tracking

## Files Modified/Created

### New Files
- `src/lib/analytics.ts` - Central analytics utilities module

### Modified Files
- `src/components/tasks/TasksSection.tsx` - Added task tracking
- `src/app/(app)/dashboard/page.tsx` - Added activity and page view tracking

## How to Use in Your Code

### Import the Analytics Module

```typescript
import { taskAnalytics, activityAnalytics, userAnalytics } from '@/lib/analytics';
import { useOpenPanel } from '@openpanel/nextjs';
```

### Track Task Events

```typescript
const op = useOpenPanel();

// When user opens add task modal
taskAnalytics.trackAddTaskModalOpened(op);

// When task is created
taskAnalytics.trackTaskCreated(op, {
  taskId: '123',
  title: 'Complete review',
  taskType: 'team',
  patientId: '456',
  patientName: 'John Doe',
  taskCount: 1,
});

// When task is toggled complete
taskAnalytics.trackTaskCompleted(op, '123');

// When task is deleted
taskAnalytics.trackTaskDeleted(op, '123');

// When task is updated
taskAnalytics.trackTaskUpdated(op, {
  taskId: '123',
  title: 'Updated title',
  taskType: 'team',
});
```

### Track Activity Events

```typescript
const op = useOpenPanel();

// When user opens add activity modal
activityAnalytics.trackAddActivityModalOpened(op);

// When activity is created
activityAnalytics.trackActivityCreated(op, {
  activityId: '789',
  title: 'Consultation with patient',
  type: 'consultation',
  location: 'Room 101',
  team: 'Dr. Smith, Nurse Jane',
});

// When activity is toggled complete
activityAnalytics.trackActivityCompleted(op, '789');

// When activity is deleted
activityAnalytics.trackActivityDeleted(op, '789');

// When activity is updated
activityAnalytics.trackActivityUpdated(op, {
  activityId: '789',
  title: 'Updated title',
  type: 'consultation',
});
```

### Track Page Views

```typescript
const op = useOpenPanel();

// On component mount, track page view
useEffect(() => {
  userAnalytics.trackPageView(op, 'dashboard');
}, [op]);
```

### Track Custom Actions

```typescript
const op = useOpenPanel();

// Track any custom action
userAnalytics.trackAction(op, 'user_exported_patients', {
  export_format: 'pdf',
  patient_count: 10,
});

// Track errors
try {
  // Some operation
} catch (error) {
  userAnalytics.trackError(op, 'patient_export_failed', error);
}
```

## Viewing Your Events

1. Go to [OpenPanel Dashboard](https://openpanel.dev)
2. Log in to your account
3. Select your project
4. Go to **Events** section
5. You should see events like:
   - `task_created`
   - `activity_created`
   - `task_completed`
   - `activity_deleted`
   - `page_viewed`
   - etc.

## Where to Add More Tracking

### Add Tracking to Patients Page

```typescript
// src/app/(app)/patients/page.tsx
import { userAnalytics } from '@/lib/analytics';

export default function PatientsPage() {
  const op = useOpenPanel();

  useEffect(() => {
    userAnalytics.trackPageView(op, 'patients');
  }, [op]);

  // ... rest of component
}
```

### Add Tracking to Task Completion in API

You could also add tracking in the API route handlers for server-side events:

```typescript
// src/app/api/tasks/[taskId]/toggle/route.ts
// After successful toggle, consider logging to a server-side analytics service
```

### Add Tracking to User Authentication

```typescript
// src/app/login/page.tsx
const handleLogin = async (credentials) => {
  try {
    const result = await signIn('credentials', credentials);
    if (result?.ok) {
      userAnalytics.trackAction(op, 'user_logged_in', {
        login_method: 'email',
      });
    }
  } catch (error) {
    userAnalytics.trackError(op, 'login_failed', error);
  }
};
```

## Event Properties You Can Track

Any custom properties can be added. Common ones:

```typescript
// Task properties
{
  taskId: string | number,
  title: string,
  taskType: 'team' | 'private',
  patientId: string | number,
  patientName: string,
  taskCount: number,
  isMultiple: boolean,
  status: string,
}

// Activity properties
{
  activityId: string | number,
  title: string,
  type: 'consultation' | 'chirurgie' | 'staff' | 'tournee',
  location: string,
  team: string,
  status: string,
}

// Custom properties
{
  any_property: string | number | boolean,
  nested_properties: 'supported',
  timestamps: 'added_automatically',
}
```

## Testing Your Tracking

1. Open your browser DevTools (F12)
2. Go to **Network** tab
3. Perform an action (create task, activity, etc.)
4. Look for requests to `api.openpanel.dev`
5. Check the payload to see what's being sent

## Disable Events (If Needed)

To temporarily disable event tracking:

```typescript
// Set an environment variable
NEXT_PUBLIC_DISABLE_ANALYTICS=true

// Then check in your code
if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS !== 'true') {
  op.track('event_name', properties);
}
```

## Next Steps

1. ✅ Events are now tracking automatically
2. View events in OpenPanel dashboard
3. Create custom dashboards and reports
4. Set up alerts for important events
5. Add tracking to additional pages as needed

## Support

- See `OPENPANEL_TRACKING.md` for detailed documentation
- Check [OpenPanel Docs](https://docs.openpanel.dev) for API reference
- Review implementation examples in the tracking file

---

**Ready to track!** Your events are now flowing to OpenPanel. 🚀
