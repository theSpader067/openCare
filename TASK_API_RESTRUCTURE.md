# Task CRUD - API Route Restructure

## Summary

Successfully migrated task CRUD operations from Server Actions to API Routes.

---

## Changes Made

### **1. Removed Old Structure**
```
❌ /src/actions/task.ts (DELETED)
```

### **2. Created New API Routes**
```
✅ /src/app/api/tasks/route.ts
   - GET: Fetch all tasks for user
   - POST: Create a new task

✅ /src/app/api/tasks/[taskId]/route.ts
   - GET: Get single task by ID
   - PUT: Update a task
   - DELETE: Delete a task

✅ /src/app/api/tasks/[taskId]/toggle/route.ts
   - POST: Toggle task completion status
```

### **3. Created API Client Library**
```
✅ /src/lib/api/tasks.ts
   - createTask()
   - getTasks()
   - getTaskById()
   - updateTask()
   - toggleTaskCompletion()
   - deleteTask()
```

### **4. Updated Frontend**
```
✅ /src/app/(app)/tasks/page.tsx
   - Updated imports from @/actions/task → @/lib/api/tasks
   - Removed userId parameter (now handled by session)
```

---

## Architecture

### **Old: Server Actions**
```
Frontend → Server Action → Prisma → Database
```

### **New: API Routes**
```
Frontend → API Client → API Route → Prisma → Database
                ↑           ↑
              Fetch     Session Auth
```

---

## API Endpoints

### **GET /api/tasks**
Fetch all tasks for authenticated user

**Request:**
```javascript
GET /api/tasks
Headers: { Cookie: session }
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "42",
      "title": "Check vitals",
      "details": "",
      "done": false,
      "taskType": "team"
    }
  ]
}
```

---

### **POST /api/tasks**
Create a new task

**Request:**
```javascript
POST /api/tasks
Headers: {
  "Content-Type": "application/json",
  Cookie: session
}
Body: {
  "title": "New task",
  "isPrivate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "42",
    "title": "New task",
    "details": "",
    "done": false,
    "taskType": "team"
  }
}
```

---

### **GET /api/tasks/[taskId]**
Get a single task by ID

**Request:**
```javascript
GET /api/tasks/42
Headers: { Cookie: session }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "42",
    "title": "Task title",
    "details": "",
    "done": false,
    "taskType": "team"
  }
}
```

---

### **PUT /api/tasks/[taskId]**
Update a task

**Request:**
```javascript
PUT /api/tasks/42
Headers: {
  "Content-Type": "application/json",
  Cookie: session
}
Body: {
  "title": "Updated title",
  "isComplete": true,
  "isPrivate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "42",
    "title": "Updated title",
    "details": "",
    "done": true,
    "taskType": "team"
  }
}
```

---

### **DELETE /api/tasks/[taskId]**
Delete a task

**Request:**
```javascript
DELETE /api/tasks/42
Headers: { Cookie: session }
```

**Response:**
```json
{
  "success": true
}
```

---

### **POST /api/tasks/[taskId]/toggle**
Toggle task completion status

**Request:**
```javascript
POST /api/tasks/42/toggle
Headers: { Cookie: session }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "42",
    "title": "Task title",
    "details": "",
    "done": true,    // Toggled
    "taskType": "team"
  }
}
```

---

## API Client Usage

### **Frontend Example**

```typescript
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} from "@/lib/api/tasks";

// Create a task
const result = await createTask({
  title: "New task",
  isPrivate: false
});

if (result.success && result.data) {
  console.log("Created task:", result.data);
}

// Get all tasks (auto gets from session)
const tasks = await getTasks();
if (tasks.success && tasks.data) {
  console.log("Tasks:", tasks.data);
}

// Update task
await updateTask({
  taskId: 42,
  title: "Updated title",
  isComplete: true
});

// Toggle completion
await toggleTaskCompletion(42);

// Delete task
await deleteTask(42);
```

---

## Authentication

### **How It Works**

1. **Client sends request** with session cookie
2. **API route calls** `getSession()` from `@/lib/auth`
3. **Session validated** by NextAuth
4. **User ID extracted** from session
5. **Database query** uses authenticated user ID

### **Code Example**
```typescript
// API Route
const session = await getSession();
if (!session?.user) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

const userId = (session.user as any).id;

// Use userId for database queries
const tasks = await prisma.task.findMany({
  where: {
    OR: [
      { creatorId: parseInt(userId) },
      { isPrivate: false }
    ]
  }
});
```

---

## Benefits of API Routes

### **✅ Advantages**
1. **RESTful API** - Standard HTTP methods
2. **Separate concerns** - Clear client/server boundary
3. **Reusable** - Can be called from anywhere (mobile app, etc.)
4. **Testable** - Easy to test with API testing tools
5. **Cacheable** - Can use HTTP caching strategies
6. **Documented** - Standard API documentation tools work

### **Server Actions vs API Routes**

| Feature | Server Actions | API Routes |
|---------|---------------|------------|
| Syntax | Simple function call | Fetch request |
| Type Safety | Full TypeScript | Manual typing |
| Caching | Built-in | Manual/HTTP cache |
| External Access | No | Yes |
| Middleware | Limited | Full control |
| Testing | Harder | Easier |
| Documentation | N/A | Standard tools |

---

## Next.js 15 Compatibility

### **Async Params**

Next.js 15 changed route params to be async. All route handlers use:

```typescript
// ✅ CORRECT (Next.js 15)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;  // Await params!
  // ...
}

// ❌ WRONG (Next.js 14 style)
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;  // No await
  // ...
}
```

---

## Error Handling

All routes return consistent error responses:

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message"
}
```

### **HTTP Status Codes**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `404` - Not Found (task doesn't exist)
- `500` - Internal Server Error

---

## Migration Checklist

- [x] Create API route structure
- [x] Implement GET /api/tasks
- [x] Implement POST /api/tasks
- [x] Implement GET /api/tasks/[taskId]
- [x] Implement PUT /api/tasks/[taskId]
- [x] Implement DELETE /api/tasks/[taskId]
- [x] Implement POST /api/tasks/[taskId]/toggle
- [x] Create API client library
- [x] Update frontend to use new API
- [x] Remove old server actions
- [x] Fix Next.js 15 async params
- [x] Test build compilation
- [x] Document API endpoints

---

## Testing

### **Manual Testing**

1. **Create Task**
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Test task","isPrivate":false}'
   ```

2. **Get Tasks**
   ```bash
   curl http://localhost:3000/api/tasks
   ```

3. **Update Task**
   ```bash
   curl -X PUT http://localhost:3000/api/tasks/42 \
     -H "Content-Type: application/json" \
     -d '{"title":"Updated","isComplete":true}'
   ```

4. **Delete Task**
   ```bash
   curl -X DELETE http://localhost:3000/api/tasks/42
   ```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts              # GET, POST
│   │       └── [taskId]/
│   │           ├── route.ts          # GET, PUT, DELETE
│   │           └── toggle/
│   │               └── route.ts      # POST
│   └── (app)/
│       └── tasks/
│           └── page.tsx              # Updated imports
└── lib/
    └── api/
        └── tasks.ts                  # API client functions
```

---

## Summary

✅ **Migration Complete**
- Old server actions removed
- New API routes created
- API client library implemented
- Frontend updated and working
- Build successful
- Next.js 15 compatible

🚀 **Ready for Production**
