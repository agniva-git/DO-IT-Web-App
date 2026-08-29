const variants = {
  primary: 'bg-plan text-ink hover:bg-plan/90',
  ghost: 'bg-transparent text-paper border border-line hover:border-paper/40',
  subtle: 'bg-surfaceRaised text-paper hover:bg-surfaceRaised/80'
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`px-5 py-3 rounded-card font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}