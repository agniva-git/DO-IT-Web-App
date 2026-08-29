import { useState } from 'react'
import Card from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import PasswordInput from '../ui/PasswordInput.jsx'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import { changePassword, deleteAccount } from '../../api/settings.js'

export default function AccountSection({ onAccountDeleted }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSaved(false)
    setError('')
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords don\u2019t match.')
      return
    }

    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Current password is incorrect.'
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const canDelete = confirmText === 'DELETE'

  const handleDelete = async () => {
    if (!canDelete) return
    setDeleting(true)
    try {
      await deleteAccount()
      onAccountDeleted()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="mb-5">
        <h3 className="font-display text-lg mb-4">Change password</h3>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <PasswordInput
            id="currentPassword"
            label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <PasswordInput
            id="newPassword"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <PasswordInput
            id="confirmNewPassword"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex items-center gap-3 mt-1">
            <Button type="submit" variant="subtle" disabled={saving}>
              {saving ? 'Updating…' : 'Update password'}
            </Button>
            {saved && <span className="text-sm text-good">Updated</span>}
          </div>
        </form>
      </Card>

      <Card className="border-danger/30">
        <h3 className="font-display text-lg mb-2 text-danger">Danger zone</h3>
        <p className="text-sm text-paper/50 mb-4">
          Deleting your account removes all tasks, study sessions, workouts,
          habits, and history permanently. This can't be undone.
        </p>
        <Button
          variant="ghost"
          onClick={() => setConfirmOpen(true)}
          className="border-danger/40 text-danger hover:border-danger"
        >
          Delete account
        </Button>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setConfirmText('')
        }}
        title="Delete your account?"
      >
        <p className="text-sm text-paper/60 mb-4">
          This is permanent. Type <span className="font-mono text-danger">DELETE</span> to confirm.
        </p>
        <Input
          id="deleteConfirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />
        <Button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="w-full mt-4 bg-danger hover:bg-danger/90"
        >
          {deleting ? 'Deleting…' : 'Permanently delete account'}
        </Button>
      </Modal>
    </>
  )
}