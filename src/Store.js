import { createContext, useContext, useMemo, useReducer, createElement } from 'react'

// Initial state ported from your Vuex store
export const initialState = {
  spinDeg: 0,
  shroomsRemaining: 25,
  totalScore: 0,
  stageScore: 0,
  missCount: 0,
  smooshedCount: 0,
  stage: 0,
  smooshPower: 1,
  // increase padding on images to create larger "splash area" for weapon
  smooshArea: 1,
  shrooms: [],
  xChild: 0,
  yChild: 0,
  xParent: 0,
  yParent: 0,
  hover: false,
  hideCursor: true,
  spawnInterval: ''
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET': {
      // Merge a partial update object into state
      return { ...state, ...action.payload }
    }
    case 'INCREMENT': {
      // Generic increment helper: { key: 'totalScore', by: 1 }
      const { key, by = 1 } = action.payload || {}
      return { ...state, [key]: (state[key] ?? 0) + by }
    }
    case 'RESET': {
      return initialState
    }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo(() => ({
    state,
    // Set multiple keys at once e.g. updateState({ totalScore: 10, stage: 2 })
    updateState: (patch) => dispatch({ type: 'SET', payload: patch }),
    // Increment numeric fields e.g. increment('totalScore', 5)
    increment: (key, by = 1) => dispatch({ type: 'INCREMENT', payload: { key, by } }),
    // Reset to initial state
    reset: () => dispatch({ type: 'RESET' }),
  }), [state])

  return createElement(StoreContext.Provider, { value }, children)
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
