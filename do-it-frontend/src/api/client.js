import axios from 'axios'

// withCredentials is required for the httpOnly auth cookie to be sent
// and stored across origins (frontend on :5173, backend on :8000).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true
})

// If the server returns 401 (expired or missing cookie), redirect to login
// rather than showing confusing "Is the backend running?" messages.
// We skip the interceptor for the /users/me call that AuthContext uses to
// check session status — that one handles 401 itself.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config.url?.includes('/users/me') &&
      !err.config.url?.includes('/auth/')
    ) {
      // Session expired mid-use — send them back to login.
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api