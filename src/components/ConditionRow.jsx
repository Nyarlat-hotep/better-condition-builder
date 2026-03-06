import { useState, useCallback } from 'react'
import { FIELDS, FIELD_MAP } from '../data/cosmicFields'
import Popover from './Popover'
import RemoveButton from './RemoveButton'
import './ConditionRow.css'

function FieldPopover({ current, onSelect, onClose }) {
  return (
    <Popover onClose={onClose}>
      {FIELDS.map(f => (
        <button
          key={f.name}
          className={`popover-item${current === f.name ? ' popover-item--active' : ''}`}
          onClick={() => { onSelect(f.name); onClose() }}
        >
          {f.name}
        </button>
      ))}
    </Popover>
  )
}

function OperatorPopover({ operators, current, onSelect, onClose }) {
  return (
    <Popover onClose={onClose}>
      {operators.map(op => (
        <button
          key={op}
          className={`popover-item${current === op ? ' popover-item--active' : ''}`}
          onClick={() => { onSelect(op); onClose() }}
        >
          {op}
        </button>
      ))}
    </Popover>
  )
}

function ValuePopover({ field, current, onSelect, onClose }) {
  const fieldDef = FIELD_MAP[field]
  if (!fieldDef) return null

  if (fieldDef.valueType === 'predefined') {
    return (
      <Popover onClose={onClose}>
        {fieldDef.options.map(opt => (
          <button
            key={opt}
            className={`popover-item${current === opt ? ' popover-item--active' : ''}`}
            onClick={() => { onSelect(opt); onClose() }}
          >
            {opt}
          </button>
        ))}
      </Popover>
    )
  }

  // number type
  return (
    <Popover onClose={onClose}>
      <input
        className="popover-input"
        type="number"
        defaultValue={current ?? ''}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onSelect(e.target.value || null); onClose() }
          if (e.key === 'Escape') onClose()
        }}
        onBlur={(e) => { onSelect(e.target.value || null); onClose() }}
      />
    </Popover>
  )
}

export default function ConditionRow({ condition, isDropTarget, onUpdate, onRemove, dragHandleProps }) {
  const [open, setOpen] = useState(null) // 'field' | 'operator' | 'value'

  const fieldDef = FIELD_MAP[condition.field]
  const operators = fieldDef?.operators ?? ['==']

  const handleFieldSelect = useCallback((name) => {
    const newFieldDef = FIELD_MAP[name]
    onUpdate({ field: name, operator: newFieldDef.operators[0], value: null })
  }, [onUpdate])

  const fieldIncomplete = !condition.field
  const valueIncomplete = !condition.value

  return (
    <div className={`condition-row${isDropTarget ? ' condition-row--drop-target' : ''}`}>
      <span className="drag-handle" {...dragHandleProps}>⠿</span>

      {/* Field pill */}
      <div className="pill-anchor">
        <button
          className={`condition-pill${fieldIncomplete ? ' condition-pill--incomplete' : ''}`}
          onClick={() => setOpen(open === 'field' ? null : 'field')}
        >
          {condition.field ?? 'Field'}
        </button>
        {open === 'field' && (
          <FieldPopover
            current={condition.field}
            onSelect={handleFieldSelect}
            onClose={() => setOpen(null)}
          />
        )}
      </div>

      {/* Operator pill */}
      <div className="pill-anchor">
        <button
          className="condition-pill condition-pill--operator"
          onClick={() => setOpen(open === 'operator' ? null : 'operator')}
          disabled={!condition.field}
        >
          {condition.operator}
        </button>
        {open === 'operator' && fieldDef && (
          <OperatorPopover
            operators={operators}
            current={condition.operator}
            onSelect={(op) => onUpdate({ operator: op })}
            onClose={() => setOpen(null)}
          />
        )}
      </div>

      {/* Value pill */}
      <div className="pill-anchor">
        <button
          className={`condition-pill${valueIncomplete ? ' condition-pill--incomplete' : ''}`}
          onClick={() => condition.field && setOpen(open === 'value' ? null : 'value')}
          disabled={!condition.field}
        >
          {condition.value ?? 'Value'}
        </button>
        {open === 'value' && condition.field && (
          <ValuePopover
            field={condition.field}
            current={condition.value}
            onSelect={(val) => onUpdate({ value: val || null })}
            onClose={() => setOpen(null)}
          />
        )}
      </div>

      <RemoveButton onClick={onRemove} />
    </div>
  )
}
