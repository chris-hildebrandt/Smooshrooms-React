import { mushroomsService } from './mushroomsService.js'

/**
 * React-friendly PlayerService
 * - No direct DOM or global store mutation
 * - Uses injected Store API via configure()
 * - Manages spawn scheduling with setTimeout (jittered), not nested setInterval+setTimeout
 */
class PlayerService {
  api = null
  _spawnTimeoutId = null

  configure(api) {
    // api: { getState, updateState, increment?, getBounds?, onStageStart? }
    this.api = api
  }

  _requireApi() {
    if (!this.api || typeof this.api.getState !== 'function' || typeof this.api.updateState !== 'function') {
      throw new Error('playerService not configured. Call configure({ getState, updateState, increment?, getBounds? }) first.')
    }
  }

  get state() {
    return this.api.getState()
  }

  // Score/counters
  changeScore(num) {
    this._requireApi()
    const { stageScore = 0 } = this.state
    this.api.updateState({ stageScore: stageScore + Number(num || 0) })
  }

  miss() {
    this._requireApi()
    const { missCount = 0 } = this.state
    this.api.updateState({ missCount: missCount + 1 })
  }

  increaseSmooshedCount(num = 1) {
    this._requireApi()
    const { smooshedCount = 0 } = this.state
    this.api.updateState({ smooshedCount: smooshedCount + Number(num || 0) })
  }

  // Stage control
  increaseStage() {
    this._requireApi()
    const { totalScore = 0, stageScore = 0, stage = 0 } = this.state
    this.api.updateState({
      totalScore: totalScore + stageScore,
      stage: stage + 1,
      shroomsRemaining: 25,
      missCount: 0,
      stageScore: 0,
    })
  }

  stopSpawning() {
    if (this._spawnTimeoutId) {
      clearTimeout(this._spawnTimeoutId)
      this._spawnTimeoutId = null
    }
  }

  _scheduleNextSpawn(bounds) {
    this.stopSpawning() // ensure single timer
    const { shroomsRemaining = 0 } = this.state
    if (shroomsRemaining <= 0) return

    const delay = 1000 + Math.random() * 3000 // 1s .. 4s
    this._spawnTimeoutId = setTimeout(() => {
      // Check again before spawning
      const { shroomsRemaining: remaining } = this.state
      if (remaining > 0) {
        mushroomsService.spawnShrooms({ bounds })
      }
      // Continue scheduling if still playing
      const { shroomsRemaining: nextRemaining } = this.state
      if (nextRemaining > 0) this._scheduleNextSpawn(bounds)
    }, delay)
  }

  startGame(options = {}) {
    this._requireApi()
    this.stopSpawning()

    // Reset miss counter and roll stage forward
    this.api.updateState({ missCount: 0 })
    this.increaseStage()

    // Determine spawn bounds: prefer provided, then configured getter
    const bounds = options.bounds || (typeof this.api.getBounds === 'function' ? this.api.getBounds() : undefined)

    // Optional lifecycle callback
    if (typeof this.api.onStageStart === 'function') this.api.onStageStart(this.state.stage)

    this._scheduleNextSpawn(bounds)
  }
}

export const playerService = new PlayerService()
export default playerService
