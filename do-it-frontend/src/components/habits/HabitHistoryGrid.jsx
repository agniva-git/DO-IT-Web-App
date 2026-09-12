export default function HabitHistoryGrid({ days }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full py-1">
      {days.map((d) => (
        <span
          key={d.date}
          title={d.date}
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm shrink-0 transition-colors ${
            d.completed ? 'bg-good' : 'bg-line'
          }`}
        />
      ))}
    </div>
  )
}