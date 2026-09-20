export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 select-none ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      }`}
    >
      <span className="text-sm text-textSecondary font-medium">{label}</span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          w-11 h-6 p-0.5 rounded-full relative inline-flex items-center shrink-0
          transition-all duration-200 outline-none
          ${
            checked
              ? 'bg-focus border border-focus shadow-[0_0_16px_rgba(0,201,200,0.45)]'
              : 'bg-[#06101F] border border-[#1B4167]/70'
          }
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            w-5 h-5 rounded-full pointer-events-none block
            transition-transform duration-200 ease-spring
            ${
              checked
                ? 'translate-x-5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)]'
                : 'translate-x-0 bg-[#6E88A3] shadow-inner'
            }
          `}
        />
      </button>
    </label>
  )
}