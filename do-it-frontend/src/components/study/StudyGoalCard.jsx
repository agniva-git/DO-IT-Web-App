import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

export default function StudyGoalCard({ goal, minutesThisWeek, onEdit, onDelete }) {
  const goalMinutes = goal.hours_per_week * 60
  const hoursDone = (minutesThisWeek / 60).toFixed(1)

  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-display text-lg">{goal.subject}</h3>
          <p className="text-xs text-paper/40 mt-0.5">Target: {goal.target_date}</p>
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
      <ProgressBar value={minutesThisWeek} max={goalMinutes} colorClass="bg-plan" />
      <p className="text-xs text-paper/50 mt-1.5">
        {hoursDone}h / {goal.hours_per_week}h this week
      </p>
    </Card>
  )
}