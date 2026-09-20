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
        // Midnight Blue surface (#0B1D3A) or signature gradient (#0B1D3A to #1B4167)
        isMirage
          ? 'bg-gradient-to-r from-[#0B1D3A] to-[#1B4167] border border-[#6E88A3]/30 shadow-card-rim'
          : 'bg-surface border border-[#1B4167]/35 shadow-card-rim',
        'rounded-card p-4 sm:p-6',
        // Entrance animation
        'animate-fadeUp',
        // Interactive press feel (opt-in)
        interactive
          ? 'cursor-pointer hover:border-[#1B4167]/65 hover:shadow-glow-midnight active:scale-[0.98]'
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