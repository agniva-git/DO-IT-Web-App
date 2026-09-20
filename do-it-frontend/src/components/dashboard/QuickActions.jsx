/**
 * Quick-action chips at the top of the Dashboard.
 * Styled in the Navy Mirage pill aesthetic (Image 2).
 */
export default function QuickActions({ onStartFocus, onAddTask, onLogWorkout, onLogExpense }) {
  const actions = [
    {
      label: '⏱ Focus',
      handler: onStartFocus,
      accent: 'border-l-focus/70 text-focus hover:bg-focus/[0.08]',
    },
    {
      label: '+ Task',
      handler: onAddTask,
      accent: 'border-l-plan/70 text-plan hover:bg-plan/[0.08]',
    },
    {
      label: '💪 Workout',
      handler: onLogWorkout,
      accent: 'border-l-move/70 text-move hover:bg-move/[0.08]',
    },
    {
      label: '+ Expense',
      handler: onLogExpense,
      accent: 'border-l-good/70 text-good hover:bg-good/[0.08]',
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
            rounded-card border border-[#35577D]/35 border-l-2
            bg-[#141E30] text-sm font-medium
            shadow-[inset_0_1px_0_rgba(196,210,225,0.08)]
            transition-colors duration-200
            hover:bg-[#192A42] hover:border-[#35577D]/60 hover:shadow-glow-mirage
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
