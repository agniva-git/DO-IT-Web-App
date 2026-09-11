import { useState, useEffect, useMemo } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'
import { DEFAULT_CATEGORIES, PRIORITIES } from '../../api/tasks.js'
import { localDateISO } from '../../utils/date.js'

const today = localDateISO

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  category: DEFAULT_CATEGORIES[0],
  customCategory: '',
  due_date: today(),
  estimated_minutes: ''
}

function daysUntil(dueDateStr) {
  if (!dueDateStr) return 0
  const due = new Date(dueDateStr + 'T00:00:00')
  const now = new Date(today() + 'T00:00:00')
  return Math.round((due - now) / 86400000)
}

export default function AddTaskForm({ open, onClose, onSave, editingTask, knownCategories }) {
  const [form, setForm] = useState(emptyForm)

  const categoryOptions = useMemo(() => {
    const extra = (knownCategories || []).filter(
      (c) => c && !DEFAULT_CATEGORIES.includes(c) && c !== 'Other'
    )
    return [...DEFAULT_CATEGORIES, ...extra, 'Other']
  }, [knownCategories])

  useEffect(() => {
    if (!open) return
    if (editingTask) {
      const isCustom = !DEFAULT_CATEGORIES.includes(editingTask.category)
      setForm({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        category: editingTask.category,
        customCategory: isCustom ? editingTask.category : '',
        due_date: editingTask.due_date,
        estimated_minutes: editingTask.estimated_minutes
      })
    } else {
      setForm(emptyForm)
    }
  }, [editingTask, open])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const showCustomInput = form.category === 'Other'
  const daysOut = daysUntil(form.due_date)
  const minutesLabel = daysOut >= 2 ? 'Est. minutes / day' : 'Est. minutes'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.due_date) return

    const finalCategory = showCustomInput ? form.customCategory.trim() : form.category
    if (!finalCategory) return

    onSave({
      title: form.title,
      description: form.description,
      priority: form.priority,
      category: finalCategory,
      due_date: form.due_date,
      estimated_minutes: Number(form.estimated_minutes) || 0
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={editingTask ? 'Edit task' : 'Add task'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="title"
          label="Title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
        <Input
          id="description"
          label="Description (optional)"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />

        <div>
          <label className="text-sm text-paper/70 mb-1.5 block">Priority</label>
          <OptionGroup
            options={PRIORITIES.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))}
            value={form.priority}
            onChange={(v) => update('priority', v)}
          />
        </div>

        <div>
          <label className="text-sm text-paper/70 mb-1.5 block">Category</label>
          <OptionGroup
            options={categoryOptions.map((c) => ({ value: c, label: c }))}
            value={form.category}
            onChange={(v) => update('category', v)}
          />
          {showCustomInput && (
            <Input
              id="customCategory"
              placeholder="Name your category"
              value={form.customCategory}
              onChange={(e) => update('customCategory', e.target.value)}
              className="mt-2"
              required
            />
          )}
        </div>

        {/* Stacks to a single column below sm (640px) — two side-by-side
            inputs, one of them a native date picker, get cramped on a
            narrow phone otherwise. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="due_date"
            type="date"
            label="Due date"
            value={form.due_date}
            onChange={(e) => update('due_date', e.target.value)}
            required
          />
          <Input
            id="estimated_minutes"
            type="number"
            min="0"
            label={minutesLabel}
            value={form.estimated_minutes}
            onChange={(e) => update('estimated_minutes', e.target.value)}
          />
        </div>

        <Button type="submit" className="mt-2">
          {editingTask ? 'Save changes' : 'Add task'}
        </Button>
      </form>
    </Modal>
  )
}