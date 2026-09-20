import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import api from '../api/client.js'

const AuthContext = createContext(null)

const LAST_ACTIVE_KEY = 'do_it_last_active'
const CACHED_USER_KEY = 'do_it_cached_user'
const TOKEN_KEY = 'do_it_token'
const INACTIVITY_LIMIT_MS = 72 * 60 * 60 * 1000 // 72 hours
const THROTTLE_MS = 60 * 1000 // update timestamp at most once per minute

export function isNativePlatform() {
  try {
    return (
      Capacitor.isNativePlatform() ||
      window.location.protocol === 'capacitor:' ||
      (window.location.protocol === 'http:' && window.location.hostname === 'localhost') ||
      Boolean(window.androidBridge) ||
      window.navigator.userAgent.includes('wv')
    )
  } catch (_) {
    return false
  }
}

function getInitialState() {
  try {
    const cached = localStorage.getItem(CACHED_USER_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && parsed.id) {
        const isNative = isNativePlatform()
        // If on web browser (desktop/mobile browser), check 72-hour inactivity
        if (!isNative) {
          const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
          if (lastActive > 0 && Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
            localStorage.removeItem(CACHED_USER_KEY)
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(LAST_ACTIVE_KEY)
            return { user: null, status: 'unauthenticated' }
          }
        }
        // On native mobile app or active web: hydrate user immediately!
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

  // ── Activity tracking (web browser only) ──────────────────────────────────
  useEffect(() => {
    if (isNativePlatform()) return // native app: never auto-logout

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

  // ── Session restore (with cold-start resilience & native persistence) ─────
  useEffect(() => {
    let timeoutId = null
    let mounted = true

    const restore = async (retryCount = 0) => {
      const isNative = isNativePlatform()

      // Web-only: if user has been inactive for >72 hours on a browser tab
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

        const hasCachedSession = Boolean(
          localStorage.getItem(CACHED_USER_KEY) || localStorage.getItem(TOKEN_KEY)
        )

        // On native mobile app, NEVER kick the user out on network/startup hiccups
        if (isNative && hasCachedSession) {
          setStatus('authenticated')
          return
        }

        // On web: if server explicitly says 401 Unauthorized
        if (err.response?.status === 401) {
          if (!isNative) {
            localStorage.removeItem(CACHED_USER_KEY)
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(LAST_ACTIVE_KEY)
            setUser(null)
            setStatus('unauthenticated')
          }
          return
        }

        // Server sleeping (Render cold start) or network timeout
        if (hasCachedSession) {
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
    <AuthContext.Provider value={{ user, status, register, login, logout, isNative: isNativePlatform() }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}