import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import api from '../api/client.js'

const AuthContext = createContext(null)

const LAST_ACTIVE_KEY = 'do_it_last_active'
const INACTIVITY_LIMIT_MS = 72 * 60 * 60 * 1000 // 72 hours
const THROTTLE_MS = 60 * 1000 // update timestamp at most once per minute
const isNative = Capacitor.isNativePlatform()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // "checking" until we know for sure whether a session exists — prevents
  // a flash of the login page for someone who's actually already logged in.
  const [status, setStatus] = useState('checking')
  const lastThrottleRef = useRef(0)

  // ── Activity tracking (web only) ──────────────────────────────────────────
  useEffect(() => {
    if (isNative) return // native app: never auto-logout

    const updateActivity = () => {
      const now = Date.now()
      if (now - lastThrottleRef.current > THROTTLE_MS) {
        lastThrottleRef.current = now
        localStorage.setItem(LAST_ACTIVE_KEY, String(now))
      }
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll']
    events.forEach((e) => window.addEventListener(e, updateActivity, { passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, updateActivity))
  }, [])

  // ── Session restore (with 72-hour inactivity check for web) ───────────────
  useEffect(() => {
    const restore = async () => {
      // Web-only: if the user has been inactive for >72 hours, log them out
      // silently without even contacting /users/me.
      if (!isNative) {
        const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
        if (lastActive > 0 && Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
          try { await api.post('/auth/logout') } catch (_) { /* ignore */ }
          localStorage.removeItem(LAST_ACTIVE_KEY)
          setUser(null)
          setStatus('unauthenticated')
          return
        }
        // Record current time as last active so a freshly opened tab resets the clock.
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
      }

      try {
        const res = await api.get('/users/me')
        setUser(res.data)
        setStatus('authenticated')
      } catch {
        setUser(null)
        setStatus('unauthenticated')
      }
    }

    restore()
  }, [])

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    setUser(res.data)
    setStatus('authenticated')
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
    return res.data
  }

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password })
    setUser(res.data)
    setStatus('authenticated')
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    localStorage.removeItem(LAST_ACTIVE_KEY)
    setUser(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ user, status, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}