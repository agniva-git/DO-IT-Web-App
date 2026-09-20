export default function MultiSelectChips({ options, values, onChange }) {
  const toggle = (value) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`
              whitespace-nowrap px-4 py-2.5 rounded-card border text-sm
              transition-colors duration-200 active:scale-[0.96]
              ${selected
                ? 'border-move/50 bg-move/10 text-paper'
                : 'border-white/[0.10] bg-white/[0.03] text-paper/60 hover:border-white/[0.20] hover:text-paper'}
            `}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}