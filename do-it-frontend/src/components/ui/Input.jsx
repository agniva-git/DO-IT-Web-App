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
        <label htmlFor={id} className="text-sm text-textSecondary">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        onWheel={handleWheel}
        className={`
          bg-surfaceRaised/50 border border-white/[0.10] rounded-card
          px-4 py-3 text-base sm:text-sm text-paper
          placeholder:text-paper/25
          transition-colors duration-200
          focus:outline-none focus:border-focus/50 focus:ring-2 focus:ring-focus/[0.15]
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}