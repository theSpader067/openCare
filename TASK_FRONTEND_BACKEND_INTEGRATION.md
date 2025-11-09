# Task Frontend-Backend Integration Complete

## Overview

The Task CRUD operations have been fully integrated between the frontend (React components) and backend (Next.js Server Actions with Prisma). Tasks are now persisted in the database and synchronized in real-time with the user interface.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         TasksPage (src/app/(app)/tasks)             │
│  - Manages session and userId from NextAuth        │
│  - Handles all task operations                      │
│  - Maintains tasks state                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─ useSession() → Get userId
                   ├─ loadTasks() → getTasks server action
                   └─ Event Handlers → Create/Update/Delete/Toggle

┌─────────────────────────────────────────────────────┐
│      TasksSection (src/components/tasks)            │
│  - UI Component for task display                    │
│  - Handles user input and modals                    │
│  - Calls parent handlers via callbacks              │
└──────────────────┬──────────────────────────────────┘
                   │
                   └─ onTaskAdd(formData) → Creates tasks via server action
                      onTaskEdit(task) → Updates task via server action
                      onTaskDelete(id) → Deletes task via server action
                      onTaskToggle(id) → Toggles task via server action

┌─────────────────────────────────────────────────────┐
│    Server Actions (src/actions/task.ts)             │
│  - "use server" functions                           │
│  - Call Prisma ORM                                  │
│  - Validate and persist data                        │
│  - Return results to client                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   └─ Prisma Client → PostgreSQL Database
```

---

## Data Flow: Creating a Task

### Step 1: User Input
```
User enters task title(s) in TasksSection modal
User selects task type (team/private)
User clicks "Enregistrer" button
```

### Step 2: TasksSection Component
```typescript
// TasksSection.handleSaveTask() is called
const handleSaveTask = async () => {
  const formData = {
    titles: ["Design new API", "Write tests"],
    taskType: "team",
    patientName: undefined
  };

  // Call parent callback
  const createdTasks = await onTaskAdd(formData);
};
```

### Step 3: TasksPage Handler
```typescript
// handleTaskAdd receives formData
const handleTaskAdd = async (formData) => {
  // For each title, create a task on the server
  for (const title of formData.titles) {
    const result = await createTask({
      title,
      userId,
      isPrivate: formData.taskType === "private"
    });

    if (result.success && result.data) {
      createdTasks.push(result.data); // Contains real DB ID
    }
  }

  // Update state with REAL tasks (from database)
  setTasks((prevTasks) => [...prevTasks, ...createdTasks]);
  return createdTasks;
};
```

### Step 4: Server Action
```typescript
// createTask() server action runs on server
"use server"
export async function createTask({ title, userId, isPrivate }) {
  const task = await prisma.task.create({
    data: {
      title,
      creatorId: userId,
      isPrivate,
      isComplete: false
    }
  });

  return {
    success: true,
    data: convertTaskToTaskItem(task) // Returns TaskItem with real ID
  };
}
```

### Step 5: Database
```sql
INSERT INTO "Task" (title, creatorId, isPrivate, isComplete, createdAt, updatedAt)
VALUES ('Design new API', 5, false, false, NOW(), NOW())
RETURNING *;

-- Result includes real ID from database (e.g., id: 42)
```

### Step 6: Component Update
```typescript
// TasksSection receives created tasks
if (createdTasks && createdTasks.length > 0) {
  setIsAddTaskModalOpen(false); // Close modal
  // Reset form
  setTaskForm({ titles: [""], taskType: "team" });
}

// TasksPage state updates with real tasks
setTasks([
  ...prevTasks,
  {
    id: "42",           // Real database ID (as string)
    title: "Design new API",
    details: "",
    done: false,
    taskType: "team",
    delegatedTo: undefined,
    patientName: undefined
  }
]);

// Component re-renders immediately
// New task appears in the list with database-assigned ID
```

---

## Data Flow: Other Operations

### Toggle Task Completion
```
User clicks checkbox on task
  ↓
onTaskToggle(taskId) called in TasksPage
  ↓
toggleTaskCompletion(taskIdNum) server action
  ↓
Prisma updates: isComplete = !isComplete
  ↓
Task returned with updated done status
  ↓
State updated: tasks.map(t => t.id === taskId ? {...t, done: updatedData.done} : t)
  ↓
UI re-renders with updated checkbox state
```

### Edit Task
```
User clicks edit button
  ↓
TasksSection opens edit modal with task data
  ↓
User updates title
  ↓
User clicks "Enregistrer"
  ↓
onTaskEdit() called in TasksPage
  ↓
updateTask() server action
  ↓
Prisma updates task
  ↓
Updated task returned
  ↓
State updated: tasks.map(t => t.id === taskId ? updatedTask : t)
  ↓
UI re-renders with new title
```

### Delete Task
```
User clicks delete button or swipes task
  ↓
Confirmation modal shown
  ↓
User confirms deletion
  ↓
onTaskDelete() called in TasksPage
  ↓
deleteTask() server action
  ↓
Prisma deletes task
  ↓
Success returned
  ↓
State updated: tasks.filter(t => t.id !== taskId)
  ↓
UI re-renders without deleted task
```

---

## Key Implementation Details

### 1. TaskFormData Interface
```typescript
interface TaskFormData {
  titles: string[];           // Multiple tasks can be created at once
  taskType?: "team" | "private";
  patientName?: string;       // For future patient association
}
```

### 2. onTaskAdd Callback Signature
```typescript
// OLD: onTaskAdd: (task: TaskItem) => void
// NEW: onTaskAdd: (formData: TaskFormData) => Promise<TaskItem[] | null>

// Returns created tasks (with real DB IDs) or null if failed
```

### 3. Real ID Handling
- **Database**: Task IDs are integers (`Int`)
- **Frontend**: Task IDs are strings (`String`)
- **Conversion**: Done in `convertTaskToTaskItem()` via `.toString()`
- **Benefit**: Prevents ID collisions, ensures consistency

### 4. User Session Integration
```typescript
const { data: session } = useSession();
const sessionUser = session?.user as any;
const userId = sessionUser?.id ? parseInt(sessionUser.id as string) : null;

// userId is used for:
// - Creating tasks owned by user
// - Fetching user's tasks
// - Filtering visible tasks (public vs private)
```

### 5. Loading States
- `isTasksLoading`: Shows spinner while fetching tasks
- `isSaving`: Disables buttons while saving task
- `isDeleting`: Disables buttons while deleting task
- Prevents duplicate submissions and improves UX

### 6. Error Handling
```typescript
try {
  const result = await createTask(...);
  if (result.success && result.data) {
    // Add to state
  }
} catch (error) {
  console.error("Error creating task:", error);
  // Task not added to state if failed
}
```

---

## Server Action Responses

All server actions return a consistent response format:

```typescript
{
  success: boolean;
  data?: TaskItem;    // For single operations
  error?: string;     // Error message if failed
}
```

Example:
```typescript
// Success
{
  success: true,
  data: { id: "42", title: "My Task", ... }
}

// Failure
{
  success: false,
  error: "Task not found"
}
```

---

## Database Queries Generated

### Create Task
```sql
INSERT INTO "Task" (title, creatorId, isPrivate, isComplete, createdAt, updatedAt)
VALUES ('Task Title', 5, false, false, NOW(), NOW())
```

### Read Tasks
```sql
SELECT * FROM "Task"
WHERE creatorId = 5 OR isPrivate = false
ORDER BY createdAt DESC
```

### Update Task
```sql
UPDATE "Task"
SET title = 'Updated Title', isComplete = true, updatedAt = NOW()
WHERE id = 42
```

### Delete Task
```sql
DELETE FROM "Task" WHERE id = 42
```

### Toggle Completion
```sql
UPDATE "Task"
SET isComplete = NOT isComplete, updatedAt = NOW()
WHERE id = 42
```

---

## Testing the Implementation

### Test 1: Create Task
1. Navigate to `/tasks`
2. Click "+" button
3. Enter task title "Test Task"
4. Select task type (Team or Private)
5. Click "Enregistrer"
6. ✅ Task should appear in the list immediately with a database ID

### Test 2: Complete Task
1. Click checkbox on a task
2. ✅ Checkbox should update immediately
3. Task shows as completed

### Test 3: Edit Task
1. Click edit (pencil) icon
2. Change task title
3. Click "Enregistrer"
4. ✅ Task title should update immediately

### Test 4: Delete Task
1. Click delete icon or swipe task left
2. Confirm in modal
3. ✅ Task should disappear immediately

### Test 5: Reload Page
1. Create several tasks
2. Refresh the page
3. ✅ All tasks should still be present (loaded from database)

### Test 6: Multiple Users
1. Create task as User A
2. Create task as User B
3. ✅ Each user should see only their own and public tasks

---

## File Structure

```
src/
├── actions/
│   └── task.ts                    (Server actions - CRUD operations)
├── app/(app)/
│   ├── tasks/
│   │   └── page.tsx              (Tasks page - main component)
│   └── dashboard/
│       └── page.tsx              (Uses TasksSection - updated)
├── components/tasks/
│   └── TasksSection.tsx          (UI component - form handling)
├── types/
│   └── tasks.ts                  (TypeScript interfaces)
└── lib/
    └── auth.ts                   (Session management)
```

---

## Performance Optimizations

### Current Optimizations
1. **Server Actions**: Eliminate network round-trips for validation
2. **Path Revalidation**: `revalidatePath("/tasks")` keeps cache fresh
3. **Async Handlers**: Non-blocking UI updates
4. **Spinner Feedback**: Users know when operations are in progress

### Future Optimizations
1. **Optimistic Updates**: Update UI immediately, revert on error
2. **Debouncing**: Prevent rapid duplicate submissions
3. **Pagination**: Load tasks in batches for large lists
4. **Caching**: Cache tasks locally with SWR/React Query
5. **WebSockets**: Real-time updates for multi-user scenarios

---

## Security Considerations

### Current Security
1. **Server Actions**: All database queries run on server (not exposed to client)
2. **Authentication**: User ID from NextAuth session (cannot be spoofed)
3. **Privacy**: Users can only see their own private tasks
4. **Validation**: Empty titles and invalid operations are rejected

### Recommendations
1. Add rate limiting to prevent abuse
2. Add audit logging for task changes
3. Implement soft deletes for recovery
4. Add permission checks for task access
5. Validate user ID matches task creator before edit/delete

---

## Troubleshooting

### Issue: Task not appearing after creation
- Check if user is logged in (`userId` is not null)
- Check browser console for errors
- Verify Prisma is connected to database
- Check if task is being created but with wrong visibility

### Issue: Tasks not loading on page load
- Verify session is active
- Check if `useEffect` for `loadTasks()` is running
- Check if `getTasks()` server action is working
- Look at network tab for failed requests

### Issue: Checkbox not updating
- Check if `toggleTaskCompletion()` is being called
- Verify task ID is being passed correctly (should be number)
- Check for TypeScript errors in console

### Issue: Slow performance
- Check database query performance
- Use browser DevTools to profile React renders
- Consider adding React.memo for task list items
- Check for unnecessary re-renders

---

## Next Steps

1. **Patient Association**: Link tasks to specific patients
2. **Task Details**: Add description, due dates, attachments
3. **Task Templates**: Save and reuse common task patterns
4. **Task Delegation**: Assign tasks to team members
5. **Real-time Sync**: WebSocket support for team collaboration
6. **Task Statistics**: Track completion rates and trends
7. **Notifications**: Email/push notifications for task changes

---

## API Reference

### Server Actions

#### createTask(options)
Creates a new task in the database.

**Parameters:**
```typescript
{
  title: string;           // Task title (required)
  userId: number;          // User ID from session (required)
  isPrivate?: boolean;     // Default: false
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: TaskItem;         // Created task with DB ID
  error?: string;
}
```

#### getTasks(userId)
Fetches all tasks for a user.

**Parameters:**
```typescript
userId: number;  // User ID from session
```

**Returns:**
```typescript
{
  success: boolean;
  data?: TaskItem[];       // Array of tasks
  error?: string;
}
```

#### updateTask(options)
Updates an existing task.

**Parameters:**
```typescript
{
  taskId: number;          // Task ID to update
  title?: string;          // New title
  isComplete?: boolean;    // Completion status
  isPrivate?: boolean;     // Privacy setting
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: TaskItem;         // Updated task
  error?: string;
}
```

#### toggleTaskCompletion(taskId)
Toggles the completion status of a task.

**Parameters:**
```typescript
taskId: number;  // Task ID to toggle
```

**Returns:**
```typescript
{
  success: boolean;
  data?: TaskItem;   // Updated task
  error?: string;
}
```

#### deleteTask(taskId)
Deletes a task from the database.

**Parameters:**
```typescript
taskId: number;  // Task ID to delete
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

---

## Summary

The task management system is now fully functional with:
- ✅ Full CRUD operations
- ✅ Database persistence
- ✅ Real-time UI updates
- ✅ User authentication integration
- ✅ Error handling
- ✅ Loading states
- ✅ Type safety
- ✅ Clean architecture

Users can now create, read, update, and delete tasks with immediate visual feedback and database persistence.
