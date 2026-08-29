import { FITNESS_GOALS } from '../../api/fitness.js'

export default function GoalSummary({ goal, onEdit }) {
  const label = FITNESS_GOALS.find((g) => g.value === goal)?.label || 'Not set'

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-card border border-line bg-surface mb-6">
      <span className="text-sm text-paper/70">
        Goal: <span className="text-paper">{label}</span>
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="text-sm text-plan hover:underline"
      >
        Edit
      </button>
    </div>
  )
}