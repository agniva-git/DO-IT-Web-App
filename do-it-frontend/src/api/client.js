import axios from 'axios'

// withCredentials is required for the httpOnly auth cookie to be sent
// and stored across origins (frontend on :5173, backend on :8000).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true
})

export default api