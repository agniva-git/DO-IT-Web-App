import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'
import { localDateISO } from '../../utils/date.js'

const today = localDateISO

export default function LogSessionForm({ open, onClose, onSave, subjects }) {
  const [subject, setSubject] = useState(subjects[0]?.subject || '')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && subjects.length > 0) {
      setSubject((curr) =>
        curr && subjects.some((s) => s.subject === curr) ? curr : subjects[0].subject
      )
      setDuration('')
      setDate(today())
      setError('')
    }
  }, [open, subjects])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!subject) {
      setError('Please select a subject.')
      return
    }
    const mins = Number(duration)
    if (!mins || mins <= 0) {
      setError('Please enter a duration greater than 0.')
      return
    }
    setSubmitting(true)
    try {
      await onSave({ subject, duration: mins, date })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not log session. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log a study session">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        <div>
          <label className="text-sm text-paper/70 mb-1.5 block">Subject</label>
          <OptionGroup
            options={subjects.map((s) => ({ value: s.subject, label: s.subject }))}
            value={subject}
            onChange={(val) => {
              setSubject(val)
              setError('')
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="duration"
            type="number"
            min="1"
            label="Duration (min)"
            placeholder="e.g. 45"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value)
              setError('')
            }}
            required
          />
          <Input
            id="sessionDate"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <Button type="submit" loading={submitting} className="mt-2">
          {submitting ? 'Logging session…' : 'Log session'}
        </Button>
      </form>
    </Modal>
  )
}