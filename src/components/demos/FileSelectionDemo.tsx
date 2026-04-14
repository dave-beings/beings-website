import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'
import { StreamingText } from './shared/StreamingText'
import { FileHighlight, ButtonHighlight } from './shared/Highlight'

const T = {
  duration: 12.0,
  entranceFadeEnd: 0.63,
  cursor1Enter: 2.0,
  cursor1Click: 3.33,
  cursor1Exit: 4.0,
  fileHighlightTime: 3.33,
  chatRevealStart: 4.0,
  chatRevealEnd: 5.47,
  cursor2Enter: 5.5,
  cursor2Click: 6.83,
  cursor2Exit: 7.5,
  buttonHighlightTime: 6.83,
  streamStart: 7.5,
  streamEnd: 11.17,
  loopFadeStart: 11.33,
  loopFadeEnd: 12.0,
  cursor1TargetX: 125,
  cursor1TargetY: 190,
  cursor2TargetX: 495,
  cursor2TargetY: 448,
  fileHighlightX: 8,
  fileHighlightY: 155,
  fileHighlightWidth: 205,
  fileHighlightHeight: 36,
  buttonHighlightX: 440,
  buttonHighlightY: 426,
  buttonHighlightWidth: 85,
  buttonHighlightHeight: 28,
  streamX: 230,
  streamY: 120,
  streamWidth: 400,
  streamHeight: 280,
  clipStartPct: 25,
  clipEndPct: 74,
} as const

const RESPONSE_TEXT =
  'The interviews highlight three key themes for improving patient experience:\n\n1. Clarity and Accessibility of Information\n\nParticipants frequently mentioned the importance of clear explanations about the study, its purpose, and what was expected of them. Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats, including written and face-to-face explanations. Some participants found explanations too fast or paperwork difficult to follow, suggesting that pacing and format diversity are crucial for ensuring comprehensive understanding across diverse participant groups.'

const W = 900
const H = 486
const CARD_W = W - 32
const CARD_H = H - 32

export default function FileSelectionDemo() {
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

  // Clip width animation (spring approximation)
  const clipProgress = Math.max(0, Math.min(1, (time - T.chatRevealStart) / (T.chatRevealEnd - T.chatRevealStart)))
  const clipEased = 1 - Math.pow(1 - clipProgress, 3)
  const clipStartWidth = CARD_W * (T.clipStartPct / 100)
  const clipEndWidth = CARD_W * (T.clipEndPct / 100)
  const clipWidth = clipStartWidth + (clipEndWidth - clipStartWidth) * clipEased

  if (reducedMotion) {
    return (
      <div ref={wrapperRef} role="img" aria-label="File selection demonstration" style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}>
        <img src="/images/product/interface-empty.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      aria-label="Animated file selection demonstration"
      style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', fontFamily: 'var(--font-family)', opacity: containerOpacity, }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${entranceScale})`, transformOrigin: 'center' }}>
          <div style={{ position: 'absolute', inset: 16, borderRadius: 16, overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--elevation-3)', border: '1px solid var(--color-divider)' }}>
            {/* Animated clip container */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: clipWidth, height: '100%', overflow: 'hidden' }}>
              <img src="/images/product/interface-empty.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: CARD_W, height: CARD_H, objectFit: 'cover', objectPosition: 'top left' }} />
            </div>

            <FileHighlight time={time} appearTime={T.fileHighlightTime} fadeOutTime={T.loopFadeStart} x={T.fileHighlightX} y={T.fileHighlightY} width={T.fileHighlightWidth} height={T.fileHighlightHeight} />
            <ButtonHighlight time={time} clickTime={T.buttonHighlightTime} x={T.buttonHighlightX} y={T.buttonHighlightY} width={T.buttonHighlightWidth} height={T.buttonHighlightHeight} />

            <StreamingText time={time} text={RESPONSE_TEXT} startTime={T.streamStart} endTime={T.streamEnd} fadeOutTime={T.loopFadeStart} x={T.streamX} y={T.streamY} width={T.streamWidth} maskHeight={T.streamHeight} />
          </div>

          <AnimatedCursor time={time} enterTime={T.cursor1Enter} clickTime={T.cursor1Click} exitTime={T.cursor1Exit} targetX={T.cursor1TargetX} targetY={T.cursor1TargetY} />
          <AnimatedCursor time={time} enterTime={T.cursor2Enter} clickTime={T.cursor2Click} exitTime={T.cursor2Exit} targetX={T.cursor2TargetX} targetY={T.cursor2TargetY} />

          <div style={{ position: 'absolute', bottom: 22, right: 26, fontFamily: 'var(--font-family)', fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', opacity: 0.5 }}>
            beings.com
          </div>
        </div>
      </div>
    </div>
  )
}
