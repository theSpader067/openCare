# Task CRUD Implementation Guide

This document describes the complete backend and frontend implementation of Task CRUD operations.

## Overview

The Task CRUD operations have been fully integrated with Next.js Server Actions, Prisma ORM, and React components.

## Architecture

### 1. Server Actions Layer (`src/actions/task.ts`)

Contains all CRUD operations as Next.js Server Actions:

- **`createTask()`** - Create a new task
  - Parameters: `title`, `userId`, `isPrivate`
  - Returns: Created task with database ID

- **`getTasks(userId)`** - Fetch all tasks for a user
  - Parameters: `userId` (number)
  - Returns: Array of TaskItem objects

- **`getTaskById(taskId)`** - Fetch a single task
  - Parameters: `taskId` (number)
  - Returns: Single TaskItem or error

- **`updateTask()`** - Update task properties
  - Parameters: `taskId`, `title`, `isComplete`, `isPrivate`
  - Returns: Updated task

- **`toggleTaskCompletion(taskId)`** - Toggle completion status
  - Parameters: `taskId` (number)
  - Returns: Updated task with new completion status

- **`deleteTask(taskId)`** - Delete a task
  - Parameters: `taskId` (number)
  - Returns: Success status

- **`deleteMultipleTasks(taskIds)`** - Delete multiple tasks
  - Parameters: `taskIds` (number array)
  - Returns: Success status

- **`getUserCreatedTasks(userId)`** - Get tasks created by user
  - Parameters: `userId` (number)
  - Returns: Array of user's created tasks

- **`getIncompleteTasks(userId)`** - Get incomplete tasks
  - Parameters: `userId` (number)
  - Returns: Array of incomplete tasks

### 2. Database Layer (Prisma)

Tasks are stored in the `Task` model with the following fields:
- `id` (Int, auto-increment primary key)
- `title` (String)
- `creatorId` (Int, foreign key to User)
- `isPrivate` (Boolean, default: false)
- `isComplete` (Boolean, default: false)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-updated)

### 3. Frontend Components

#### TasksPage (`src/app/(app)/tasks/page.tsx`)

**Key Changes:**
- Added `useSession()` hook to get user ID
- Added `loadTasks()` effect to fetch tasks from database on mount
- Updated all task handlers to call server actions:
  - `handleTaskToggle()` - calls `toggleTaskCompletion()`
  - `handleTaskAdd()` - calls `createTask()`
  - `handleTaskEdit()` - calls `updateTask()`
  - `handleTaskDelete()` - calls `deleteTask()`
  - `handleReloadTasks()` - calls `loadTasks()`

#### TasksSection (`src/components/tasks/TasksSection.tsx`)

**Key Changes:**
- Updated callback type signatures to support async operations
  ```typescript
  onTaskToggle: (taskId: string) => void | Promise<void>;
  onTaskAdd: (task: TaskItem) => void | Promise<void>;
  onTaskEdit: (task: TaskItem) => void | Promise<void>;
  onTaskDelete: (taskId: string) => void | Promise<void>;
  ```

- Made `handleSaveTask()` and `handleConfirmDeleteTask()` async
- Added `isSaving` and `isDeleting` loading states
- Updated UI buttons to show loading state while operations complete
- Added error handling with try-catch blocks

## Data Flow

### Creating a Task

1. User fills task form in modal (TasksSection)
2. User clicks "Enregistrer" button
3. `handleSaveTask()` is called → calls `onTaskAdd()` (async)
4. `handleTaskAdd()` in TasksPage calls `createTask()` server action
5. Server action creates task in Prisma database
6. Task is returned and added to local state
7. Component re-renders with new task

### Editing a Task

1. User clicks edit button on existing task
2. Modal opens with task data
3. User updates task details
4. User clicks "Enregistrer"
5. `handleSaveTask()` is called → calls `onTaskEdit()` (async)
6. `handleTaskEdit()` in TasksPage calls `updateTask()` server action
7. Server action updates task in database
8. Updated task is returned and updates local state
9. Component re-renders with updated task

### Toggling Task Completion

1. User clicks checkbox on task
2. `onTaskToggle()` is called (async)
3. `handleTaskToggle()` in TasksPage calls `toggleTaskCompletion()` server action
4. Server action toggles `isComplete` in database
5. Updated task is returned
6. Local state is updated with new completion status
7. UI icon changes (circle → check circle)

### Deleting a Task

1. User clicks delete/swipe action on task
2. Confirmation modal opens
3. User confirms deletion
4. `handleConfirmDeleteTask()` is called (async)
5. `handleTaskDelete()` in TasksPage calls `deleteTask()` server action
6. Server action deletes task from database
7. Task is removed from local state
8. Component re-renders without the task

## ID Handling

- **Database IDs**: Stored as `Int` in Prisma/PostgreSQL
- **Frontend IDs**: Converted to `String` for consistency with React keys and component props
- **Conversion**: Done in `convertTaskToTaskItem()` function with `task.id.toString()`

## Error Handling

All server actions include:
- Try-catch blocks
- Validation (e.g., empty title checks)
- Detailed error messages
- Console logging for debugging
- Frontend error handling with user feedback

## Loading States

- Tasks are loaded on component mount via `useEffect` hook
- `isTasksLoading` state manages loading spinner
- Modal operations show loading spinner during async operations
- Buttons are disabled during operations to prevent duplicate submissions
- Touch/click handlers on task items use `void` to handle async operations

## Session Management

- User ID is extracted from `useSession()` hook
- Used for:
  - Fetching user's tasks
  - Creating tasks assigned to user
  - Filtering tasks visibility (public vs private)

## Revalidation

Server actions use `revalidatePath("/tasks")` to:
- Invalidate Next.js cache after changes
- Ensure fresh data on next render
- Trigger real-time updates if using streaming/polling

## Future Enhancements

1. **Optimistic Updates**: Update UI immediately before server confirmation
2. **Real-time Sync**: Add WebSocket support for multi-user updates
3. **Task Details**: Add description, due dates, attachments
4. **Delegation**: Support assigning tasks to other users
5. **Notifications**: Add email/push notifications for task changes
6. **Batch Operations**: Multiple select and bulk delete
7. **Task Templates**: Save common task patterns as templates
8. **Undo/Redo**: Add undo functionality for recent changes

## Testing

To test the CRUD operations:

1. **Create**: Click "+" button, fill form, click "Enregistrer"
2. **Read**: Tasks should load on page mount from database
3. **Update**: Click task, edit details, save
4. **Delete**: Click delete icon, confirm in modal
5. **Toggle**: Click checkbox to mark complete/incomplete

## Dependencies

- `next-auth` - Authentication and session management
- `@prisma/client` - Database ORM
- `next/cache` - Path revalidation
- React hooks (useState, useEffect, useRef)

## Files Modified

1. `/src/actions/task.ts` (NEW) - Server actions
2. `/src/app/(app)/tasks/page.tsx` - Tasks page integration
3. `/src/components/tasks/TasksSection.tsx` - Component async support
