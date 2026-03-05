import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ConditionRow from './ConditionRow'
import './GroupNode.css'

function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  )
}

export default function GroupNode({
  node,
  isRoot = false,
  onAddCondition,
  onAddGroup,
  onUpdateCondition,
  onToggleConnector,
  onRemove,
}) {
  const childIds = node.children.map(c => c.id)

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: node.id })

  const groupStyle = isRoot ? {} : {
    borderColor: `${node.color}40`,
    boxShadow: isOver ? `0 0 0 1px ${node.color}60` : undefined,
  }

  return (
    <div
      className={`group-node${isRoot ? ' group-node--root' : ''}${isOver ? ' group-node--over' : ''}`}
      style={groupStyle}
      ref={setDropRef}
    >
      {!isRoot && (
        <button
          className="remove-group-btn"
          onClick={() => onRemove(node.id)}
          title="Remove group"
        >
          ×
        </button>
      )}

      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div className="group-children">
          {node.children.map((child, i) => (
            <div key={child.id}>
              <div className="group-row">
                <SortableItem id={child.id}>
                  {({ dragHandleProps }) =>
                    child.type === 'condition' ? (
                      <ConditionRow
                        condition={child}
                        onUpdate={(updates) => onUpdateCondition(child.id, updates)}
                        onRemove={() => onRemove(child.id)}
                        dragHandleProps={dragHandleProps}
                      />
                    ) : (
                      <GroupNode
                        node={child}
                        isRoot={false}
                        onAddCondition={onAddCondition}
                        onAddGroup={onAddGroup}
                        onUpdateCondition={onUpdateCondition}
                        onToggleConnector={onToggleConnector}
                        onRemove={onRemove}
                      />
                    )
                  }
                </SortableItem>
              </div>

              {i < node.children.length - 1 && (
                <button
                  className="connector-badge"
                  style={{ color: isRoot ? 'rgba(220,210,240,0.4)' : node.color }}
                  onClick={() => onToggleConnector(node.id)}
                >
                  {node.connector}
                </button>
              )}
            </div>
          ))}
        </div>
      </SortableContext>

      <div className="add-row">
        <button className="add-btn" onClick={() => onAddCondition(node.id)}>
          + Condition
        </button>
        <button className="add-btn" onClick={() => onAddGroup(node.id)}>
          + Group
        </button>
      </div>
    </div>
  )
}
