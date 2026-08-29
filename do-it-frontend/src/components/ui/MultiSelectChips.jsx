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
            className={`whitespace-nowrap px-4 py-2.5 rounded-card border text-sm transition-colors ${
              selected
                ? 'border-move bg-move/10 text-paper'
                : 'border-line bg-surface text-paper/70 hover:border-paper/30'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}