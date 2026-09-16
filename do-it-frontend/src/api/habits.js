import api from './client.js'
import { localDateISO, daysAgoISO as _daysAgoISO } from '../utils/date.js'

export const listHabits = () => api.get('/habits').then((res) => res.data)

export const createHabit = (habit) => api.post('/habits', habit).then((res) => res.data)

export const deleteHabit = (id) => api.delete(`/habits/${id}`)

export const listHabitLogs = () => api.get('/habits/logs').then((res) => res.data)

export const checkIn = (habitId, date, completed) =>
  api.post(`/habits/${habitId}/check-in`, { date, completed }).then((res) => res.data)

// Re-exported as todayISO so existing callers (Dashboard, Habits page, etc.)
// don't need mass-import updates — they still import { todayISO } from './habits'.
export const todayISO = localDateISO


// Current streak: consecutive successful days counting back from today.
// If today isn't logged yet, counts from yesterday so an unmarked
// "today" doesn't wipe out an otherwise-intact streak.
export function calcStreak(logs, habitId) {
  const byDate = new Map(
    logs.filter((l) => l.habit_id === habitId).map((l) => [l.date, l.completed])
  )
  let streak = 0
  let cursor = new Date()
  const todayKey = localDateISO(cursor)
  if (byDate.get(todayKey) !== true) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const key = localDateISO(cursor)
    if (byDate.get(key) === true) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// Number of completed days in the last N calendar days (default 30).
export function calcDaysCompleted(logs, habitId, days = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)
  const cutoffStr = localDateISO(cutoff)
  const relevant = logs.filter(
    (l) => l.habit_id === habitId && l.date >= cutoffStr && l.completed === true
  )
  const uniqueDates = new Set(relevant.map((l) => l.date))
  return uniqueDates.size
}

// Consistency over the last N calendar days (default 30).
export function calcConsistency(logs, habitId, days = 30) {
  const completed = calcDaysCompleted(logs, habitId, days)
  return Math.round((completed / days) * 100)
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
    const key = localDateISO(d)
    days.push({ date: key, completed: byDate.get(key) === true })
  }
  return days
}