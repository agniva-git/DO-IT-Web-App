export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span className="text-sm text-textSecondary">{label}</span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          w-11 h-6 rounded-full relative shrink-0
          transition-all duration-200
          border-0 outline-none
          ${checked
            ? 'bg-focus shadow-glow-focus'
            : 'bg-white/[0.12]'}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-5 h-5 rounded-full
            border-0 outline-none
            shadow-[0_1px_4px_rgba(0,0,0,0.5)]
            transition-all duration-200 ease-spring
            ${checked
              ? 'translate-x-[22px] bg-ink'
              : 'translate-x-0.5 bg-paper/90'}
          `}
        />
      </button>
    </label>
  )
}