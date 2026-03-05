import ConditionRow from './ConditionRow'

export default function Builder({ tree, onUpdateCondition, onRemove }) {
  const testCondition = { id: 'test', type: 'condition', field: null, operator: '==', value: null }
  return (
    <div>
      <ConditionRow
        condition={testCondition}
        onUpdate={(updates) => console.log('update', updates)}
        onRemove={() => console.log('remove')}
        dragHandleProps={{}}
      />
    </div>
  )
}
