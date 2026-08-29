import api from './client.js'

// 'Other' isn't a real category — it's the trigger for typing a custom
// one. Custom categories the user has actually used get merged in ahead
// of it (computed from existing tasks, not stored separately).
export const DEFAULT_CATEGORIES = ['Study', 'Coding', 'Personal', 'Errand']
export const PRIORITIES = ['low', 'medium', 'high']

export const MISS_REASONS = [
  'Too difficult',
  "Didn't have time",
  'Forgot',
  'Lost motivation',
  'Not important anymore',
  'Something else'
]

export const listTasks = () => api.get('/tasks').then((res) => res.data)

export const createTask = (task) => api.post('/tasks', task).then((res) => res.data)

export const updateTask = (id, task) =>
  api.patch(`/tasks/${id}`, task).then((res) => res.data)

export const deleteTask = (id) => api.delete(`/tasks/${id}`)

export const toggleTaskComplete = (id) =>
  api.post(`/tasks/${id}/complete`).then((res) => res.data)

export const logMissReason = (id, reason) =>
  api.post(`/tasks/${id}/miss-reason`, { reason })