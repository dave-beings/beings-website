import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'
import { TypingText } from './shared/TypingText'
import { StreamingText } from './shared/StreamingText'

/**
 * Timing in seconds — converted from Remotion frame numbers (÷30fps).
 * See animations/src/remotion/InterfaceDemo/index.tsx for the source.
 */
const T = {
  duration: 14,          // 420 frames
  entranceFadeEnd: 0.67, // frame 20
  cursorEnter: 1.0,      // frame 30
  cursorClick: 2.33,     // frame 70
  typeStart: 2.6,        // frame 78
  typeEnd: 7.33,         // frame 220
  cursorExit: 7.5,       // frame 225
  messageAppear: 7.83,   // frame 235
  streamStart: 8.33,     // frame 250
  streamEnd: 12.67,      // frame 380
  loopFadeStart: 13.0,   // frame 390
  loopFadeEnd: 14.0,     // frame 420

  cursorTargetX: 450,
  cursorTargetY: 400,

  typingX: 286,
  typingY: 392,
  typingWidth: 345,

  messageX: 240,
  messageY: 85,
  messageWidth: 390,

  streamX: 230,
  streamY: 145,
  streamWidth: 400,
  streamHeight: 260,
} as const

const PROMPT_TEXT =
  'Summarise the three most prominent themes in these interviews through the lens of what feedback we need to most note in order to ultimately make the patient experience better'

const RESPONSE_TEXT =
  'The interviews highlight three key themes for improving patient experience:\n\n1. Clarity and Accessibility of Information\n\nParticipants frequently mentioned the importance of clear explanations about the study, its purpose, and what was expected of them. Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats, including written and face-to-face explanations. Some participants found explanations too fast or paperwork difficult to follow, suggesting that pacing and format diversity are crucial for ensuring comprehensive understanding across diverse participant groups.'

const W = 900
const H = 486

export default function InterfaceDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({
    duration: T.duration,
  })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / W)
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, T.entranceFadeEnd, 0, 1)
  const entranceScale = lerp(time, 0, T.entranceFadeEnd, 0.98, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  // Message bubble
  const messageVisible = time >= T.messageAppear && time < T.loopFadeEnd
  const messageFadeOut = lerp(time, T.loopFadeStart, T.loopFadeStart + 0.67, 1, 0)
  const timeSinceMessage = time - T.messageAppear
  const messageScale = messageVisible
    ? lerp(Math.min(timeSinceMessage, 0.4), 0, 0.4, 0.95, 1)
    : 0.95

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Demonstration of the Beings chat interface"
        style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}
      >
        <img
          src="/images/product/interface-empty.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
      aria-label="Animated demonstration of the Beings chat interface"
      style={{
        width: '100%',
        aspectRatio: `${W}/${H}`,
        overflow: 'hidden',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
          fontFamily: 'var(--font-family)',
          opacity: containerOpacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${entranceScale})`,
            transformOrigin: 'center',
          }}
        >
          {/* Main card */}
          <div
            style={{
              position: 'absolute',
              inset: 16,
              borderRadius: 16,
              overflow: 'hidden',
              background: 'var(--color-surface)',
              boxShadow: 'var(--elevation-3)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <img
              src="/images/product/interface-empty.png"
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top left',
              }}
            />

            {/* User message bubble */}
            {messageVisible && (
              <div
                style={{
                  position: 'absolute',
                  left: T.messageX,
                  top: T.messageY,
                  width: T.messageWidth,
                  opacity: messageFadeOut,
                  transform: `scale(${messageScale})`,
                  transformOrigin: 'bottom right',
                }}
              >
                <div
                  style={{
                    background: 'var(--color-primary)',
                    borderRadius: 6,
                    padding: '6px 8px',
                    fontFamily: 'var(--font-family)',
                    fontSize: 6.5,
                    lineHeight: 1.5,
                    color: '#FFFFFF',
                    wordWrap: 'break-word',
                  }}
                >
                  {PROMPT_TEXT}
                </div>
              </div>
            )}

            {/* Aida response stream */}
            <StreamingText
              time={time}
              text={RESPONSE_TEXT}
              startTime={T.streamStart}
              endTime={T.streamEnd}
              fadeOutTime={T.loopFadeStart}
              x={T.streamX}
              y={T.streamY}
              width={T.streamWidth}
              maskHeight={T.streamHeight}
            />
          </div>

          {/* Typing in input area */}
          <TypingText
            time={time}
            text={PROMPT_TEXT}
            startTime={T.typeStart}
            endTime={T.typeEnd}
            fadeOutTime={T.messageAppear}
            x={T.typingX}
            y={T.typingY}
            width={T.typingWidth}
          />

          {/* Cursor */}
          <AnimatedCursor
            time={time}
            enterTime={T.cursorEnter}
            clickTime={T.cursorClick}
            exitTime={T.cursorExit}
            targetX={T.cursorTargetX}
            targetY={T.cursorTargetY}
          />

          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: 22,
              right: 26,
              fontFamily: 'var(--font-family)',
              fontSize: 8,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.04em',
              opacity: 0.5,
            }}
          >
            beings.com
          </div>
        </div>
      </div>
    </div>
  )
}
