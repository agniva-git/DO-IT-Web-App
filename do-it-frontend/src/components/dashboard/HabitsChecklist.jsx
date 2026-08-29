import Card from '../ui/Card.jsx'

export default function HabitsChecklist({ habits, onToggle }) {
  return (
    <Card>
      <h3 className="font-display text-lg mb-3">Habits</h3>
      {habits.length === 0 ? (
        <p className="text-paper/40 text-sm">No habits yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {habits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onToggle(h.id)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 transition-colors ${
                    h.done
                      ? 'bg-good/20 border-good text-good'
                      : 'border-line text-transparent group-hover:border-paper/40'
                  }`}
                >
                  ✓
                </span>
                <span className={h.done ? 'text-paper/90' : 'text-paper/50'}>{h.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}