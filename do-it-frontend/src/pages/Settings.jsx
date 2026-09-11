import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ProfileSection from '../components/settings/ProfileSection.jsx'
import PreferencesSection from '../components/settings/PreferencesSection.jsx'
import NotificationsSection from '../components/settings/NotificationsSection.jsx'
import AccountSection from '../components/settings/AccountSection.jsx'
import { getProfile, updateProfile, getPreferences, updatePreferences } from '../api/settings.js'
import {
  storedPreference,
  savePreference,
  requestPermission,
  permissionStatus
} from '../utils/notifications.js'

export default function Settings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [preferences, setPreferences] = useState(null)
  // Read initial value from localStorage so the setting persists across refreshes.
  const [notifications, setNotifications] = useState({
    browser: storedPreference(),
    email: false
  })
  const [notifPermission, setNotifPermission] = useState(permissionStatus())
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
    await logout()
    navigate('/')
  }

  const handleNotificationsChange = async (next) => {
    const browserTurnedOn = next.browser && !notifications.browser
    if (browserTurnedOn) {
      const status = await requestPermission()
      setNotifPermission(status)
      if (status !== 'granted') {
        // Don't flip the toggle if permission was denied.
        return
      }
    }
    if (!next.browser) {
      savePreference(false)
      setNotifPermission(permissionStatus())
    }
    setNotifications(next)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/40 text-sm">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl">Settings</h1>
        <p className="text-paper/50 mt-1">Your profile, preferences, and account.</p>
      </header>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="w-full max-w-xl flex flex-col gap-5">
        {profile && <ProfileSection profile={profile} onSave={handleSaveProfile} />}
        {preferences && (
          <PreferencesSection preferences={preferences} onSave={handleSavePreferences} />
        )}
        <NotificationsSection
          settings={notifications}
          onChange={handleNotificationsChange}
          permissionStatus={notifPermission}
        />
        <AccountSection onAccountDeleted={handleAccountDeleted} />
      </div>
    </div>
  )
}