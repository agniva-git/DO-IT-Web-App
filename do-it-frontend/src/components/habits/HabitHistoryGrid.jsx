export default function HabitHistoryGrid({ days }) {
  return (
    <div className="flex gap-1">
      {days.map((d) => (
        <span
          key={d.date}
          title={d.date}
          className={`w-4 h-4 rounded-sm ${d.completed ? 'bg-good' : 'bg-line'}`}
        />
      ))}
    </div>
  )
}