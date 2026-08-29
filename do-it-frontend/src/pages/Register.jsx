import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import OptionGroup from '../components/ui/OptionGroup.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { FITNESS_GOALS, FITNESS_ACK_PHRASE, FREQUENCY_TYPES } from '../api/fitness.js'

const initialForm = {
  name: '',
  username: '',
  email: '',
  whatsapp: '',
  password: '',
  confirmPassword: '',
  gender: '',
  fitnessGoal: '',
  fitnessAck: '',
  workoutFrequencyType: 'weekly',
  workoutFrequencyCount: ''
}

// Maps backend error detail strings (e.g. "email already registered")
// to the form field that should show the error.
const FIELD_FOR_DETAIL = {
  email: 'email',
  username: 'username',
  whatsapp_number: 'whatsapp'
}

const FREQUENCY_UNIT = { weekly: 'week', monthly: 'month' }
const FREQUENCY_MAX = { weekly: 7, monthly: 31 }

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const handleChange = (e) => update(e.target.name, e.target.value)

  const goalIsNone = form.fitnessGoal === 'none'
  const needsCount = !goalIsNone && form.workoutFrequencyType !== 'daily'

  const validate = () => {
    const next = {}
    if (form.password.length < 8) {
      next.password = 'Use at least 8 characters.'
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords don\u2019t match.'
    }
    if (!form.email.includes('@')) {
      next.email = 'Enter a valid email.'
    }
    if (!form.gender) {
      next.gender = 'Select one.'
    }
    if (!form.fitnessGoal) {
      next.fitnessGoal = 'Select one.'
    }
    if (goalIsNone && form.fitnessAck.trim() !== FITNESS_ACK_PHRASE) {
      next.fitnessAck = 'Type the sentence exactly to confirm.'
    }
    if (needsCount) {
      const n = Number(form.workoutFrequencyCount)
      const max = FREQUENCY_MAX[form.workoutFrequencyType]
      if (!n || n < 1 || n > max) {
        next.workoutFrequencyCount = `Enter a number between 1 and ${max}.`
      }
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setLoading(true)
    try {
      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        whatsapp_number: form.whatsapp || null,
        password: form.password,
        gender: form.gender,
        fitness_goal: form.fitnessGoal,
        workout_frequency_type: form.workoutFrequencyType,
        workout_frequency_count: needsCount ? Number(form.workoutFrequencyCount) : null
      })
      navigate('/onboarding')
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      const matchedField = Object.keys(FIELD_FOR_DETAIL).find((key) =>
        detail.includes(key)
      )
      if (matchedField) {
        const field = FIELD_FOR_DETAIL[matchedField]
        setErrors({
          [field]:
            field === 'whatsapp'
              ? 'That WhatsApp number is already in use.'
              : `That ${field} is already registered.`
        })
      } else {
        setErrors({ email: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <span className="font-display text-2xl">DO-IT</span>
          <p className="text-paper/50 text-sm">Set up your account.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="name"
              name="name"
              label="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              id="username"
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              id="whatsapp"
              name="whatsapp"
              label="WhatsApp number (optional)"
              placeholder="For reminders later — not required now"
              value={form.whatsapp}
              onChange={handleChange}
              error={errors.whatsapp}
            />
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
              required
            />
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <div className="pt-2 border-t border-line">
              <label className="text-sm text-paper/70 mb-1.5 block">Gender</label>
              <OptionGroup
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' }
                ]}
                value={form.gender}
                onChange={(v) => update('gender', v)}
              />
              {errors.gender && <p className="text-sm text-danger mt-1.5">{errors.gender}</p>}
            </div>

            <div>
              <label className="text-sm text-paper/70 mb-1.5 block">Fitness goal</label>
              <OptionGroup
                options={FITNESS_GOALS}
                value={form.fitnessGoal}
                onChange={(v) => update('fitnessGoal', v)}
              />
              {errors.fitnessGoal && (
                <p className="text-sm text-danger mt-1.5">{errors.fitnessGoal}</p>
              )}
              {goalIsNone && (
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-line">
                  <p className="text-sm text-paper/60">
                    Skipping a fitness goal is your call — type the sentence
                    below to confirm.
                  </p>
                  <p className="text-sm font-mono text-warn">"{FITNESS_ACK_PHRASE}"</p>
                  <Input
                    id="fitnessAck"
                    placeholder="Type it exactly — pasting is disabled"
                    value={form.fitnessAck}
                    onChange={(e) => update('fitnessAck', e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    error={errors.fitnessAck}
                  />
                </div>
              )}
            </div>

            {!goalIsNone && form.fitnessGoal && (
              <div>
                <label className="text-sm text-paper/70 mb-1.5 block">
                  How often do you want to work out?
                </label>
                <OptionGroup
                  options={FREQUENCY_TYPES}
                  value={form.workoutFrequencyType}
                  onChange={(v) => update('workoutFrequencyType', v)}
                />
                {needsCount && (
                  <Input
                    id="workoutFrequencyCount"
                    type="number"
                    min="1"
                    max={FREQUENCY_MAX[form.workoutFrequencyType]}
                    label={`Days per ${FREQUENCY_UNIT[form.workoutFrequencyType]}`}
                    value={form.workoutFrequencyCount}
                    onChange={(e) => update('workoutFrequencyCount', e.target.value)}
                    error={errors.workoutFrequencyCount}
                    className="mt-2"
                  />
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-paper/50">
          Already have an account?{' '}
          <Link to="/login" className="text-plan hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}