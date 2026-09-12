import Input from '../ui/Input.jsx'
import OptionGroup from '../ui/OptionGroup.jsx'

export default function CategoryInputRow({ category, onChange, onRemove }) {
  const update = (key, value) => onChange({ ...category, [key]: value })

  return (
    <div className="flex flex-col gap-2 p-3 rounded-card border border-line bg-surfaceRaised">
      <div className="flex items-center gap-2">
        <Input
          id={`cat-name-${category.key}`}
          placeholder="Category name"
          value={category.name}
          onChange={(e) => update('name', e.target.value)}
          className="flex-1"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-paper/40 hover:text-danger px-2 py-1 shrink-0"
        >
          Remove
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <OptionGroup
          options={[
            { value: 'percentage', label: '%' },
            { value: 'amount', label: 'Amount' }
          ]}
          value={category.input_mode}
          onChange={(v) => update('input_mode', v)}
        />
        <Input
          id={`cat-value-${category.key}`}
          type="number"
          min="0"
          step="0.01"
          placeholder={category.input_mode === 'percentage' ? '% of income' : 'Amount'}
          value={category.value}
          onChange={(e) => update('value', e.target.value)}
          className="w-full sm:flex-1"
        />
      </div>
    </div>
  )
}