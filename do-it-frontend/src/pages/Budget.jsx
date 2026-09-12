import { useState, useEffect } from 'react'
import Button from '../components/ui/Button.jsx'
import BudgetSetupForm from '../components/budget/BudgetSetupForm.jsx'
import BudgetSummaryCard from '../components/budget/BudgetSummaryCard.jsx'
import CategoryProgressCard from '../components/budget/CategoryProgressCard.jsx'
import CategoryDetailModal from '../components/budget/CategoryDetailModal.jsx'
import AddCategoryModal from '../components/budget/AddCategoryModal.jsx'
import LogExpenseForm from '../components/budget/LogExpenseForm.jsx'
import BudgetHistoryList from '../components/budget/BudgetHistoryList.jsx'
import {
  listMonths,
  createMonth,
  getMonth,
  deleteMonth,
  addCategory,
  renameCategory,
  deleteCategory,
  logExpense,
  currentYearMonth,
  monthName
} from '../api/budget.js'

export default function Budget() {
  const { year, month } = currentYearMonth()
  const [months, setMonths] = useState([])
  const [currentMonth, setCurrentMonth] = useState(null)
  const [viewingMonth, setViewingMonth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [setupSubmitting, setSetupSubmitting] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [expenseCategory, setExpenseCategory] = useState(null)
  const [detailCategory, setDetailCategory] = useState(null)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  // Inline confirmation state — avoids window.confirm which blocks on mobile.
  // { type: 'category' | 'month', id } when a delete is pending user confirmation.
  const [pendingDelete, setPendingDelete] = useState(null)

  const loadAll = async () => {
    const summaries = await listMonths()
    setMonths(summaries)
    const currentSummary = summaries.find((m) => m.year === year && m.month === month)
    if (currentSummary) {
      const full = await getMonth(currentSummary.id)
      setCurrentMonth(full)
    } else {
      setCurrentMonth(null)
    }
  }

  useEffect(() => {
    loadAll()
      .catch(() => setError('Could not load budget data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const refreshCurrentAndSummaries = async (updatedMonth) => {
    setCurrentMonth(updatedMonth)
    const summaries = await listMonths()
    setMonths(summaries)
  }

  const handleCreateMonth = async (payload) => {
    setSetupSubmitting(true)
    setSetupError('')
    try {
      const created = await createMonth({ ...payload, year, month })
      await refreshCurrentAndSummaries(created)
    } catch (err) {
      setSetupError(
        err.response?.data?.detail || 'Something went wrong creating this budget.'
      )
    } finally {
      setSetupSubmitting(false)
    }
  }

  const handleSaveExpense = async (expenseData) => {
    try {
      await logExpense(expenseCategory.id, expenseData)
      setExpenseCategory(null)
      const refreshed = await getMonth(currentMonth.id)
      await refreshCurrentAndSummaries(refreshed)
    } catch (err) {
      // Most likely: tried to log a Sudden Expense without a description.
      alert(err.response?.data?.detail || 'Could not log that expense.')
    }
  }

  const handleAddCategory = async (categoryInput) => {
    const updated = await addCategory(currentMonth.id, categoryInput)
    setAddCategoryOpen(false)
    await refreshCurrentAndSummaries(updated)
  }

  const handleRenameCategory = async (categoryId, name) => {
    const updated = await renameCategory(categoryId, name)
    await refreshCurrentAndSummaries(updated)
    const fresh = updated.categories.find((c) => c.id === categoryId)
    if (fresh) setDetailCategory(fresh)
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!pendingDelete || pendingDelete.type !== 'category' || pendingDelete.id !== categoryId) {
      setPendingDelete({ type: 'category', id: categoryId })
      return
    }
    setPendingDelete(null)
    const updated = await deleteCategory(categoryId)
    setDetailCategory(null)
    await refreshCurrentAndSummaries(updated)
  }

  const handleSelectHistoryMonth = async (id) => {
    const full = await getMonth(id)
    setViewingMonth(full)
  }

  const handleDeleteMonth = async (id) => {
    if (!pendingDelete || pendingDelete.type !== 'month' || pendingDelete.id !== id) {
      setPendingDelete({ type: 'month', id })
      return
    }
    setPendingDelete(null)
    await deleteMonth(id)
    if (viewingMonth?.id === id) setViewingMonth(null)
    if (currentMonth?.id === id) setCurrentMonth(null)
    const summaries = await listMonths()
    setMonths(summaries)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading budget…</p>
      </div>
    )
  }

  const historyMonths = months.filter((m) => !(m.year === year && m.month === month))
  const activeMonth = viewingMonth || currentMonth
  const isEditable = !viewingMonth
  // Sudden Expenses always sorts last — it's the catch-all, not a
  // planned priority.
  const sortedCategories = activeMonth
    ? [...activeMonth.categories].sort((a, b) => (a.is_default ? 1 : 0) - (b.is_default ? 1 : 0))
    : []

  return (
    <div className="min-h-screen px-3.5 py-4 sm:px-6 sm:py-8 md:px-10 md:py-10">
      <header className="mb-5">
        <h1 className="font-display text-2xl sm:text-3xl">Expenses</h1>
        <p className="text-paper/50 mt-0.5 text-sm sm:text-base">Plan it, spend it, see where it went.</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {activeMonth ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-xl">
              {monthName(activeMonth.month)} {activeMonth.year}
            </h2>
            <div className="flex gap-2 flex-wrap items-center">
              {viewingMonth ? (
                <Button variant="ghost" onClick={() => setViewingMonth(null)}>
                  Back to {monthName(month)}
                </Button>
              ) : (
                <>
                  <Button variant="subtle" onClick={() => setAddCategoryOpen(true)}>
                    + Add category
                  </Button>
                  {pendingDelete?.type === 'month' && pendingDelete.id === activeMonth.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-danger">Sure? This deletes all data.</span>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteMonth(activeMonth.id)}
                        className="text-danger border-danger/30 hover:border-danger"
                      >
                        Yes, delete
                      </Button>
                      <Button variant="subtle" onClick={() => setPendingDelete(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteMonth(activeMonth.id)}
                      className="text-danger border-danger/30 hover:border-danger"
                    >
                      Delete &amp; redo
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <BudgetSummaryCard month={activeMonth} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedCategories.map((cat) => (
              <CategoryProgressCard
                key={cat.id}
                category={cat}
                editable={isEditable}
                onLogExpense={setExpenseCategory}
                onOpenDetail={setDetailCategory}
              />
            ))}
          </div>
        </div>
      ) : (
        <BudgetSetupForm
          monthLabel={`${monthName(month)} ${year}`}
          onSubmit={handleCreateMonth}
          submitting={setupSubmitting}
          error={setupError}
        />
      )}

      <div className="mt-6">
        <BudgetHistoryList
          months={historyMonths}
          onSelect={handleSelectHistoryMonth}
          onDelete={handleDeleteMonth}
        />
      </div>

      <LogExpenseForm
        open={!!expenseCategory}
        category={expenseCategory}
        onClose={() => setExpenseCategory(null)}
        onSave={handleSaveExpense}
      />

      <AddCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSave={handleAddCategory}
      />

      <CategoryDetailModal
        category={detailCategory}
        editable={isEditable}
        onRenamed={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onClose={() => setDetailCategory(null)}
      />
    </div>
  )
}