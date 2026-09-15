import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const emptyGoal = { subject: '', target_date: '', hours_per_day: '', target_hours: '' }

function calcDaysLeft(dateStr) {
  if (!dateStr) return 0
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return 0
  const [y, m, d] = parts
  const target = new Date(y, m - 1, d)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((target - today) / (1000 * 60 * 60 * 24)))
}

export default function StudyGoalForm({ open, onClose, onSave, editingGoal }) {
  const [form, setForm] = useState(emptyGoal)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingGoal) {
      const dailyHours =
        editingGoal.hours_per_day !== undefined && editingGoal.hours_per_day !== null
          ? editingGoal.hours_per_day
          : editingGoal.hours_per_week
            ? Math.round((editingGoal.hours_per_week / 7) * 10) / 10
            : ''
      const totalHours =
        editingGoal.target_hours && editingGoal.target_hours > 0
          ? editingGoal.target_hours
          : dailyHours
            ? Math.round(dailyHours * calcDaysLeft(editingGoal.target_date))
            : ''
      setForm({
        subject: editingGoal.subject,
        target_date: editingGoal.target_date,
        hours_per_day: dailyHours,
        target_hours: totalHours
      })
    } else {
      setForm(emptyGoal)
    }
  }, [editingGoal, open])

  const handleDateChange = (newDate) => {
    const days = calcDaysLeft(newDate)
    const currentDaily = Number(form.hours_per_day)
    const currentTotal = Number(form.target_hours)

    if (currentTotal > 0 && days > 0) {
      setForm((f) => ({
        ...f,
        target_date: newDate,
        hours_per_day: (currentTotal / days).toFixed(1)
      }))
    } else if (currentDaily > 0 && days > 0) {
      setForm((f) => ({
        ...f,
        target_date: newDate,
        target_hours: Math.round(currentDaily * days)
      }))
    } else {
      setForm((f) => ({ ...f, target_date: newDate }))
    }
  }

  const handleTotalHoursChange = (val) => {
    const total = Number(val)
    const days = calcDaysLeft(form.target_date)
    setForm((f) => ({
      ...f,
      target_hours: val,
      hours_per_day: total > 0 && days > 0 ? (total / days).toFixed(1) : f.hours_per_day
    }))
  }

  const handleDailyHoursChange = (val) => {
    const daily = Number(val)
    const days = calcDaysLeft(form.target_date)
    setForm((f) => ({
      ...f,
      hours_per_day: val,
      target_hours: daily > 0 && days > 0 ? Math.round(daily * days) : f.target_hours
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.target_date || submitting) return
    const daily = Number(form.hours_per_day) || 0
    const total = Number(form.target_hours) || 0
    setSubmitting(true)
    try {
      await onSave({
        subject: form.subject.trim(),
        target_date: form.target_date,
        hours_per_day: daily,
        hours_per_week: Math.round(daily * 7),
        target_hours: total
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingGoal ? 'Edit study goal' : 'Add study goal'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="subject"
          label="Subject"
          placeholder="e.g. Physics, Java / DSA"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          required
        />
        <Input
          id="target_date"
          type="date"
          label="Target date"
          value={form.target_date}
          onChange={(e) => handleDateChange(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="target_hours"
            type="number"
            min="0"
            step="1"
            label="Total target hours"
            placeholder="e.g. 100"
            value={form.target_hours}
            onChange={(e) => handleTotalHoursChange(e.target.value)}
          />
          <Input
            id="hours_per_day"
            type="number"
            min="0"
            step="0.5"
            label="Hours / day"
            placeholder="e.g. 2"
            value={form.hours_per_day}
            onChange={(e) => handleDailyHoursChange(e.target.value)}
          />
        </div>
        <Button type="submit" loading={submitting} className="mt-2">
          {submitting ? 'Saving…' : editingGoal ? 'Save changes' : 'Add goal'}
        </Button>
      </form>
    </Modal>
  )
}