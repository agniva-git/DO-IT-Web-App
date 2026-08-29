import api from './client.js'

export const listHabits = () => api.get('/habits').then((res) => res.data)

export const createHabit = (habit) => api.post('/habits', habit).then((res) => res.data)

export const deleteHabit = (id) => api.delete(`/habits/${id}`)

export const listHabitLogs = () => api.get('/habits/logs').then((res) => res.data)

export const checkIn = (habitId, date, completed) =>
  api.post(`/habits/${habitId}/check-in`, { date, completed }).then((res) => res.data)

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Current streak: consecutive successful days counting back from today.
// If today isn't logged yet, counts from yesterday so an unmarked
// "today" doesn't wipe out an otherwise-intact streak.
export function calcStreak(logs, habitId) {
  const byDate = new Map(
    logs.filter((l) => l.habit_id === habitId).map((l) => [l.date, l.completed])
  )
  let streak = 0
  let cursor = new Date()
  const todayKey = cursor.toISOString().slice(0, 10)
  if (byDate.get(todayKey) !== true) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (byDate.get(key) === true) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// Consistency over the last N logged days (default 30).
export function calcConsistency(logs, habitId, days = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const relevant = logs.filter(
    (l) => l.habit_id === habitId && new Date(l.date) >= cutoff
  )
  if (relevant.length === 0) return 0
  const completed = relevant.filter((l) => l.completed).length
  return Math.round((completed / relevant.length) * 100)
}

// Last N days as [{date, completed}] for the mini history grid, oldest first.
export function lastNDays(logs, habitId, n = 14) {
  const byDate = new Map(
    logs.filter((l) => l.habit_id === habitId).map((l) => [l.date, l.completed])
  )
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, completed: byDate.get(key) === true })
  }
  return days
}