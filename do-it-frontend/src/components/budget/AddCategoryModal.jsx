import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'
import { CATEGORY_SUGGESTIONS } from '../../api/budget.js'

export default function AddCategoryModal({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState('amount')
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !value || Number(value) <= 0) return
    onSave({ name: name.trim(), input_mode: mode, value: Number(value) })
    setName('')
    setValue('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a category">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setName(s)}
              className="px-3 py-1.5 rounded-card border border-line bg-surface text-sm text-paper/70 hover:border-plan/50 hover:text-paper transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          id="newCategoryName"
          label="Category name"
          placeholder="e.g. Clothing, or something unplanned"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <OptionGroup
            options={[
              { value: 'percentage', label: '%' },
              { value: 'amount', label: 'Amount' }
            ]}
            value={mode}
            onChange={setMode}
          />
          <Input
            id="newCategoryValue"
            type="number"
            min="0"
            step="0.01"
            placeholder={mode === 'percentage' ? '% of income' : 'Amount'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full sm:flex-1"
          />
        </div>
        <Button type="submit" className="mt-2">
          Add category
        </Button>
      </form>
    </Modal>
  )
}