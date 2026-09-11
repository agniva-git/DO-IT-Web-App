import Card from '../ui/Card.jsx'

const PRIORITY_STYLES = {
  high: 'bg-danger/15 text-danger border-danger/30',
  medium: 'bg-warn/15 text-warn border-warn/30',
  low: 'bg-good/15 text-good border-good/30'
}

function TaskRow({ task, isOverdue }) {
  return (
    <li
      className={`px-3 sm:px-4 py-2.5 rounded-card border text-sm flex items-center justify-between gap-2 ${
        PRIORITY_STYLES[task.priority]
      } ${task.status === 'completed' ? 'opacity-50' : ''}`}
    >
      <span
        className={`min-w-0 truncate ${task.status === 'completed' ? 'line-through' : ''}`}
      >
        {task.title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {isOverdue && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-warn/20 text-warn border border-warn/30 whitespace-nowrap">
            overdue
          </span>
        )}
        <span className="text-xs opacity-70">{task.category}</span>
      </div>
    </li>
  )
}

export default function TodaysTasks({ tasks, overdueTasks = [] }) {
  const hasOverdue = overdueTasks.length > 0
  const hasToday = tasks.length > 0
  const isEmpty = !hasToday && !hasOverdue

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Tasks</h3>
      {isEmpty ? (
        <p className="text-paper/40 text-sm">
          Nothing due today — add a task to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {hasOverdue && (
            <>
              {overdueTasks.map((task) => (
                <TaskRow key={task.id} task={task} isOverdue />
              ))}
              {hasToday && <li className="border-t border-line my-1" />}
            </>
          )}
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} isOverdue={false} />
          ))}
        </ul>
      )}
    </Card>
  )
}