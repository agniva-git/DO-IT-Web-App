import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const emptyGoal = { subject: '', target_date: '', hours_per_day: '' }

export default function StudyGoalForm({ open, onClose, onSave, editingGoal }) {
  const [form, setForm] = useState(emptyGoal)

  useEffect(() => {
    if (editingGoal) {
      const dailyHours =
        editingGoal.hours_per_day !== undefined && editingGoal.hours_per_day !== null
          ? editingGoal.hours_per_day
          : editingGoal.hours_per_week
            ? Math.round((editingGoal.hours_per_week / 7) * 10) / 10
            : ''
      setForm({
        subject: editingGoal.subject,
        target_date: editingGoal.target_date,
        hours_per_day: dailyHours
      })
    } else {
      setForm(emptyGoal)
    }
  }, [editingGoal, open])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.target_date) return
    const daily = Number(form.hours_per_day) || 0
    onSave({
      subject: form.subject.trim(),
      target_date: form.target_date,
      hours_per_day: daily,
      hours_per_week: Math.round(daily * 7)
    })
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="target_date"
            type="date"
            label="Target date"
            value={form.target_date}
            onChange={(e) => update('target_date', e.target.value)}
            required
          />
          <Input
            id="hours_per_day"
            type="number"
            min="0"
            step="0.5"
            label="Hours / day"
            placeholder="e.g. 2"
            value={form.hours_per_day}
            onChange={(e) => update('hours_per_day', e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-2">
          {editingGoal ? 'Save changes' : 'Add goal'}
        </Button>
      </form>
    </Modal>
  )
}