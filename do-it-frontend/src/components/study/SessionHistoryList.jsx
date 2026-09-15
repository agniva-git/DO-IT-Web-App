import { useState } from 'react'
import Card from '../ui/Card.jsx'

export default function SessionHistoryList({ sessions, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  const handleDelete = async (id) => {
    if (!onDelete || deletingId) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Session history</h3>
      {sorted.length === 0 ? (
        <p className="text-paper/40 text-sm">No sessions logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((s) => {
            const isDeleting = deletingId === s.id
            return (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 rounded-card border border-line bg-surfaceRaised text-sm"
              >
                <span className="text-paper/80 min-w-0 truncate">{s.subject}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-paper/40 font-mono text-xs">{s.date}</span>
                  <span className="text-plan font-medium">{s.duration} min</span>
                  {onDelete && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(s.id)}
                      className="text-paper/40 hover:text-danger disabled:opacity-50 text-xs px-1.5 py-0.5 rounded transition-colors"
                      title="Delete session"
                      aria-label="Delete session"
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}