import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const today = () => new Date().toISOString().slice(0, 10)

export default function LogExpenseForm({ open, category, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')

  const isSudden = category?.is_default
  const noteRequired = !!isSudden

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    if (noteRequired && !note.trim()) return
    onSave({ amount: Number(amount), date, note: note.trim() || null })
    setAmount('')
    setDate(today())
    setNote('')
  }

  return (
    <Modal open={open} onClose={onClose} title={`Log expense — ${category?.name || ''}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="expenseAmount"
            type="number"
            min="0.01"
            step="0.01"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            id="expenseDate"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <Input
          id="expenseNote"
          label={
            noteRequired
              ? 'What was this for? (required)'
              : 'Note (optional)'
          }
          placeholder={
            noteRequired
              ? 'e.g. birthday gift, sudden trip'
              : 'What was this for?'
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required={noteRequired}
        />
        <Button type="submit" disabled={noteRequired && !note.trim()} className="mt-2">
          Log expense
        </Button>
      </form>
    </Modal>
  )
}