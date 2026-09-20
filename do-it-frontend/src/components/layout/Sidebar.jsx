import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { NAV_ITEMS } from './navItems.js'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[#35577D]/25 bg-ink px-3 py-6 gap-0.5">
      {/* Logo */}
      <span className="font-display text-xl px-3 mb-7 flex items-center gap-1.5 text-paper">
        <span className="text-focus">·</span>
        <span>DO-IT</span>
      </span>

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `relative px-3 py-2.5 rounded-card text-sm transition-colors duration-200 ${
              isActive
                ? 'text-paper bg-gradient-to-r from-[#141E30] to-[#192A42] font-medium shadow-[inset_0_1px_0_rgba(196,210,225,0.08)]'
                : 'text-textSecondary/70 hover:text-paper hover:bg-[#141E30]/60'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#00C9C8] to-[#35577D] rounded-r-full" />
              )}
              {item.label}
            </>
          )}
        </NavLink>
      ))}

      <div className="mt-auto pt-4 border-t border-[#35577D]/25 flex flex-col gap-0.5">
        {user && (
          <span className="px-3 text-xs text-textMuted/60 truncate mb-1">{user.email}</span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-2.5 rounded-card text-sm text-left text-textMuted hover:text-danger hover:bg-[#141E30]/60 transition-all duration-150"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}