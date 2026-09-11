import { useState, useEffect, useMemo } from 'react'
import StatCard from '../components/analytics/StatCard.jsx'
import AnalyticsBarList from '../components/analytics/AnalyticsBarList.jsx'
import AIInsightCard from '../components/dashboard/AIInsightCard.jsx'
import { listTasks } from '../api/tasks.js'
import { listSessions as listStudySessions } from '../api/study.js'
import { listFocusSessions } from '../api/focus.js'
import { listWorkouts } from '../api/fitness.js'
import { listHabits, listHabitLogs, calcConsistency } from '../api/habits.js'
import { daysAgoISO } from '../utils/date.js'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tasks, setTasks] = useState([])
  const [studySessions, setStudySessions] = useState([])
  const [focusSessions, setFocusSessions] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])

  useEffect(() => {
    Promise.all([
      listTasks(),
      listStudySessions(),
      listFocusSessions(),
      listWorkouts(),
      listHabits(),
      listHabitLogs()
    ])
      .then(([t, s, f, w, h, logs]) => {
        setTasks(t)
        setStudySessions(s)
        setFocusSessions(f)
        setWorkouts(w)
        setHabits(h)
        setHabitLogs(logs)
      })
      .catch(() => setError('Could not load analytics. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    // Compute fresh on every render so a tab left open overnight
    // doesn't use a stale 30-day cutoff.
    const thirtyDaysAgo = daysAgoISO(30)

    const completionRate =
      tasks.length === 0
        ? 0
        : Math.round(
            (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100
          )

    const recentStudy = studySessions.filter((s) => s.date >= thirtyDaysAgo)
    const studyHoursTotal = (
      recentStudy.reduce((sum, s) => sum + s.duration, 0) / 60
    ).toFixed(1)

    const recentFocus = focusSessions.filter((s) => s.date >= thirtyDaysAgo)
    const recentWorkouts = workouts.filter((w) => w.date >= thirtyDaysAgo)

    const habitConsistency =
      habits.length === 0
        ? 0
        : Math.round(
            habits.reduce((sum, h) => sum + calcConsistency(habitLogs, h.id), 0) /
              habits.length
          )

    return {
      completionRate,
      studyHoursTotal,
      focusSessionsCount: recentFocus.length,
      workoutSessionsCount: recentWorkouts.length,
      habitConsistency
    }
  }, [tasks, studySessions, focusSessions, workouts, habits, habitLogs])

  const studyBySubject = useMemo(() => {
    const totals = {}
    for (const s of studySessions.filter((s) => s.date >= daysAgoISO(30))) {
      totals[s.subject] = (totals[s.subject] || 0) + s.duration
    }
    return Object.entries(totals).map(([label, minutes]) => ({
      label,
      value: Number((minutes / 60).toFixed(1))
    }))
  }, [studySessions])

  const focusByDay = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const dateStr = daysAgoISO(i)
      const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short'
      })
      const minutes = focusSessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + (s.planned_minutes || 0), 0)
      days.push({ label, value: minutes })
    }
    return days
  }, [focusSessions])

  const fitnessByBodyPart = useMemo(() => {
    const counts = {}
    for (const w of workouts.filter((w) => w.date >= daysAgoISO(30))) {
      for (const part of w.body_parts) {
        counts[part] = (counts[part] || 0) + 1
      }
    }
    return Object.entries(counts).map(([label, value]) => ({ label, value }))
  }, [workouts])


  const habitsConsistency = useMemo(
    () =>
      habits.map((h) => ({
        label: h.name,
        value: calcConsistency(habitLogs, h.id)
      })),
    [habits, habitLogs]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading analytics…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl">Analytics</h1>
        <p className="text-paper/50 mt-1">What the numbers actually say.</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <StatCard label="Completion rate" value={stats.completionRate} unit="%" colorClass="text-plan" />
        <StatCard label="Study hours (30d)" value={stats.studyHoursTotal} unit="h" colorClass="text-plan" />
        <StatCard label="Focus sessions (30d)" value={stats.focusSessionsCount} colorClass="text-focus" />
        <StatCard label="Workouts (30d)" value={stats.workoutSessionsCount} colorClass="text-move" />
        <StatCard label="Habit consistency" value={stats.habitConsistency} unit="%" colorClass="text-good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <AnalyticsBarList
          title="Study — hours by subject (30d)"
          items={studyBySubject}
          unit="h"
          color="plan"
        />
        <AnalyticsBarList
          title="Focus — minutes by day (last 7 days)"
          items={focusByDay}
          unit="m"
          color="focus"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <AnalyticsBarList
          title="Fitness — sessions by body part (30d)"
          items={fitnessByBodyPart}
          color="move"
        />
        <AnalyticsBarList
          title="Habits — consistency (30d)"
          items={habitsConsistency}
          unit="%"
          color="good"
        />
      </div>

      <AIInsightCard insight="Weekly reflections and personalized suggestions will appear here once the AI Coach ships." />
    </div>
  )
}