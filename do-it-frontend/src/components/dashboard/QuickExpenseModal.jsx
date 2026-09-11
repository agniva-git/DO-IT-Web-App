import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import { localDateISO } from '../../utils/date.js'

/**
 * Lightweight quick-expense modal for the Dashboard.
 * Shows the current month's budget categories as a pick list,
 * then just needs an amount (and optionally a note for Sudden Expenses).
 *
 * Props:
 *  open           — boolean
 *  categories     — array of { id, name, is_default, remaining, percent_used }
 *  onSave(categoryId, { amount, date, note }) — called on submit
 *  onClose        — called on cancel / backdrop click
 */
export default function QuickExpenseModal({ open, categories = [], onSave, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date] = useState(localDateISO())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selected = categories.find((c) => c.id === selectedId)
  const isSudden = selected?.is_default
  const noteRequired = !!isSudden

  const handleClose = () => {
    setSelectedId(null)
    setAmount('')
    setNote('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedId) { setError('Pick a category first.'); return }
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return }
    if (noteRequired && !note.trim()) { setError('Add a note for Sudden Expenses.'); return }

    setSubmitting(true)
    setError('')
    try {
      await onSave(selectedId, { amount: Number(amount), date, note: note.trim() || null })
      setSelectedId(null)
      setAmount('')
      setNote('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not log expense.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category picker */}
        <div>
          <p className="text-sm text-paper/70 mb-2">Category</p>
          {categories.length === 0 ? (
            <p className="text-sm text-paper/40">
              No budget set up this month — go to Expenses to create one.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedId(cat.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-card border text-sm text-left transition-colors ${
                      isSelected
                        ? 'border-plan bg-plan/10 text-paper'
                        : 'border-line bg-surface text-paper/70 hover:border-paper/30'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.remaining != null && (
                      <span className="text-xs text-paper/40 ml-2 shrink-0">
                        ₹{cat.remaining.toFixed(0)} left
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Amount */}
        {selectedId && (
          <>
            <Input
              id="quickExpenseAmount"
              type="number"
              min="0.01"
              step="0.01"
              label="Amount (₹)"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Input
              id="quickExpenseNote"
              label={noteRequired ? 'What was this for? (required)' : 'Note (optional)'}
              placeholder={noteRequired ? 'e.g. birthday gift, sudden trip' : 'What was this for?'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required={noteRequired}
            />
          </>
        )}

        {error && <p className="text-sm text-danger -mt-1">{error}</p>}

        <div className="flex gap-2 mt-1">
          <Button
            type="submit"
            disabled={submitting || !selectedId || !amount}
            className="flex-1"
          >
            {submitting ? 'Logging…' : 'Log expense'}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
