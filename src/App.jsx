import { useEffect, useCallback, useState } from 'react'
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
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : ''
  }, [theme])

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

    // Handle drop onto an insert slot → reorder
    if (over.id.includes('__slot__')) {
      const slotIdx = over.id.lastIndexOf('__slot__')
      const parentId = over.id.slice(0, slotIdx)
      const insertIndex = parseInt(over.id.slice(slotIdx + 8))
      const activeResult = findNode(tree, active.id)
      if (!activeResult) return
      const [activeNode, activeParent, activeIndex] = activeResult
      if (activeParent?.id === parentId) {
        const siblings = [...activeParent.children]
        siblings.splice(activeIndex, 1)
        const target = insertIndex > activeIndex ? insertIndex - 1 : insertIndex
        siblings.splice(target, 0, activeNode)
        set(updateNode(tree, parentId, { children: siblings }))
      } else {
        set(moveNode(tree, active.id, parentId, insertIndex))
      }
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
      const newGroup = makeGroup([overNode, activeNode], color)
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
          <button className="control-btn" onClick={() => set(makeRoot())} title="Reset">✕</button>
          <button className="control-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Builder
          tree={tree}
          onAddCondition={onAddCondition}
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
