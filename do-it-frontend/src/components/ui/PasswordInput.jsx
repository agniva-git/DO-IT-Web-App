import { useState } from 'react'

export default function PasswordInput({ label, id, error, className = '', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-paper/70">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`w-full bg-surface border border-line rounded-card px-4 py-3 pr-16 text-base sm:text-sm text-paper placeholder:text-paper/30 focus:border-plan outline-none transition-colors ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-paper/40 hover:text-paper/70"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}