import { useState, useEffect } from 'react'
import Card from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const FIELD_FOR_DETAIL = {
  email: 'email',
  username: 'username',
  whatsapp_number: 'whatsapp_number'
}

export default function ProfileSection({ profile, onSave }) {
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => setForm(profile), [profile])

  const update = (key, value) => {
    setSaved(false)
    setErrors({})
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await onSave(form)
      setSaved(true)
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      const matchedField = Object.keys(FIELD_FOR_DETAIL).find((key) =>
        detail.includes(key)
      )
      if (matchedField) {
        setErrors({ [FIELD_FOR_DETAIL[matchedField]]: `That ${matchedField.replace('_number', ' number')} is already in use.` })
      } else {
        setErrors({ email: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">Profile</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="settingsName"
          label="Full name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <Input
          id="settingsUsername"
          label="Username"
          value={form.username}
          onChange={(e) => update('username', e.target.value)}
          error={errors.username}
        />
        <Input
          id="settingsEmail"
          type="email"
          label="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
        />
        <Input
          id="settingsWhatsapp"
          label="WhatsApp number (optional)"
          value={form.whatsapp_number || ''}
          onChange={(e) => update('whatsapp_number', e.target.value)}
          error={errors.whatsapp_number}
        />
        <div className="flex items-center gap-3 mt-1">
          <Button type="submit" variant="subtle" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
          {saved && <span className="text-sm text-good">Saved</span>}
        </div>
      </form>
    </Card>
  )
}