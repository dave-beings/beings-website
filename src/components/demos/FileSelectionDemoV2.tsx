import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'

const T = {
  duration: 10.53,
  entranceFadeEnd: 0.47,
  headerAppear: 0.5,
  rowStartFrame: 0.73,
  rowStaggerGap: 0.27,
  cursor1Enter: 1.57,
  cursor1Click: 2.43,
  cursor1Exit: 3.03,
  checkboxClickTime: 2.43,
  chatRevealStart: 3.03,
  chatRevealEnd: 4.5,
  cursor2Enter: 4.53,
  cursor2Click: 5.7,
  cursor2Exit: 6.2,
  summariseClickTime: 5.7,
  typeStartTime: 6.37,
  loopFadeStart: 9.87,
  loopFadeEnd: 10.53,
  cursor1TargetX: 718,
  cursor1TargetY: 146,
  cursor2TargetX: 450,
  cursor2TargetY: 458,
} as const

const W = 800
const H = 500

const ROW_SLIDE_DURATION = 0.5
const HEADER_FADE_DURATION = 0.33
const HIGHLIGHT_FADE_SEC = 8 / 30
const CHARS_PER_SECOND = 120
const CURSOR_BLINK_PERIOD = 16 / 30
const AVATAR_LEAD_SEC = 10 / 30

const FILES = [
  { name: 'Patient Interview Transcripts.pdf', size: '2.4 MB' },
  { name: 'Consent Forms \u2013 Batch 3.pdf', size: '1.1 MB' },
  { name: 'Focus Group Notes \u2013 March.pdf', size: '890 KB' },
]

const TITLE_1 = '1. Clarity and Accessibility'
const BODY_1 =
  'Participants frequently mentioned the importance of clear communication about the study, its purpose, and what was expected of them. Feedback indicates a need for simpler language and providing materials in various formats.'
const TITLE_2 = '2. Respectful Staff Interaction'
const BODY_2 =
  'A recurring sentiment was the desire to feel respected, valued, and listened to by the research team throughout the study process.'

const ALL_SEGMENTS = [
  { text: TITLE_1, type: 'title1' as const },
  { text: BODY_1, type: 'body1' as const },
  { text: TITLE_2, type: 'title2' as const },
  { text: BODY_2, type: 'body2' as const },
]

const TOTAL_CHARS = ALL_SEGMENTS.reduce((sum, s) => sum + s.text.length, 0)
const ACTION_BUTTONS = ['Summarise', 'Discuss', 'Evaluate'] as const

function getTypedSegments(totalCharsTyped: number) {
  let remaining = totalCharsTyped
  const result: Partial<Record<(typeof ALL_SEGMENTS)[number]['type'], string>> = {}
  for (const seg of ALL_SEGMENTS) {
    const chars = Math.min(remaining, seg.text.length)
    result[seg.type] = seg.text.slice(0, chars)
    remaining -= chars
    if (remaining <= 0) break
  }
  return result as Record<string, string>
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/** Approximates Remotion spring (damping 200) for row stagger — duration ~0.5s */
function rowSpringProgress(time: number, rowAppearTime: number) {
  const p = Math.max(0, Math.min(1, (time - rowAppearTime) / ROW_SLIDE_DURATION))
  return easeOutCubic(p)
}

/** Checkbox click spring approximation */
function checkboxSpringProgress(time: number, clickTime: number) {
  const t = Math.max(0, time - clickTime)
  const raw = Math.min(1, 1 - Math.exp(-11 * Math.min(t, 0.55)))
  return raw
}

function checkScaleFromProgress(p: number) {
  if (p <= 0) return 1
  if (p < 0.5) return 1 + 0.15 * (p / 0.5)
  return 1.15 - 0.15 * ((p - 0.5) / 0.5)
}

function checkFillFromProgress(p: number) {
  return Math.min(1, Math.max(0, p / 0.3))
}

/** Chat panel width spring — 0% → 50% */
function chatWidthSpring(time: number) {
  const dur = T.chatRevealEnd - T.chatRevealStart
  const p = Math.max(0, Math.min(1, (time - T.chatRevealStart) / dur))
  const eased = easeOutCubic(p)
  return eased * 50
}

function summariseHighlight(time: number) {
  if (time < T.summariseClickTime) return 0
  const elapsed = time - T.summariseClickTime
  const peak = 5 / 30
  const end = 25 / 30
  if (elapsed <= peak) return lerp(elapsed, 0, peak, 0, 1)
  if (elapsed <= end) return lerp(elapsed, peak, end, 1, 0)
  return 0
}

/** Blinking caret opacity — triangle wave over CURSOR_BLINK_PERIOD (Remotion: 16 frames @ 30fps). */
function blinkOpacity(time: number) {
  const local = (time % CURSOR_BLINK_PERIOD) / CURSOR_BLINK_PERIOD
  if (local < 0.5) return lerp(local, 0, 0.5, 1, 0)
  return lerp(local, 0.5, 1, 0, 1)
}

function currentSegmentType(totalCharsTyped: number): 'title1' | 'body1' | 'title2' | 'body2' | 'done' {
  let remaining = totalCharsTyped
  for (const seg of ALL_SEGMENTS) {
    if (remaining < seg.text.length) return seg.type
    remaining -= seg.text.length
  }
  return 'done'
}

export default function FileSelectionDemoV2() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, T.entranceFadeEnd, 0, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const opacity = Math.min(entranceFade, loopFade)

  const headerOpacity = lerp(time, T.headerAppear, T.headerAppear + HEADER_FADE_DURATION, 0, 1)
  const chatWidthPercent = chatWidthSpring(time)
  const showChat = chatWidthPercent > 0.5

  const typeElapsed = Math.max(0, time - T.typeStartTime)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_SECOND))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showTypeCursor = time >= T.typeStartTime && !isTypingDone
  const typed = getTypedSegments(totalCharsTyped)
  const currentSeg = currentSegmentType(totalCharsTyped)

  const avatarOpacity = lerp(time, T.typeStartTime - AVATAR_LEAD_SEC, T.typeStartTime, 0, 1)
  const sumHighlight = summariseHighlight(time)

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="File list and chat panel"
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
      ref={(n) => {
        ;(wrapperRef as { current: HTMLDivElement | null }).current = n
        ;(containerRef as { current: HTMLDivElement | null }).current = n
      }}
      role="img"
      aria-label="Animated file selection and chat demonstration"
      style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
          fontFamily: 'var(--font-family)',
          opacity,
          background: 'var(--color-background)',
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
            display: 'flex',
          }}
        >
          {/* Files panel */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-surface)',
              overflow: 'hidden',
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
                opacity: headerOpacity,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>Total Files: 3</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M10 3.5A4.5 4.5 0 002.2 4.3M2 8.5A4.5 4.5 0 009.8 7.7"
                    stroke="var(--color-text-secondary)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path d="M10 1.5v2h-2" stroke="var(--color-text-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 10.5v-2h2" stroke="var(--color-text-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <circle cx="5" cy="5" r="3.5" stroke="var(--color-text-secondary)" strokeWidth="1.2" />
                  <path d="M8 8l2.5 2.5" stroke="var(--color-text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              {FILES.map((file, i) => {
                const rowAppearTime = T.rowStartFrame + i * T.rowStaggerGap
                const rowP = rowSpringProgress(time, rowAppearTime)
                const rowOpacity = rowP
                const rowTranslateY = 8 * (1 - rowP)

                const isThirdRow = i === 2
                const isChecked = isThirdRow && time >= T.checkboxClickTime
                const checkP = isThirdRow ? checkboxSpringProgress(time, T.checkboxClickTime) : 0
                const checkScale = isChecked ? checkScaleFromProgress(checkP) : 1
                const checkFill = isChecked ? checkFillFromProgress(checkP) : 0

                const highlightOpacity =
                  isThirdRow && time >= T.checkboxClickTime
                    ? lerp(time, T.checkboxClickTime, T.checkboxClickTime + HIGHLIGHT_FADE_SEC, 0, 1)
                    : 0

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--color-divider)',
                      opacity: rowOpacity,
                      transform: `translateY(${rowTranslateY}px)`,
                      position: 'relative',
                      background:
                        highlightOpacity > 0
                          ? `color-mix(in srgb, var(--color-primary) ${Math.round(6 * highlightOpacity)}%, transparent)`
                          : 'transparent',
                      borderLeft:
                        highlightOpacity > 0
                          ? `3px solid color-mix(in srgb, var(--color-primary) ${Math.round(100 * highlightOpacity)}%, transparent)`
                          : '3px solid transparent',
                    }}
                  >
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0 }} aria-hidden>
                      <rect x="0.5" y="0.5" width="13" height="15" rx="2" fill="rgba(0,0,0,0.04)" stroke="var(--color-divider)" />
                      <path
                        d="M3.5 5H10.5M3.5 7.5H10.5M3.5 10H7.5"
                        stroke="var(--color-text-secondary)"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        marginLeft: 10,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: 'var(--color-text-secondary)',
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      {file.size}
                    </span>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        border: checkFill > 0.5 ? 'none' : '1.5px solid var(--color-divider)',
                        background:
                          checkFill > 0
                            ? `color-mix(in srgb, var(--color-primary) ${Math.round(100 * checkFill)}%, white)`
                            : 'transparent',
                        marginLeft: 12,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `scale(${checkScale})`,
                      }}
                    >
                      {checkFill > 0.3 && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 8, flexShrink: 0 }} aria-hidden>
                      <path
                        d="M3.5 2L6.5 5L3.5 8"
                        stroke="var(--color-text-secondary)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 6, flexShrink: 0 }} aria-hidden>
                      <circle cx="5" cy="2" r="0.8" fill="var(--color-text-secondary)" />
                      <circle cx="5" cy="5" r="0.8" fill="var(--color-text-secondary)" />
                      <circle cx="5" cy="8" r="0.8" fill="var(--color-text-secondary)" />
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat panel */}
          {showChat && (
            <div
              style={{
                width: `${chatWidthPercent}%`,
                height: '100%',
                overflow: 'hidden',
                flexShrink: 0,
                borderLeft: '1px solid var(--color-divider)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-surface)',
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
                }}
              >
                <span
                  style={{
                    fontSize: 12,
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
                    fontSize: 9,
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    background: 'rgba(0,0,0,0.04)',
                    padding: '2px 7px',
                    borderRadius: 9999,
                  }}
                >
                  2 credits/query
                </span>
              </div>

              <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
                {time >= T.typeStartTime - AVATAR_LEAD_SEC && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: avatarOpacity }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>A</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: 4 }}>Aida</span>
                    </div>

                    {(typed.title1?.length ?? 0) > 0 && (
                      <div style={{ paddingLeft: 32 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            margin: '0 0 6px',
                            lineHeight: 1.4,
                          }}
                        >
                          {typed.title1}
                          {showTypeCursor && currentSeg === 'title1' && (
                            <span style={{ color: 'var(--color-primary)', fontWeight: 400, marginLeft: 1, opacity: blinkOpacity(time) }}>
                              █
                            </span>
                          )}
                        </p>
                        {(typed.body1?.length ?? 0) > 0 && (
                          <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            {typed.body1}
                            {showTypeCursor && currentSeg === 'body1' && (
                              <span style={{ color: 'var(--color-primary)', fontWeight: 400, marginLeft: 1, opacity: blinkOpacity(time) }}>
                                █
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {(typed.title2?.length ?? 0) > 0 && (
                      <div style={{ paddingLeft: 32 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            margin: '0 0 6px',
                            lineHeight: 1.4,
                          }}
                        >
                          {typed.title2}
                          {showTypeCursor && currentSeg === 'title2' && (
                            <span style={{ color: 'var(--color-primary)', fontWeight: 400, marginLeft: 1, opacity: blinkOpacity(time) }}>
                              █
                            </span>
                          )}
                        </p>
                        {(typed.body2?.length ?? 0) > 0 && (
                          <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            {typed.body2}
                            {showTypeCursor && currentSeg === 'body2' && (
                              <span style={{ color: 'var(--color-primary)', fontWeight: 400, marginLeft: 1, opacity: blinkOpacity(time) }}>
                                █
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  borderTop: '1px solid var(--color-divider)',
                  flexShrink: 0,
                }}
              >
                {ACTION_BUTTONS.map((label) => {
                  const isSummarise = label === 'Summarise'
                  return (
                    <div
                      key={label}
                      style={{
                        fontSize: 9,
                        fontWeight: 500,
                        color: isSummarise && sumHighlight > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        background:
                          isSummarise && sumHighlight > 0
                            ? `color-mix(in srgb, var(--color-primary) ${Math.round(15 * sumHighlight)}%, var(--color-background))`
                            : 'rgba(0,0,0,0.04)',
                        padding: '5px 12px',
                        borderRadius: 9999,
                      }}
                    >
                      {label}
                    </div>
                  )
                })}
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          )}
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
          targetX={T.cursor2TargetX}
          targetY={T.cursor2TargetY}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 22,
            right: 26,
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
  )
}
