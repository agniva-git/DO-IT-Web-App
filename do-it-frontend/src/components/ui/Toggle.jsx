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
          border outline-none
          ${checked
            ? 'bg-gradient-to-r from-[#0B1D3A] to-[#1B4167] border-[#6E88A3]/50 shadow-glow-mirage'
            : 'bg-[#102A4C] border-[#1B4167]/45'}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-5 h-5 rounded-full
            border-0 outline-none
            shadow-[0_1px_4px_rgba(6,16,31,0.6)]
            transition-all duration-200
            ${checked
              ? 'translate-x-[22px] bg-paper'
              : 'translate-x-0.5 bg-paper/90'}
          `}
        />
      </button>
    </label>
  )
}