import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS, MOBILE_QUICK_TABS } from './navItems.js'
import MobileMoreMenu from './MobileMoreMenu.jsx'

const quickTabs = NAV_ITEMS.filter((item) => MOBILE_QUICK_TABS.includes(item.to))

export default function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  // "More" itself highlights when the active page isn't one of the
  // 4 quick tabs, so something always shows as selected.
  const isOnMoreOnlyPage = !MOBILE_QUICK_TABS.includes(location.pathname)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-line bg-surface flex justify-around py-2 z-20">
        {quickTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-card ${
                isActive ? 'text-plan' : 'text-paper/50'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`text-xs px-3 py-1.5 rounded-card ${
            isOnMoreOnlyPage ? 'text-plan' : 'text-paper/50'
          }`}
        >
          More
        </button>
      </nav>

      <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}