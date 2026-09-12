import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import OptionGroup from '../components/ui/OptionGroup.jsx'
import { updatePreferences } from '../api/settings.js'
import { createHabit } from '../api/habits.js'

// Gender and fitness goal are now collected at registration instead of
// here — front-loaded since they're more structural. Educational "goals"
// as a single free-text question was removed too: goals with individual
// deadlines are handled properly post-onboarding via Study (subject goals
// with target dates) and Tasks (deadlines), which cover this far better
// than one line-text field ever could.
const HABIT_SUGGESTIONS = [
  'Reading', 'Sketching', 'Playing chess', 'Journaling', 'Coding practice', 'Something else'
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    isStudent: '',
    educationType: '',
    completionTime: '',
    habitBuild: '',
    habitBuildCustom: '',
    habitLeave: ''
  })

  // If the user says they are not a student, skip the education questions entirely
  const steps = form.isStudent === 'no'
    ? ['student', 'habitBuild', 'habitLeave']
    : ['student', 'education', 'habitBuild', 'habitLeave']

  const step = steps[stepIndex] || steps[0]
  const isLast = stepIndex === steps.length - 1

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const canContinue = () => {
    switch (step) {
      case 'student':
        return form.isStudent !== ''
      case 'education':
        return form.educationType.trim() !== '' && form.completionTime.trim() !== ''
      case 'habitBuild':
        return form.habitBuild !== '' && (form.habitBuild !== 'Something else' || form.habitBuildCustom.trim() !== '')
      case 'habitLeave':
        return form.habitLeave.trim() !== ''
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (!canContinue() || submitting) return
    if (isLast) {
      setSubmitting(true)
      setError('')
      try {
        // 1. Mark onboarding as completed in backend preferences
        await updatePreferences({ onboarding_completed: true })

        // 2. Create the chosen build habit if provided
        const buildHabitName =
          form.habitBuild === 'Something else'
            ? form.habitBuildCustom.trim()
            : form.habitBuild.trim()

        if (buildHabitName) {
          try {
            await createHabit({ name: buildHabitName, type: 'build', frequency: 'daily' })
          } catch {
            // Non-fatal if habit name collides or fails
          }
        }

        // 3. Create the chosen leave habit if provided
        const leaveHabitName = form.habitLeave.trim()
        if (leaveHabitName) {
          try {
            await createHabit({ name: leaveHabitName, type: 'leave', frequency: 'daily' })
          } catch {
            // Non-fatal
          }
        }

        navigate('/dashboard')
      } catch {
        setError('Could not save onboarding preferences. Please try again.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStepIndex((i) => i + 1)
  }

  const handleBack = () => {
    if (stepIndex === 0) return
    setStepIndex((i) => i - 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-paper/40">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <div className="h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-plan transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="flex flex-col gap-5">
          {step === 'student' && (
            <>
              <h2 className="font-display text-xl">Are you a student right now?</h2>
              <OptionGroup
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' }
                ]}
                value={form.isStudent}
                onChange={(v) => update('isStudent', v)}
              />
            </>
          )}

          {step === 'education' && (
            <>
              <h2 className="font-display text-xl">Your current education type</h2>
              <Input
                id="educationType"
                placeholder="e.g. B.Tech Computer Science, 3rd year"
                value={form.educationType}
                onChange={(e) => update('educationType', e.target.value)}
              />
              <Input
                id="completionTime"
                label="Expected completion"
                placeholder="e.g. May 2027"
                value={form.completionTime}
                onChange={(e) => update('completionTime', e.target.value)}
              />
            </>
          )}

          {step === 'habitBuild' && (
            <>
              <h2 className="font-display text-xl">Catch a good habit</h2>
              <OptionGroup
                options={HABIT_SUGGESTIONS.map((h) => ({ value: h, label: h }))}
                value={form.habitBuild}
                onChange={(v) => update('habitBuild', v)}
              />
              {form.habitBuild === 'Something else' && (
                <Input
                  id="habitBuildCustom"
                  placeholder="What habit do you want to build?"
                  value={form.habitBuildCustom}
                  onChange={(e) => update('habitBuildCustom', e.target.value)}
                />
              )}
            </>
          )}

          {step === 'habitLeave' && (
            <>
              <h2 className="font-display text-xl">Leave a bad habit</h2>
              <Input
                id="habitLeave"
                placeholder="What do you want to cut back on?"
                value={form.habitLeave}
                onChange={(e) => update('habitLeave', e.target.value)}
              />
            </>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={handleBack} disabled={stepIndex === 0 || submitting}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canContinue() || submitting}>
              {submitting ? 'Finishing setup…' : isLast ? 'Finish setup' : 'Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}