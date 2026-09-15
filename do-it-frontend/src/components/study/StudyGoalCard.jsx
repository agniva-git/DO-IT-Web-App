import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

function getDeadlineInfo(targetDateStr) {
  if (!targetDateStr) return null
  const parts = targetDateStr.split('-').map(Number)
  if (parts.length !== 3) return null
  const [y, m, d] = parts
  const target = new Date(y, m - 1, d)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24))
  if (diffDays > 1) {
    return { text: `${diffDays} days left`, isPast: false, isToday: false, days: diffDays }
  } else if (diffDays === 1) {
    return { text: '1 day left (tomorrow)', isPast: false, isToday: false, days: 1 }
  } else if (diffDays === 0) {
    return { text: 'Deadline is today!', isPast: false, isToday: true, days: 0 }
  } else {
    return { text: `Deadline passed (${Math.abs(diffDays)}d ago)`, isPast: true, isToday: false, days: diffDays }
  }
}

export default function StudyGoalCard({
  goal,
  minutesToday = 0,
  totalMinutes = 0,
  onEdit,
  onDelete
}) {
  const dailyTargetHours =
    goal.hours_per_day !== undefined && goal.hours_per_day !== null && goal.hours_per_day > 0
      ? goal.hours_per_day
      : goal.hours_per_week
        ? Math.round((goal.hours_per_week / 7) * 10) / 10
        : 0

  const deadline = getDeadlineInfo(goal.target_date)
  const totalHoursDone = totalMinutes / 60
  const hoursDoneToday = (minutesToday / 60).toFixed(1)

  // Determine overall target hours:
  // 1. Explicit goal.target_hours if set by user.
  // 2. Or completed hours + remaining days * daily target hours.
  const daysRemaining = deadline && !deadline.isPast && deadline.days > 0 ? deadline.days : 0
  const totalTargetHours =
    goal.target_hours && goal.target_hours > 0
      ? goal.target_hours
      : Math.max(1, Math.round(totalHoursDone + daysRemaining * dailyTargetHours))

  const totalTargetMinutes = totalTargetHours * 60

  return (
    <Card>
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-lg truncate">{goal.subject}</h3>
          <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
            <span className="text-paper/40">Target: {goal.target_date}</span>
            {deadline && (
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] ${
                  deadline.isPast
                    ? 'bg-danger/10 text-danger'
                    : deadline.isToday
                      ? 'bg-accent/15 text-accent font-medium'
                      : 'bg-plan/15 text-plan'
                }`}
              >
                {deadline.text}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="text-xs text-paper/40 hover:text-paper px-2 py-1"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="text-xs text-paper/40 hover:text-danger px-2 py-1"
          >
            Delete
          </button>
        </div>
      </div>
      <ProgressBar value={totalMinutes} max={totalTargetMinutes || 1} colorClass="bg-plan" />
      <div className="flex items-center justify-between text-xs text-paper/50 mt-1.5 flex-wrap gap-1">
        <span>
          <strong className="text-paper/80 font-medium">{totalHoursDone.toFixed(1)}h</strong> / {totalTargetHours}h total
        </span>
        <span className="text-paper/40">
          {hoursDoneToday}h / {dailyTargetHours}h today
        </span>
      </div>
    </Card>
  )
}