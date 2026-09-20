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
      accent: 'border-l-focus/60 text-focus hover:bg-focus/[0.08]',
    },
    {
      label: '+ Task',
      handler: onAddTask,
      accent: 'border-l-plan/60 text-plan hover:bg-plan/[0.08]',
    },
    {
      label: '💪 Workout',
      handler: onLogWorkout,
      accent: 'border-l-move/60 text-move hover:bg-move/[0.08]',
    },
    {
      label: '+ Expense',
      handler: onLogExpense,
      accent: 'border-l-good/60 text-good hover:bg-good/[0.08]',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5">
      {actions.map(({ label, handler, accent }) => (
        <button
          key={label}
          type="button"
          onClick={handler}
          className={`
            flex items-center justify-center py-2.5 px-3 sm:px-4
            rounded-card border border-white/[0.08] border-l-2
            bg-white/[0.03] text-sm font-medium
            transition-all duration-150 ease-spring
            active:scale-[0.96]
            ${accent}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
