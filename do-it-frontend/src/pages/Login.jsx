import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.identifier, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Invalid email/username or password.'
          : 'Could not log in. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <span className="font-display text-2xl">DO-IT</span>
          <p className="text-paper/50 text-sm">Welcome back.</p>
        </div>

        <Card>
          {successMessage && (
            <div className="mb-4 p-3 rounded-card bg-plan/15 border border-plan/40 text-plan text-xs font-medium text-center">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="identifier"
              name="identifier"
              label="Email or username"
              value={form.identifier}
              onChange={handleChange}
              autoComplete="username"
              required
            />
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-2 text-center text-sm text-paper/50">
          <Link to="/forgot-password" className="hover:text-paper/80">
            Forgot your password?
          </Link>
          <p>
            New here?{' '}
            <Link to="/register" className="text-plan hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}