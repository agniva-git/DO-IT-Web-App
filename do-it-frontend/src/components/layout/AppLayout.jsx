import Sidebar from './Sidebar.jsx'
import MobileHeader from './MobileHeader.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        {/* pb-safe adds space for mobile browser bottom bars (iOS Safari, etc.) */}
        <div className="flex-1 pb-6 md:pb-0">{children}</div>
      </div>
    </div>
  )
}