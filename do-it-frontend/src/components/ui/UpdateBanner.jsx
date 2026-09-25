import { useEffect, useState } from 'react'
import { isNativePlatform } from '../../context/AuthContext.jsx'

const DISMISSED_KEY = 'do_it_dismissed_update'
const DISMISS_DURATION_MS = 2 * 60 * 60 * 1000 // 2 hours

export default function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [releaseInfo, setReleaseInfo] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if dismissed recently
    try {
      const dismissedAt = localStorage.getItem(DISMISSED_KEY)
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < DISMISS_DURATION_MS) {
        setDismissed(true)
        return
      }
    } catch {
      // ignore
    }

    const checkUpdates = async () => {
      try {
        const isNative = isNativePlatform()
        // Only trigger release check if native APK or explicitly interested
        const res = await fetch(
          'https://api.github.com/repos/agniva-git/DO-IT-Web-App/releases/tags/latest-apk',
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        )
        if (!res.ok) return
        const data = await res.json()
        const publishedAt = new Date(data.published_at).getTime()

        // Current build time injected by Vite
        const buildTimeStr = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : '2026-09-01T00:00:00Z'
        const currentBuildTime = new Date(buildTimeStr).getTime()

        // If published at least 3 minutes after this APK/web build was compiled
        if (publishedAt > currentBuildTime + 3 * 60 * 1000) {
          const apkAsset = (data.assets || []).find((a) => a.name.endsWith('.apk'))
          setReleaseInfo({
            downloadUrl:
              apkAsset?.browser_download_url ||
              'https://github.com/agniva-git/DO-IT-Web-App/releases/download/latest-apk/DO-IT.apk',
            publishedDate: new Date(data.published_at).toLocaleDateString(),
            isNative
          })
          setUpdateAvailable(true)
        }
      } catch (err) {
        // Silently catch network failures or GitHub API rate limits
      }
    }

    // Check after 2 seconds to not block initial page load
    const timer = setTimeout(checkUpdates, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    } catch {
      // ignore
    }
    setDismissed(true)
  }

  const handleDownload = () => {
    if (releaseInfo?.downloadUrl) {
      window.open(releaseInfo.downloadUrl, '_system') || (window.location.href = releaseInfo.downloadUrl)
    }
  }

  if (!updateAvailable || dismissed) return null

  return (
    <div className="bg-primary/20 border-b border-primary/40 px-3.5 py-2.5 sm:px-6 flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0 text-base">🚀</span>
        <p className="text-paper truncate">
          <span className="font-semibold text-accent">New DO-IT update ready!</span>{' '}
          <span className="hidden sm:inline text-paper/70">
            {releaseInfo?.isNative ? 'Install the latest APK for new features & speed fixes.' : 'Latest version is available.'}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDownload}
          className="px-2.5 py-1 bg-primary hover:bg-primary/80 active:scale-95 text-white font-medium rounded-md shadow transition"
        >
          {releaseInfo?.isNative ? 'Download APK' : 'Update'}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-paper/50 hover:text-paper rounded transition"
          aria-label="Dismiss update notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
