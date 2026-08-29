import Card from '../ui/Card.jsx'

const PRIORITY_STYLES = {
  high: 'bg-danger/15 text-danger border-danger/30',
  medium: 'bg-warn/15 text-warn border-warn/30',
  low: 'bg-good/15 text-good border-good/30'
}

export default function TodaysTasks({ tasks }) {
  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Today's tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-paper/40 text-sm">
          Nothing due today — add a task to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`px-3 sm:px-4 py-2.5 rounded-card border text-sm flex items-center justify-between gap-2 ${
                PRIORITY_STYLES[task.priority]
              } ${task.status === 'completed' ? 'opacity-50' : ''}`}
            >
              <span
                className={`min-w-0 truncate ${task.status === 'completed' ? 'line-through' : ''}`}
              >
                {task.title}
              </span>
              <span className="text-xs opacity-70 shrink-0">{task.category}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}