import { useEffect, useMemo } from 'react'
import imgShroom1 from '../assets/sprites/brown-shroom.png'
import imgShroom2 from '../assets/sprites/shroom2large.webp'
import imgShroom3 from '../assets/sprites/Monster_fungus_big_stand_full.webp'
import imgPoof from '../assets/the-one-who-got-away_86.gif'

/**
 * React port of BasicShroom.vue
 * - No external toast/marquee libraries
 * - Safe icon rendering using @mdi/font classes
 * - Despawn handled via setTimeout in an effect
 *
 * Props:
 *  - shroom: {
 *      id: string|number,
 *      name?: string,
 *      type?: 'mobile'|'static',
 *      img?: 1|2|3,
 *      location?: 0|1|2|3|4|5|6|7|8|9,
 *      disabled?: boolean,
 *      despawnDelay?: number,
 *      direction?: { x: { coordinates: number }, y: { coordinates: number } }
 *    }
 *  - onSmoosh?: (id) => void
 *  - onDespawn?: (id) => void
 */
export default function BasicShroom({ shroom, onSmoosh, onDespawn }) {
  // Fallback positions matching the original CSS .position{0..9}
  const fallbackPos = useMemo(() => ({
    0: { top: '6vh', left: '30vw' },
    1: { top: '40vh', left: '33vw' },
    2: { top: '50vh', left: '22vw' },
    3: { top: '63vh', left: '18vw' },
    4: { top: '75vh', left: '30vw' },
    5: { top: '77vh', left: '50vw' },
    6: { top: '47vh', left: '53vw' },
    7: { top: '32vh', left: '65vw' },
    8: { top: '20vh', left: '82vw' },
    9: { top: '55vh', left: '78vw' }
  }), [])

  const style = (() => {
    // Absolute position for both modes
    const base = { position: 'absolute', userSelect: 'none' }
    if (shroom?.type === 'mobile' && shroom?.direction?.x && shroom?.direction?.y) {
      return {
        ...base,
        left: `${Number(shroom.direction.x.coordinates) || 0}px`,
        top: `${Number(shroom.direction.y.coordinates) || 0}px`
      }
    }
    const preset = fallbackPos[shroom?.location ?? 0] || fallbackPos[0]
    return { ...base, ...preset }
  })()

  const imgSrc = useMemo(() => {
    if (shroom?.img === 1) return imgShroom1
    if (shroom?.img === 2) return imgShroom2
    if (shroom?.img === 3) return imgShroom3
    return imgShroom3
  }, [shroom?.img])

  useEffect(() => {
    if (!shroom?.despawnDelay || !onDespawn) return
    const t = setTimeout(() => onDespawn?.(shroom.id), shroom.despawnDelay)
    return () => clearTimeout(t)
  }, [shroom?.id, shroom?.despawnDelay, onDespawn])

  const handleClick = (e) => {
    e.stopPropagation()
    onSmoosh?.(shroom?.id)
  }

  return (
    <div
      id={String(shroom?.id)}
      className={`small-box shroom ${shroom?.disabled ? 'disabled' : ''}`}
      style={{ ...style, pointerEvents: shroom?.disabled ? 'none' : 'auto' }}
      draggable={false}
      onClick={handleClick}
      title={shroom?.name || 'Basic-Shroom'}
      aria-label={shroom?.name || 'Basic-Shroom'}
    >
      <img
        id={`shroom${String(shroom?.id)}`}
        className={`small-box btn m-0 ${shroom?.img === 1 ? 'attack-cursor hover-grow' : ''}`}
        src={imgSrc}
        alt="Basic-Shroom"
        draggable={false}
        title={shroom?.name || 'Basic-Shroom'}
        style={{ height: 100, width: 'auto', filter: 'drop-shadow(1px 1px 6px black)' }}
      />
      <img
        id={`poof${String(shroom?.id)}`}
        className="small-box m-0 d-none"
        src={imgPoof}
        alt="poof"
        draggable={false}
        style={{ height: 100, width: 'auto' }}
      />
    </div>
  )
}
