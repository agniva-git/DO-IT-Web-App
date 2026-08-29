import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ProfileSection from '../components/settings/ProfileSection.jsx'
import PreferencesSection from '../components/settings/PreferencesSection.jsx'
import NotificationsSection from '../components/settings/NotificationsSection.jsx'
import AccountSection from '../components/settings/AccountSection.jsx'
import { getProfile, updateProfile, getPreferences, updatePreferences } from '../api/settings.js'

// Notification toggles aren't backed by anything yet — there's no
// notification-delivery system to enable/disable (that's Phase H).
// Kept as local-only UI state rather than pretending to persist it.
const initialNotifications = { browser: true, email: false }

export default function Settings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProfile(), getPreferences()])
      .then(([p, prefs]) => {
        setProfile(p)
        setPreferences(prefs)
      })
      .catch(() => setError('Could not load settings. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async (updates) => {
    const updated = await updateProfile(updates)
    setProfile(updated)
  }

  const handleSavePreferences = async (updates) => {
    const updated = await updatePreferences(updates)
    setPreferences(updated)
  }

  const handleAccountDeleted = async () => {
    // Account is already gone server-side — clear local session state
    // (logout() just POSTs /auth/logout, harmless even though the
    // cookie's already invalid) and send them back to the landing page.
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-paper/50 mt-1">Your profile, preferences, and account.</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="max-w-xl flex flex-col gap-5">
        {profile && <ProfileSection profile={profile} onSave={handleSaveProfile} />}
        {preferences && (
          <PreferencesSection preferences={preferences} onSave={handleSavePreferences} />
        )}
        <NotificationsSection settings={notifications} onChange={setNotifications} />
        <AccountSection onAccountDeleted={handleAccountDeleted} />
      </div>
    </div>
  )
}