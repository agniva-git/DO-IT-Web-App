// Shaped like the `tasks` table from the blueprint's DB schema and the
// GET /tasks response. Swap for a real fetch once FastAPI is live.
export const mockTasks = [
  {
    id: 1,
    title: 'Physics Assignment — Chapter 4',
    description: 'Problems 1 through 12, show full working.',
    priority: 'high',
    status: 'pending',
    category: 'Study',
    dueDate: '2026-08-13',
    estimatedMinutes: 90,
    missCount: 0
  },
  {
    id: 2,
    title: 'Java — OOP practice set',
    description: '',
    priority: 'medium',
    status: 'pending',
    category: 'Coding',
    dueDate: '2026-08-14',
    estimatedMinutes: 60,
    missCount: 3
  },
  {
    id: 3,
    title: 'Read Chapter 2 — Data Structures',
    description: '',
    priority: 'low',
    status: 'completed',
    category: 'Study',
    dueDate: '2026-08-10',
    estimatedMinutes: 45,
    missCount: 0
  }
]

export const CATEGORIES = ['Study', 'Coding', 'Personal', 'Errand', 'Other']
export const PRIORITIES = ['low', 'medium', 'high']

export const MISS_REASONS = [
  'Too difficult',
  "Didn't have time",
  'Forgot',
  'Lost motivation',
  'Not important anymore',
  'Something else'
]