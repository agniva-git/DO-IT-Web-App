import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '../ui/Button.jsx'
import {
  sendNotification,
  scheduleNotification,
  cancelNotification,
  isNative
} from '../../utils/notifications.js'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const TIMER_NOTIFICATION_ID = 1001

// How many seconds of elapsed real-world time to allow before treating a
// "hidden" document event as a system sleep rather than a deliberate tab switch.
const SLEEP_THRESHOLD_MS = 5000

// phase: 'work' → 'breakOffer' → 'break' → done
// New phase: 'interrupted' — tab was switched away intentionally (desktop web).
export default function FocusTimer({ label, totalMinutes, breakMinutes, onEnd }) {
  const [phase, setPhase] = useState('work')
  const [remaining, setRemaining] = useState(totalMinutes * 60)
  const [running, setRunning] = useState(true)
  const [interruptedAt, setInterruptedAt] = useState(null)
  const intervalRef = useRef(null)
  const lastTickRef = useRef(Date.now())
  const targetEndRef = useRef(null)

  // --- Schedule Native Local Notification when running ---
  useEffect(() => {
    if (!running || (phase !== 'work' && phase !== 'break') || remaining <= 0) {
      cancelNotification(TIMER_NOTIFICATION_ID)
      targetEndRef.current = null
      return
    }

    const targetTime = Date.now() + remaining * 1000
    targetEndRef.current = targetTime

    const notifTitle = phase === 'work' ? 'Focus session complete! 🎉' : 'Break over ☕'
    const notifBody =
      phase === 'work' ? `You finished "${label}". Time for a break.` : 'Ready to get back to it?'

    scheduleNotification({
      id: TIMER_NOTIFICATION_ID,
      title: notifTitle,
      body: notifBody,
      at: targetTime
    })

    return () => {
      cancelNotification(TIMER_NOTIFICATION_ID)
    }
  }, [running, phase, label]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Timer tick ---
  useEffect(() => {
    if (!running || phase === 'breakOffer' || phase === 'interrupted') return
    intervalRef.current = setInterval(() => {
      lastTickRef.current = Date.now()
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phase])

  // --- Natural completion ---
  useEffect(() => {
    if (remaining !== 0) return
    cancelNotification(TIMER_NOTIFICATION_ID)
    if (phase === 'work') {
      sendNotification('Focus session complete! 🎉', `You finished "${label}". Time for a break.`)
      if (breakMinutes > 0) {
        setPhase('breakOffer')
      } else {
        onEnd('complete', totalMinutes)
      }
    } else if (phase === 'break') {
      sendNotification('Break over ☕', 'Ready to get back to it?')
      onEnd('complete', totalMinutes)
    }
  }, [remaining, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Tab switch / phone sleep detection ---
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      lastTickRef.current = Date.now()
    } else {
      // Page became visible again
      if (targetEndRef.current && running) {
        const secondsLeft = Math.max(0, Math.round((targetEndRef.current - Date.now()) / 1000))
        setRemaining(secondsLeft)
      }

      // On native mobile app, locking screen or app backgrounding is normal
      if (isNative) return

      // On desktop browser: tab switch during work pauses session
      if (phase !== 'work' || !running) return
      const elapsed = Date.now() - lastTickRef.current
      if (elapsed < SLEEP_THRESHOLD_MS) {
        clearInterval(intervalRef.current)
        setRunning(false)
        setPhase('interrupted')
        setInterruptedAt(new Date())
        cancelNotification(TIMER_NOTIFICATION_ID)
      }
    }
  }, [phase, running])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [handleVisibilityChange])

  // --- Actions ---
  const startBreak = () => {
    setRemaining(breakMinutes * 60)
    setRunning(true)
    setPhase('break')
  }

  const skipBreak = () => onEnd('complete', totalMinutes)

  const resumeAfterInterruption = () => {
    setPhase('work')
    setRunning(true)
    setInterruptedAt(null)
  }

  const endAfterInterruption = () => {
    const minutesDone = Math.round((totalMinutes * 60 - remaining) / 60)
    onEnd('interrupted', minutesDone)
  }

  // ---- Render: interrupted ----
  if (phase === 'interrupted') {
    return (
      <div className="fixed inset-0 bg-ink z-40 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-warn">
          ⚠ Session interrupted
        </span>
        <h2 className="font-display text-2xl sm:text-3xl">{label}</h2>
        <p className="text-paper/60 max-w-sm">
          You left this tab at {interruptedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
          Your timer was paused — want to pick up where you left off?
        </p>
        <p className="font-mono text-4xl text-warn">{formatTime(remaining)}</p>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Button onClick={resumeAfterInterruption}>Resume — {formatTime(remaining)} left</Button>
          <Button variant="ghost" onClick={endAfterInterruption}>
            End session
          </Button>
        </div>
      </div>
    )
  }

  // ---- Render: break offer ----
  if (phase === 'breakOffer') {
    return (
      <div className="fixed inset-0 bg-ink z-40 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-good">
          ✓ Work session complete
        </span>
        <h2 className="font-display text-2xl sm:text-3xl">{label}</h2>
        <p className="text-paper/60 max-w-sm">
          Take a {breakMinutes}-minute break before your next session?
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Button onClick={startBreak}>Start {breakMinutes}-min break</Button>
          <Button variant="ghost" onClick={skipBreak}>Skip break</Button>
        </div>
      </div>
    )
  }

  // ---- Render: active work or break ----
  const totalSeconds = (phase === 'break' ? breakMinutes : totalMinutes) * 60
  const pctDone = Math.round(((totalSeconds - remaining) / totalSeconds) * 100)
  const isBreak = phase === 'break'

  return (
    <div className="fixed inset-0 bg-ink z-40 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 py-8 overflow-y-auto">
      <span
        className={`font-mono text-xs uppercase tracking-widest ${isBreak ? 'text-move' : 'text-focus'}`}
      >
        {isBreak ? '☕ Break time' : '🔵 Focus mode active'}
      </span>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-display text-xl sm:text-2xl text-paper/70">
          {isBreak ? 'Step away for a bit' : label}
        </span>
        <span className="font-mono text-5xl sm:text-7xl text-paper tabular-nums">
          {formatTime(remaining)}
        </span>
        <span className="text-sm text-paper/40">remaining</span>
      </div>

      <div className="w-full max-w-xs h-1.5 bg-line rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${isBreak ? 'bg-move' : 'bg-focus'}`}
          style={{ width: `${pctDone}%` }}
        />
      </div>

      <p className="text-paper/50 text-sm">
        {isBreak ? 'Back to it soon.' : 'Stay focused. Switching tabs will pause your session.'}
      </p>

      <div className="flex flex-wrap gap-3 justify-center mt-4">
        <Button variant="ghost" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </Button>
        {isBreak ? (
          <Button variant="subtle" onClick={() => onEnd('complete', totalMinutes)}>
            End break now
          </Button>
        ) : (
          <>
            <Button
              variant="subtle"
              onClick={() => onEnd('partial', Math.round((totalSeconds - remaining) / 60))}
            >
              End early
            </Button>
            <Button variant="ghost" onClick={() => onEnd('skipped', 0)}>
              Skip
            </Button>
          </>
        )}
      </div>
    </div>
  )
}