import Card from '../ui/Card.jsx'
import Toggle from '../ui/Toggle.jsx'

export default function NotificationsSection({ settings, onChange, permissionStatus }) {
  const denied = permissionStatus === 'denied'
  const unsupported = permissionStatus === 'unsupported'
  const active = settings.browser && permissionStatus === 'granted'

  return (
    <Card>
      <h3 className="font-display text-lg mb-1">Notifications</h3>
      <p className="text-xs text-paper/50 mb-4">
        Stay on track with daily habit reminders, task alerts, and timer chimes.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Toggle
            label="Browser push notifications"
            checked={settings.browser}
            onChange={(v) => onChange({ ...settings, browser: v })}
            disabled={unsupported}
          />
          {active && (
            <p className="text-xs text-good pl-1">
              ✓ Active on this device
            </p>
          )}
          {unsupported && (
            <p className="text-xs text-paper/40 pl-1">
              Your browser does not support web push notifications.
            </p>
          )}
          {denied && (
            <p className="text-xs text-warn pl-1">
              Notifications are blocked — open your browser's site settings to allow them, then toggle again.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-line">
          <span className="text-sm text-paper/30">WhatsApp reminders</span>
          <span className="text-xs font-mono text-paper/30 uppercase">Coming in V3</span>
        </div>
      </div>
    </Card>
  )
}