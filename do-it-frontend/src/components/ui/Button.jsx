const variants = {
  primary:
    'bg-gradient-to-b from-focus to-focus/80 text-ink font-semibold ' +
    'shadow-glow-focus hover:shadow-[0_0_32px_rgba(0,201,200,0.4)] hover:from-focus/95 ' +
    'active:scale-[0.97] active:shadow-none',
  mirage:
    'bg-gradient-to-r from-[#141E30] to-[#35577D] text-paper font-medium ' +
    'border border-[#557392]/35 shadow-glow-mirage hover:brightness-110 hover:border-[#7A8CA6]/50 ' +
    'active:scale-[0.97]',
  ghost:
    'bg-transparent text-paper border border-[#35577D]/35 ' +
    'hover:border-[#557392]/60 hover:bg-[#192A42]/50 active:scale-[0.97]',
  subtle:
    'bg-[#192A42] text-paper border border-[#35577D]/25 ' +
    'hover:bg-[#1E3552] hover:border-[#35577D]/45 active:scale-[0.97]',
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-card font-medium disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}