import Sidebar from './Sidebar.jsx'
import MobileHeader from './MobileHeader.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}