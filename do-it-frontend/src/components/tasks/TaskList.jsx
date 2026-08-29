import TaskCard from './TaskCard.jsx'

export default function TaskList({ tasks, onToggleComplete, onEdit, onDelete, onOpenDetail }) {
  if (tasks.length === 0) {
    return (
      <p className="text-paper/40 text-sm text-center py-10">
        No tasks match this filter.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  )
}