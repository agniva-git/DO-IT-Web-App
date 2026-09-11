import { useState, useEffect } from 'react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import OptionGroup from '../components/ui/OptionGroup.jsx'
import FocusTimer from '../components/focus/FocusTimer.jsx'
import FocusSessionHistory from '../components/focus/FocusSessionHistory.jsx'
import { FOCUS_PRESETS, listFocusSessions, createFocusSession } from '../api/focus.js'

export default function Focus() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('')
  const [preset, setPreset] = useState('25-5')
  const [customMinutes, setCustomMinutes] = useState('')
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    listFocusSessions()
      .then(setSessions)
      .catch(() => setError('Could not load focus sessions. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const selectedPreset = FOCUS_PRESETS.find((p) => p.value === preset)
  const plannedMinutes =
    preset === 'custom' ? Number(customMinutes) || 0 : selectedPreset.workMinutes
  const plannedBreak =
    preset === 'custom' ? Math.max(5, Math.round(plannedMinutes / 5)) : selectedPreset.breakMinutes

  const canStart = label.trim() !== '' && plannedMinutes > 0

  const handleStart = () => {
    if (!canStart) return
    setActiveSession({ label: label.trim(), totalMinutes: plannedMinutes, breakMinutes: plannedBreak })
  }

  const handleEnd = async (status, minutesDone) => {
    const created = await createFocusSession({
      label: activeSession.label,
      planned_minutes: activeSession.totalMinutes,
      date: new Date().toISOString().slice(0, 10),
      status
    })
    setSessions((ss) => [...ss, created])
    setActiveSession(null)
    setLabel('')
  }

  if (activeSession) {
    return (
      <FocusTimer
        label={activeSession.label}
        totalMinutes={activeSession.totalMinutes}
        breakMinutes={activeSession.breakMinutes}
        onEnd={handleEnd}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading focus history…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl">Focus</h1>
        <p className="text-paper/50 mt-1">Distraction-free time, on your terms.</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display text-lg mb-4">Start a session</h3>
          <div className="flex flex-col gap-4">
            <Input
              id="focusLabel"
              label="What are you focusing on?"
              placeholder="e.g. Java — Inheritance"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <div>
              <label className="text-sm text-paper/70 mb-1.5 block">
                Duration <span className="text-paper/40 font-normal">(work / break, in minutes)</span>
              </label>
              <OptionGroup
                options={FOCUS_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
                value={preset}
                onChange={setPreset}
              />
            </div>
            {preset === 'custom' && (
              <Input
                id="customMinutes"
                type="number"
                min="1"
                label="Minutes"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
              />
            )}
            <Button onClick={handleStart} disabled={!canStart} className="mt-2">
              Start focus session
            </Button>
          </div>
        </Card>

        <FocusSessionHistory sessions={sessions} />
      </div>
    </div>
  )
}