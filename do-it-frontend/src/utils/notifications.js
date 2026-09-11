/**
 * Browser notification helpers.
 *
 * Usage:
 *   import { requestPermission, sendNotification, isGranted } from '../utils/notifications.js'
 *
 *   // In settings toggle handler:
 *   const granted = await requestPermission()
 *
 *   // In focus timer:
 *   sendNotification('Session complete!', 'Great work — take a break.')
 */

const STORAGE_KEY = 'do_it_notifications_browser'

/**
 * Returns true if browser notifications are both supported and permission
 * has been granted.
 */
export function isGranted() {
  return (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    localStorage.getItem(STORAGE_KEY) === 'true'
  )
}

/**
 * Returns the current browser permission status: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function permissionStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/**
 * Reads the user's stored preference (independent of actual permission —
 * user might have enabled in app but not yet granted in browser).
 */
export function storedPreference() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

/**
 * Saves the user's preference to localStorage.
 */
export function savePreference(enabled) {
  if (enabled) {
    localStorage.setItem(STORAGE_KEY, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Requests browser notification permission and saves the result.
 * Returns 'granted' | 'denied' | 'default' | 'unsupported'.
 */
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') {
    savePreference(true)
    return 'granted'
  }
  if (Notification.permission === 'denied') {
    // Can't re-prompt — user must manually reset in browser settings.
    return 'denied'
  }
  const result = await Notification.requestPermission()
  if (result === 'granted') savePreference(true)
  return result
}

/**
 * Fires a browser notification if permission is granted and user has
 * enabled the setting.  Silently no-ops otherwise — callers don't need
 * to guard.
 */
export function sendNotification(title, body, options = {}) {
  if (!isGranted()) return
  try {
    new Notification(title, { body, icon: '/icons/icon-192.png', ...options })
  } catch {
    // Service worker notifications (required on some mobile browsers)
    // would go here in a future iteration.
  }
}
