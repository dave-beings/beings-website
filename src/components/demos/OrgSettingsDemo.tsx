import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'
import { TypingText } from './shared/TypingText'

const T = {
  duration: 11.5,
  entranceFadeEnd: 0.47,
  cursorEnter: 0.67,
  cursorClick: 1.93,
  cursorExit: 3.0,
  zoomInStart: 2.73,
  zoomInEnd: 3.73,
  crossFadeStart: 3.73,
  crossFadeEnd: 4.23,
  zoomOutStart: 4.23,
  zoomOutEnd: 5.23,
  typeStart: 5.57,
  typeEnd: 10.57,
  loopFadeStart: 10.67,
  loopFadeEnd: 11.47,
  cursorTargetX: 510,
  cursorTargetY: 375,
  zoomOriginX: '51%',
  zoomOriginY: '78%',
  peakZoom: 7,
  peakBlur: 12,
  typingX: 30,
  typingY: 257,
  typingWidth: 840,
} as const

const DESCRIPTION_TEXT =
  'This is for all those involved in the PRES for Alexander Hospital \u2013 March 2026.'

const W = 900
const H = 486

function cubicInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function OrgSettingsDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W))
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, T.entranceFadeEnd, 0, 1)
  const entranceScale = lerp(time, 0, T.entranceFadeEnd, 0.98, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  // Zoom + blur
  let zoomScale = 1
  let blurAmount = 0
  const zoomInProgress = cubicInOut(Math.max(0, Math.min(1, (time - T.zoomInStart) / (T.zoomInEnd - T.zoomInStart))))
  const zoomOutProgress = cubicInOut(Math.max(0, Math.min(1, (time - T.zoomOutStart) / (T.zoomOutEnd - T.zoomOutStart))))

  if (time < T.zoomInEnd) {
    zoomScale = 1 + (T.peakZoom - 1) * zoomInProgress
    blurAmount = T.peakBlur * zoomInProgress
  } else if (time < T.zoomOutStart) {
    zoomScale = T.peakZoom
    blurAmount = T.peakBlur
  } else {
    zoomScale = T.peakZoom - (T.peakZoom - 1) * zoomOutProgress
    blurAmount = T.peakBlur * (1 - zoomOutProgress)
  }

  const crossFade = lerp(time, T.crossFadeStart, T.crossFadeEnd, 0, 1)
  const transformOrigin = `${T.zoomOriginX} ${T.zoomOriginY}`

  if (reducedMotion) {
    return (
      <div ref={wrapperRef} role="img" aria-label="Organisation settings demonstration" style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}>
        <img src="/images/product/org-settings.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  return (
    <div
      ref={(node) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      role="img"
      aria-label="Animated organisation settings demonstration"
      style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', fontFamily: 'var(--font-family)', opacity: containerOpacity }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${entranceScale})`, transformOrigin: 'center' }}>
          <div style={{ position: 'absolute', inset: 16, borderRadius: 16, overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--elevation-3)', border: '1px solid var(--color-divider)' }}>
            {/* Image 1: org dropdown */}
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - crossFade, transform: `scale(${zoomScale})`, transformOrigin, filter: `blur(${blurAmount}px)`, willChange: 'transform, filter, opacity' }}>
              <img src="/images/product/org-dropdown.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }} />
            </div>
            {/* Image 2: org settings + typing */}
            <div style={{ position: 'absolute', inset: 0, opacity: crossFade, transform: `scale(${zoomScale})`, transformOrigin, filter: `blur(${blurAmount}px)`, willChange: 'transform, filter, opacity' }}>
              <img src="/images/product/org-settings.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }} />
              {/* Typing overlay inside zoom container */}
              <div style={{ position: 'absolute', left: T.typingX, top: T.typingY, width: T.typingWidth, height: 55, background: 'var(--color-surface)', zIndex: 50 }}>
                <div style={{ padding: '3px 4px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11, lineHeight: 1.4, color: 'var(--color-text-secondary)', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {time >= T.typeStart && (() => {
                    const elapsed = Math.max(0, time - T.typeStart)
                    const duration = T.typeEnd - T.typeStart
                    const progress = Math.min(1, elapsed / duration)
                    const chars = Math.floor(progress * DESCRIPTION_TEXT.length)
                    const displayed = DESCRIPTION_TEXT.slice(0, chars)
                    const isTyping = chars < DESCRIPTION_TEXT.length
                    const blinkPhase = (time % 0.53) / 0.53
                    const caretOpacity = isTyping ? (blinkPhase < 0.5 ? 1 : 0) : 0
                    return (
                      <>
                        {displayed}
                        <span style={{ display: 'inline-block', width: 1, height: 10, background: 'var(--color-text-primary)', opacity: caretOpacity, marginLeft: 1, verticalAlign: 'text-bottom' }} />
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          <AnimatedCursor time={time} enterTime={T.cursorEnter} clickTime={T.cursorClick} exitTime={T.cursorExit} targetX={T.cursorTargetX} targetY={T.cursorTargetY} />

          <div style={{ position: 'absolute', bottom: 22, right: 26, fontFamily: 'var(--font-family)', fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', opacity: 0.5 }}>
            beings.com
          </div>
        </div>
      </div>
    </div>
  )
}
