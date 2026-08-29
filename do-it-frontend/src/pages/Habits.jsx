import { useState, useMemo, useEffect } from 'react'
import Button from '../components/ui/Button.jsx'
import OptionGroup from '../components/ui/OptionGroup.jsx'
import HabitCard from '../components/habits/HabitCard.jsx'
import AddHabitForm from '../components/habits/AddHabitForm.jsx'
import {
  listHabits,
  createHabit,
  deleteHabit,
  listHabitLogs,
  checkIn,
  todayISO
} from '../api/habits.js'

const TABS = [
  { value: 'build', label: 'Building' },
  { value: 'leave', label: 'Leaving' }
]

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')

  useEffect(() => {
    Promise.all([listHabits(), listHabitLogs()])
      .then(([h, l]) => {
        setHabits(h)
        setLogs(l)
      })
      .catch(() => setError('Could not load habits. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const visibleHabits = useMemo(
    () => habits.filter((h) => h.type === activeTab),
    [habits, activeTab]
  )

  const handleAddHabit = async (habit) => {
    const created = await createHabit(habit)
    setHabits((hs) => [...hs, created])
    setFormOpen(false)
  }

  const handleDeleteHabit = async (id) => {
    await deleteHabit(id)
    setHabits((hs) => hs.filter((h) => h.id !== id))
    setLogs((ls) => ls.filter((l) => l.habit_id !== id))
  }

  const handleToggleToday = async (habitId) => {
    const today = todayISO()
    const existing = logs.find((l) => l.habit_id === habitId && l.date === today)
    const nextCompleted = existing ? !existing.completed : true

    // Optimistic update first, then sync — the check-in button should
    // feel instant.
    setLogs((ls) => {
      if (existing) {
        return ls.map((l) =>
          l.habit_id === habitId && l.date === today
            ? { ...l, completed: nextCompleted }
            : l
        )
      }
      return [...ls, { habit_id: habitId, date: today, completed: nextCompleted }]
    })

    try {
      await checkIn(habitId, today, nextCompleted)
    } catch {
      // Roll back on failure.
      setLogs((ls) =>
        existing
          ? ls.map((l) =>
              l.habit_id === habitId && l.date === today
                ? { ...l, completed: existing.completed }
                : l
            )
          : ls.filter((l) => !(l.habit_id === habitId && l.date === today))
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading habits…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-10">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Habits</h1>
          <p className="text-paper/50 mt-1">Small, repeated, consistent.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Add habit</Button>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="mb-6">
        <OptionGroup options={TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      {visibleHabits.length === 0 ? (
        <p className="text-paper/40 text-sm">
          {activeTab === 'build'
            ? 'No habits you\u2019re building yet — add one to start a streak.'
            : 'No habits you\u2019re leaving behind yet — add one to start tracking.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logs}
              onToggleToday={handleToggleToday}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      )}

      <AddHabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleAddHabit}
        defaultType={activeTab}
      />
    </div>
  )
}