import { describe, it, expect } from 'vitest'
import { findNode, removeNode, updateNode, replaceNode } from './treeOps'

const tree = {
  id: 'root', type: 'group', connector: 'AND', color: null,
  children: [
    { id: 'c1', type: 'condition', field: 'Mass', operator: '>', value: '10' },
    {
      id: 'g1', type: 'group', connector: 'OR', color: '#22d3ee',
      children: [
        { id: 'c2', type: 'condition', field: 'Age', operator: '<', value: '5' },
      ],
    },
  ],
}

describe('findNode', () => {
  it('finds root', () => {
    const [node] = findNode(tree, 'root')
    expect(node.id).toBe('root')
  })

  it('finds nested condition', () => {
    const [node, parent, index] = findNode(tree, 'c2')
    expect(node.id).toBe('c2')
    expect(parent.id).toBe('g1')
    expect(index).toBe(0)
  })

  it('returns null for missing id', () => {
    expect(findNode(tree, 'nope')).toBeNull()
  })
})

describe('removeNode', () => {
  it('removes a top-level condition', () => {
    const newTree = removeNode(tree, 'c1')
    expect(newTree.children.length).toBe(1)
    expect(newTree.children[0].id).toBe('g1')
  })

  it('removes a nested condition', () => {
    const newTree = removeNode(tree, 'c2')
    expect(newTree.children[1].children.length).toBe(0)
  })
})

describe('updateNode', () => {
  it('updates a condition field', () => {
    const newTree = updateNode(tree, 'c1', { field: 'Galaxy' })
    const [node] = findNode(newTree, 'c1')
    expect(node.field).toBe('Galaxy')
  })
})

describe('replaceNode', () => {
  it('replaces a condition with a new node', () => {
    const newNode = { id: 'new', type: 'condition', field: 'Temperature', operator: '==', value: '5000' }
    const newTree = replaceNode(tree, 'c1', newNode)
    expect(newTree.children[0].id).toBe('new')
    expect(newTree.children[0].field).toBe('Temperature')
  })
})
