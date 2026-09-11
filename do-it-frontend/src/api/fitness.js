import api from './client.js'

// Universal body parts list for logging workout sessions
export const BODY_PARTS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Abs',
  'Glutes',
  'Legs'
]

export const FITNESS_GOALS = [
  { value: 'general', label: 'General fitness' },
  { value: 'strength', label: 'Strength' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'walking', label: 'Walking' },
  { value: 'running', label: 'Running' },
  { value: 'sports', label: 'Sports' },
  { value: 'custom', label: 'Custom' },
  { value: 'none', label: 'No fitness goal' }
]

// Single source of truth for the "no fitness goal" acknowledgment — used
// at Registration and the Fitness page's edit-goal flow, so the
// requirement stays identical everywhere the goal can be set or changed.
export const FITNESS_ACK_PHRASE = 'I understand this may affect my health'

export const FREQUENCY_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export const listWorkouts = () => api.get('/fitness/workouts').then((res) => res.data)

export const createWorkout = (workout) =>
  api.post('/fitness/workouts', workout).then((res) => res.data)

export const getPreferences = () =>
  api.get('/users/me/preferences').then((res) => res.data)

export const updatePreferences = (preferences) =>
  api.patch('/users/me/preferences', preferences).then((res) => res.data)

export function startOfThisWeek() {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function startOfThisMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}