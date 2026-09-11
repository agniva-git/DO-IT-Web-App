import Card from '../ui/Card.jsx'
import Toggle from '../ui/Toggle.jsx'

export default function NotificationsSection({ settings, onChange, permissionStatus }) {
  const update = (key, value) => onChange({ ...settings, [key]: value })

  const denied = permissionStatus === 'denied'
  const unsupported = permissionStatus === 'unsupported'

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Notifications</h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Toggle
            label="Browser notifications"
            checked={settings.browser}
            onChange={(v) => update('browser', v)}
            disabled={unsupported}
          />
          {unsupported && (
            <p className="text-xs text-paper/40 pl-1">
              Your browser does not support notifications.
            </p>
          )}
          {denied && (
            <p className="text-xs text-warn pl-1">
              Notifications are blocked — open your browser's site settings to allow them, then toggle again.
            </p>
          )}
        </div>
        <Toggle
          label="Email notifications"
          checked={settings.email}
          onChange={(v) => update('email', v)}
        />
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-line">
          <span className="text-sm text-paper/30">WhatsApp reminders</span>
          <span className="text-xs font-mono text-paper/30 uppercase">Coming in V3</span>
        </div>
      </div>
    </Card>
  )
}