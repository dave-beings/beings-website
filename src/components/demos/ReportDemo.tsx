import { useRef, useEffect, useState, useLayoutEffect } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'

const T = {
  duration: 20.33,
  modalEntranceEnd: 0.83,
  titleStart: 1.0,
  titleEnd: 1.83,
  typeStart: 2.0,
  scrollStart: 15.33,
  toolbarSlideStart: 17.67,
  toolbarSlideDuration: 0.67,
  savedFadeStart: 18.17,
  loopFadeStart: 19.67,
  loopFadeEnd: 20.3,
} as const

const TITLE = 'Patient Experience: Clarity, Respect, Flexibility'

const INTRO =
  'This report synthesises feedback from 15 participants across three demographic groups. The following sections outline the most prominent themes identified through thematic analysis of semi-structured interviews.'

const H1 = '1. Clarity and Accessibility of Information'
const B1 =
  'Participants frequently mentioned the importance of clear explanations about the study, its purpose, and what was expected of them. Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats.'

const H2 = '2. Respectful and Supportive Staff Interaction'
const B2 =
  'A recurring sentiment was the desire to feel respected, valued, and listened to by the research team. Participants who reported positive experiences often cited friendly, patient, and empathetic staff as a key factor.'

const H3 = '3. Flexibility and Practical Considerations'
const B3 =
  'Several participants raised logistical concerns, particularly around appointment scheduling, travel, and parking. Employed participants and carers especially highlighted the need for more flexible timing options.'

/** Ordered fragments for typing + bold headings */
const SEGMENTS: readonly { text: string; bold?: boolean }[] = [
  { text: `${INTRO}\n\n` },
  { text: H1, bold: true },
  { text: `\n\n${B1}\n\n` },
  { text: H2, bold: true },
  { text: `\n\n${B2}\n\n` },
  { text: H3, bold: true },
  { text: `\n\n${B3}` },
] as const

const TOTAL_CHARS = SEGMENTS.reduce((n, s) => n + s.text.length, 0)
const CHARS_PER_SEC = 90

const W = 600
const H = 550

const CARD_INSET = { left: 30, right: 30, top: 16, bottom: 16 }
const TITLE_BAR_H = 44
const TOOLBAR_MAX_H = 62
const FORMAT_ROW_H = 30

function visibleReportSlice(visibleChars: number) {
  let remaining = Math.max(0, Math.floor(visibleChars))
  const nodes: React.ReactNode[] = []
  SEGMENTS.forEach((seg, i) => {
    if (remaining <= 0) return
    const take = Math.min(remaining, seg.text.length)
    const slice = seg.text.slice(0, take)
    remaining -= take
    if (!slice) return
    nodes.push(
      <span
        key={i}
        style={{
          fontWeight: seg.bold ? 700 : 400,
          color: 'var(--color-text-primary)',
        }}
      >
        {slice}
      </span>,
    )
  })
  return nodes
}

export default function ReportDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({
    duration: T.duration,
  })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [scrollMax, setScrollMax] = useState(0)

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / W)
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  const toolbarSlideEnd = T.toolbarSlideStart + T.toolbarSlideDuration
  const toolbarH = lerp(time, T.toolbarSlideStart, toolbarSlideEnd, 0, TOOLBAR_MAX_H)

  const visibleChars =
    time < T.typeStart ? 0 : Math.min(TOTAL_CHARS, Math.floor((time - T.typeStart) * CHARS_PER_SEC))

  useLayoutEffect(() => {
    const vp = viewportRef.current
    const inner = innerRef.current
    if (!vp || !inner) return
    const overflow = Math.max(0, inner.scrollHeight - vp.clientHeight)
    setScrollMax(overflow)
  }, [visibleChars, toolbarH])

  const scrollProgress = Math.max(
    0,
    Math.min(1, (time - T.scrollStart) / (toolbarSlideEnd - T.scrollStart)),
  )
  const scrollOffset = time >= T.scrollStart ? scrollProgress * scrollMax : 0

  const entranceFade = lerp(time, 0, T.modalEntranceEnd, 0, 1)
  const entranceScale = lerp(time, 0, T.modalEntranceEnd, 0.95, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  const titleOpacity = lerp(time, T.titleStart, T.titleEnd, 0, 1)
  const titleY = lerp(time, T.titleStart, T.titleEnd, 8, 0)

  const savedOpacity = lerp(time, T.savedFadeStart, T.savedFadeStart + 0.33, 0, 1)

  const cardH = H - CARD_INSET.top - CARD_INSET.bottom
  const bodyH = cardH - TITLE_BAR_H - toolbarH

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Demonstration of a research report in Beings"
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
            background: 'var(--color-background)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: CARD_INSET.left,
              right: CARD_INSET.right,
              top: CARD_INSET.top,
              bottom: CARD_INSET.bottom,
              borderRadius: 12,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              boxShadow: 'var(--elevation-3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: TITLE_BAR_H,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  paddingRight: 8,
                }}
              >
                {TITLE}
              </span>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }} aria-hidden>
                ×
              </span>
            </div>
            <div style={{ flex: 1, padding: '10px 12px', fontSize: 9, lineHeight: 1.55, overflow: 'auto' }}>
              {visibleReportSlice(TOTAL_CHARS)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={(node) => {
        ;(wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      role="img"
      aria-label="Animated demonstration of a research report in Beings"
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
            transform: `scale(${entranceScale})`,
            transformOrigin: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: CARD_INSET.left,
              right: CARD_INSET.right,
              top: CARD_INSET.top,
              bottom: CARD_INSET.bottom,
              borderRadius: 12,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              boxShadow: 'var(--elevation-3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Title bar */}
            <div
              style={{
                height: TITLE_BAR_H,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                borderBottom: '1px solid var(--color-divider)',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  opacity: titleOpacity,
                  transform: `translateY(${titleY}px)`,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  paddingRight: 8,
                  lineHeight: 1.25,
                }}
              >
                {TITLE}
              </div>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                style={{
                  width: 28,
                  height: 28,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'default',
                  fontSize: 16,
                  lineHeight: 1,
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              >
                ×
              </button>
            </div>

            {/* Report body */}
            <div
              ref={viewportRef}
              style={{
                height: bodyH,
                flexShrink: 0,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 0,
              }}
            >
              <div
                ref={innerRef}
                style={{
                  transform: `translateY(-${scrollOffset}px)`,
                  padding: '10px 12px 12px',
                  fontSize: 9,
                  lineHeight: 1.55,
                  willChange: 'transform',
                }}
              >
                {visibleReportSlice(visibleChars)}
              </div>
            </div>

            {/* Toolbar */}
            <div
              style={{
                height: toolbarH,
                flexShrink: 0,
                overflow: 'hidden',
                borderTop: toolbarH > 0 ? '1px solid var(--color-divider)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  height: FORMAT_ROW_H,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 8px',
                  fontSize: 8,
                  color: 'var(--color-text-secondary)',
                  borderBottom: '1px solid var(--color-divider)',
                  opacity: toolbarH > 8 ? 1 : 0,
                }}
              >
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-background)',
                  }}
                >
                  Paragraph
                </span>
                <span
                  style={{
                    padding: '2px 4px',
                    borderRadius: 4,
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-background)',
                  }}
                >
                  14
                </span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>B</span>
                <span style={{ fontStyle: 'italic' }}>I</span>
                <span>U</span>
                <span>S</span>
                <span style={{ marginLeft: 4, letterSpacing: 2 }}>≡</span>
                <span style={{ letterSpacing: 1 }}>•</span>
                <span style={{ marginLeft: 4 }}>⊞</span>
                <span style={{ marginLeft: 4 }}>⫣</span>
                <span style={{ marginLeft: 'auto', opacity: 0.85 }}>🔗</span>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px',
                  fontSize: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    opacity: savedOpacity * Math.min(1, toolbarH / 36),
                    color: 'var(--color-success)',
                    fontWeight: 600,
                  }}
                >
                  <span aria-hidden style={{ fontSize: 10 }}>
                    ✓
                  </span>
                  <span>Saved</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: Math.min(1, toolbarH / 36),
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: '1px solid var(--color-divider)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 9,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    A
                  </span>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: 8,
                    }}
                  >
                    Convert to Source
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 20,
              fontFamily: 'var(--font-family)',
              fontSize: 8,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.04em',
              opacity: 0.45,
            }}
          >
            beings.com
          </div>
        </div>
      </div>
    </div>
  )
}
