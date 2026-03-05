import { useState, useCallback } from 'react'

const MAX_HISTORY = 50

export function useHistory(initialState) {
  const [history, setHistory] = useState({
    past: [],
    present: initialState,
    future: [],
  })

  const set = useCallback((newPresent) => {
    setHistory(h => ({
      past: [...h.past.slice(-(MAX_HISTORY - 1)), h.present],
      present: newPresent,
      future: [],
    }))
  }, [])

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.past.length === 0) return h
      const previous = h.past[h.past.length - 1]
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(h => {
      if (h.future.length === 0) return h
      const next = h.future[0]
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      }
    })
  }, [])

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
