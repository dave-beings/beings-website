import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'

/**
 * Timing in seconds — ported from Remotion TransparencyDemo (14s loop).
 */
const T = {
  duration: 14.0,
  entranceFadeEnd: 0.67,
  userMessageIn: 0.83,
  userMessageEnd: 1.67,
  typeStart: 2.5,
  metricsRevealStart: 5.5,
  tokenCountEnd: 7.33,
  processingInfoIn: 6.67,
  modelInfoIn: 7.17,
  cursorEnter: 8.17,
  cursorClick: 9.17,
  cursorExit: 11.33,
  accordionExpandStart: 9.33,
  accordionExpandDuration: 1.3,
  loopFadeStart: 13.33,
  loopFadeEnd: 13.97,

  cursorTargetX: 130,
  cursorTargetY: 298,
} as const

const USER_MESSAGE = 'tell me about the weather'

const LINE1 = 'The current data does not contain sufficient evidence to answer this.'
const LINE2 = 'Would you like me to assist you in another area or refine your request?'
const RESPONSE = `${LINE1}\n${LINE2}`

const CHARS_PER_SEC = 120
const BLINK_PERIOD = 0.53

const INPUT_TARGET = 1047
const OUTPUT_TARGET = 31
const TOTAL_TARGET = 1078

const ACCORDION_LINES = [
  '## 1. IDENTITY & PURPOSE',
  'You are Aida, the Co-Intelligent Research Partner for Beings.',
  'You are a Senior Qualitative Research Analyst with 20+ years...',
  'Your Goal: Amplify human expertise by synthesising...',
] as const

const W = 800
const H = 500

function entranceSpringScale(time: number, end: number): number {
  const p = Math.max(0, Math.min(1, time / end))
  const eased = 1 - Math.pow(1 - p, 3)
  return 0.96 + 0.04 * eased
}

function formatInt(n: number): string {
  return Math.round(n).toString()
}

function AccordionSystemContext({
  expandStart,
  expandDuration,
  clickTime,
}: {
  expandStart: number
  expandDuration: number
  clickTime: number
}) {
  const expandT = Math.max(0, Math.min(1, (time - expandStart) / expandDuration))
  const bodyHeight = 72 * expandT
  const chevronRot = 90 * expandT

  const glowWindow = time >= clickTime && time < clickTime + 0.45
  const glowStrength = glowWindow ? lerp(time, clickTime, clickTime + 0.38, 1, 0) : 0
  const headerGlow =
    glowStrength > 0
      ? `0 0 ${8 + 10 * glowStrength}px rgba(91, 111, 204, ${0.35 * glowStrength})`
      : 'none'

  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 8,
        border: '1px solid var(--color-divider)',
        overflow: 'hidden',
        background: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          gap: 8,
          boxShadow: headerGlow,
          transition: 'box-shadow 0.08s ease-out',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              transform: `rotate(${chevronRot}deg)`,
              transformOrigin: 'center',
              fontSize: 10,
              lineHeight: 1,
              color: 'var(--color-text-secondary)',
            }}
            aria-hidden
          >
            ▶
          </span>
          System Context
        </span>
        <span style={{ fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)' }}>27 lines</span>
      </div>
      <div
        style={{
          height: bodyHeight,
          overflow: 'hidden',
          borderTop: expandT > 0.02 ? '1px solid var(--color-divider)' : 'none',
        }}
      >
        <div style={{ padding: '8px 10px 10px' }}>
          {ACCORDION_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: 7.5,
                lineHeight: 1.45,
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TransparencyDemo() {
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
  const entranceScale = entranceSpringScale(time, T.entranceFadeEnd)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  const userMsgProgress = Math.max(
    0,
    Math.min(1, (time - T.userMessageIn) / (T.userMessageEnd - T.userMessageIn)),
  )
  const userMsgEased = 1 - Math.pow(1 - userMsgProgress, 3)
  const userMsgX = 28 * (1 - userMsgEased)

  const typeElapsed = Math.max(0, time - T.typeStart)
  const totalCharsTyped = Math.min(RESPONSE.length, Math.floor(typeElapsed * CHARS_PER_SEC))
  const isTypingDone = totalCharsTyped >= RESPONSE.length
  const showTypeCursor = time >= T.typeStart && !isTypingDone
  const blinkPhase = (time % BLINK_PERIOD) / BLINK_PERIOD
  const caretVisible = showTypeCursor && blinkPhase < 0.5
  const avatarOpacity = lerp(time, T.typeStart - 0.33, T.typeStart, 0, 1)

  const visibleResponse = RESPONSE.slice(0, totalCharsTyped)
  const nlIdx = visibleResponse.indexOf('\n')

  const tokenProgress = Math.max(
    0,
    Math.min(1, (time - T.metricsRevealStart) / (T.tokenCountEnd - T.metricsRevealStart)),
  )
  const inputShown = INPUT_TARGET * tokenProgress
  const outputShown = OUTPUT_TARGET * tokenProgress
  const totalShown = TOTAL_TARGET * tokenProgress

  const metricsOpacity = lerp(time, T.metricsRevealStart, T.metricsRevealStart + 0.4, 0, 1)
  const processingOpacity = lerp(time, T.processingInfoIn, T.processingInfoIn + 0.35, 0, 1)
  const modelOpacity = lerp(time, T.modelInfoIn, T.modelInfoIn + 0.35, 0, 1)

  const Caret = () =>
    caretVisible ? (
      <span style={{ color: 'var(--color-primary)', fontWeight: 400, marginLeft: 1 }}>█</span>
    ) : null

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Transparency and system context in chat"
        style={{
          width: '100%',
          aspectRatio: `${W}/${H}`,
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
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
      aria-label="Animated demonstration of transparency metrics and system context in chat"
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
            transformOrigin: 'center center',
          }}
        >
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
          <div style={{ display: 'flex', flexDirection: 'row', height: '100%', minHeight: 0 }}>
            {/* Chat — 50% */}
            <div
              style={{
                flex: 2,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--color-divider)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--color-divider)',
                  flexShrink: 0,
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      borderBottom: '2px solid var(--color-primary)',
                      paddingBottom: 2,
                    }}
                  >
                    Chat
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      background: 'rgba(0,0,0,0.05)',
                      padding: '3px 8px',
                      borderRadius: 9999,
                    }}
                  >
                    1 credit
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-divider)',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    standard
                  </span>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  overflow: 'hidden',
                  minHeight: 0,
                }}
              >
                {time >= T.userMessageIn && (
                  <div
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '88%',
                      opacity: userMsgEased,
                      transform: `translateX(${userMsgX}px)`,
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 400,
                        padding: '8px 12px',
                        borderRadius: '14px 14px 4px 14px',
                        lineHeight: 1.45,
                      }}
                    >
                      {USER_MESSAGE}
                    </div>
                  </div>
                )}

                {time >= T.typeStart - 0.33 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      opacity: avatarOpacity,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>A</span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Aida
                      </span>
                    </div>
                    <div style={{ paddingLeft: 26 }}>
                      <div
                        style={{
                          fontSize: 10,
                          lineHeight: 1.55,
                          color: 'var(--color-text-secondary)',
                          margin: 0,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {nlIdx === -1 ? (
                          <>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {visibleResponse}
                            </span>
                            <Caret />
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {visibleResponse.slice(0, nlIdx)}
                            </span>
                            {'\n'}
                            <span style={{ fontWeight: 400 }}>
                              {visibleResponse.slice(nlIdx + 1)}
                            </span>
                            <Caret />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {time >= T.metricsRevealStart && (
                  <div
                    style={{
                      opacity: metricsOpacity,
                      marginTop: 'auto',
                      paddingTop: 8,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 9,
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        marginBottom: 8,
                      }}
                    >
                      <span>Input={formatInt(inputShown)}</span>
                      <span>Output={formatInt(outputShown)}</span>
                      <span>Total={formatInt(totalShown)}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: 'var(--color-text-secondary)',
                        marginBottom: 4,
                        opacity: processingOpacity,
                      }}
                    >
                      Total: 1154ms
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 500,
                        color: 'var(--color-primary)',
                        marginBottom: 8,
                        opacity: modelOpacity,
                      }}
                    >
                      Model: azure-gpt-4o-uk
                    </div>
                    <AccordionSystemContext
                      expandStart={T.accordionExpandStart}
                      expandDuration={T.accordionExpandDuration}
                      clickTime={T.cursorClick}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Document — 25% */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--color-divider)',
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-divider)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Document
              </div>
              <div
                style={{
                  padding: 12,
                  fontSize: 9,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                No document selected
              </div>
            </div>

            {/* Files — 25% */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-divider)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Files
              </div>
              <div
                style={{
                  padding: 12,
                  fontSize: 9,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                No files uploaded
              </div>
            </div>
          </div>
        </div>

        <AnimatedCursor
          time={time}
          enterTime={T.cursorEnter}
          clickTime={T.cursorClick}
          exitTime={T.cursorExit}
          targetX={T.cursorTargetX}
          targetY={T.cursorTargetY}
        />

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
