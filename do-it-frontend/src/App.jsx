import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'

// Lazy-loaded routes for code-splitting & performance optimization
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Tasks = lazy(() => import('./pages/Tasks.jsx'))
const Study = lazy(() => import('./pages/Study.jsx'))
const Focus = lazy(() => import('./pages/Focus.jsx'))
const Fitness = lazy(() => import('./pages/Fitness.jsx'))
const Habits = lazy(() => import('./pages/Habits.jsx'))
const Budget = lazy(() => import('./pages/Budget.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))

const PageFallback = () => (
  <div className="flex-1 min-h-[50vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

// Wraps a page in both the sidebar/tab-bar shell and the auth check,
// with a Suspense boundary for lazy chunks.
function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<PageFallback />}>
          {children}
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<PageFallback />}>
            <ForgotPassword />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<PageFallback />}>
            <ResetPassword />
          </Suspense>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Onboarding />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
      <Route path="/study" element={<Protected><Study /></Protected>} />
      <Route path="/focus" element={<Protected><Focus /></Protected>} />
      <Route path="/fitness" element={<Protected><Fitness /></Protected>} />
      <Route path="/habits" element={<Protected><Habits /></Protected>} />
      <Route path="/budget" element={<Protected><Budget /></Protected>} />
      <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
    </Routes>
  )
}