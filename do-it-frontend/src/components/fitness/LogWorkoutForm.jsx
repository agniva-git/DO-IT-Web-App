import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const today = () => new Date().toISOString().slice(0, 10)

// bodyParts arrives pre-selected from BodyPartPicker — this form just
// confirms duration/date before the session is saved to history.
export default function LogWorkoutForm({ open, onClose, onSave, bodyParts }) {
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(today())

  useEffect(() => {
    if (open) {
      setDuration('')
      setDate(today())
    }
  }, [open])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!duration || bodyParts.length === 0) return
    onSave({ body_parts: bodyParts, duration: Number(duration), date })
  }

  return (
    <Modal open={open} onClose={onClose} title="Log this session">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <span className="text-sm text-paper/70 block mb-1.5">Body parts trained</span>
          <div className="flex flex-wrap gap-2">
            {bodyParts.map((part) => (
              <span
                key={part}
                className="px-3 py-1.5 rounded-card bg-move/15 text-move text-sm"
              >
                {part}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="workoutDuration"
            type="number"
            min="1"
            label="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <Input
            id="workoutDate"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="mt-2">
          Save session
        </Button>
      </form>
    </Modal>
  )
}