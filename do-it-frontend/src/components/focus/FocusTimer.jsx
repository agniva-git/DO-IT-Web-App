import { useState, useEffect, useRef } from 'react'
import Button from '../ui/Button.jsx'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// phase: 'work' -> 'breakOffer' -> 'break' -> done
// Break is only offered after a work session runs to completion naturally.
// Ending early or skipping the work session logs the outcome immediately
// with no break offered, since there's nothing to recover from yet.
export default function FocusTimer({ label, totalMinutes, breakMinutes, onEnd }) {
  const [phase, setPhase] = useState('work')
  const [remaining, setRemaining] = useState(totalMinutes * 60)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running || phase === 'breakOffer') return
    intervalRef.current = setInterval(() => {
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

  useEffect(() => {
    if (remaining !== 0) return
    if (phase === 'work') {
      if (breakMinutes > 0) {
        setPhase('breakOffer')
      } else {
        onEnd('complete', totalMinutes)
      }
    } else if (phase === 'break') {
      onEnd('complete', totalMinutes)
    }
  }, [remaining, phase])

  const startBreak = () => {
    setRemaining(breakMinutes * 60)
    setRunning(true)
    setPhase('break')
  }

  const skipBreak = () => {
    onEnd('complete', totalMinutes)
  }

  if (phase === 'breakOffer') {
    return (
      <div className="fixed inset-0 bg-ink z-40 flex flex-col items-center justify-center gap-6 px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-good">
          ✓ Work session complete
        </span>
        <h2 className="font-display text-3xl text-center">{label}</h2>
        <p className="text-paper/60 text-center max-w-sm">
          Take a {breakMinutes}-minute break before your next session?
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="ghost" onClick={skipBreak}>
            Skip break
          </Button>
          <Button onClick={startBreak}>Start {breakMinutes}-min break</Button>
        </div>
      </div>
    )
  }

  const totalSeconds = (phase === 'break' ? breakMinutes : totalMinutes) * 60
  const pctDone = Math.round(((totalSeconds - remaining) / totalSeconds) * 100)
  const isBreak = phase === 'break'

  return (
    <div className="fixed inset-0 bg-ink z-40 flex flex-col items-center justify-center gap-8 px-6">
      <span
        className={`font-mono text-xs uppercase tracking-widest ${isBreak ? 'text-move' : 'text-focus'}`}
      >
        {isBreak ? '☕ Break time' : '🔵 Focus mode active'}
      </span>
      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-2xl text-paper/70">
          {isBreak ? 'Step away for a bit' : label}
        </span>
        <span className="font-mono text-7xl text-paper tabular-nums">
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
        {isBreak ? 'Back to it soon.' : 'Stay focused.'}
      </p>

      <div className="flex gap-3 mt-4">
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