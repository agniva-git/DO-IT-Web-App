import axios from 'axios'
import { isNativePlatform } from '../context/AuthContext.jsx'

// withCredentials is required for cross-domain cookie support,
// and Authorization header is sent as primary persistent token.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  timeout: 45000
})

let activeRequests = 0
const listeners = new Set()

function notify() {
  const isLoading = activeRequests > 0
  listeners.forEach((fn) => fn(isLoading))
}

export function onLoadingChange(fn) {
  listeners.add(fn)
  fn(activeRequests > 0)
  return () => listeners.delete(fn)
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('do_it_token')
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`)
      } else {
        config.headers = config.headers || {}
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    activeRequests++
    notify()
    return config
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    notify()
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (res) => {
    activeRequests = Math.max(0, activeRequests - 1)
    notify()
    return res
  },
  (err) => {
    activeRequests = Math.max(0, activeRequests - 1)
    notify()

    const isNative = isNativePlatform()
    const isAuthRoute =
      err.config?.url?.includes('/users/me') ||
      err.config?.url?.includes('/auth/')

    // Only redirect to /login on web if the server explicitly rejected the credentials
    if (err.response?.status === 401 && !isAuthRoute && !isNative) {
      localStorage.removeItem('do_it_token')
      localStorage.removeItem('do_it_cached_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api