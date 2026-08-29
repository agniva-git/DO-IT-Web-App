import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // "checking" until we know for sure whether a session exists — prevents
  // a flash of the login page for someone who's actually already logged in.
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    api
      .get('/users/me')
      .then((res) => {
        setUser(res.data)
        setStatus('authenticated')
      })
      .catch(() => {
        setUser(null)
        setStatus('unauthenticated')
      })
  }, [])

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    setUser(res.data)
    setStatus('authenticated')
    return res.data
  }

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password })
    setUser(res.data)
    setStatus('authenticated')
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
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