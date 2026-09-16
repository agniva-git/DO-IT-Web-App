/**
 * Browser notification & Web Push helpers for DO-IT.
 */
import api from '../api/client.js'

const STORAGE_KEY = 'do_it_notifications_browser'

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

function playGentleChime() {
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
 * Returns true if browser notifications are supported, permitted, and enabled.
 */
export function isGranted() {
  return (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    localStorage.getItem(STORAGE_KEY) === 'true'
  )
}

export function permissionStatus() {
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
 * Requests browser notification permission.
 */
export async function requestPermission() {
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
 * Subscribes the current browser to Web Push using the backend's VAPID key.
 */
export async function subscribeToPush() {
  const perm = await requestPermission()
  if (perm !== 'granted') return { success: false, permission: perm }

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
    savePreference(true) // Still allow local in-browser notifications
    return { success: true, pushSupported: false, error: err.message }
  }
}

/**
 * Unsubscribes from Web Push.
 */
export async function unsubscribeFromPush() {
  savePreference(false)

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
 * Local notification helper (e.g. for timer alerts).
 * Works via Service Worker registration on mobile & desktop with chime sound.
 */
export async function sendLocalNotification(title, body, options = {}) {
  if (!isGranted()) return

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

// Backward-compatible alias
export const sendNotification = sendLocalNotification

