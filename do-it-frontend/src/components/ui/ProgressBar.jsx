export default function ProgressBar({ value, max, colorClass = 'bg-plan' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2 bg-line rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-paper/40 font-mono">{pct}%</span>
    </div>
  )
}