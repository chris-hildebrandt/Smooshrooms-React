import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../Store.js'

function useCountUp(target, durationMs, trigger = 0) {
  const [value, setValue] = useState(0)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const startValue = 0
    const endValue = Number(target) || 0
    const duration = Math.max(0, durationMs || 0)

    cancelAnimationFrame(rafRef.current)
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const t = duration === 0 ? 1 : Math.min(1, elapsed / duration)
      // easeInOutQuad
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const current = Math.round(startValue + (endValue - startValue) * eased)
      setValue(current)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    setValue(0)
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [target, durationMs, trigger])

  return value
}

export default function StageSummaryModal({ onNextStage }) {
  const { state, updateState } = useStore()
  const modalRef = useRef(null)
  const [animTrigger, setAnimTrigger] = useState(0)

  const stageSmooshed = state.smooshedCount
  const stageMiss = state.missCount
  const stageScore = state.stageScore
  const totalProjected = useMemo(() => state.totalScore + state.stageScore, [state.totalScore, state.stageScore])

  const vSmooshed = useCountUp(stageSmooshed, 2000, animTrigger)
  const vMiss = useCountUp(stageMiss, 2000, animTrigger)
  const vScore = useCountUp(stageScore, 2000, animTrigger)
  const vTotal = useCountUp(totalProjected, 3000, animTrigger)

  useEffect(() => {
    const el = modalRef.current
    if (!el) return

    const onShown = () => setAnimTrigger((n) => n + 1)
    el.addEventListener('shown.bs.modal', onShown)
    return () => {
      el.removeEventListener('shown.bs.modal', onShown)
    }
  }, [])

  const handleNext = () => {
    if (typeof onNextStage === 'function') return onNextStage()
    // Default behavior: advance stage and roll stageScore into totalScore
    updateState({
      stage: state.stage + 1,
      totalScore: state.totalScore + state.stageScore,
      stageScore: 0,
      smooshedCount: 0,
      missCount: 0,
      shroomsRemaining: 25,
      shrooms: []
    })
  }

  return (
    <div
      ref={modalRef}
      className="modal fade"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      id="exampleModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">STAGE COMPLETE!</h1>
          </div>

          <div className="modal-body">
            <h2>
              Smooshed: <span className="stage-smooshed">{vSmooshed}</span>
            </h2>
            <h2>
              Misses: <span className="stage-miss">{vMiss}</span>
            </h2>
            <h2>
              Score: <span className="stage-score">{vScore}</span>
            </h2>
            <h2>
              Total: <span className="total-score">{vTotal}</span>
            </h2>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleNext}>
              Next Stage!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
