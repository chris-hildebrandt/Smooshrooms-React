import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../Store.js'
import BasicShroom from '../components/BasicShroom.jsx'
import { playerService } from '../service/playerService.js'
import MoveShrooms from '../components/MoveShrooms.jsx'
import StageSummaryModal from '../components/StageSummaryModal.jsx'

export default function HomePage() {
  const { state, updateState, increment } = useStore()
  const spinElRef = useRef(null)

  // Helper to clamp scores to avoid negatives
  const changeScore = useCallback((delta) => {
    updateState({
      stageScore: Math.max(0, state.stageScore + delta),
      totalScore: Math.max(0, state.totalScore + delta)
    })
  }, [state.stageScore, state.totalScore, updateState])

  const miss = useCallback(() => {
    increment('missCount', 1)
    changeScore(-1)
  }, [increment, changeScore])

  const spin = useCallback(() => {
    // Rotate the spin icon by current spinDeg, then increment
    // Style is bound to state, so UI updates reactively
    increment('spinDeg', 30)
  }, [increment])

  const stageRef = useRef(null)

  const startGame = useCallback(() => {
    // Delegate stage increment/reset and spawning to the service
    playerService.startGame({
      bounds: stageRef.current
        ? { width: stageRef.current.clientWidth, height: stageRef.current.clientHeight }
        : undefined,
    })
  }, [])

  // Replace deprecated <marquee> with Web Animations API bounce
  useEffect(() => {
    if (state.stage !== 0) return
    const el = spinElRef.current
    if (!el) return

    const anim = el.animate([
      { transform: `translate(-50%, -50%) rotate(${state.spinDeg}deg)` },
      { transform: `translate(50%, 50%) rotate(${state.spinDeg}deg)` },
      { transform: `translate(-30%, 40%) rotate(${state.spinDeg}deg)` },
      { transform: `translate(30%, -40%) rotate(${state.spinDeg}deg)` },
      { transform: `translate(-50%, -50%) rotate(${state.spinDeg}deg)` }
    ], {
      duration: 6000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out'
    })

    return () => anim.cancel()
  }, [state.stage, state.spinDeg])

  const onSmoosh = useCallback((id) => {
    // Remove the shroom and update counters
    const next = state.shrooms.filter(s => s.id !== id)
    updateState({ shrooms: next, smooshedCount: state.smooshedCount + 1, shroomsRemaining: Math.max(0, state.shroomsRemaining - 1) })
    changeScore(5)
  }, [state.shrooms, state.smooshedCount, state.shroomsRemaining, updateState, changeScore])

  const onDespawn = useCallback((id) => {
    // Despawn without score change
    const next = state.shrooms.filter(s => s.id !== id)
    updateState({ shrooms: next, shroomsRemaining: Math.max(0, state.shroomsRemaining - 1) })
  }, [state.shrooms, state.shroomsRemaining, updateState])

  const textShadow = { textShadow: '1px 1px 6px black' }

  return (
    <>
      <div
        ref={stageRef}
        id="stage"
        className={`container-fluid m-0 stage${state.stage}`}
        onClick={miss}
        style={{
          minHeight: '100vh',
          position: 'relative',
          background: state.stage === 0
            ? 'radial-gradient(circle at 20% 20%, #234, #121212)'
            : state.stage === 1
              ? 'radial-gradient(circle at 80% 20%, #2d3e50, #0f2027)'
              : state.stage === 2
                ? 'radial-gradient(circle at 50% 80%, #1b2735, #090a0f)'
                : 'radial-gradient(circle at 50% 50%, #223, #111)'
        }}
      >
        <h1 className="text-light pt-3 mt-0" style={{ ...textShadow, fontSize: 70, userSelect: 'none' }}>
          Smooshrooms!
        </h1>

        <div className="shrooms-remaining text-light m-0" title="shrooms remaining" style={{ ...textShadow, position: 'absolute', top: 10, left: 20, fontWeight: 700, fontSize: 'x-large' }}>
          Shrooms: {state.shroomsRemaining}
        </div>

        <div className="miss-count text-light m-0" title="misses" style={{ ...textShadow, position: 'absolute', top: 10, left: 300, fontWeight: 700, fontSize: 'x-large' }}>
          Missed: {state.missCount}
        </div>

        <div className="score text-light m-0" title="stage score" style={{ ...textShadow, position: 'absolute', top: 10, right: 50, fontWeight: 700, fontSize: 'x-large' }}>
          Score: {state.stageScore}
        </div>

        <div className="total-score text-light m-0" title="total score" style={{ ...textShadow, position: 'absolute', bottom: 10, right: 10, fontWeight: 700, fontSize: 'x-large' }}>
          Total Score: {state.totalScore}
        </div>

        {state.stage <= 0 && (
          <button className="btn btn-info" onClick={(e) => { e.stopPropagation(); startGame() }}>
            START GAME
          </button>
        )}

        {state.stage === 0 && (
          <div className="ramblin" style={{ minHeight: '78vh' }}>
            <div
              id="click-spin"
              className="hover-grow"
              ref={spinElRef}
              onClick={(e) => { e.stopPropagation(); spin() }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${state.spinDeg}deg)`,
                transition: 'transform .25s ease-in-out',
                height: 100,
                width: 100,
                display: 'grid',
                placeItems: 'center',
                userSelect: 'none',
                color: 'white',
                fontSize: 64
              }}
              title="Spin!"
            >
              <span className="mdi mdi-mushroom-outline" aria-hidden="true"></span>
            </div>
          </div>
        )}

        {state.shrooms.map((b) =>
          b?.type === 'mobile' ? (
            <MoveShrooms key={b.id} mShroom={b} onSmoosh={onSmoosh} onDespawn={onDespawn} />
          ) : (
            <BasicShroom key={b.id} shroom={b} onSmoosh={onSmoosh} onDespawn={onDespawn} />
          )
        )}
      </div>

      <button id="modal-button" type="button" className="btn btn-primary d-none position-absolute" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Launch demo modal
      </button>

      <StageSummaryModal />
    </>
  )
}
