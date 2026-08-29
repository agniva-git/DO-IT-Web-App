import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'

const PLACEHOLDERS = {
  build: 'e.g. Read 20 pages, sleep before midnight',
  leave: 'e.g. Late-night scrolling, skipping breakfast'
}

export default function AddHabitForm({ open, onClose, onSave, defaultType = 'build' }) {
  const [type, setType] = useState(defaultType)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')

  useEffect(() => {
    if (open) {
      setType(defaultType)
      setName('')
      setFrequency('daily')
    }
  }, [open, defaultType])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), frequency, type })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a habit">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-paper/70 mb-1.5 block">Type</label>
          <OptionGroup
            options={[
              { value: 'build', label: 'Catch a good habit' },
              { value: 'leave', label: 'Leave a bad habit' }
            ]}
            value={type}
            onChange={setType}
          />
        </div>
        <Input
          id="habitName"
          label={type === 'build' ? 'What do you want to build?' : 'What do you want to leave?'}
          placeholder={PLACEHOLDERS[type]}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div>
          <label className="text-sm text-paper/70 mb-1.5 block">Frequency</label>
          <OptionGroup
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' }
            ]}
            value={frequency}
            onChange={setFrequency}
          />
        </div>
        <Button type="submit" className="mt-2">
          Add habit
        </Button>
      </form>
    </Modal>
  )
}