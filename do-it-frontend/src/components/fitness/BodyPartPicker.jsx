import { useState } from 'react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'
import MultiSelectChips from '../ui/MultiSelectChips.jsx'
import { BODY_PARTS } from '../../api/fitness.js'

export default function BodyPartPicker({ onLog }) {
  const [gender, setGender] = useState('male')
  const [selected, setSelected] = useState([])

  const handleLog = () => {
    if (selected.length === 0) return
    onLog(selected)
    setSelected([])
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">What did you train?</h3>
        <OptionGroup
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ]}
          value={gender}
          onChange={(g) => {
            setGender(g)
            setSelected([])
          }}
        />
      </div>

      <MultiSelectChips
        options={BODY_PARTS[gender]}
        values={selected}
        onChange={setSelected}
      />

      <p className="text-xs text-paper/40 mt-3">
        Select one or more — a push day might be Chest + Shoulders + Arms.
      </p>

      <Button
        onClick={handleLog}
        disabled={selected.length === 0}
        className="mt-4 w-full"
      >
        Log this session
      </Button>
    </Card>
  )
}