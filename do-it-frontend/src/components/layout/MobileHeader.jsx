import { useState } from 'react'
import MobileNavMenu from './MobileNavMenu.jsx'

export default function MobileHeader() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <header
        className="md:hidden sticky top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 border-b border-line bg-surface/95 backdrop-blur-md"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.75rem)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-lg tracking-tight">DO-IT</span>
        </div>
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="flex flex-col gap-1.5 p-2.5 -mr-2 rounded-card hover:bg-surfaceRaised"
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 bg-paper/80 rounded-full" />
          <span className="block w-5 h-0.5 bg-paper/80 rounded-full" />
          <span className="block w-5 h-0.5 bg-paper/80 rounded-full" />
        </button>
      </header>

      <MobileNavMenu open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  )
}