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
            className={`
              whitespace-nowrap px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-card border text-sm font-medium
              transition-colors duration-200 shrink-0 active:scale-[0.96]
              ${selected
                ? 'border-plan/50 bg-plan/10 text-paper'
                : 'border-white/[0.10] bg-white/[0.03] text-paper/60 hover:border-white/[0.20] hover:text-paper'}
            `}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}