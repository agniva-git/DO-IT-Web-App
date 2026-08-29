import api from './client.js'

export const listGoals = () => api.get('/study/goals').then((res) => res.data)

export const createGoal = (goal) => api.post('/study/goals', goal).then((res) => res.data)

export const updateGoal = (id, goal) =>
  api.patch(`/study/goals/${id}`, goal).then((res) => res.data)

export const deleteGoal = (id) => api.delete(`/study/goals/${id}`)

export const listSessions = () => api.get('/study/sessions').then((res) => res.data)

export const createSession = (session) =>
  api.post('/study/sessions', session).then((res) => res.data)

// ISO date of the most recent Monday, used to compute "this week" totals.
export function startOfThisWeek() {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}