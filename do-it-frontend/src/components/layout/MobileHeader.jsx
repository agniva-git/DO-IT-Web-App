import { useState } from 'react'
import MobileNavMenu from './MobileNavMenu.jsx'

export default function MobileHeader() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <header className="md:hidden sticky top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 border-b border-line bg-surface">
        <span className="font-display text-lg">DO-IT</span>
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="flex flex-col gap-1.5 p-2 -mr-2"
          aria-label="Open menu"
        >
          <span className="block w-6 h-0.5 bg-paper/80 rounded-full" />
          <span className="block w-6 h-0.5 bg-paper/80 rounded-full" />
          <span className="block w-6 h-0.5 bg-paper/80 rounded-full" />
        </button>
      </header>

      <MobileNavMenu open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  )
}