import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

export default function TodayProgress({ completed, total }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">Today's progress</h3>
        <span className="text-sm text-paper/50">
          {completed} / {total} tasks
        </span>
      </div>
      <ProgressBar value={completed} max={total} colorClass="bg-plan" />
    </Card>
  )
}