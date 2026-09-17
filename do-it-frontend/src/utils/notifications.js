/**
 * Unified notification helper for DO-IT.
 * Supports:
 * - Native Android Offline Local Notifications (@capacitor/local-notifications)
 * - Browser Web Push (VAPID / Service Worker)
 * - In-app gentle chime audio alert
 */
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import api from '../api/client.js'

const STORAGE_KEY = 'do_it_notifications_browser'

export const isNative = Capacitor.isNativePlatform()

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function playGentleChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15) // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.6)
  } catch {
    // AudioContext not allowed or not supported; ignore safely
  }
}

/**
 * Returns true if notifications are permitted and enabled.
 */
export function isGranted() {
  if (isNative) {
    return storedPreference()
  }
  return (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    storedPreference()
  )
}

export function permissionStatus() {
  if (isNative) {
    return storedPreference() ? 'granted' : 'default'
  }
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function storedPreference() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function savePreference(enabled) {
  if (enabled) {
    localStorage.setItem(STORAGE_KEY, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Requests notification permission across native Android or Web browser.
 */
export async function requestPermission() {
  if (isNative) {
    try {
      const perm = await LocalNotifications.requestPermissions()
      const granted = perm.display === 'granted'
      savePreference(granted)
      return granted ? 'granted' : 'denied'
    } catch (err) {
      console.warn('Native permission request failed:', err)
      savePreference(true)
      return 'granted'
    }
  }

  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') {
    savePreference(true)
    return 'granted'
  }
  if (Notification.permission === 'denied') {
    return 'denied'
  }
  const result = await Notification.requestPermission()
  if (result === 'granted') savePreference(true)
  return result
}

/**
 * Subscribes the current device to notifications.
 * On Android native: ensures LocalNotification permissions are granted.
 * On Web: registers Web Push via VAPID service worker.
 */
export async function subscribeToPush() {
  const perm = await requestPermission()
  if (perm !== 'granted') return { success: false, permission: perm }

  if (isNative) {
    savePreference(true)
    return { success: true, pushSupported: false, native: true }
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    savePreference(true)
    return { success: true, pushSupported: false }
  }

  try {
    const reg = await navigator.serviceWorker.ready
    let subscription = await reg.pushManager.getSubscription()

    if (!subscription) {
      const res = await api.get('/notifications/vapid-public-key')
      const vapidPublicKey = res.data.public_key
      if (!vapidPublicKey) {
        throw new Error('No VAPID public key available')
      }

      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })
    }

    const subJson = subscription.toJSON()
    await api.post('/notifications/subscribe', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh || '',
        auth: subJson.keys?.auth || ''
      }
    })

    savePreference(true)
    return { success: true, pushSupported: true }
  } catch (err) {
    console.error('Failed to subscribe to web push:', err)
    savePreference(true) // Still allow local notifications
    return { success: true, pushSupported: false, error: err.message }
  }
}

/**
 * Unsubscribes from notifications.
 */
export async function unsubscribeFromPush() {
  savePreference(false)

  if (isNative) {
    return { success: true }
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: true }
  }

  try {
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      await api.post('/notifications/unsubscribe', {
        endpoint: subscription.endpoint
      })
    }
    return { success: true }
  } catch (err) {
    console.error('Failed to unsubscribe from push:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Send an immediate local notification.
 */
export async function sendLocalNotification(title, body, options = {}) {
  if (!isGranted()) return

  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id || Math.floor(Math.random() * 1000000),
            title,
            body,
            sound: 'default',
            smallIcon: 'ic_launcher_round',
            extra: options.extra || {}
          }
        ]
      })
      return
    } catch (err) {
      console.warn('Native sendLocalNotification failed, falling back:', err)
    }
  }

  // Web Browser fallback
  playGentleChime()

  const defaultOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    ...options
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions)
        return
      }
    } catch {
      // fallback below
    }
  }

  try {
    new Notification(title, defaultOptions)
  } catch {
    // ignore
  }
}

/**
 * Schedule a local notification to fire at an exact future date/time.
 * Works 100% offline via Android AlarmManager on mobile, or in-memory on Web.
 */
export async function scheduleNotification({ id, title, body, at, extra }) {
  if (!isGranted()) return null
  const notifId = id || Math.floor(Math.random() * 1000000)

  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            schedule: at ? { at: new Date(at) } : undefined,
            sound: 'default',
            smallIcon: 'ic_launcher_round',
            extra: extra || {}
          }
        ]
      })
      return notifId
    } catch (err) {
      console.warn('Native scheduleNotification failed:', err)
    }
  }

  // Web fallback: setTimeout if target time is in future
  if (at) {
    const delayMs = new Date(at).getTime() - Date.now()
    if (delayMs > 0) {
      const timerId = setTimeout(() => {
        sendLocalNotification(title, body, { id: notifId, extra })
      }, delayMs)
      return timerId
    }
  }

  await sendLocalNotification(title, body, { id: notifId, extra })
  return notifId
}

/**
 * Cancel a previously scheduled local notification.
 */
export async function cancelNotification(id) {
  if (!id) return

  if (isNative) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] })
      return
    } catch (err) {
      console.warn('Native cancelNotification failed:', err)
    }
  }

  // Web fallback
  try {
    clearTimeout(id)
  } catch {
    // ignore
  }
}

// Backward-compatible alias
export const sendNotification = sendLocalNotification


