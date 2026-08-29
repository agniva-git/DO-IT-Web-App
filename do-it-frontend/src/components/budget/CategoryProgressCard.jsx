import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { budgetStatusColor } from '../../api/budget.js'

const BAR_CLASS = { good: 'bg-good', warn: 'bg-warn', danger: 'bg-danger' }
const TEXT_CLASS = { good: 'text-good', warn: 'text-warn', danger: 'text-danger' }

export default function CategoryProgressCard({ category, editable, onLogExpense, onOpenDetail }) {
  const colorKey = budgetStatusColor(category.percent_used)

  return (
    <Card
      onClick={() => onOpenDetail(category)}
      className="cursor-pointer hover:border-paper/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-lg">{category.name}</h3>
        {editable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onLogExpense(category)
            }}
            className="text-xs text-plan hover:underline shrink-0"
          >
            + Log expense
          </button>
        )}
      </div>

      {category.is_default ? (
        // No planned allocation to measure against — just the running
        // total, no progress bar implying a cap that doesn't exist.
        <p className="text-sm text-paper/50">
          Total logged:{' '}
          <span className="text-paper font-medium">{category.spent.toFixed(2)}</span>
        </p>
      ) : (
        <>
          <ProgressBar
            value={category.spent}
            max={category.computed_amount}
            colorClass={BAR_CLASS[colorKey]}
          />
          <div className="flex items-center justify-between text-sm mt-1.5">
            <span className="text-paper/50">
              {category.spent.toFixed(2)} / {category.computed_amount.toFixed(2)}
            </span>
            <span className={category.percent_used >= 100 ? TEXT_CLASS[colorKey] : 'text-paper/40'}>
              {category.percent_used >= 100
                ? `Over by ${Math.abs(category.remaining).toFixed(2)}`
                : `${category.remaining.toFixed(2)} left`}
            </span>
          </div>
        </>
      )}
    </Card>
  )
}