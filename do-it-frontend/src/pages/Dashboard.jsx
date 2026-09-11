import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import TodayProgress from '../components/dashboard/TodayProgress.jsx'
import TodaysTasks from '../components/dashboard/TodaysTasks.jsx'
import TodaysFocusSessions from '../components/dashboard/TodaysFocusSessions.jsx'
import TodaysWorkouts from '../components/dashboard/TodaysWorkouts.jsx'
import TodaysExpenses from '../components/dashboard/TodaysExpenses.jsx'
import FocusSummary from '../components/dashboard/FocusSummary.jsx'
import FitnessSummary from '../components/dashboard/FitnessSummary.jsx'
import HabitsChecklist from '../components/dashboard/HabitsChecklist.jsx'
import QuickActions from '../components/dashboard/QuickActions.jsx'
import QuickExpenseModal from '../components/dashboard/QuickExpenseModal.jsx'
import AddTaskForm from '../components/tasks/AddTaskForm.jsx'
import Card from '../components/ui/Card.jsx'
import { listTasks, toggleTaskComplete, createTask } from '../api/tasks.js'
import { listFocusSessions } from '../api/focus.js'
import { listWorkouts, getPreferences } from '../api/fitness.js'
import { listHabits, listHabitLogs, checkIn, todayISO } from '../api/habits.js'
import {
  listMonths,
  getMonth,
  logExpense,
  listMonthExpenses,
  currentYearMonth
} from '../api/budget.js'
import {
  localDateISO,
  startOfThisWeek,
  startOfThisMonth,
  formatDateLong
} from '../utils/date.js'

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
  const [currentMonthId, setCurrentMonthId] = useState(null)
  const [budgetCategories, setBudgetCategories] = useState([])

  // Quick expense modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  // Quick task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const knownCategories = useMemo(
    () => [...new Set(tasks.map((t) => t.category))],
    [tasks]
  )

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

      const { year, month } = currentYearMonth()
      const currentBudget = budgetMonths.find((m) => m.year === year && m.month === month)
      if (currentBudget) {
        setHasBudgetThisMonth(true)
        setCurrentMonthId(currentBudget.id)
        // Fetch full month detail for categories + today's flat expenses in parallel.
        const [fullMonth, flat] = await Promise.all([
          getMonth(currentBudget.id),
          listMonthExpenses(currentBudget.id)
        ])
        // Sort: non-default (real planned categories) first, Sudden Expenses last.
        const sorted = [...(fullMonth.categories || [])].sort(
          (a, b) => (a.is_default ? 1 : 0) - (b.is_default ? 1 : 0)
        )
        setBudgetCategories(sorted)
        setTodaysExpenses(flat.filter((e) => e.date === localDateISO()))
      }
    }

    loadEverything()
      .catch(() => setError('Could not load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const today = localDateISO()

  // Tasks due today, sorted: incomplete first by priority.
  const todaysTasks = useMemo(() => {
    return tasks
      .filter((t) => t.due_date === today)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'completed' ? 1 : -1
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      })
  }, [tasks, today])

  // Overdue: past due date, not yet complete.
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => t.due_date && t.due_date < today && t.status !== 'completed')
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
  }, [tasks, today])

  const tasksCompleted = useMemo(
    () =>
      [...todaysTasks, ...overdueTasks].filter((t) => t.status === 'completed').length,
    [todaysTasks, overdueTasks]
  )
  const tasksTotal = todaysTasks.length + overdueTasks.length

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

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Toggle a task complete/incomplete directly from the Dashboard.
  const handleToggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const wasCompleting = task.status !== 'completed'
    // Optimistic update
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, status: wasCompleting ? 'completed' : 'pending' } : t))
    )
    try {
      const updated = await toggleTaskComplete(id)
      setTasks((ts) => ts.map((t) => (t.id === id ? updated : t)))
    } catch {
      // Roll back
      setTasks((ts) => ts.map((t) => (t.id === id ? task : t)))
    }
  }

  // Quick expense from Dashboard — logs to budget and refreshes today's total.
  const handleQuickExpense = async (categoryId, expenseData) => {
    await logExpense(categoryId, expenseData)
    // Refresh expenses and categories (remaining amounts change after a log).
    if (currentMonthId) {
      const [fullMonth, flat] = await Promise.all([
        getMonth(currentMonthId),
        listMonthExpenses(currentMonthId)
      ])
      const sorted = [...(fullMonth.categories || [])].sort(
        (a, b) => (a.is_default ? 1 : 0) - (b.is_default ? 1 : 0)
      )
      setBudgetCategories(sorted)
      setTodaysExpenses(flat.filter((e) => e.date === localDateISO()))
    }
    setExpenseModalOpen(false)
  }

  // Quick add task from Dashboard
  const handleQuickAddTask = async (formData) => {
    try {
      const created = await createTask(formData)
      setTasks((ts) => [...ts, created])
      setTaskModalOpen(false)
    } catch {
      setError('Could not save task — please try again.')
    }
  }

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

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading your day…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-8 sm:py-10">
      <header className="mb-5">
        <h1 className="font-display text-2xl sm:text-3xl">
          Hello, {user?.name} 👋
        </h1>
        <p className="text-paper/50 mt-0.5 text-sm sm:text-base">{formatDateLong(new Date())}</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {/* Quick-action chips */}
      <QuickActions
        onStartFocus={() => navigate('/focus')}
        onAddTask={() => setTaskModalOpen(true)}
        onLogWorkout={() => navigate('/fitness')}
        onLogExpense={() => setExpenseModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* ── Left / main column ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <TodayProgress completed={tasksCompleted} total={tasksTotal} />

          {/* Tasks — interactive checkboxes */}
          <TodaysTasks
            tasks={todaysTasks}
            overdueTasks={overdueTasks}
            onToggle={handleToggleTask}
          />

          {todaysFocusSessions.length > 0 && (
            <TodaysFocusSessions sessions={todaysFocusSessions} />
          )}
          {todaysWorkouts.length > 0 && (
            <TodaysWorkouts workouts={todaysWorkouts} />
          )}
          {hasBudgetThisMonth && (
            <TodaysExpenses expenses={todaysExpenses} total={todaysExpensesTotal} />
          )}
        </div>

        {/* ── Right / wellness column ── */}
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

      {/* Quick expense modal */}
      <QuickExpenseModal
        open={expenseModalOpen}
        categories={budgetCategories}
        onSave={handleQuickExpense}
        onClose={() => setExpenseModalOpen(false)}
      />

      {/* Quick add task modal */}
      <AddTaskForm
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleQuickAddTask}
        knownCategories={knownCategories}
      />
    </div>
  )
}