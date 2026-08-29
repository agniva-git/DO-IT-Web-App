import Card from '../ui/Card.jsx'

const STATUS_STYLES = {
  complete: 'bg-good/15 text-good',
  partial: 'bg-warn/15 text-warn',
  skipped: 'bg-danger/15 text-danger'
}

const STATUS_LABEL = {
  complete: 'Complete',
  partial: 'Partial',
  skipped: 'Skipped'
}

export default function FocusSessionHistory({ sessions }) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Session history</h3>
      {sorted.length === 0 ? (
        <p className="text-paper/40 text-sm">No focus sessions yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
            >
              <span className="text-paper/80">{s.label}</span>
              <span className="text-paper/40 font-mono text-xs">{s.date}</span>
              <span className="text-paper/50">{s.planned_minutes} min</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>
                {STATUS_LABEL[s.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}