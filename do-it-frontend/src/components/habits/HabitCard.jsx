import Card from '../ui/Card.jsx'
import HabitHistoryGrid from './HabitHistoryGrid.jsx'
import { calcStreak, calcConsistency, lastNDays, todayISO } from '../../api/habits.js'

const COPY = {
  build: {
    streakUnit: 'day streak',
    doneLabel: '✓ Done today',
    actionLabel: 'Mark done today',
    undoHint: 'Tap to undo'
  },
  leave: {
    streakUnit: 'days clean',
    doneLabel: '✓ Stayed clean today',
    actionLabel: 'Mark clean today',
    undoHint: 'Tap to undo'
  }
}

export default function HabitCard({ habit, logs, onToggleToday, onDelete }) {
  const copy = COPY[habit.type] || COPY.build
  const streak = calcStreak(logs, habit.id)
  const consistency = calcConsistency(logs, habit.id)
  const days = lastNDays(logs, habit.id)
  const today = todayISO()
  const doneToday = logs.some((l) => l.habit_id === habit.id && l.date === today && l.completed)

  return (
    <Card>
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-display text-lg">{habit.name}</h3>
        <button
          type="button"
          onClick={() => onDelete(habit.id)}
          className="text-xs text-paper/40 hover:text-danger px-2 py-1 shrink-0"
        >
          Delete
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-warn">🔥 {streak} {copy.streakUnit}</span>
        <span className="text-paper/50">{consistency}% / 30 days</span>
      </div>

      <button
        type="button"
        onClick={() => onToggleToday(habit.id)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-card border text-sm font-medium transition-colors mb-4 ${
          doneToday
            ? 'bg-good/15 border-good/40 text-good'
            : 'bg-plan/10 border-plan/40 text-plan hover:bg-plan/15'
        }`}
      >
        {doneToday ? (
          <>
            {copy.doneLabel}
            <span className="text-xs text-paper/40 font-normal ml-1">
              · {copy.undoHint}
            </span>
          </>
        ) : (
          copy.actionLabel
        )}
      </button>

      <HabitHistoryGrid days={days} />
    </Card>
  )
}