import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import api from '../api/client.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords don\u2019t match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword })
      navigate('/login')
    } catch (err) {
      setError(
        err.response?.data?.detail || 'That reset link is invalid or has expired.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-sm text-center">
          <p className="text-paper/70 mb-3">This link is missing a reset token.</p>
          <Link to="/forgot-password" className="text-plan hover:underline text-sm">
            Request a new one
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <span className="font-display text-2xl">DO-IT</span>
          <p className="text-paper/50 text-sm">Set a new password.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PasswordInput
              id="newPassword"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}