import Card from '../ui/Card.jsx'
import Toggle from '../ui/Toggle.jsx'

export default function NotificationsSection({ settings, onChange }) {
  const update = (key, value) => onChange({ ...settings, [key]: value })

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Notifications</h3>
      <div className="flex flex-col gap-4">
        <Toggle
          label="Browser notifications"
          checked={settings.browser}
          onChange={(v) => update('browser', v)}
        />
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