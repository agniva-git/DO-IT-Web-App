import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import TodayProgress from '../components/dashboard/TodayProgress.jsx'
import TodaysTasks from '../components/dashboard/TodaysTasks.jsx'
import TodaysFocusSessions from '../components/dashboard/TodaysFocusSessions.jsx'
import TodaysWorkouts from '../components/dashboard/TodaysWorkouts.jsx'
import TodaysExpenses from '../components/dashboard/TodaysExpenses.jsx'
import FocusSummary from '../components/dashboard/FocusSummary.jsx'
import FitnessSummary from '../components/dashboard/FitnessSummary.jsx'
import HabitsChecklist from '../components/dashboard/HabitsChecklist.jsx'
import AIInsightCard from '../components/dashboard/AIInsightCard.jsx'
import Card from '../components/ui/Card.jsx'
import { listTasks } from '../api/tasks.js'
import { listFocusSessions } from '../api/focus.js'
import { listWorkouts, getPreferences } from '../api/fitness.js'
import { listHabits, listHabitLogs, checkIn, todayISO } from '../api/habits.js'
import { listMonths, getMonth, listMonthExpenses, currentYearMonth } from '../api/budget.js'

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

function startOfThisWeek() {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

function startOfThisMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tasks, setTasks] = useState([])
  const [focusSessions, setFocusSessions] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [preferences, setPreferences] = useState(null)
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [todaysExpenses, setTodaysExpenses] = useState([])
  const [hasBudgetThisMonth, setHasBudgetThisMonth] = useState(false)

  useEffect(() => {
    const loadEverything = async () => {
      const [t, f, w, prefs, h, logs, budgetMonths] = await Promise.all([
        listTasks(),
        listFocusSessions(),
        listWorkouts(),
        getPreferences(),
        listHabits(),
        listHabitLogs(),
        listMonths()
      ])
      setTasks(t)
      setFocusSessions(f)
      setWorkouts(w)
      setPreferences(prefs)
      setHabits(h)
      setHabitLogs(logs)

      // Expenses live under a specific month's id — find this calendar
      // month's budget (if one exists) before we can fetch its expenses.
      const { year, month } = currentYearMonth()
      const currentBudget = budgetMonths.find((m) => m.year === year && m.month === month)
      if (currentBudget) {
        setHasBudgetThisMonth(true)
        const allExpenses = await listMonthExpenses(currentBudget.id)
        setTodaysExpenses(allExpenses.filter((e) => e.date === todayISO()))
      }
    }

    loadEverything()
      .catch(() => setError('Could not load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const today = todayISO()

  const todaysTasks = useMemo(() => {
    return tasks
      .filter((t) => t.due_date === today)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'completed' ? 1 : -1
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      })
  }, [tasks, today])

  const tasksCompleted = todaysTasks.filter((t) => t.status === 'completed').length

  const todaysFocusSessions = useMemo(
    () => focusSessions.filter((s) => s.date === today),
    [focusSessions, today]
  )

  const todaysWorkouts = useMemo(
    () => workouts.filter((w) => w.date === today),
    [workouts, today]
  )

  const todaysExpensesTotal = useMemo(
    () => todaysExpenses.reduce((sum, e) => sum + e.amount, 0),
    [todaysExpenses]
  )

  const focusThisWeek = useMemo(() => {
    const monday = startOfThisWeek()
    const inWeek = focusSessions.filter((s) => new Date(s.date) >= monday)
    return {
      sessions: inWeek.length,
      minutes: inWeek.reduce((sum, s) => sum + (s.planned_minutes || 0), 0)
    }
  }, [focusSessions])

  const fitness = useMemo(() => {
    if (!preferences) return null
    const freqType = preferences.workout_frequency_type || 'weekly'
    const goal = freqType === 'daily' ? 7 : preferences.workout_frequency_count || 1
    const windowStart = freqType === 'monthly' ? startOfThisMonth() : startOfThisWeek()
    const windowLabel = freqType === 'monthly' ? 'this month' : 'this week'
    const days = new Set(
      workouts.filter((w) => new Date(w.date) >= windowStart).map((w) => w.date)
    )
    const daysTrained = days.size
    const message =
      freqType === 'daily'
        ? "every day's the goal"
        : `${Math.max(0, goal - daysTrained)} more ${windowLabel}`
    return { daysTrained, goal, message, goalIsNone: preferences.fitness_goal === 'none' }
  }, [preferences, workouts])

  const habitsToday = useMemo(() => {
    return habits.map((h) => ({
      ...h,
      done: habitLogs.some((l) => l.habit_id === h.id && l.date === today && l.completed)
    }))
  }, [habits, habitLogs, today])

  const handleToggleHabit = async (habitId) => {
    const existing = habitLogs.find((l) => l.habit_id === habitId && l.date === today)
    const nextCompleted = existing ? !existing.completed : true

    setHabitLogs((ls) => {
      if (existing) {
        return ls.map((l) =>
          l.habit_id === habitId && l.date === today ? { ...l, completed: nextCompleted } : l
        )
      }
      return [...ls, { habit_id: habitId, date: today, completed: nextCompleted }]
    })

    try {
      await checkIn(habitId, today, nextCompleted)
    } catch {
      setHabitLogs((ls) =>
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
        <p className="text-paper/40 text-sm">Loading your day…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl">
          Good {new Date().getHours() < 12 ? 'morning' : 'day'}, {user?.name} 👋
        </h1>
        <p className="text-paper/50 mt-1">{formatDate(new Date())}</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <TodayProgress completed={tasksCompleted} total={todaysTasks.length} />
          <TodaysTasks tasks={todaysTasks} />
          <TodaysFocusSessions sessions={todaysFocusSessions} />
          <TodaysWorkouts workouts={todaysWorkouts} />
          {hasBudgetThisMonth ? (
            <TodaysExpenses expenses={todaysExpenses} total={todaysExpensesTotal} />
          ) : (
            <Card>
              <h3 className="font-display text-lg mb-2 text-good">Spent today</h3>
              <p className="text-sm text-paper/50">
                No budget set up for this month yet — head to Expenses to start tracking.
              </p>
            </Card>
          )}
          <AIInsightCard insight="Weekly reflections and personalized suggestions will appear here once the AI Coach ships." />
        </div>

        <div className="flex flex-col gap-5">
          <FocusSummary
            sessionsThisWeek={focusThisWeek.sessions}
            totalMinutes={focusThisWeek.minutes}
          />
          {fitness?.goalIsNone ? (
            <Card>
              <h3 className="font-display text-lg mb-2 text-move">Fitness</h3>
              <p className="text-sm text-paper/50">Tracking is off — no pressure.</p>
            </Card>
          ) : (
            fitness && (
              <FitnessSummary
                daysTrained={fitness.daysTrained}
                goal={fitness.goal}
                message={fitness.message}
              />
            )
          )}
          <HabitsChecklist habits={habitsToday} onToggle={handleToggleHabit} />
        </div>
      </div>
    </div>
  )
}