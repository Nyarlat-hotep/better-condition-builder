import { describe, it, expect } from 'vitest'
import { treeToString, rootToString } from './expression'

describe('treeToString', () => {
  it('renders incomplete condition as ? == ?', () => {
    const condition = { id: '1', type: 'condition', field: null, operator: '==', value: null }
    expect(treeToString(condition)).toBe('? == ?')
  })

  it('renders complete condition', () => {
    const condition = { id: '1', type: 'condition', field: 'StarType', operator: '==', value: 'Pulsar' }
    expect(treeToString(condition)).toBe('StarType == Pulsar')
  })

  it('renders group with two conditions', () => {
    const group = {
      id: 'g1', type: 'group', connector: 'AND', color: '#22d3ee',
      children: [
        { id: '1', type: 'condition', field: 'StarType', operator: '==', value: 'Pulsar' },
        { id: '2', type: 'condition', field: 'Mass', operator: '>', value: '5' },
      ],
    }
    expect(treeToString(group)).toBe('(StarType == Pulsar AND Mass > 5)')
  })

  it('renders nested groups', () => {
    const inner = {
      id: 'g2', type: 'group', connector: 'OR', color: '#f5c842',
      children: [
        { id: '1', type: 'condition', field: 'Galaxy', operator: '==', value: 'Andromeda' },
        { id: '2', type: 'condition', field: 'Galaxy', operator: '==', value: 'Sombrero' },
      ],
    }
    const outer = {
      id: 'g1', type: 'group', connector: 'AND', color: '#22d3ee',
      children: [inner],
    }
    expect(treeToString(outer)).toBe('((Galaxy == Andromeda OR Galaxy == Sombrero))')
  })
})

describe('rootToString', () => {
  it('renders root children without outer parens', () => {
    const root = {
      id: 'root', type: 'group', connector: 'AND', color: null,
      children: [
        { id: '1', type: 'condition', field: 'Mass', operator: '>', value: '10' },
        { id: '2', type: 'condition', field: 'Age', operator: '<', value: '5' },
      ],
    }
    expect(rootToString(root)).toBe('Mass > 10 AND Age < 5')
  })

  it('returns empty string for empty root', () => {
    const root = { id: 'root', type: 'group', connector: 'AND', color: null, children: [] }
    expect(rootToString(root)).toBe('')
  })
})
