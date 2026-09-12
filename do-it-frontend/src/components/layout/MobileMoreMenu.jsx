import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { NAV_ITEMS, MOBILE_QUICK_TABS } from './navItems.js'

const moreItems = NAV_ITEMS.filter((item) => !MOBILE_QUICK_TABS.includes(item.to))

export default function MobileMoreMenu({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!open) return null

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/login')
  }

  return (
    <div
      className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-end justify-center md:hidden"
      onClick={onClose}
    >
      <div
        className="bg-surface border-t border-line rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-5 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        <div className="w-10 h-1 bg-paper/20 rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">More Menu</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-paper/50 hover:text-paper text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {moreItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3.5 rounded-card border text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-plan bg-plan/15 text-plan'
                    : 'border-line bg-surfaceRaised text-paper/80 hover:border-paper/30'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="pt-3 border-t border-line flex flex-col gap-2">
          {user && (
            <span className="text-xs text-paper/40 truncate">{user.email}</span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-card border border-danger/30 bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors text-center"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
