// Safe React port of the Mushroom model
// - No direct DOM queries in the module
// - Avoids alias imports and vulnerable deps
// - Accepts optional bounds to initialize movement coordinates
// - Includes generateId and findOpenLocation fallbacks

function generateId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase()
}

function findOpenLocation(taken = []) {
  // Provide a simple slot selection from 0..9, avoiding those in `taken` if possible
  const ALL = Array.from({ length: 10 }, (_, i) => i)
  const available = ALL.filter((n) => !taken.includes(n))
  const pickFrom = available.length ? available : ALL
  return pickFrom[Math.floor(Math.random() * pickFrom.length)]
}

function resolveStageBounds(opts = {}) {
  // Prefer explicit bounds if provided
  if (opts.bounds && Number.isFinite(opts.bounds.width) && Number.isFinite(opts.bounds.height)) {
    return { width: opts.bounds.width, height: opts.bounds.height }
  }
  // If a stage element is provided, derive its size safely
  if (opts.stageEl && typeof opts.stageEl.clientWidth === 'number' && typeof opts.stageEl.clientHeight === 'number') {
    return { width: opts.stageEl.clientWidth, height: opts.stageEl.clientHeight }
  }
  // Fallback to viewport if in browser
  if (typeof window !== 'undefined' && window.innerWidth && window.innerHeight) {
    return { width: Math.max(320, window.innerWidth), height: Math.max(240, window.innerHeight) }
  }
  // Final static fallback for non-DOM environments
  return { width: 1024, height: 768 }
}

function createInitialDirection(bounds) {
  const clampW = Math.max(0, (bounds?.width ?? 1024) - 150)
  const clampH = Math.max(0, (bounds?.height ?? 768) - 100)
  const rand = (n) => Math.random() * n
  const speed = () => Math.ceil(Math.random() * 4)
  return {
    x: {
      speed: speed(),
      positive: Math.random() > 0.5,
      coordinates: rand(clampW),
      max: clampW,
    },
    y: {
      speed: speed(),
      positive: Math.random() > 0.5,
      coordinates: rand(clampH),
      max: clampH,
    },
  }
}

export class Mushroom {
  /**
   * @param {Object} data - initial values similar to the original Vue model
   * @param {Object} [options]
   * @param {{width:number,height:number}} [options.bounds] - size of the stage area
   * @param {HTMLElement} [options.stageEl] - optional element to infer bounds
   * @param {number[]} [options.takenLocations] - slots already used (0..9)
   */
  constructor(data = {}, options = {}) {
    const bounds = resolveStageBounds(options)

    this.id = generateId()
    this.name = data.name ?? 'Mushroom'
    this.hitPoints = Number.isFinite(data.hitPoints) ? data.hitPoints : 1
    this.location = Number.isFinite(data.location)
      ? data.location
      : findOpenLocation(options.takenLocations || [])
    this.img = data.img ?? 1
    this.poofImg = data.poofImg ?? null
    this.disabled = Boolean(data.disabled)
    this.despawnDelay = Number.isFinite(data.despawnDelay) ? data.despawnDelay : 3000
    this.type = data.type || 'stationary' // matches original default

    // Initialize movement direction using safe bounds
    this.direction = createInitialDirection(bounds)
  }
}
