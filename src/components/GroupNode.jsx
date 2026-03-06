import { Fragment } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ConditionRow from './ConditionRow'
import './GroupNode.css'

function GroupDropZone({ groupId }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${groupId}__dropzone` })
  return (
    <div
      ref={setNodeRef}
      className={`group-dropzone${isOver ? ' group-dropzone--over' : ''}`}
    />
  )
}

function InsertSlot({ parentId, index }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${parentId}__slot__${index}` })
  return (
    <div
      ref={setNodeRef}
      className={`insert-slot${isOver ? ' insert-slot--over' : ''}`}
    />
  )
}

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
    <div ref={setNodeRef} style={style} className="sortable-item">
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  )
}

export default function GroupNode({
  node,
  isRoot = false,
  dragHandleProps,
  activeId,
  overId,
  onAddCondition,
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
      {!isRoot && <span className="drag-handle" {...dragHandleProps}>⠿</span>}

      <SortableContext items={childIds} strategy={horizontalListSortingStrategy}>
        <div className="group-children">
          {activeId && <InsertSlot parentId={node.id} index={0} />}
          {node.children.map((child, i) => (
            <Fragment key={child.id}>
              <SortableItem id={child.id}>
                {({ dragHandleProps: hdl }) =>
                  child.type === 'condition' ? (
                    <ConditionRow
                      condition={child}
                      isDropTarget={overId === child.id && activeId !== child.id}
                      onUpdate={(updates) => onUpdateCondition(child.id, updates)}
                      onRemove={() => onRemove(child.id)}
                      dragHandleProps={hdl}
                    />
                  ) : (
                    <GroupNode
                      node={child}
                      isRoot={false}
                      dragHandleProps={hdl}
                      activeId={activeId}
                      overId={overId}
                      onAddCondition={onAddCondition}
                      onUpdateCondition={onUpdateCondition}
                      onToggleConnector={onToggleConnector}
                      onRemove={onRemove}
                    />
                  )
                }
              </SortableItem>

              {i < node.children.length - 1 && !activeId && (
                <button
                  className="connector-badge"
                  style={{ color: isRoot ? 'rgba(220,210,240,0.4)' : node.color }}
                  onClick={() => onToggleConnector(node.id)}
                >
                  {node.connector}
                </button>
              )}
              {activeId && <InsertSlot parentId={node.id} index={i + 1} />}
            </Fragment>
          ))}

          {!isRoot && activeId && <GroupDropZone groupId={node.id} />}
          <button className="add-btn" onClick={() => onAddCondition(node.id)}>+</button>
        </div>
      </SortableContext>

      {!isRoot && (
        <button className="remove-group-btn" onClick={() => onRemove(node.id)} title="Remove group">×</button>
      )}
    </div>
  )
}
