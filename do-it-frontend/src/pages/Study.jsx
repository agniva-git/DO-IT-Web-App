import { useState, useMemo, useEffect } from 'react'
import Button from '../components/ui/Button.jsx'
import StudyGoalCard from '../components/study/StudyGoalCard.jsx'
import StudyGoalForm from '../components/study/StudyGoalForm.jsx'
import LogSessionForm from '../components/study/LogSessionForm.jsx'
import SessionHistoryList from '../components/study/SessionHistoryList.jsx'
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  listSessions,
  createSession,
  startOfThisWeek
} from '../api/study.js'
import { localDateISO } from '../utils/date.js'

export default function Study() {
  const [goals, setGoals] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [goalFormOpen, setGoalFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)

  useEffect(() => {
    Promise.all([listGoals(), listSessions()])
      .then(([g, s]) => {
        setGoals(g)
        setSessions(s)
      })
      .catch(() => setError('Could not load study data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const minutesTodayBySubject = useMemo(() => {
    const todayStr = localDateISO()
    const totals = {}
    for (const s of sessions) {
      if (s.date === todayStr) {
        totals[s.subject] = (totals[s.subject] || 0) + s.duration
      }
    }
    return totals
  }, [sessions])

  const minutesThisWeekBySubject = useMemo(() => {
    const monday = startOfThisWeek()
    const totals = {}
    for (const s of sessions) {
      if (new Date(s.date) >= monday) {
        totals[s.subject] = (totals[s.subject] || 0) + s.duration
      }
    }
    return totals
  }, [sessions])

  const handleSaveGoal = async (formData) => {
    if (editingGoal) {
      const updated = await updateGoal(editingGoal.id, formData)
      setGoals((gs) => gs.map((g) => (g.id === editingGoal.id ? updated : g)))
    } else {
      const created = await createGoal(formData)
      setGoals((gs) => [...gs, created])
    }
    setGoalFormOpen(false)
    setEditingGoal(null)
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setGoalFormOpen(true)
  }

  const handleDeleteGoal = async (id) => {
    await deleteGoal(id)
    setGoals((gs) => gs.filter((g) => g.id !== id))
  }

  const handleLogSession = async (session) => {
    const created = await createSession(session)
    setSessions((ss) => [...ss, created])
    setSessionFormOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading study data…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl">Study</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="subtle" onClick={() => setSessionFormOpen(true)} disabled={goals.length === 0}>
            Log session
          </Button>
          <Button
            onClick={() => {
              setEditingGoal(null)
              setGoalFormOpen(true)
            }}
          >
            + Add subject goal
          </Button>
        </div>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {goals.length === 0 ? (
        <p className="text-paper/40 text-sm mb-8">
          No study goals yet — add a subject to start tracking sessions against it.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {goals.map((goal) => (
            <StudyGoalCard
              key={goal.id}
              goal={goal}
              minutesToday={minutesTodayBySubject[goal.subject] || 0}
              minutesThisWeek={minutesThisWeekBySubject[goal.subject] || 0}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      <SessionHistoryList sessions={sessions} />

      <StudyGoalForm
        open={goalFormOpen}
        onClose={() => {
          setGoalFormOpen(false)
          setEditingGoal(null)
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <LogSessionForm
        open={sessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
        onSave={handleLogSession}
        subjects={goals}
      />
    </div>
  )
}