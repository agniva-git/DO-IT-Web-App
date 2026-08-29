import Card from '../ui/Card.jsx'

export default function FocusSummary({ sessionsThisWeek, totalMinutes }) {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return (
    <Card>
      <h3 className="font-display text-lg mb-3 text-focus">Focus</h3>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-display">{sessionsThisWeek} sessions</span>
        <span className="text-sm text-paper/50">this week</span>
        <span className="text-sm text-paper/50 mt-1">
          {hours}h {mins}m total
        </span>
      </div>
    </Card>
  )
}