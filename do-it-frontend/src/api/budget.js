import api from './client.js'

export const CATEGORY_SUGGESTIONS = ['Food', 'Rent', 'Clothing', 'Other essentials']

export const listMonths = () => api.get('/budget/months').then((res) => res.data)

export const createMonth = (payload) =>
  api.post('/budget/months', payload).then((res) => res.data)

export const getMonth = (id) => api.get(`/budget/months/${id}`).then((res) => res.data)

export const deleteMonth = (id) => api.delete(`/budget/months/${id}`)

export const addCategory = (monthId, category) =>
  api.post(`/budget/months/${monthId}/categories`, category).then((res) => res.data)

// Only { name } is ever sent — the allocated amount/mode is locked
// after creation, enforced server-side too.
export const renameCategory = (categoryId, name) =>
  api.patch(`/budget/categories/${categoryId}`, { name }).then((res) => res.data)

export const deleteCategory = (categoryId) =>
  api.delete(`/budget/categories/${categoryId}`).then((res) => res.data)

export const logExpense = (categoryId, expense) =>
  api.post(`/budget/categories/${categoryId}/expenses`, expense).then((res) => res.data)

export const listCategoryExpenses = (categoryId) =>
  api.get(`/budget/categories/${categoryId}/expenses`).then((res) => res.data)

export const listMonthExpenses = (monthId) =>
  api.get(`/budget/months/${monthId}/expenses`).then((res) => res.data)

export function currentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function monthName(month) {
  return new Date(2000, month - 1, 1).toLocaleDateString(undefined, { month: 'long' })
}

export function budgetStatusColor(percentUsed) {
  if (percentUsed >= 100) return 'danger'
  if (percentUsed >= 80) return 'warn'
  return 'good'
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Always "DD Mon YYYY" regardless of browser locale — toLocaleDateString
// varies by locale/device, which isn't what we want for expense logs.
export function formatExpenseDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return `${day} ${MONTH_ABBR[Number(month) - 1]} ${year}`
}