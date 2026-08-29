export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-surface border border-line rounded-card p-4 sm:p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}