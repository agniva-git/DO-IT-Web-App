import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import MobileNavMenu from './MobileNavMenu.jsx'

export default function MobileHeader() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <header
        className="md:hidden sticky top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-2.5 glass border-b"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.75rem)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard"
            className="font-display text-lg tracking-tight hover:text-focus transition-colors flex items-center gap-1"
          >
            <span className="text-focus text-xl leading-none">·</span>
            <span>DO-IT</span>
          </Link>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors duration-200 ${
                isActive
                  ? 'bg-focus/10 border-focus/30 text-focus font-semibold'
                  : 'bg-white/[0.04] border-white/[0.10] text-paper/60 hover:text-paper hover:border-white/[0.20]'
              }`
            }
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </NavLink>
        </div>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="flex flex-col gap-[5px] p-2 -mr-1 rounded-card hover:bg-white/[0.06] transition-colors"
          aria-label="Open menu"
        >
          <span className="block w-5 h-[1.5px] bg-paper/60 rounded-full" />
          <span className="block w-4 h-[1.5px] bg-paper/60 rounded-full" />
          <span className="block w-5 h-[1.5px] bg-paper/60 rounded-full" />
        </button>
      </header>

      <MobileNavMenu open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  )
}