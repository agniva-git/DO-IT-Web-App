export default function Card({ children, className = '', onClick, interactive = false }) {
  return (
    <div
      className={[
        // Layered glass surface
        'bg-surface border border-white/[0.07]',
        'rounded-card p-4 sm:p-6',
        // Subtle inner highlight on the top edge via box-shadow
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.35)]',
        // Entrance animation
        'animate-fadeUp',
        // Interactive press feel (opt-in)
        interactive
          ? 'cursor-pointer hover:border-white/[0.14] active:scale-[0.98]'
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