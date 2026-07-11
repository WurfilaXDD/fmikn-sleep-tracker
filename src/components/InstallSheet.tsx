import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallSheet() {
  const { showSheet, closeSheet, hintLead, hintSteps } = useInstallPrompt()
  const [mounted, setMounted] = useState(false)
  const [sheetShown, setSheetShown] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startYRef = useRef(0)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (showSheet) {
      setMounted(true)
      setSheetShown(false)
      setDragY(0)
      setDragging(false)
      const raf1 = requestAnimationFrame(() => requestAnimationFrame(() => setSheetShown(true)))
      return () => cancelAnimationFrame(raf1)
    }
    setSheetShown(false)
    setDragging(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setMounted(false)
      setDragY(0)
    }, 360)
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [showSheet])

  if (!mounted) return null

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    startYRef.current = e.clientY
    setDragging(true)
    setDragY(0)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore — pointer capture is a nicety, not required for the gesture to work
    }
  }
  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    setDragY(Math.max(0, e.clientY - startYRef.current))
  }
  function handlePointerUp() {
    if (!dragging) return
    setDragging(false)
    if (dragY > 110) closeSheet()
    else setDragY(0)
  }

  const sheetY = dragging ? `${dragY}px` : sheetShown ? '0px' : '100%'
  const sheetTransition = dragging ? 'none' : 'transform .35s cubic-bezier(.2,.8,.2,1)'

  return (
    <div className="install-sheet-overlay" style={{ opacity: sheetShown ? 1 : 0 }} onClick={closeSheet}>
      <div
        className="install-sheet"
        style={{ transform: `translateY(${sheetY})`, transition: sheetTransition }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: 'grab', touchAction: 'none', paddingTop: 6 }}
        >
          <div className="install-sheet-handle" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div className="install-sheet-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141824" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2.5" />
                <line x1="12" y1="3.5" x2="12" y2="13.5" />
                <line x1="8.5" y1="7" x2="12" y2="3.5" />
                <line x1="15.5" y1="7" x2="12" y2="3.5" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-.3px' }}>Установите «Трекер сна»</h2>
              <p style={{ margin: '3px 0 0', fontSize: 13, lineHeight: 1.4, color: 'var(--text-muted)' }}>{hintLead}</p>
            </div>
          </div>
        </div>
        <div className="install-sheet-steps">
          {hintSteps.map((st) => (
            <div key={st.n} className="install-sheet-step">
              <div className="install-sheet-step-num">{st.n}</div>
              <span style={{ fontSize: 14.5, lineHeight: 1.35, color: '#e6e9ef' }}>{st.text}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={closeSheet}>
          Понятно
        </button>
      </div>
    </div>
  )
}
