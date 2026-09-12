import Card from '../ui/Card.jsx'

export default function BudgetSummaryCard({ month }) {
  const overBudget = month.unallocated < 0
  const overSpent = month.total_spent > month.income - month.savings_amount

  return (
    <Card className={overSpent ? 'border-danger/40' : ''}>
      <h3 className="font-display text-lg mb-3">This month</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-paper/50 block">Income</span>
          <span className="font-display text-lg sm:text-xl truncate block">{month.income.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-paper/50 block">Savings target</span>
          <span className="font-display text-lg sm:text-xl text-good truncate block">
            {month.savings_amount.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-paper/50 block">Spent so far</span>
          <span className="font-display text-lg sm:text-xl truncate block">{month.total_spent.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-paper/50 block">
            {overBudget ? 'Over budget by' : 'Unallocated'}
          </span>
          <span className={`font-display text-lg sm:text-xl truncate block ${overBudget ? 'text-danger' : ''}`}>
            {Math.abs(month.unallocated).toFixed(2)}
          </span>
        </div>
      </div>
      {overSpent && (
        <p className="text-sm text-danger mt-3">
          You've spent more than your planned budget (income minus savings) for
          this month.
        </p>
      )}
    </Card>
  )
}