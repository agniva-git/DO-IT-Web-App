import { useState, useEffect } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'
import { FITNESS_GOALS, FITNESS_ACK_PHRASE, FREQUENCY_TYPES } from '../../api/fitness.js'

const FREQUENCY_UNIT = { weekly: 'week', monthly: 'month' }
const FREQUENCY_MAX = { weekly: 7, monthly: 31 }

export default function EditGoalModal({ open, currentGoal, currentPreferences, onClose, onSave }) {
  const [goal, setGoal] = useState(currentGoal)
  const [ack, setAck] = useState('')
  const [freqType, setFreqType] = useState('weekly')
  const [freqCount, setFreqCount] = useState('')
  const [countError, setCountError] = useState('')

  useEffect(() => {
    if (open) {
      setGoal(currentGoal)
      setAck('')
      setFreqType(currentPreferences?.workout_frequency_type || 'weekly')
      setFreqCount(currentPreferences?.workout_frequency_count?.toString() || '')
      setCountError('')
    }
  }, [open, currentGoal, currentPreferences])

  const goalIsNone = goal === 'none'
  const needsAck = goalIsNone
  const needsCount = !goalIsNone && freqType !== 'daily'
  const canSaveAck = !needsAck || ack.trim() === FITNESS_ACK_PHRASE

  const handleSave = () => {
    if (!canSaveAck) return
    if (needsCount) {
      const n = Number(freqCount)
      const max = FREQUENCY_MAX[freqType]
      if (!n || n < 1 || n > max) {
        setCountError(`Enter a number between 1 and ${max}.`)
        return
      }
    }
    onSave({
      fitness_goal: goal,
      workout_frequency_type: freqType,
      workout_frequency_count: needsCount ? Number(freqCount) : null
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Update your fitness goal">
      <div className="flex flex-col gap-4">
        <OptionGroup options={FITNESS_GOALS} value={goal} onChange={setGoal} />

        {needsAck && (
          <div className="flex flex-col gap-2 pt-2 border-t border-line">
            <p className="text-sm text-paper/60">
              Skipping a fitness goal is your call — type the sentence below
              to confirm.
            </p>
            <p className="text-sm font-mono text-warn">"{FITNESS_ACK_PHRASE}"</p>
            <Input
              id="fitnessGoalAck"
              placeholder="Type it exactly — pasting is disabled"
              value={ack}
              onChange={(e) => setAck(e.target.value)}
              onPaste={(e) => e.preventDefault()}
            />
          </div>
        )}

        {!goalIsNone && (
          <div className="pt-2 border-t border-line">
            <label className="text-sm text-paper/70 mb-1.5 block">
              How often do you want to work out?
            </label>
            <OptionGroup options={FREQUENCY_TYPES} value={freqType} onChange={setFreqType} />
            {needsCount && (
              <Input
                id="freqCount"
                type="number"
                min="1"
                max={FREQUENCY_MAX[freqType]}
                label={`Days per ${FREQUENCY_UNIT[freqType]}`}
                value={freqCount}
                onChange={(e) => setFreqCount(e.target.value)}
                error={countError}
                className="mt-2"
              />
            )}
          </div>
        )}

        <Button onClick={handleSave} disabled={!canSaveAck} className="mt-2">
          Save goal
        </Button>
      </div>
    </Modal>
  )
}