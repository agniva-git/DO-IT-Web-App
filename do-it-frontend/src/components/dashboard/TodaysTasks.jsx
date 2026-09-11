import Card from '../ui/Card.jsx'

const PRIORITY_DOT = {
  high: 'bg-danger',
  medium: 'bg-warn',
  low: 'bg-good'
}

function TaskRow({ task, isOverdue, onToggle }) {
  const done = task.status === 'completed'

  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
      {/* Checkbox circle */}
      <button
        type="button"
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
          done
            ? 'bg-good border-good'
            : `border-line hover:border-paper/50 ${PRIORITY_DOT[task.priority] === 'bg-danger' ? 'hover:border-danger/60' : ''}`
        }`}
      >
        {done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />

      {/* Title */}
      <span
        className={`flex-1 text-sm min-w-0 truncate transition-colors ${
          done ? 'line-through text-paper/30' : 'text-paper/90'
        }`}
      >
        {task.title}
      </span>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isOverdue && !done && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-warn/15 text-warn border border-warn/20">
            overdue
          </span>
        )}
        <span className="text-xs text-paper/30 hidden sm:block">{task.category}</span>
      </div>
    </li>
  )
}

export default function TodaysTasks({ tasks, overdueTasks = [], onToggle }) {
  const hasOverdue = overdueTasks.length > 0
  const hasToday = tasks.length > 0
  const isEmpty = !hasToday && !hasOverdue

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg">Tasks</h3>
        {(hasOverdue || hasToday) && (
          <span className="text-xs text-paper/40">
            {tasks.filter((t) => t.status === 'completed').length + overdueTasks.filter((t) => t.status === 'completed').length}
            {' / '}
            {tasks.length + overdueTasks.length} done
          </span>
        )}
      </div>

      {isEmpty ? (
        <p className="text-paper/40 text-sm py-2">
          Nothing due today — add a task to get started.
        </p>
      ) : (
        <ul>
          {overdueTasks.map((task) => (
            <TaskRow key={task.id} task={task} isOverdue onToggle={onToggle} />
          ))}
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} isOverdue={false} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </Card>
  )
}