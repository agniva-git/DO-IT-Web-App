import Card from '../ui/Card.jsx'

export default function StatCard({ label, value, unit, colorClass = 'text-paper' }) {
  return (
    <Card>
      <p className="text-sm text-paper/50 mb-1">{label}</p>
      <p className={`font-display text-3xl ${colorClass}`}>
        {value}
        {unit && <span className="text-lg text-paper/40 ml-1">{unit}</span>}
      </p>
    </Card>
  )
}