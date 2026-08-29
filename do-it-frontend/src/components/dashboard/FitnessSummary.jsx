import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

export default function FitnessSummary({ daysTrained, goal, message }) {
  return (
    <Card>
      <h3 className="font-display text-lg mb-3 text-move">Fitness</h3>
      <div className="flex flex-col gap-2">
        <span className="text-2xl font-display">
          {daysTrained} / {goal}
        </span>
        <ProgressBar value={daysTrained} max={goal} colorClass="bg-move" />
        <span className="text-sm text-paper/50">{message}</span>
      </div>
    </Card>
  )
}