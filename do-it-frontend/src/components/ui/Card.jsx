export default function Card({
  children,
  className = '',
  onClick,
  interactive = false,
  variant = 'default',
}) {
  const isMirage = variant === 'mirage'

  return (
    <div
      className={[
        // Base Navy Mirage surface or signature gradient
        isMirage
          ? 'bg-gradient-to-r from-[#141E30] to-[#35577D] border border-[#557392]/30 shadow-card-rim'
          : 'bg-surface border border-[#35577D]/25 shadow-card-rim',
        'rounded-card p-4 sm:p-6',
        // Entrance animation
        'animate-fadeUp',
        // Interactive press feel (opt-in)
        interactive
          ? 'cursor-pointer hover:border-[#35577D]/50 hover:shadow-glow-mirage active:scale-[0.98]'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}