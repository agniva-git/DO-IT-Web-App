import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { MISS_REASONS } from '../../api/tasks.js'

export default function MissReasonModal({ open, taskTitle, onClose, onSubmit }) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (!reason) return
    onSubmit(reason)
    setReason('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Why didn't you finish this?">
      <p className="text-sm text-paper/50 mb-4 break-words">
        You've missed <span className="text-paper/80">"{taskTitle}"</span> three
        times. This helps DO-IT understand what's actually getting in the way.
      </p>
      <div className="flex flex-col gap-2 mb-5">
        {MISS_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={`text-left px-4 py-2.5 rounded-card border text-sm transition-colors ${
              reason === r
                ? 'border-plan bg-plan/10 text-paper'
                : 'border-line bg-surfaceRaised text-paper/70 hover:border-paper/30'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <Button onClick={handleSubmit} disabled={!reason} className="w-full">
        Submit
      </Button>
    </Modal>
  )
}