import { nanoid } from 'nanoid'

export const PALETTE = ['#22d3ee', '#f5c842', '#ec4899', '#a78bfa', '#34d399', '#fb923c', '#f87171']

export function makeCondition() {
  return { id: nanoid(), type: 'condition', field: null, operator: '==', value: null }
}

export function makeGroup(children = [], color = '#22d3ee') {
  return { id: nanoid(), type: 'group', connector: 'AND', color, children }
}

export function makeRoot() {
  return { id: 'root', type: 'group', connector: 'AND', color: null, children: [makeCondition()] }
}

export function countGroups(node) {
  if (node.type === 'condition') return 0
  return 1 + node.children.reduce((acc, c) => acc + countGroups(c), 0)
}

export function findNode(root, id, parent = null, index = -1) {
  if (root.id === id) return [root, parent, index]
  if (root.type !== 'group') return null
  for (let i = 0; i < root.children.length; i++) {
    const result = findNode(root.children[i], id, root, i)
    if (result) return result
  }
  return null
}

export function removeNode(root, id) {
  if (root.type !== 'group') return root
  return {
    ...root,
    children: root.children
      .filter(c => c.id !== id)
      .map(c => removeNode(c, id)),
  }
}

export function updateNode(root, id, updates) {
  if (root.id === id) return { ...root, ...updates }
  if (root.type !== 'group') return root
  return {
    ...root,
    children: root.children.map(c => updateNode(c, id, updates)),
  }
}

export function replaceNode(root, id, newNode) {
  if (root.id === id) return newNode
  if (root.type !== 'group') return root
  return {
    ...root,
    children: root.children.map(c => replaceNode(c, id, newNode)),
  }
}

export function insertIntoGroup(root, groupId, node, index) {
  if (root.id === groupId && root.type === 'group') {
    const newChildren = [...root.children]
    newChildren.splice(Math.min(index, newChildren.length), 0, node)
    return { ...root, children: newChildren }
  }
  if (root.type !== 'group') return root
  return {
    ...root,
    children: root.children.map(c => insertIntoGroup(c, groupId, node, index)),
  }
}

export function moveNode(root, nodeId, targetParentId, targetIndex) {
  const result = findNode(root, nodeId)
  if (!result) return root
  const [node] = result
  let newRoot = removeNode(root, nodeId)
  newRoot = insertIntoGroup(newRoot, targetParentId, node, targetIndex)
  return newRoot
}
