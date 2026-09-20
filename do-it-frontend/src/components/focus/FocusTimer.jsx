import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '../ui/Button.jsx'
import {
  sendNotification,
  scheduleNotification,
  cancelNotification,
  isNative,
} from '../../utils/notifications.js'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const TIMER_NOTIFICATION_ID = 1001
const SLEEP_THRESHOLD_MS = 5000

// ── Circular arc progress ring ────────────────────────────────────────────────
// Renders a 240° arc (like a premium gauge) with a gradient-tipped leading edge.
function ArcRing({ pct, isBreak }) {
  const SIZE = 260
  const STROKE = 8
  const R = (SIZE - STROKE) / 2
  const CENTER = SIZE / 2

  // 240° sweep, starting from bottom-left (-210° from top = 150° from right in SVG coords)
  const SWEEP_DEG = 240
  const START_DEG = 150 // clockwise from 3 o'clock
  const toRad = (d) => (d * Math.PI) / 180

  const arcPath = (startDeg, sweepDeg) => {
    const start = toRad(startDeg)
    const end = toRad(startDeg + sweepDeg)
    const x1 = CENTER + R * Math.cos(start)
    const y1 = CENTER + R * Math.sin(start)
    const x2 = CENTER + R * Math.cos(end)
    const y2 = CENTER + R * Math.sin(end)
    const largeArc = sweepDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const filledSweep = Math.max(0, (pct / 100) * SWEEP_DEG)
  const accentColor = isBreak ? '#F08C3A' : '#00C9C8'
  const glowColor = isBreak ? 'rgba(240,140,58,0.5)' : 'rgba(0,201,200,0.5)'
  const gradId = isBreak ? 'arcGradMove' : 'arcGradFocus'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="drop-shadow-lg">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </linearGradient>
        <filter id="arcGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track arc */}
      <path
        d={arcPath(START_DEG, SWEEP_DEG)}
        fill="none"
        stroke="rgba(53, 87, 125, 0.25)"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />

      {/* Filled arc */}
      {filledSweep > 0 && (
        <path
          d={arcPath(START_DEG, filledSweep)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          filter="url(#arcGlow)"
          style={{ transition: 'all 1s ease-out' }}
        />
      )}

      {/* Leading-edge glow dot */}
      {filledSweep > 2 && (() => {
        const endRad = toRad(START_DEG + filledSweep)
        const dx = CENTER + R * Math.cos(endRad)
        const dy = CENTER + R * Math.sin(endRad)
        return (
          <circle
            cx={dx}
            cy={dy}
            r={STROKE / 2 + 1}
            fill={accentColor}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        )
      })()}
    </svg>
  )
}

// phase: 'work' → 'breakOffer' → 'break' → done
export default function FocusTimer({ label, totalMinutes, breakMinutes, onEnd }) {
  const [phase, setPhase] = useState('work')
  const [remaining, setRemaining] = useState(totalMinutes * 60)
  const [running, setRunning] = useState(true)
  const [interruptedAt, setInterruptedAt] = useState(null)
  const [showRipple, setShowRipple] = useState(false)
  const intervalRef = useRef(null)
  const lastTickRef = useRef(Date.now())
  const targetEndRef = useRef(null)

  // --- Schedule native notification ---
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
      phase === 'work'
        ? `You finished "${label}". Time for a break.`
        : 'Ready to get back to it?'

    scheduleNotification({ id: TIMER_NOTIFICATION_ID, title: notifTitle, body: notifBody, at: targetTime })
    return () => { cancelNotification(TIMER_NOTIFICATION_ID) }
  }, [running, phase, label]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Timer tick ---
  useEffect(() => {
    if (!running || phase === 'breakOffer' || phase === 'interrupted') return
    intervalRef.current = setInterval(() => {
      lastTickRef.current = Date.now()
      setRemaining((r) => {
        if (r <= 1) { clearInterval(intervalRef.current); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phase])

  // --- Natural completion ---
  useEffect(() => {
    if (remaining !== 0) return
    cancelNotification(TIMER_NOTIFICATION_ID)
    setShowRipple(true)
    setTimeout(() => setShowRipple(false), 800)

    if (phase === 'work') {
      sendNotification('Focus session complete! 🎉', `You finished "${label}". Time for a break.`)
      if (breakMinutes > 0) setPhase('breakOffer')
      else onEnd('complete', totalMinutes)
    } else if (phase === 'break') {
      sendNotification('Break over ☕', 'Ready to get back to it?')
      onEnd('complete', totalMinutes)
    }
  }, [remaining, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Tab visibility / sleep detection ---
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      lastTickRef.current = Date.now()
    } else {
      if (targetEndRef.current && running) {
        const secondsLeft = Math.max(0, Math.round((targetEndRef.current - Date.now()) / 1000))
        setRemaining(secondsLeft)
      }
      if (isNative) return
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
  const startBreak = () => { setRemaining(breakMinutes * 60); setRunning(true); setPhase('break') }
  const skipBreak = () => onEnd('complete', totalMinutes)
  const resumeAfterInterruption = () => { setPhase('work'); setRunning(true); setInterruptedAt(null) }
  const endAfterInterruption = () => {
    const minutesDone = Math.round((totalMinutes * 60 - remaining) / 60)
    onEnd('interrupted', minutesDone)
  }

  // ── Radial background haze ────────────────────────────────────────────────
  const hazeColor = phase === 'break' || phase === 'breakOffer'
    ? 'rgba(240,140,58,0.12)'
    : 'rgba(53,87,125,0.40)'

  const bgStyle = {
    background: `radial-gradient(ellipse 75% 65% at 50% 38%, ${hazeColor}, #0A1B2E 85%)`,
  }

  // ── interrupted ──────────────────────────────────────────────────────────
  if (phase === 'interrupted') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6 text-center" style={bgStyle}>
        <span className="font-mono text-xs uppercase tracking-widest text-warn animate-breathe">
          ⚠ Session interrupted
        </span>
        <h2 className="font-display text-2xl sm:text-3xl">{label}</h2>
        <p className="text-paper/60 max-w-sm">
          You left this tab at{' '}
          {interruptedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
          Your timer was paused — want to pick up where you left off?
        </p>
        <p className="font-mono text-4xl text-warn tabular-nums">{formatTime(remaining)}</p>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Button onClick={resumeAfterInterruption}>Resume — {formatTime(remaining)} left</Button>
          <Button variant="ghost" onClick={endAfterInterruption}>End session</Button>
        </div>
      </div>
    )
  }

  // ── break offer ───────────────────────────────────────────────────────────
  if (phase === 'breakOffer') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6 text-center" style={bgStyle}>
        <span className="font-mono text-xs uppercase tracking-widest text-good">✓ Work session complete</span>
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

  // ── active (work or break) ────────────────────────────────────────────────
  const totalSeconds = (phase === 'break' ? breakMinutes : totalMinutes) * 60
  const pctDone = Math.round(((totalSeconds - remaining) / totalSeconds) * 100)
  const isBreak = phase === 'break'

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 py-8 overflow-y-auto"
      style={bgStyle}
    >
      {/* Status badge with breathing dot */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full animate-breathe ${isBreak ? 'bg-move' : 'bg-focus'}`}
          style={{ boxShadow: isBreak ? '0 0 8px rgba(240,140,58,0.8)' : '0 0 8px rgba(0,201,200,0.8)' }}
        />
        <span className={`font-mono text-xs uppercase tracking-widest ${isBreak ? 'text-move' : 'text-focus'}`}>
          {isBreak ? 'Break time' : 'Focus mode active'}
        </span>
      </div>

      {/* Session label */}
      <span className="font-display text-xl sm:text-2xl text-paper/70 text-center">
        {isBreak ? 'Step away for a bit' : label}
      </span>

      {/* Arc ring + timer */}
      <div className="relative flex items-center justify-center">
        <ArcRing pct={pctDone} isBreak={isBreak} />

        {/* Ripple on completion */}
        {showRipple && (
          <span
            className="absolute w-48 h-48 rounded-full border-2 animate-ripple"
            style={{ borderColor: isBreak ? '#F08C3A' : '#00C9C8' }}
          />
        )}

        {/* Centred time display */}
        <div className="absolute flex flex-col items-center gap-0.5">
          <span className="font-mono text-5xl sm:text-6xl tabular-nums tracking-tight text-paper">
            {formatTime(remaining)}
          </span>
          <span className="text-xs text-paper/35 tracking-widest uppercase font-mono">remaining</span>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-paper/40 text-sm text-center max-w-xs">
        {isBreak
          ? 'Back to it soon.'
          : 'Stay focused. Switching tabs will pause your session.'}
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <Button variant="ghost" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </Button>
        {isBreak ? (
          <Button variant="subtle" onClick={() => onEnd('complete', totalMinutes)}>End break now</Button>
        ) : (
          <>
            <Button
              variant="subtle"
              onClick={() => onEnd('partial', Math.round((totalSeconds - remaining) / 60))}
            >
              End early
            </Button>
            <Button variant="ghost" onClick={() => onEnd('skipped', 0)}>Skip</Button>
          </>
        )}
      </div>
    </div>
  )
}