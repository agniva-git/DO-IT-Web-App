import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS, MOBILE_QUICK_TABS } from './navItems.js'
import MobileMoreMenu from './MobileMoreMenu.jsx'

const TAB_ICONS = {
  '/dashboard': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  ),
  '/tasks': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
    </svg>
  ),
  '/study': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
    </svg>
  ),
  '/budget': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h2m4 0h4"/>
    </svg>
  ),
  '/habits': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  '/focus': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/>
    </svg>
  ),
}

const quickTabs = MOBILE_QUICK_TABS.map((to) => NAV_ITEMS.find((item) => item.to === to)).filter(Boolean)

export default function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const isOnMoreOnlyPage =
    !MOBILE_QUICK_TABS.includes(location.pathname) && location.pathname !== '/dashboard'

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 border-t border-white/[0.06] bg-ink/80 backdrop-blur-xl flex justify-around items-center z-30 px-2 py-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.5rem)' }}
      >
        {quickTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all duration-150 ${
                isActive ? 'text-focus' : 'text-paper/35 hover:text-paper/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {TAB_ICONS[tab.to]}
                <span className="text-[10px] leading-none tracking-wide">{tab.label}</span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute bottom-[calc(max(env(safe-area-inset-bottom,0px),0.5rem)+2px)] w-1 h-1 rounded-full bg-focus" />
                )}
              </>
            )}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all duration-150 ${
            isOnMoreOnlyPage ? 'text-focus' : 'text-paper/35 hover:text-paper/60'
          }`}
          aria-label="More navigation options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="5"  cy="12" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
          <span className="text-[10px] leading-none tracking-wide">More</span>
        </button>
      </nav>

      <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}