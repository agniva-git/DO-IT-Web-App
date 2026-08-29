import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { NAV_ITEMS } from './navItems.js'

export default function MobileNavMenu({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!open) return null

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/login')
  }

  return (
    <div className="md:hidden fixed inset-0 bg-ink z-40 flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <span className="font-display text-xl">DO-IT</span>
        <button
          type="button"
          onClick={onClose}
          className="text-paper/50 text-2xl leading-none px-2"
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3.5 rounded-card text-base transition-colors ${
                isActive
                  ? 'bg-plan/15 text-plan'
                  : 'text-paper/70 hover:text-paper hover:bg-surfaceRaised'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-line flex flex-col gap-1">
        {user && (
          <span className="px-4 text-xs text-paper/30 truncate mb-1">{user.email}</span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-3.5 rounded-card text-base text-left text-paper/60 hover:text-danger hover:bg-surfaceRaised transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}