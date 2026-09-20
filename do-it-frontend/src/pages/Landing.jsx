import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

// Full class strings written out literally (not built via template strings)
// so Tailwind's JIT scanner can actually find and generate them at build time.
const loop = [
  { key: 'PLAN',    desc: 'Tasks, study goals, deadlines.',              badge: 'bg-plan/15 text-plan',    accent: 'border-l-plan/50' },
  { key: 'FOCUS',   desc: 'Timed sessions, distraction-free.',           badge: 'bg-focus/15 text-focus',  accent: 'border-l-focus/50' },
  { key: 'MOVE',    desc: 'Workouts that fit the day you actually had.', badge: 'bg-move/15 text-move',    accent: 'border-l-move/50' },
  { key: 'REFLECT', desc: 'What the data says, in plain language.',      badge: 'bg-reflect/15 text-reflect', accent: 'border-l-reflect/50' },
]

export default function Landing() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,50,110,0.35) 0%, #070D18 65%)',
      }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <span className="font-display text-xl tracking-tight flex items-center gap-1.5">
          <span className="text-focus">·</span>DO-IT
        </span>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-16 gap-16">
        <div className="max-w-2xl text-center flex flex-col gap-5">
          <p className="font-mono text-sm uppercase tracking-widest text-paper/40">
            One system. Your whole day.
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            Not every minute deserves a plan. Just the ones that{' '}
            <span className="text-focus" style={{ textShadow: '0 0 40px rgba(0,201,200,0.3)' }}>
              matter.
            </span>
          </h1>
          <p className="text-paper/50 text-lg max-w-lg mx-auto leading-relaxed">
            DO-IT connects your tasks, study time, focus sessions and workouts —
            so your day is planned around what you actually have time for, not
            what four separate apps think you should do.
          </p>
        </div>

        {/* The loop */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {loop.map((step, i) => (
            <div
              key={step.key}
              className={`
                relative flex flex-col gap-2 p-5 rounded-card
                bg-white/[0.03] border border-white/[0.07] border-l-2 ${step.accent}
                shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.12]
                animate-fadeUp
              `}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono ${step.badge}`}
              >
                {i + 1}
              </span>
              <span className="font-display text-lg">{step.key}</span>
              <span className="text-sm text-paper/45 leading-relaxed">{step.desc}</span>
            </div>
          ))}
        </div>

        <Link to="/register">
          <Button variant="primary" className="text-base px-8 py-4">
            Start planning your day
          </Button>
        </Link>
      </main>

      <footer className="px-6 md:px-12 py-8 text-center text-sm text-paper/25">
        Built for students juggling more than a to-do list can hold.
      </footer>
    </div>
  )
}