import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const emptyGoal = { subject: '', target_date: '', hours_per_week: '' }

export default function StudyGoalForm({ open, onClose, onSave, editingGoal }) {
  const [form, setForm] = useState(emptyGoal)

  useEffect(() => {
    setForm(
      editingGoal
        ? {
            subject: editingGoal.subject,
            target_date: editingGoal.target_date,
            hours_per_week: editingGoal.hours_per_week
          }
        : emptyGoal
    )
  }, [editingGoal, open])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.target_date) return
    onSave({ ...form, hours_per_week: Number(form.hours_per_week) || 0 })
  }

  return (
    <Modal open={open} onClose={onClose} title={editingGoal ? 'Edit study goal' : 'Add study goal'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="subject"
          label="Subject"
          placeholder="e.g. Physics, Java / DSA"
          value={form.subject}
          onChange={(e) => update('subject', e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="target_date"
            type="date"
            label="Target date"
            value={form.target_date}
            onChange={(e) => update('target_date', e.target.value)}
            required
          />
          <Input
            id="hours_per_week"
            type="number"
            min="0"
            label="Hours / week"
            value={form.hours_per_week}
            onChange={(e) => update('hours_per_week', e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-2">
          {editingGoal ? 'Save changes' : 'Add goal'}
        </Button>
      </form>
    </Modal>
  )
}