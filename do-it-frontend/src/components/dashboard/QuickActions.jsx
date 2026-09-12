/**
 * Quick-action chips at the top of the Dashboard.
 *
 * Focus / Task / Workout → navigate to their full pages
 * Expense → opens the inline QuickExpenseModal (passed via onExpense prop)
 */
export default function QuickActions({ onStartFocus, onAddTask, onLogWorkout, onLogExpense }) {
  const actions = [
    {
      label: '⏱ Focus',
      handler: onStartFocus,
      color: 'text-focus border-focus/30 hover:bg-focus/10'
    },
    {
      label: '+ Task',
      handler: onAddTask,
      color: 'text-plan border-plan/30 hover:bg-plan/10'
    },
    {
      label: '💪 Workout',
      handler: onLogWorkout,
      color: 'text-move border-move/30 hover:bg-move/10'
    },
    {
      label: '+ Expense',
      handler: onLogExpense,
      color: 'text-good border-good/30 hover:bg-good/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5">
      {actions.map(({ label, handler, color }) => (
        <button
          key={label}
          type="button"
          onClick={handler}
          className={`flex items-center justify-center py-2.5 px-3 sm:px-4 rounded-card border text-sm font-medium transition-colors ${color}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
