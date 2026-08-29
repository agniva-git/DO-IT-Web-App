// One list, used by both the desktop Sidebar and the mobile nav menu —
// adding a new page here makes it reachable everywhere automatically.
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Today' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/study', label: 'Study' },
  { to: '/focus', label: 'Focus' },
  { to: '/fitness', label: 'Fitness' },
  { to: '/habits', label: 'Habits' },
  { to: '/budget', label: 'Expenses' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' }
]

// The 4 most-used destinations get a permanent slot in the mobile
// bottom bar; everything else (including these, for consistency) is
// reachable through the "More" menu too.
export const MOBILE_QUICK_TABS = ['/dashboard', '/tasks', '/focus', '/habits']