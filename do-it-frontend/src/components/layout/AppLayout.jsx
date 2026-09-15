import Sidebar from './Sidebar.jsx'
import MobileHeader from './MobileHeader.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import TopLoadingBar from '../ui/TopLoadingBar.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ink text-paper">
      <TopLoadingBar />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        {/* pb-24 adds space on mobile so bottom tab bar never covers content */}
        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
        <MobileTabBar />
      </div>
    </div>
  )
}