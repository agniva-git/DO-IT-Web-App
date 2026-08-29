import Card from '../ui/Card.jsx'

export default function SessionHistoryList({ sessions }) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Session history</h3>
      {sorted.length === 0 ? (
        <p className="text-paper/40 text-sm">No sessions logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
            >
              <span className="text-paper/80">{s.subject}</span>
              <span className="text-paper/40 font-mono text-xs">{s.date}</span>
              <span className="text-plan">{s.duration} min</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}