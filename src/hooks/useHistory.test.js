import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from './useHistory'

describe('useHistory', () => {
  it('returns initial state as present', () => {
    const { result } = renderHook(() => useHistory({ value: 0 }))
    expect(result.current.state).toEqual({ value: 0 })
  })

  it('set() updates present and saves to past', () => {
    const { result } = renderHook(() => useHistory({ value: 0 }))
    act(() => result.current.set({ value: 1 }))
    expect(result.current.state).toEqual({ value: 1 })
    expect(result.current.canUndo).toBe(true)
  })

  it('undo() reverts to previous state', () => {
    const { result } = renderHook(() => useHistory({ value: 0 }))
    act(() => result.current.set({ value: 1 }))
    act(() => result.current.undo())
    expect(result.current.state).toEqual({ value: 0 })
    expect(result.current.canUndo).toBe(false)
  })

  it('redo() re-applies undone state', () => {
    const { result } = renderHook(() => useHistory({ value: 0 }))
    act(() => result.current.set({ value: 1 }))
    act(() => result.current.undo())
    act(() => result.current.redo())
    expect(result.current.state).toEqual({ value: 1 })
  })

  it('new set() clears future', () => {
    const { result } = renderHook(() => useHistory({ value: 0 }))
    act(() => result.current.set({ value: 1 }))
    act(() => result.current.undo())
    act(() => result.current.set({ value: 2 }))
    expect(result.current.canRedo).toBe(false)
    expect(result.current.state).toEqual({ value: 2 })
  })

  it('canUndo is false initially', () => {
    const { result } = renderHook(() => useHistory({}))
    expect(result.current.canUndo).toBe(false)
  })

  it('canRedo is false initially', () => {
    const { result } = renderHook(() => useHistory({}))
    expect(result.current.canRedo).toBe(false)
  })
})
