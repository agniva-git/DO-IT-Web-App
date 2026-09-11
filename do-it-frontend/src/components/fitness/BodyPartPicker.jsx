import { useState } from 'react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import MultiSelectChips from '../ui/MultiSelectChips.jsx'
import { BODY_PARTS } from '../../api/fitness.js'

export default function BodyPartPicker({ onLog }) {
  const [selected, setSelected] = useState([])

  const handleLog = () => {
    if (selected.length === 0) return
    onLog(selected)
    setSelected([])
  }

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">What did you train?</h3>

      <MultiSelectChips
        options={BODY_PARTS}
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