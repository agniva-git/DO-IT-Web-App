import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'

const today = () => new Date().toISOString().slice(0, 10)

export default function LogSessionForm({ open, onClose, onSave, subjects }) {
  const [subject, setSubject] = useState(subjects[0]?.subject || '')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(today())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!subject || !duration) return
    onSave({ subject, duration: Number(duration), date })
    setDuration('')
    setDate(today())
  }

  return (
    <Modal open={open} onClose={onClose} title="Log a study session">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-paper/70 mb-1.5 block">Subject</label>
          <OptionGroup
            options={subjects.map((s) => ({ value: s.subject, label: s.subject }))}
            value={subject}
            onChange={setSubject}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="duration"
            type="number"
            min="1"
            label="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
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
        <Button type="submit" className="mt-2">
          Log session
        </Button>
      </form>
    </Modal>
  )
}