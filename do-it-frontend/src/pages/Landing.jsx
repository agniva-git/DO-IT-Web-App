import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

// Full class strings written out literally (not built via template strings)
// so Tailwind's JIT scanner can actually find and generate them at build time.
const loop = [
  { key: 'PLAN', desc: 'Tasks, study goals, deadlines.', badge: 'bg-plan/20 text-plan' },
  { key: 'FOCUS', desc: 'Timed sessions, distraction-free.', badge: 'bg-focus/20 text-focus' },
  { key: 'MOVE', desc: 'Workouts that fit the day you actually had.', badge: 'bg-move/20 text-move' },
  { key: 'REFLECT', desc: 'What the data says, in plain language.', badge: 'bg-reflect/20 text-reflect' }
]

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <span className="font-display text-xl tracking-tight">DO-IT</span>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get started</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-16 gap-16">
        <div className="max-w-2xl text-center flex flex-col gap-5">
          <p className="font-mono text-sm uppercase tracking-widest text-paper/50">
            One system. Your whole day.
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            Not every minute deserves a plan. Just the ones that matter.
          </h1>
          <p className="text-paper/60 text-lg max-w-lg mx-auto">
            DO-IT connects your tasks, study time, focus sessions and workouts —
            so your day is planned around what you actually have time for, not
            what four separate apps think you should do.
          </p>
        </div>

        {/* Signature element: the loop is the product's real differentiator
            (a connected cycle, not four siloed modules), so it earns the
            central visual position rather than a generic stat row. */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {loop.map((step, i) => (
            <div
              key={step.key}
              className="relative flex flex-col gap-2 p-5 rounded-card border border-line bg-surface"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono ${step.badge}`}
              >
                {i + 1}
              </span>
              <span className="font-display text-lg">{step.key}</span>
              <span className="text-sm text-paper/50">{step.desc}</span>
            </div>
          ))}
        </div>

        <Link to="/register">
          <Button variant="primary" className="text-base px-8 py-4">
            Start planning your day
          </Button>
        </Link>
      </main>

      <footer className="px-6 md:px-12 py-8 text-center text-sm text-paper/30">
        Built for students juggling more than a to-do list can hold.
      </footer>
    </div>
  )
}