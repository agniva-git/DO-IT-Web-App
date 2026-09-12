import { useState, useMemo } from 'react'
import Card from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'
import CategoryInputRow from './CategoryInputRow.jsx'
import { CATEGORY_SUGGESTIONS } from '../../api/budget.js'

let nextKey = 0

const emptyCategory = (name = '') => ({
  key: nextKey++,
  name,
  input_mode: 'amount',
  value: ''
})

function resolveAmount(mode, value, income) {
  const n = Number(value) || 0
  return mode === 'percentage' ? (income * n) / 100 : n
}

export default function BudgetSetupForm({ monthLabel, onSubmit, submitting, error }) {
  const [income, setIncome] = useState('')
  const [categories, setCategories] = useState([emptyCategory('Food'), emptyCategory('Rent')])
  const [savingsMode, setSavingsMode] = useState('amount')
  const [savingsValue, setSavingsValue] = useState('')

  const incomeNum = Number(income) || 0

  const addSuggestion = (name) => {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return
    setCategories((cs) => [...cs, emptyCategory(name)])
  }

  const addCustom = () => setCategories((cs) => [...cs, emptyCategory('')])

  const updateCategory = (key, updated) =>
    setCategories((cs) => cs.map((c) => (c.key === key ? updated : c)))

  const removeCategory = (key) => setCategories((cs) => cs.filter((c) => c.key !== key))

  const summary = useMemo(() => {
    const categoryTotal = categories.reduce(
      (sum, c) => sum + resolveAmount(c.input_mode, c.value, incomeNum),
      0
    )
    const savingsAmount = resolveAmount(savingsMode, savingsValue, incomeNum)
    const totalAllocated = categoryTotal + savingsAmount
    return {
      categoryTotal,
      savingsAmount,
      totalAllocated,
      unallocated: incomeNum - totalAllocated
    }
  }, [categories, incomeNum, savingsMode, savingsValue])

  const canSubmit =
    incomeNum > 0 &&
    categories.some((c) => c.name.trim() && Number(c.value) > 0) &&
    savingsValue !== ''

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      income: incomeNum,
      savings_mode: savingsMode,
      savings_value: Number(savingsValue) || 0,
      categories: categories
        .filter((c) => c.name.trim() && Number(c.value) > 0)
        .map((c) => ({ name: c.name.trim(), input_mode: c.input_mode, value: Number(c.value) }))
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <h3 className="font-display text-lg mb-4">Set up {monthLabel}</h3>
        <Input
          id="income"
          type="number"
          min="0"
          step="0.01"
          label="Total income this month"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="font-display text-lg mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORY_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSuggestion(s)}
              className="px-3 py-1.5 rounded-card border border-line bg-surface text-sm text-paper/70 hover:border-plan/50 hover:text-paper transition-colors"
            >
              + {s}
            </button>
          ))}
          <button
            type="button"
            onClick={addCustom}
            className="px-3 py-1.5 rounded-card border border-line bg-surface text-sm text-paper/70 hover:border-plan/50 hover:text-paper transition-colors"
          >
            + Custom category
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <CategoryInputRow
              key={cat.key}
              category={cat}
              onChange={(updated) => updateCategory(cat.key, updated)}
              onRemove={() => removeCategory(cat.key)}
            />
          ))}
          {categories.length === 0 && (
            <p className="text-paper/40 text-sm">Add at least one category above.</p>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg mb-3">How much do you want to save?</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <OptionGroup
            options={[
              { value: 'percentage', label: '%' },
              { value: 'amount', label: 'Amount' }
            ]}
            value={savingsMode}
            onChange={setSavingsMode}
          />
          <Input
            id="savingsValue"
            type="number"
            min="0"
            step="0.01"
            placeholder={savingsMode === 'percentage' ? '% of income' : 'Amount'}
            value={savingsValue}
            onChange={(e) => setSavingsValue(e.target.value)}
            className="w-full sm:flex-1"
          />
        </div>
      </Card>

      <Card className={summary.unallocated < 0 ? 'border-danger/40' : ''}>
        <h3 className="font-display text-lg mb-3">Summary</h3>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-paper/60">Income</span>
            <span>{incomeNum.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-paper/60">Categories</span>
            <span>{summary.categoryTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-paper/60">Savings</span>
            <span>{summary.savingsAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium pt-1.5 border-t border-line">
            <span>{summary.unallocated < 0 ? 'Over budget by' : 'Unallocated'}</span>
            <span className={summary.unallocated < 0 ? 'text-danger' : 'text-good'}>
              {Math.abs(summary.unallocated).toFixed(2)}
            </span>
          </div>
        </div>
        {summary.unallocated < 0 && (
          <p className="text-sm text-danger mt-3">
            Your categories and savings add up to more than your income. You can
            still save this — just know it's a deficit plan.
          </p>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!canSubmit || submitting}>
        {submitting ? 'Creating…' : 'Create this month\u2019s budget'}
      </Button>
    </form>
  )
}