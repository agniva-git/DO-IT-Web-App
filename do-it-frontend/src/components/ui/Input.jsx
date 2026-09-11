export default function Input({ label, id, error, className = '', type, onWheel, ...props }) {
  const handleWheel = (e) => {
    if (type === 'number') {
      // Prevent mouse wheel from accidentally incrementing/decrementing number inputs while scrolling the page
      e.currentTarget.blur()
    }
    onWheel?.(e)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-paper/70">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        onWheel={handleWheel}
        className={`bg-surface border border-line rounded-card px-4 py-3 text-paper placeholder:text-paper/30 focus:border-plan outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}