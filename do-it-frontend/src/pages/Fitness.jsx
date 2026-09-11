import { useState, useMemo, useEffect } from 'react'
import Card from '../components/ui/Card.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import GoalSummary from '../components/fitness/GoalSummary.jsx'
import EditGoalModal from '../components/fitness/EditGoalModal.jsx'
import BodyPartPicker from '../components/fitness/BodyPartPicker.jsx'
import LogWorkoutForm from '../components/fitness/LogWorkoutForm.jsx'
import WorkoutHistoryList from '../components/fitness/WorkoutHistoryList.jsx'
import {
  listWorkouts,
  createWorkout,
  getPreferences,
  updatePreferences,
  startOfThisWeek,
  startOfThisMonth
} from '../api/fitness.js'

export default function Fitness() {
  const [preferences, setPreferences] = useState(null)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [pendingBodyParts, setPendingBodyParts] = useState([])

  useEffect(() => {
    Promise.all([getPreferences(), listWorkouts()])
      .then(([prefs, w]) => {
        setPreferences(prefs)
        setWorkouts(w)
      })
      .catch(() => setError('Could not load fitness data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const goal = preferences?.fitness_goal
  const goalIsNone = goal === 'none'
  const freqType = preferences?.workout_frequency_type || 'weekly'
  // Daily has no stored count — the target is simply every day in the
  // window. Weekly/monthly use whatever count was set at registration
  // or last edited.
  const freqCount = freqType === 'daily' ? 7 : preferences?.workout_frequency_count || 1

  // Which window to measure against depends on the frequency type —
  // daily/weekly both look at the current week, monthly looks at the
  // current calendar month.
  const windowStart = freqType === 'monthly' ? startOfThisMonth() : startOfThisWeek()
  const windowLabel = freqType === 'monthly' ? 'this month' : 'this week'

  const daysTrainedInWindow = useMemo(() => {
    // Unique days, not session count — logging two sessions in one day
    // should still only count as one active day toward the target.
    const days = new Set(
      workouts.filter((w) => new Date(w.date) >= windowStart).map((w) => w.date)
    )
    return days.size
  }, [workouts, windowStart])

  const progressMessage =
    freqType === 'daily'
      ? `Worked out ${daysTrainedInWindow} / 7 days this week — every day's the goal`
      : `Worked out ${daysTrainedInWindow} / ${freqCount} days ${windowLabel}`

  const handlePickBodyParts = (bodyParts) => {
    setPendingBodyParts(bodyParts)
    setFormOpen(true)
  }

  const handleLogWorkout = async (workout) => {
    try {
      const created = await createWorkout(workout)
      setWorkouts((ws) => [...ws, created])
      setFormOpen(false)
      setPendingBodyParts([])
    } catch {
      setError('Could not log workout — please try again.')
    }
  }

  const handleSaveGoal = async (updates) => {
    try {
      const updated = await updatePreferences(updates)
      setPreferences(updated)
      setGoalModalOpen(false)
    } catch {
      setError('Could not save goal — please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading fitness data…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl">Fitness</h1>
        <p className="text-paper/50 mt-1">
          {goalIsNone
            ? "We'll focus on your productivity and study goals."
            : 'Keep it simple — consistency over intensity.'}
        </p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <GoalSummary goal={goal} onEdit={() => setGoalModalOpen(true)} />

      {goalIsNone ? (
        <Card className="text-center py-10">
          <p className="text-paper/50">
            Fitness tracking is off for now. Hit "Edit" above to turn it back
            on anytime — no pressure either way.
          </p>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg capitalize">{windowLabel}</h3>
            </div>
            <ProgressBar
              value={daysTrainedInWindow}
              max={freqType === 'daily' ? 7 : freqCount}
              colorClass="bg-move"
            />
            <p className="text-sm text-paper/50 mt-1.5">{progressMessage}</p>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BodyPartPicker onLog={handlePickBodyParts} />
            <WorkoutHistoryList workouts={workouts} />
          </div>
        </>
      )}

      <LogWorkoutForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setPendingBodyParts([])
        }}
        onSave={handleLogWorkout}
        bodyParts={pendingBodyParts}
      />

      <EditGoalModal
        open={goalModalOpen}
        currentGoal={goal}
        currentPreferences={preferences}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  )
}