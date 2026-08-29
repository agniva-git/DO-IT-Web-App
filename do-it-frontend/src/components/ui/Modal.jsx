export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-ink/70 backdrop-blur-sm flex items-center justify-center z-30 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line rounded-card p-5 sm:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg pr-4">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-paper/40 hover:text-paper text-xl leading-none shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}