import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import api from '../api/client.js'

const AuthContext = createContext(null)

const LAST_ACTIVE_KEY = 'do_it_last_active'
const CACHED_USER_KEY = 'do_it_cached_user'
const TOKEN_KEY = 'do_it_token'
const INACTIVITY_LIMIT_MS = 72 * 60 * 60 * 1000 // 72 hours
const THROTTLE_MS = 60 * 1000 // update timestamp at most once per minute
const isNative = Capacitor.isNativePlatform()

function getInitialState() {
  try {
    const cached = localStorage.getItem(CACHED_USER_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && parsed.id) {
        // If on web, check 72-hour inactivity before using cache
        if (!isNative) {
          const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
          if (lastActive > 0 && Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
            localStorage.removeItem(CACHED_USER_KEY)
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(LAST_ACTIVE_KEY)
            return { user: null, status: 'unauthenticated' }
          }
        }
        return { user: parsed, status: 'authenticated' }
      }
    }
  } catch (_) {
    // ignore parse error
  }
  return { user: null, status: 'checking' }
}

export function AuthProvider({ children }) {
  const initial = getInitialState()
  const [user, setUser] = useState(initial.user)
  const [status, setStatus] = useState(initial.status)
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

  // ── Session restore (with cold-start resilience & 401-only logout) ─────────
  useEffect(() => {
    let timeoutId = null
    let mounted = true

    const restore = async (retryCount = 0) => {
      // Web-only: if user has been inactive for >72 hours, log them out silently
      if (!isNative) {
        const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
        if (lastActive > 0 && Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
          try { await api.post('/auth/logout') } catch (_) { /* ignore */ }
          localStorage.removeItem(LAST_ACTIVE_KEY)
          localStorage.removeItem(CACHED_USER_KEY)
          localStorage.removeItem(TOKEN_KEY)
          if (mounted) {
            setUser(null)
            setStatus('unauthenticated')
          }
          return
        }
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
      }

      try {
        const res = await api.get('/users/me')
        if (!mounted) return
        setUser(res.data)
        setStatus('authenticated')
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(res.data))
      } catch (err) {
        if (!mounted) return

        // If the server explicitly returned 401 Unauthorized, the token is genuinely invalid
        if (err.response?.status === 401) {
          localStorage.removeItem(CACHED_USER_KEY)
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(LAST_ACTIVE_KEY)
          setUser(null)
          setStatus('unauthenticated')
          return
        }

        // Otherwise: network error, server sleeping (Render cold start 502/503/504), or timeout.
        // DO NOT log the user out!
        const hasCachedSession = Boolean(localStorage.getItem(CACHED_USER_KEY) || localStorage.getItem(TOKEN_KEY))
        if (hasCachedSession) {
          // Keep user logged in with cached data, retry in background (up to 3 times) once Render wakes up
          setStatus('authenticated')
          if (retryCount < 3) {
            timeoutId = setTimeout(() => {
              if (mounted) restore(retryCount + 1)
            }, 4000)
          }
        } else {
          setUser(null)
          setStatus('unauthenticated')
        }
      }
    }

    restore()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    const userData = res.data
    setUser(userData)
    setStatus('authenticated')
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem(TOKEN_KEY, userData.token)
    }
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
    return userData
  }

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password })
    const userData = res.data
    setUser(userData)
    setStatus('authenticated')
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem(TOKEN_KEY, userData.token)
    }
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
    return userData
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch (_) { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CACHED_USER_KEY)
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