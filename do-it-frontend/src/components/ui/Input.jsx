export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-paper/70">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`bg-surface border border-line rounded-card px-4 py-3 text-paper placeholder:text-paper/30 focus:border-plan outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}