export default function OptionGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-card border text-sm transition-colors ${
              selected
                ? 'border-plan bg-plan/10 text-paper'
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