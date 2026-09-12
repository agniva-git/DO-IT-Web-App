export default function OptionGroup({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 max-w-full overflow-x-auto py-0.5 ${className}`}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-card border text-sm font-medium transition-colors shrink-0 ${
              selected
                ? 'border-plan bg-plan/15 text-paper'
                : 'border-line bg-surface text-paper/70 hover:border-paper/30'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}