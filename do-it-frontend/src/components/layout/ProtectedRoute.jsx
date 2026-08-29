import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}