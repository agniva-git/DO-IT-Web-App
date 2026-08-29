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
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line px-4 py-6 gap-1">
      <span className="font-display text-xl px-3 mb-6">DO-IT</span>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `px-3 py-2.5 rounded-card text-sm transition-colors ${
              isActive
                ? 'bg-plan/15 text-plan'
                : 'text-paper/60 hover:text-paper hover:bg-surfaceRaised'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}

      <div className="mt-auto pt-4 border-t border-line flex flex-col gap-1">
        {user && (
          <span className="px-3 text-xs text-paper/30 truncate">{user.email}</span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-2.5 rounded-card text-sm text-left text-paper/50 hover:text-danger hover:bg-surfaceRaised transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}