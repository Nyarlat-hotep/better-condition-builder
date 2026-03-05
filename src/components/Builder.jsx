import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { findNode } from '../utils/treeOps'
import GroupNode from './GroupNode'
import ConditionRow from './ConditionRow'
import './Builder.css'

export default function Builder({
  tree,
  onAddCondition,
  onAddGroup,
  onUpdateCondition,
  onToggleConnector,
  onRemove,
  onDragEnd,
}) {
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeResult = activeId ? findNode(tree, activeId) : null
  const activeNode = activeResult?.[0]

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={(event) => { setActiveId(null); onDragEnd(event) }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="builder">
        <GroupNode
          node={tree}
          isRoot={true}
          onAddCondition={onAddCondition}
          onAddGroup={onAddGroup}
          onUpdateCondition={onUpdateCondition}
          onToggleConnector={onToggleConnector}
          onRemove={onRemove}
        />
      </div>

      <DragOverlay>
        {activeNode?.type === 'condition' && (
          <div className="drag-overlay-item">
            <ConditionRow
              condition={activeNode}
              onUpdate={() => {}}
              onRemove={() => {}}
              dragHandleProps={{}}
            />
          </div>
        )}
        {activeNode?.type === 'group' && (
          <div
            className="drag-overlay-item"
            style={{
              border: `1px solid ${activeNode.color}40`,
              borderRadius: 10,
              padding: '0.5rem 1rem',
              color: activeNode.color,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              background: '#0d0a1a',
            }}
          >
            GROUP ({activeNode.children.length})
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
