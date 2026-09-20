export default function ProgressBar({ value, max, colorClass = 'bg-plan' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_currentColor]`}
        style={{ width: `${pct}%`, opacity: pct === 0 ? 0 : 1 }}
      />
    </div>
  )
}