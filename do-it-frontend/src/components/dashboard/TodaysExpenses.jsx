import Card from '../ui/Card.jsx'

export default function TodaysExpenses({ expenses, total }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-display text-lg text-good">Spent today</h3>
        <span className="text-sm text-paper/50 shrink-0">{total.toFixed(2)}</span>
      </div>
      {expenses.length === 0 ? (
        <p className="text-paper/40 text-sm">No expenses logged today.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-paper/80 truncate">{e.category_name}</span>
                {e.note && <span className="text-xs text-paper/40 truncate">{e.note}</span>}
              </div>
              <span className="text-paper/50 shrink-0">{e.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}