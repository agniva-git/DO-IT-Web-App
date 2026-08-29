import { useState, useMemo } from 'react'
import Card from '../ui/Card.jsx'
import { monthName } from '../../api/budget.js'

const MONTH_OPTIONS = [
  { value: '', label: 'All months' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: monthName(i + 1) }))
]

export default function BudgetHistoryList({ months, onSelect, onDelete }) {
  const [yearFilter, setYearFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  const years = useMemo(
    () => [...new Set(months.map((m) => m.year))].sort((a, b) => b - a),
    [months]
  )

  const filtered = useMemo(() => {
    return months.filter(
      (m) =>
        (!yearFilter || m.year === Number(yearFilter)) &&
        (!monthFilter || m.month === Number(monthFilter))
    )
  }, [months, yearFilter, monthFilter])

  if (months.length === 0) return null

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-display text-lg">History</h3>
        <div className="flex gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-surfaceRaised border border-line rounded-card px-3 py-1.5 text-sm text-paper"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-surfaceRaised border border-line rounded-card px-3 py-1.5 text-sm text-paper"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-paper/40 text-sm">No budgets match that filter.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
            >
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                className="text-paper/80 hover:text-paper text-left flex-1"
              >
                {monthName(m.month)} {m.year}
              </button>
              <span className="text-paper/40 mr-3">
                {m.total_spent.toFixed(2)} / {(m.total_allocated - m.savings_amount).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="text-xs text-paper/40 hover:text-danger px-2 py-1"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}