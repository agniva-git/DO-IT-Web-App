export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm text-paper/70">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
          checked ? 'bg-plan' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-paper transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}