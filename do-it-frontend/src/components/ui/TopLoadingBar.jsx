import { useState, useEffect } from 'react'
import { onLoadingChange } from '../../api/client.js'

export default function TopLoadingBar() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return onLoadingChange((isLoading) => {
      setLoading(isLoading)
    })
  }, [])

  if (!loading) return null

  return (
    <div
      className="fixed top-0 inset-x-0 h-1 z-[9999] overflow-hidden bg-plan/20 pointer-events-none"
      role="progressbar"
      aria-label="Loading"
    >
      <div className="h-full bg-gradient-to-r from-plan via-accent to-plan animate-pulse w-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
    </div>
  )
}
