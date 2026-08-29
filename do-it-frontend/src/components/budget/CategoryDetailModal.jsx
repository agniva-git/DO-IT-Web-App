import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { listCategoryExpenses, renameCategory, formatExpenseDate } from '../../api/budget.js'

export default function CategoryDetailModal({
  category,
  editable,
  onRenamed,
  onDeleteCategory,
  onClose
}) {
  const [name, setName] = useState('')
  const [expenses, setExpenses] = useState([])
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!category) return
    setName(category.name)
    setLoadingExpenses(true)
    listCategoryExpenses(category.id)
      .then(setExpenses)
      .finally(() => setLoadingExpenses(false))
  }, [category])

  if (!category) return null

  // The default "Sudden Expenses" category is entirely locked — not
  // just the allocation, the name and its existence too.
  const canEdit = editable && !category.is_default

  const handleSave = async () => {
    if (!name.trim() || name.trim() === category.name) return
    setSaving(true)
    try {
      await onRenamed(category.id, name.trim())
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={!!category} onClose={onClose} title={category.name}>
      <div className="flex flex-col gap-5">
        {canEdit && (
          <div className="flex flex-col gap-3 pb-4 border-b border-line">
            <h4 className="text-sm text-paper/60">Rename this category</h4>
            <p className="text-xs text-paper/40">
              The allocated amount can't be changed once set — only the name.
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="editCategoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="subtle"
                onClick={handleSave}
                disabled={saving || !name.trim() || name.trim() === category.name}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
            <button
              type="button"
              onClick={() => onDeleteCategory(category.id)}
              className="text-sm text-danger hover:underline text-left"
            >
              Delete category
            </button>
          </div>
        )}

        {category.is_default && (
          <p className="text-xs text-paper/40 pb-4 border-b border-line">
            This category always exists and can't be renamed or deleted.
          </p>
        )}

        <div>
          <h4 className="text-sm text-paper/60 mb-3">Logged expenses</h4>
          {loadingExpenses ? (
            <p className="text-paper/40 text-sm">Loading…</p>
          ) : expenses.length === 0 ? (
            <p className="text-paper/40 text-sm">Nothing logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {expenses.map((exp) => (
                <li
                  key={exp.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-card border border-line bg-surfaceRaised text-sm"
                >
                  <div className="flex flex-col min-w-0">
                    <span>{exp.amount.toFixed(2)}</span>
                    {exp.note && (
                      <span className="text-xs text-paper/40 truncate">{exp.note}</span>
                    )}
                  </div>
                  <span className="text-paper/40 text-xs shrink-0">
                    {formatExpenseDate(exp.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}