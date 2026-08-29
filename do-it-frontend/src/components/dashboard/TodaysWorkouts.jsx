import Card from '../ui/Card.jsx'

export default function TodaysWorkouts({ workouts }) {
  return (
    <Card>
      <h3 className="font-display text-lg mb-4 text-move">Fitness today</h3>
      {workouts.length === 0 ? (
        <p className="text-paper/40 text-sm">No workouts logged today.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {workouts.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
            >
              <div className="flex flex-wrap gap-1.5">
                {w.body_parts.map((part) => (
                  <span
                    key={part}
                    className="text-xs px-2 py-0.5 rounded-full bg-move/15 text-move"
                  >
                    {part}
                  </span>
                ))}
              </div>
              <span className="text-paper/50 shrink-0">{w.duration} min</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}