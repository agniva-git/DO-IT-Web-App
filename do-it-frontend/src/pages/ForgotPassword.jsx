import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import api from '../api/client.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data.detail)
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <span className="font-display text-2xl">DO-IT</span>
          <p className="text-paper/50 text-sm">Reset your password.</p>
        </div>

        <Card>
          {message ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-paper/80">{message}</p>
              <p className="text-xs text-paper/50">
                Please check your inbox (and spam/junk folder). The link will expire in 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="forgotEmail"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-paper/50">
          <Link to="/login" className="text-plan hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}