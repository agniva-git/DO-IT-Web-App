import { useMemo } from 'react'
import Card from '../ui/Card.jsx'
import { todayISO } from '../../api/habits.js'

const TARGET_DAYS = 21

export default function HabitMonthlyHistory({ habits, logs, activeTab }) {
  const currentMonthKey = todayISO().slice(0, 7) // 'YYYY-MM'

  const monthlyData = useMemo(() => {
    // 1. Collect all distinct months from logs and habits
    const monthSet = new Set()
    monthSet.add(currentMonthKey)

    for (const log of logs) {
      if (log.date) {
        monthSet.add(log.date.slice(0, 7))
      }
    }
    for (const habit of habits) {
      if (habit.created_at) {
        monthSet.add(habit.created_at.slice(0, 7))
      }
    }

    // Sort descending (newest month first)
    const sortedMonths = Array.from(monthSet).sort().reverse()

    return sortedMonths.map((monthKey) => {
      const [yearStr, monthStr] = monthKey.split('-')
      const year = Number(yearStr)
      const month = Number(monthStr)
      const daysInMonth = new Date(year, month, 0).getDate()
      const monthDate = new Date(year, month - 1, 1)
      const formattedTitle = monthDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      })
      const isCurrentMonth = monthKey === currentMonthKey

      // Filter habits relevant to this tab (build or leave)
      const tabHabits = habits.filter((h) => h.type === activeTab)

      // Calculate stats for each habit in this month
      const habitStats = tabHabits.map((h) => {
        const completedDates = new Set(
          logs
            .filter(
              (l) =>
                l.habit_id === h.id &&
                l.date &&
                l.date.startsWith(monthKey) &&
                l.completed
            )
            .map((l) => l.date)
        )
        const completedCount = completedDates.size
        const achieved = completedCount >= TARGET_DAYS

        return {
          habit: h,
          completedCount,
          daysInMonth,
          achieved,
          progressPct: Math.min(100, Math.round((completedCount / TARGET_DAYS) * 100))
        }
      })

      const totalAchieved = habitStats.filter((s) => s.achieved).length

      return {
        monthKey,
        formattedTitle,
        isCurrentMonth,
        daysInMonth,
        habitStats,
        totalAchieved
      }
    })
  }, [habits, logs, activeTab, currentMonthKey])

  const totalCaughtAllTime = useMemo(() => {
    let count = 0
    for (const m of monthlyData) {
      count += m.totalAchieved
    }
    return count
  }, [monthlyData])

  return (
    <div className="mt-12 pt-8 border-t border-line">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl flex items-center gap-2.5">
            <span>Monthly History & Milestones</span>
            {totalCaughtAllTime > 0 && (
              <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-good/15 text-good border border-good/30 font-medium">
                {totalCaughtAllTime} {activeTab === 'build' ? 'Caught' : 'Left'}
              </span>
            )}
          </h2>
          <p className="text-paper/50 text-xs sm:text-sm mt-0.5">
            {activeTab === 'build'
              ? 'Good habits established by hitting 21+ days in a month.'
              : 'Bad habits broken by staying clean for 21+ days in a month.'}
          </p>
        </div>
      </div>

      {monthlyData.length === 0 || habits.filter((h) => h.type === activeTab).length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-paper/40">
            {activeTab === 'build'
              ? 'Track a habit for 21+ days in a month to see your "Habit Caught" milestones here!'
              : 'Stay clean from a habit for 21+ days in a month to see your "Bad Habit Left" milestones here!'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {monthlyData.map((m) => (
            <div key={m.monthKey} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-base sm:text-lg text-paper/90">
                    {m.formattedTitle}
                  </h3>
                  {m.isCurrentMonth && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-plan/15 text-plan border border-plan/30 font-medium">
                      Current Month
                    </span>
                  )}
                </div>
                {m.totalAchieved > 0 && (
                  <span className="text-xs text-good font-medium">
                    {m.totalAchieved} {activeTab === 'build' ? 'habit caught 🎉' : 'habit left 🛡️'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {m.habitStats.map((stat) => (
                  <Card key={stat.habit.id} className="relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-medium text-sm sm:text-base text-paper">
                          {stat.habit.name}
                        </h4>
                        <span className="text-xs text-paper/50">
                          {stat.completedCount} / {stat.daysInMonth} days logged
                        </span>
                      </div>

                      {stat.achieved ? (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 flex items-center gap-1.5 ${
                            activeTab === 'build'
                              ? 'bg-good/15 text-good border-good/40'
                              : 'bg-plan/15 text-plan border-plan/40'
                          }`}
                        >
                          {activeTab === 'build' ? (
                            <>
                              <span>Habit Caught</span>
                              <span>🎉</span>
                            </>
                          ) : (
                            <>
                              <span>Habit Left</span>
                              <span>🛡️</span>
                            </>
                          )}
                        </span>
                      ) : m.isCurrentMonth ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-surfaceRaised text-paper/60 border border-line font-medium shrink-0">
                          {TARGET_DAYS - stat.completedCount > 0
                            ? `${TARGET_DAYS - stat.completedCount} days to goal`
                            : 'Goal reached!'}
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-surfaceRaised text-paper/40 border border-line/60 font-normal shrink-0">
                          Attempted
                        </span>
                      )}
                    </div>

                    {/* Progress bar towards 21-day milestone */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-paper/40 mb-1">
                        <span>Milestone Progress (21 days target)</span>
                        <span>{stat.completedCount} / 21</span>
                      </div>
                      <div className="w-full h-2 bg-surfaceRaised rounded-full overflow-hidden border border-line/40">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            stat.achieved
                              ? activeTab === 'build'
                                ? 'bg-good'
                                : 'bg-plan'
                              : 'bg-paper/30'
                          }`}
                          style={{ width: `${stat.progressPct}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
