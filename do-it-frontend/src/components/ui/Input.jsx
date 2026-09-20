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
        <label htmlFor={id} className="text-sm text-textSecondary font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        onWheel={handleWheel}
        className={`
          bg-[#08162A] border border-[#1B4167]/50 rounded-card
          px-4 py-3 text-base sm:text-sm text-paper
          placeholder:text-textMuted/60
          transition-colors duration-200
          focus:outline-none focus:border-[#1B4167] focus:ring-2 focus:ring-[#1B4167]/30
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}