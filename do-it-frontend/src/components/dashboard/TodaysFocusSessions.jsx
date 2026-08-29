import Card from '../ui/Card.jsx'

const STATUS_STYLES = {
  complete: 'bg-good/15 text-good',
  partial: 'bg-warn/15 text-warn',
  skipped: 'bg-danger/15 text-danger'
}

export default function TodaysFocusSessions({ sessions }) {
  return (
    <Card>
      <h3 className="font-display text-lg mb-4 text-focus">Focus today</h3>
      {sessions.length === 0 ? (
        <p className="text-paper/40 text-sm">No focus sessions logged today.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
            >
              <span className="text-paper/80 min-w-0 truncate">{s.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-paper/50">{s.planned_minutes} min</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>
                  {s.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}