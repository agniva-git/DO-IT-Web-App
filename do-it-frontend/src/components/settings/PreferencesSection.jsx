import { useState, useEffect } from 'react'
import Card from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

export default function PreferencesSection({ preferences, onSave }) {
  const [form, setForm] = useState(preferences)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => setForm(preferences), [preferences])

  const update = (key, value) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        wake_time: form.wake_time || null,
        sleep_time: form.sleep_time || null,
        study_duration: form.study_duration ? Number(form.study_duration) : null,
        break_duration: form.break_duration ? Number(form.break_duration) : null
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Preferences</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="wakeTime"
            type="time"
            label="Wake time"
            value={form.wake_time || ''}
            onChange={(e) => update('wake_time', e.target.value)}
          />
          <Input
            id="sleepTime"
            type="time"
            label="Sleep time"
            value={form.sleep_time || ''}
            onChange={(e) => update('sleep_time', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="studyDuration"
            type="number"
            min="5"
            label="Default study session (min)"
            value={form.study_duration || ''}
            onChange={(e) => update('study_duration', e.target.value)}
          />
          <Input
            id="breakDuration"
            type="number"
            min="1"
            label="Default break (min)"
            value={form.break_duration || ''}
            onChange={(e) => update('break_duration', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Button type="submit" variant="subtle" disabled={saving}>
            {saving ? 'Saving…' : 'Save preferences'}
          </Button>
          {saved && <span className="text-sm text-good">Saved</span>}
        </div>
      </form>
    </Card>
  )
}