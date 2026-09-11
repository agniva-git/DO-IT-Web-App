/**
 * Returns today's date as YYYY-MM-DD in the *local* timezone.
 *
 * Do NOT use `new Date().toISOString().slice(0,10)` — that returns the UTC
 * date, which is wrong for IST (UTC+5:30) users any time before 5:30 AM or
 * past midnight UTC.  This helper is the single source of truth for "today"
 * across the entire app.
 */
export function localDateISO(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns a date N days in the past as YYYY-MM-DD in the local timezone.
 */
export function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return localDateISO(d)
}

/**
 * Returns the Monday of the current week (midnight local time).
 */
export function startOfThisWeek() {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Returns the first day of the current calendar month (midnight local time).
 */
export function startOfThisMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Returns a greeting phrase based on current hour.
 */
export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

/**
 * Formats a Date as a human-readable string, e.g. "Thursday, September 11".
 */
export function formatDateLong(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}
