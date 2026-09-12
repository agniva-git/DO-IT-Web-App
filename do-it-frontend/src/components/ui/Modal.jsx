export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-ink/75 backdrop-blur-sm flex items-end sm:items-center justify-center z-40 p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface border-t sm:border border-line rounded-t-2xl sm:rounded-card p-5 sm:p-6 w-full max-w-lg max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.25rem)' }}
      >
        <div className="w-10 h-1 bg-paper/20 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="font-display text-lg sm:text-xl pr-4">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-paper/40 hover:text-paper hover:bg-surfaceRaised text-2xl leading-none shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}