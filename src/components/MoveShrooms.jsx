import { useEffect, useMemo, useRef } from 'react'
import imgShroom3 from '../assets/sprites/Monster_fungus_big_stand_full.webp'
import imgPoof from '../assets/the-one-who-got-away_86.gif'

/**
 * React port of MoveShrooms.vue
 * - No external toast/marquee libraries
 * - Uses Web Animations API for gentle movement (optional)
 * - Uses @mdi/font icons instead of external images
 *
 * Props:
 *  - mShroom: {
 *      id: string|number,
 *      name?: string,
 *      img?: 1|2|3,
 *      location?: 0|1|2|3|4|5|6|7|8|9,
 *      disabled?: boolean,
 *      direction?: { x: { coordinates: number }, y: { coordinates: number } }
 *    }
 *  - onSmoosh?: (id) => void
 *  - onDespawn?: (id) => void
 *  - despawnDelay?: number (default 5000ms)
 *  - animate?: boolean (default true)
 */
export default function MoveShrooms({ mShroom, onSmoosh, onDespawn, despawnDelay = 5000, animate = true }) {
  const elRef = useRef(null)

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

  const baseStyle = useMemo(() => {
    // Absolute position across modes
    const base = { position: 'absolute', userSelect: 'none' }
    const dx = mShroom?.direction?.x?.coordinates
    const dy = mShroom?.direction?.y?.coordinates
    if (Number.isFinite(dx) && Number.isFinite(dy)) {
      return { ...base, left: `${dx}px`, top: `${dy}px` }
    }
    const preset = fallbackPos[mShroom?.location ?? 0] || fallbackPos[0]
    return { ...base, ...preset }
  }, [mShroom?.direction?.x?.coordinates, mShroom?.direction?.y?.coordinates, mShroom?.location, fallbackPos])

  const imgSrc = useMemo(() => {
    if (mShroom?.img === 3) return imgShroom3
    return imgShroom3
  }, [mShroom?.img])

  // Despawn after delay
  useEffect(() => {
    if (!onDespawn) return
    const t = setTimeout(() => onDespawn?.(mShroom?.id), despawnDelay)
    return () => clearTimeout(t)
  }, [mShroom?.id, onDespawn, despawnDelay])

  // Gentle movement using WAAPI (avoids deprecated <marquee> and heavy deps)
  useEffect(() => {
    if (!animate) return
    const node = elRef.current
    if (!node) return

    // Seed animation variation by id to reduce sync look
    const seed = (Number(String(mShroom?.id).replace(/\D/g, '')) || 1) % 10
    const amp = 8 + (seed * 1.7) // px
    const dur = 2400 + (seed * 150) // ms

    const anim = node.animate([
      { transform: 'translate(0, 0)' },
      { transform: `translate(${amp}px, ${-amp}px)` },
      { transform: `translate(${-amp}px, ${amp}px)` },
      { transform: 'translate(0, 0)' }
    ], {
      duration: dur,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out'
    })

    return () => anim.cancel()
  }, [animate, mShroom?.id])

  const handleClick = (e) => {
    e.stopPropagation()
    onSmoosh?.(mShroom?.id)
  }

  return (
    <div
      ref={elRef}
      id={String(mShroom?.id)}
      className={`small-box shroom ${mShroom?.disabled ? 'disabled' : ''}`}
      style={{ ...baseStyle, pointerEvents: mShroom?.disabled ? 'none' : 'auto' }}
      draggable={false}
      onClick={handleClick}
      title={mShroom?.name || 'Moving Shroom'}
      aria-label={mShroom?.name || 'Moving Shroom'}
    >
      <img
        id={`shroom${String(mShroom?.id)}`}
        className="small-box btn m-0"
        src={imgSrc}
        alt="Basic-Shroom"
        draggable={false}
        title={mShroom?.name || 'Moving Shroom'}
        style={{ height: 100, width: 'auto', filter: 'drop-shadow(1px 1px 6px black)' }}
      />
      <img
        id={`poof${String(mShroom?.id)}`}
        className="small-box m-0 d-none"
        src={imgPoof}
        alt="poof"
        draggable={false}
        style={{ height: 100, width: 'auto' }}
      />
    </div>
  )
}
