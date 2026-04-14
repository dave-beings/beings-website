import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'

/**
 * Composition: 600×550 @ 12.67s loop.
 */
const T = {
  duration: 12.67,
  modalSpringEnd: 0.67,
  typeStart: 1.0,
  typeEnd: 3.0,
  cogSpringStart: 3.33,
  cogSpringDur: 0.4,
  cursor1Enter: 4.33,
  cursor1Click: 5.0,
  cursor1Exit: 5.33,
  crossFadeStart: 5.33,
  crossFadeEnd: 6.17,
  cursor2Enter: 6.5,
  cursor2Click: 7.07,
  cursor2Exit: 10.33,
  option1T: 7.83,
  option2T: 8.5,
  option3T: 9.17,
  loopFadeStart: 12.0,
  loopFadeEnd: 12.67,
  cursor1TargetX: 500,
  cursor1TargetY: 58,
  dropdownX: 490,
  dropdownY: 158,
  opt1: { x: 300, y: 201 },
  opt2: { x: 300, y: 239 },
  opt3: { x: 300, y: 277 },
} as const

const INSTRUCTION_TEXT =
  'I want concise, structured responses that prioritise key themes and direct quotes from participants. Focus on actionable insights.'

const W = 600
const H = 550

/** Overshoot easing (spring-like) for modal + cog */
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/** Cursor 2 target — piecewise path (used as AnimatedCursor target after click; fixed before click) */
function cursor2TargetPath(time: number): { x: number; y: number } {
  if (time < T.cursor2Click) return { x: T.dropdownX, y: T.dropdownY }
  if (time <= T.option1T) {
    return {
      x: lerp(time, T.cursor2Click, T.option1T, T.dropdownX, T.opt1.x),
      y: lerp(time, T.cursor2Click, T.option1T, T.dropdownY, T.opt1.y),
    }
  }
  if (time <= T.option2T) {
    return {
      x: lerp(time, T.option1T, T.option2T, T.opt1.x, T.opt2.x),
      y: lerp(time, T.option1T, T.option2T, T.opt1.y, T.opt2.y),
    }
  }
  if (time <= T.option3T) {
    return {
      x: lerp(time, T.option2T, T.option3T, T.opt2.x, T.opt3.x),
      y: lerp(time, T.option2T, T.option3T, T.opt2.y, T.opt3.y),
    }
  }
  return { x: T.opt3.x, y: T.opt3.y }
}

/** Closest option index (0–2) by Y distance — DropdownCursor hover */
function highlightedOptionIndex(cursorY: number): number {
  const ys = [T.opt1.y, T.opt2.y, T.opt3.y] as const
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < 3; i++) {
    const d = Math.abs(cursorY - ys[i])
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

export default function CustomInstructionsDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
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

  const entranceFade = lerp(time, 0, T.modalSpringEnd, 0, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  const modalSpringT = clamp01(time / T.modalSpringEnd)
  const modalScale = 0.95 + 0.05 * easeOutBack(modalSpringT)

  const crossFade = lerp(time, T.crossFadeStart, T.crossFadeEnd, 0, 1)
  const chatPrefsOpacity = 1 - crossFade
  const identityOpacity = crossFade

  const cogSpringProgress = clamp01((time - T.cogSpringStart) / T.cogSpringDur)
  const cogScale = time < T.cogSpringStart ? 0 : easeOutBack(cogSpringProgress)

  const cursor2Target =
    time >= T.cursor2Click ? cursor2TargetPath(time) : { x: T.dropdownX, y: T.dropdownY }

  const dropdownOpen = time >= T.cursor2Click && time < T.cursor2Exit
  const cursor2YForHighlight = cursor2TargetPath(time).y
  const hoveredOption = dropdownOpen ? highlightedOptionIndex(cursor2YForHighlight) : -1

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Chat preferences and identity settings"
        style={{
          width: '100%',
          aspectRatio: `${W}/${H}`,
          overflow: 'hidden',
          borderRadius: 12,
          background: 'var(--color-background)',
        }}
      />
    )
  }

  return (
    <div
      ref={(node) => {
        ;(wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      role="img"
      aria-label="Animated demonstration of custom instructions and identity settings"
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
          background: 'var(--color-background)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${modalScale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Modal card — layout tuned to hit cursor targets */}
          <div
            style={{
              position: 'absolute',
              left: 32,
              top: 28,
              width: 536,
              height: 494,
              borderRadius: 12,
              background: 'var(--color-surface)',
              boxShadow: 'var(--elevation-3)',
              border: '1px solid var(--color-divider)',
              overflow: 'hidden',
            }}
          >
            {/* Chat Preferences */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: chatPrefsOpacity,
                pointerEvents: 'none',
                transition: 'none',
              }}
            >
              <div
                style={{
                  padding: '16px 20px 12px',
                  borderBottom: '1px solid var(--color-divider)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Chat Preferences
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 7.5,
                    lineHeight: 1.4,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Guide how Aida responds in this project. These apply to every chat.
                </div>
              </div>
              <div
                style={{
                  margin: '12px 20px',
                  height: 168,
                  borderRadius: 8,
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-background)',
                  padding: '8px 10px',
                  position: 'relative',
                }}
              >
                {time >= T.typeStart && (
                  <TypewriterBlock
                    time={time}
                    text={INSTRUCTION_TEXT}
                    startTime={T.typeStart}
                    endTime={T.typeEnd}
                  />
                )}
              </div>
              <button
                type="button"
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 454,
                  top: 16,
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${cogScale})`,
                  transformOrigin: 'center',
                  padding: 0,
                  cursor: 'default',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    stroke="var(--color-text-secondary)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                    stroke="var(--color-text-secondary)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Identity & Role */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: identityOpacity,
                pointerEvents: 'none',
              }}
            >
              <div style={{ padding: '16px 20px 10px' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Identity &amp; Role
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 7.5,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  Define how Aida interprets your perspective in analysis.
                </div>
              </div>
              <div style={{ padding: '0 20px', fontSize: 8, lineHeight: 1.5 }}>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  Role: Senior Research Analyst
                </div>
                <div style={{ marginTop: 6, color: 'var(--color-text-secondary)' }}>
                  Experience: 20+ years
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 406,
                  top: 99,
                  width: 104,
                }}
              >
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: 4,
                  }}
                >
                  Analysis Framework
                </div>
                <div
                  style={{
                    height: 30,
                    borderRadius: 8,
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    fontSize: 8,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Grounded Theory
                  <span style={{ marginLeft: 'auto', fontSize: 6, color: 'var(--color-text-secondary)' }}>
                    ▾
                  </span>
                </div>
              </div>
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 128,
                    top: 154,
                    width: 280,
                    borderRadius: 8,
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-surface)',
                    boxShadow: 'var(--elevation-2)',
                    overflow: 'hidden',
                    zIndex: 20,
                  }}
                >
                  {(['Grounded Theory', 'Thematic Analysis', 'Discourse Analysis'] as const).map(
                    (label, i) => {
                      const active = hoveredOption === i
                      return (
                        <div
                          key={label}
                          style={{
                            padding: '8px 12px',
                            fontSize: 8,
                            color: 'var(--color-text-primary)',
                            background: active
                              ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
                              : 'transparent',
                            borderBottom: i < 2 ? '1px solid var(--color-divider)' : undefined,
                          }}
                        >
                          {label}
                        </div>
                      )
                    },
                  )}
                </div>
              )}
            </div>
          </div>

          <AnimatedCursor
            time={time}
            enterTime={T.cursor1Enter}
            clickTime={T.cursor1Click}
            exitTime={T.cursor1Exit}
            targetX={T.cursor1TargetX}
            targetY={T.cursor1TargetY}
          />
          <AnimatedCursor
            time={time}
            enterTime={T.cursor2Enter}
            clickTime={T.cursor2Click}
            exitTime={T.cursor2Exit}
            targetX={cursor2Target.x}
            targetY={cursor2Target.y}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 18,
              right: 22,
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

const BLINK = 0.53

function TypewriterBlock({
  time,
  text,
  startTime,
  endTime,
}: {
  time: number
  text: string
  startTime: number
  endTime: number
}) {
  const elapsed = Math.max(0, time - startTime)
  const duration = endTime - startTime
  const progress = Math.min(1, elapsed / duration)
  const totalChars = Math.floor(progress * text.length)
  const displayed = text.slice(0, totalChars)
  const isTyping = totalChars < text.length
  const caretPhase = (time % BLINK) / BLINK
  const caretOpacity = isTyping ? (caretPhase < 0.5 ? 1 : 0) : 0

  return (
    <div
      style={{
        fontSize: 7.5,
        lineHeight: 1.5,
        color: 'var(--color-text-secondary)',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    >
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: 1,
          height: 9,
          background: 'var(--color-text-primary)',
          opacity: caretOpacity,
          marginLeft: 1,
          verticalAlign: 'text-bottom',
        }}
      />
    </div>
  )
}
