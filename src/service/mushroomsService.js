import { Mushroom } from '../models/Mushroom.js'

/**
 * React-friendly port of the Vue mushrooms service.
 * - No direct DOM manipulation
 * - Immutable state updates through injected store API
 * - Optional callbacks for UI hooks (e.g., openModal)
 *
 * Usage:
 *   mushroomsService.configure({
 *     getState: () => state,
 *     updateState: (patch) => updateState(patch),
 *     increment: (key, by) => increment(key, by),
 *     openModal: () => document.getElementById('modal-button')?.click(), // optional
 *   })
 */
class MushroomsService {
  api = null

  configure(api) {
    this.api = api
  }

  _requireApi() {
    if (!this.api || typeof this.api.getState !== 'function' || typeof this.api.updateState !== 'function') {
      throw new Error('mushroomsService not configured. Call configure({ getState, updateState, increment, openModal? }) first.')
    }
  }

  get state() {
    return this.api.getState()
  }

  getShroomById(id) {
    const { shrooms } = this.state
    const m = shrooms.find((s) => s.id === id)
    if (!m) console.warn('No mushroom found by id', id)
    return m || null
  }

  // Internal helpers
  _changeScore(delta) {
    const { stageScore, totalScore } = this.state
    const nextStage = Math.max(0, stageScore + delta)
    const nextTotal = Math.max(0, totalScore + delta)
    this.api.updateState({ stageScore: nextStage, totalScore: nextTotal })
  }

  _increaseSmooshedCount(delta = 1) {
    const { smooshedCount = 0 } = this.state
    this.api.updateState({ smooshedCount: smooshedCount + delta })
  }

  _miss() {
    const { missCount = 0 } = this.state
    this.api.updateState({ missCount: missCount + 1 })
  }

  _decreaseRemainingShrooms() {
    const { shroomsRemaining } = this.state
    const next = Math.max(0, (shroomsRemaining ?? 0) - 1)
    this.api.updateState({ shroomsRemaining: next })
    if (next <= 0) {
      // Stage complete -> open summary modal if provided
      if (this.api.openModal) this.api.openModal()
    }
  }

  hitShroom(id) {
    this._requireApi()
    const s = this.getShroomById(id)
    if (!s) return

    const { smooshPower = 1 } = this.state
    const nextHP = (s.hitPoints ?? 1) - smooshPower

    // Update hit points and disabled state immutably
    const nextShrooms = this.state.shrooms.map((m) =>
      m.id === id ? { ...m, hitPoints: nextHP, disabled: nextHP <= 0 } : m
    )
    this.api.updateState({ shrooms: nextShrooms })

    if (nextHP <= 0) {
      this._changeScore(+1)
      this._increaseSmooshedCount(1)
      this.determineDespawnScenario(id)
    }
  }

  determineDespawnScenario(id) {
    this._requireApi()
    const s = this.getShroomById(id)
    if (!s) return

    if ((s.hitPoints ?? 0) > 0) {
      this.instantDespawn(s.id)
    } else {
      this.delayedDespawn(s.id, 400)
    }
    this._decreaseRemainingShrooms()
  }

  instantDespawn(id) {
    // Remove immediately and register a miss with score penalty
    const next = this.state.shrooms.filter((m) => m.id !== id)
    this.api.updateState({ shrooms: next })
    this._miss()
    this._changeScore(-1)
  }

  delayedDespawn(id, delayMs = 400) {
    // Remove after a short delay to allow poof animation
    setTimeout(() => {
      const next = this.state.shrooms.filter((m) => m.id !== id)
      this.api.updateState({ shrooms: next })
    }, delayMs)
  }

  spawnShrooms(options = {}) {
    this._requireApi()
    const state = this.state

    // Basic capacity checks
    if (state.shrooms.length >= 10) return
    if (state.shrooms.length >= state.shroomsRemaining) return

    const mushroom = {}

    switch (state.stage) {
      case 1: {
        mushroom.name = 'BasicShroom'
        mushroom.img = 1
        mushroom.hitPoints = 1
        break
      }
      case 2: {
        if (Math.random() > 0.5) {
          mushroom.name = 'BasicShroom'
          mushroom.img = 1
          mushroom.hitPoints = 1
        } else {
          mushroom.name = 'TuffShroom'
          mushroom.img = 2
          mushroom.hitPoints = 2
        }
        break
      }
      case 3: {
        mushroom.name = 'skitterShroom'
        mushroom.img = 3
        mushroom.hitPoints = 1
        mushroom.type = 'mobile'
        mushroom.despawnDelay = 10000
        break
      }
      default: {
        mushroom.name = 'BasicShroom'
        mushroom.img = 1
        mushroom.hitPoints = 1
      }
    }

    const takenLocations = state.shrooms.map((m) => m.location).filter((n) => Number.isFinite(n))
    const m = new Mushroom(mushroom, { bounds: options.bounds, takenLocations })

    this.api.updateState({ shrooms: [...state.shrooms, m] })
  }

  incrementSpin() {
    const { spinDeg = 0 } = this.state
    this.api.updateState({ spinDeg: spinDeg + 360 })
  }
}

export const mushroomsService = new MushroomsService()
