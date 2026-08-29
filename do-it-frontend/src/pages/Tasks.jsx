import { useState, useMemo, useEffect } from 'react'
import Button from '../components/ui/Button.jsx'
import OptionGroup from '../components/ui/OptionGroup.jsx'
import TaskList from '../components/tasks/TaskList.jsx'
import AddTaskForm from '../components/tasks/AddTaskForm.jsx'
import MissReasonModal from '../components/tasks/MissReasonModal.jsx'
import TaskDetailModal from '../components/tasks/TaskDetailModal.jsx'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  logMissReason
} from '../api/tasks.js'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' }
]

const SORTS = [
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' }
]

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('due_date')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [missModalTask, setMissModalTask] = useState(null)
  const [detailTaskId, setDetailTaskId] = useState(null)
  const detailTask = tasks.find((t) => t.id === detailTaskId) || null

  useEffect(() => {
    listTasks()
      .then(setTasks)
      .catch(() => setError('Could not load tasks. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const visibleTasks = useMemo(() => {
    let list = tasks
    if (filter !== 'all') list = list.filter((t) => t.status === filter)
    return [...list].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      return a.due_date.localeCompare(b.due_date)
    })
  }, [tasks, filter, sort])

  const knownCategories = useMemo(
    () => [...new Set(tasks.map((t) => t.category))],
    [tasks]
  )

  const handleToggleComplete = async (id) => {
    const task = tasks.find((t) => t.id === id)
    const wasCompleting = task?.status !== 'completed'
    const updated = await toggleTaskComplete(id)
    setTasks((ts) => ts.map((t) => (t.id === id ? updated : t)))

    if (wasCompleting && updated.miss_count >= 3) {
      setMissModalTask(updated)
    }
  }

  const handleSaveTask = async (formData) => {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, formData)
      setTasks((ts) => ts.map((t) => (t.id === editingTask.id ? updated : t)))
    } else {
      const created = await createTask(formData)
      setTasks((ts) => [...ts, created])
    }
    setFormOpen(false)
    setEditingTask(null)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setTasks((ts) => ts.filter((t) => t.id !== id))
  }

  const handleMissReasonSubmit = async (reason) => {
    await logMissReason(missModalTask.id, reason)
    setTasks((ts) =>
      ts.map((t) => (t.id === missModalTask.id ? { ...t, miss_count: 0 } : t))
    )
    setMissModalTask(null)
  }

  const handleToggleDay = async (taskId, dateStr, completed) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const nextProgress = { ...(task.daily_progress || {}), [dateStr]: completed }
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, daily_progress: nextProgress } : t)))
    try {
      await updateTask(taskId, { daily_progress: nextProgress })
    } catch {
      setTasks((ts) => ts.map((t) => (t.id === taskId ? task : t)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading tasks…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl">Tasks</h1>
        <Button
          onClick={() => {
            setEditingTask(null)
            setFormOpen(true)
          }}
        >
          + Add task
        </Button>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <span className="text-xs text-paper/40 uppercase tracking-wide block mb-2">Filter</span>
          <OptionGroup options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        <div>
          <span className="text-xs text-paper/40 uppercase tracking-wide block mb-2">Sort by</span>
          <OptionGroup options={SORTS} value={sort} onChange={setSort} />
        </div>
      </div>

      <TaskList
        tasks={visibleTasks}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenDetail={(task) => setDetailTaskId(task.id)}
      />

      <AddTaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        knownCategories={knownCategories}
      />

      <MissReasonModal
        open={!!missModalTask}
        taskTitle={missModalTask?.title}
        onClose={() => setMissModalTask(null)}
        onSubmit={handleMissReasonSubmit}
      />

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTaskId(null)}
        onToggleDay={handleToggleDay}
      />
    </div>
  )
}