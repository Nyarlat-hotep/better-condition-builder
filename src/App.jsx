import { useEffect, useCallback } from 'react'
import { useHistory } from './hooks/useHistory'
import {
  makeRoot, makeCondition, makeGroup, updateNode, removeNode,
  moveNode, replaceNode, findNode, insertIntoGroup, countGroups, PALETTE
} from './utils/treeOps'
import Builder from './components/Builder'
import ExpressionOutput from './components/ExpressionOutput'
import './App.css'

export default function App() {
  const { state: tree, set, undo, redo, canUndo, canRedo } = useHistory(makeRoot())

  const nextColor = useCallback(() => {
    const count = countGroups(tree)
    return PALETTE[count % PALETTE.length]
  }, [tree])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const onAddCondition = useCallback((parentId) => {
    const result = findNode(tree, parentId)
    if (!result) return
    const [parent] = result
    set(insertIntoGroup(tree, parentId, makeCondition(), parent.children.length))
  }, [tree, set])

  const onAddGroup = useCallback((parentId) => {
    const result = findNode(tree, parentId)
    if (!result) return
    const [parent] = result
    const group = makeGroup([makeCondition()], nextColor())
    set(insertIntoGroup(tree, parentId, group, parent.children.length))
  }, [tree, set, nextColor])

  const onUpdateCondition = useCallback((id, updates) => {
    set(updateNode(tree, id, updates))
  }, [tree, set])

  const onToggleConnector = useCallback((id) => {
    const result = findNode(tree, id)
    if (!result) return
    const [node] = result
    set(updateNode(tree, id, { connector: node.connector === 'AND' ? 'OR' : 'AND' }))
  }, [tree, set])

  const onRemove = useCallback((id) => {
    set(removeNode(tree, id))
  }, [tree, set])

  const onDragEnd = useCallback(({ active, over }) => {
    if (!over || active.id === over.id) return

    // Handle drop onto a group's dedicated drop zone
    if (over.id.endsWith('__dropzone')) {
      const groupId = over.id.slice(0, -10)
      const groupResult = findNode(tree, groupId)
      if (!groupResult) return
      const [groupNode] = groupResult
      set(moveNode(tree, active.id, groupId, groupNode.children.length))
      return
    }

    const activeResult = findNode(tree, active.id)
    const overResult = findNode(tree, over.id)
    if (!activeResult || !overResult) return

    const [activeNode, activeParent, activeIndex] = activeResult
    const [overNode, overParent, overIndex] = overResult

    // Drop condition onto condition → wrap both in a new group
    if (activeNode.type === 'condition' && overNode.type === 'condition') {
      const color = nextColor()
      const newGroup = makeGroup([activeNode, overNode], color)
      let newTree = removeNode(tree, active.id)
      newTree = replaceNode(newTree, over.id, newGroup)
      set(newTree)
      return
    }

    // Reorder within same parent
    if (activeParent?.id === overParent?.id && activeParent) {
      const siblings = [...activeParent.children]
      siblings.splice(activeIndex, 1)
      siblings.splice(overIndex, 0, activeNode)
      set(updateNode(tree, activeParent.id, { children: siblings }))
      return
    }

    // Drop onto a group → append inside it
    if (overNode.type === 'group') {
      set(moveNode(tree, active.id, overNode.id, overNode.children.length))
      return
    }

    // Move to same parent as overNode
    if (overParent) {
      set(moveNode(tree, active.id, overParent.id, overIndex))
    }
  }, [tree, set, nextColor])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-text">
          <h1 className="app-title">CONDITION_BUILDER</h1>
          <p className="app-subtitle">Add conditions and drag them to form groups.</p>
        </div>
        <div className="app-controls">
          <button className="control-btn" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">↩</button>
          <button className="control-btn" onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">↪</button>
        </div>
      </header>

      <main className="app-main">
        <Builder
          tree={tree}
          onAddCondition={onAddCondition}
          onAddGroup={onAddGroup}
          onUpdateCondition={onUpdateCondition}
          onToggleConnector={onToggleConnector}
          onRemove={onRemove}
          onDragEnd={onDragEnd}
        />
      </main>

      <ExpressionOutput tree={tree} />
    </div>
  )
}
