const PRIORITY_STYLES = {
  high: 'bg-danger/15 text-danger',
  medium: 'bg-warn/15 text-warn',
  low: 'bg-good/15 text-good'
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, onOpenDetail }) {
  const isDone = task.status === 'completed'

  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div
      onClick={() => onOpenDetail(task)}
      className={`flex items-start gap-3 px-3 sm:px-4 py-3.5 rounded-card border transition-colors cursor-pointer hover:border-paper/20 ${
        isDone ? 'border-line bg-surface/50' : 'border-line bg-surface'
      }`}
    >
      <button
        type="button"
        onClick={stop(() => onToggleComplete(task.id))}
        className={`mt-0.5 w-6 h-6 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center text-xs shrink-0 transition-colors ${
          isDone
            ? 'bg-good/20 border-good text-good'
            : 'border-line text-transparent hover:border-paper/40'
        }`}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        ✓
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className={`text-sm ${isDone ? 'line-through text-paper/40' : 'text-paper'}`}>
            {task.title}
          </span>
          <span className={`text-[11px] sm:text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
          <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-plan/15 text-plan">
            {task.category}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-paper/40 mt-1 break-words">{task.description}</p>
        )}
        <div className="flex items-center gap-2.5 sm:gap-3 mt-1.5 text-xs text-paper/40 flex-wrap">
          <span>Due {task.due_date}</span>
          {task.estimated_minutes > 0 && <span>{task.estimated_minutes} min</span>}
          {task.miss_count > 0 && (
            <span className="text-warn">Missed {task.miss_count}×</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0 items-center">
        <button
          type="button"
          onClick={stop(() => onEdit(task))}
          className="text-xs text-paper/40 hover:text-paper px-2 py-1.5 rounded hover:bg-surfaceRaised"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={stop(() => onDelete(task.id))}
          className="text-xs text-paper/40 hover:text-danger px-2 py-1.5 rounded hover:bg-surfaceRaised"
        >
          Delete
        </button>
      </div>
    </div>
  )
}