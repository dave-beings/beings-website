import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'

/**
 * Timing in seconds — ported from Remotion (30fps) with ~120 chars/sec typing.
 */
const T = {
  duration: 11.5,
  entranceFadeEnd: 0.5,
  chatRevealStart: 1.5,
  chatRevealEnd: 2.47,
  typeStart: 2.67,
  cursorEnter: 7.17,
  cursorClick: 8.17,
  cursorExit: 10.17,
  scrollStart: 8.17,
  scrollEnd: 9.0,
  highlightIn: 8.33,
  highlightOut: 10.17,
  highlightSpringDuration: 20 / 30,
  highlightOutFadeDuration: 25 / 30,
  loopFadeStart: 10.83,
  loopFadeEnd: 11.47,
  cursorTargetX: 595,
  cursorTargetY: 168,
} as const

const W = 800
const H = 500

const CHARS_PER_SEC = 120
const BLINK_PERIOD = 16 / 30
const SCROLL_DISTANCE = 0

const TRANSCRIPT_LINES = [
  '\u201CEverything was explained clearly, and they were',
  'supportive. They were flexible with appointment times,',
  'which helped a lot. I felt valued, not just like a number.',
  'Childcare is always a challenge. I was very satisfied. Yes,',
  'I\u2019d definitely take part again.\u201D Participant 12 Male, 62,',
  'Small business owner, White British \u201CMy GP referred me.',
  'I\u2019ve lived with a long-term condition for years, so I was',
  'interested. The explanation was thorough, maybe a bit',
  'long. Everything was professional. I felt respected.',
  'Parking was expensive and annoying. Overall, I was',
  'satisfied. I\u2019d do it again if there were fewer visits.\u201D',
  'Participant 13 Female, 27, Hospitality worker, Latina 6 \u201CA',
  'friend told me about it.\u201D',
]

const HIGHLIGHT_START_LINE = 0
const HIGHLIGHT_END_LINE = 2

const FINDING_1_TITLE = '1. Clarity and Accessibility'
const FINDING_1_BODY_PRE =
  'Participants frequently mentioned the importance of clear communication about the study, its purpose, and what was expected of them.'
const FINDING_1_BODY_POST =
  ' Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats, including written and face-to-face explanations.'
const FINDING_2_TITLE = '2. Respectful and Supportive Staff Interaction'
const FINDING_2_BODY =
  'A recurring sentiment was the desire to feel respected, valued, and listened to by the research team.'

const ALL_SEGMENTS = [
  { text: FINDING_1_TITLE, type: 'title1' as const },
  { text: FINDING_1_BODY_PRE, type: 'body1pre' as const },
  { text: FINDING_1_BODY_POST, type: 'body1post' as const },
  { text: FINDING_2_TITLE, type: 'title2' as const },
  { text: FINDING_2_BODY, type: 'body2' as const },
]

const TOTAL_CHARS = ALL_SEGMENTS.reduce((sum, s) => sum + s.text.length, 0)

function springEase(progress: number): number {
  const p = Math.max(0, Math.min(1, progress))
  return 1 - Math.pow(1 - p, 3)
}

function getTypedSegments(totalCharsTyped: number): Partial<Record<(typeof ALL_SEGMENTS)[number]['type'], string>> {
  let remaining = totalCharsTyped
  const result: Partial<Record<(typeof ALL_SEGMENTS)[number]['type'], string>> = {}

  for (const seg of ALL_SEGMENTS) {
    const chars = Math.min(remaining, seg.text.length)
    result[seg.type] = seg.text.slice(0, chars)
    remaining -= chars
    if (remaining <= 0) break
  }

  return result
}

function BlinkingCursor({ time, visible }: { time: number; visible: boolean }) {
  if (!visible) return null
  const phase = (time % BLINK_PERIOD) / BLINK_PERIOD
  const opacity = phase < 0.5 ? 1 : 0
  return (
    <span
      style={{
        opacity,
        color: 'var(--color-primary)',
        fontWeight: 400,
        marginLeft: 1,
      }}
    >
      {'\u258C'}
    </span>
  )
}

function CitationBadge({
  number,
  isActive,
  glowOpacity,
  visible,
}: {
  number: number
  isActive: boolean
  glowOpacity: number
  visible: boolean
}) {
  if (!visible) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: 4,
        background: isActive ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
        color: isActive ? '#fff' : 'var(--color-primary)',
        fontFamily: 'var(--font-family)',
        fontSize: 10,
        fontWeight: 600,
        marginLeft: 3,
        verticalAlign: 'middle',
        position: 'relative',
        boxShadow: glowOpacity > 0 ? `0 0 ${10 * glowOpacity}px color-mix(in srgb, var(--color-primary) 40%, transparent)` : 'none',
      }}
    >
      {number}
    </span>
  )
}

function DocumentPanel({
  scrollY,
  highlightOpacity,
}: {
  scrollY: number
  highlightOpacity: number
}) {
  return (
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
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-divider)',
          background: 'var(--color-surface)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <rect x="0.5" y="0.5" width="15" height="17" rx="2" fill="#F0F4F8" stroke="var(--color-divider)" />
            <path d="M4 5H12M4 8H12M4 11H9" stroke="var(--color-text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Participant Interview Transcripts.pdf
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 9,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            background: 'color-mix(in srgb, var(--color-text-primary) 6%, transparent)',
            padding: '2px 8px',
            borderRadius: 9999,
          }}
        >
          Document
        </span>
      </div>

      <div
        style={{
          flex: 1,
          padding: '14px 16px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ transform: `translateY(${scrollY}px)` }}>
          {TRANSCRIPT_LINES.map((line, i) => {
            const isHighlighted = i >= HIGHLIGHT_START_LINE && i <= HIGHLIGHT_END_LINE
            return (
              <div key={i} style={{ position: 'relative' }}>
                {isHighlighted && highlightOpacity > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-1px -4px',
                      background: `color-mix(in srgb, var(--color-primary) ${12 * highlightOpacity}%, transparent)`,
                      borderRadius: 3,
                      boxShadow:
                        highlightOpacity > 0.5
                          ? `0 0 ${8 * highlightOpacity}px color-mix(in srgb, var(--color-primary) ${15 * highlightOpacity}%, transparent)`
                          : 'none',
                      ...(i === HIGHLIGHT_START_LINE && {
                        borderLeft: `2.5px solid color-mix(in srgb, var(--color-primary) ${70 * highlightOpacity}%, transparent)`,
                      }),
                    }}
                  />
                )}
                <p
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 10.5,
                    lineHeight: 1.65,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    position: 'relative',
                  }}
                >
                  {line}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ChatPanelContent({
  time,
  typeStart,
  cursorClick,
  highlightOut,
  highlightOutFadeDuration,
}: {
  time: number
  typeStart: number
  cursorClick: number
  highlightOut: number
  highlightOutFadeDuration: number
}) {
  const typeElapsed = Math.max(0, time - typeStart)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_SEC))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = time >= typeStart && !isTypingDone

  const typed = getTypedSegments(totalCharsTyped)
  const hasTitle1 = (typed.title1?.length ?? 0) > 0
  const hasBody1Pre = (typed.body1pre?.length ?? 0) > 0
  const hasBody1Post = (typed.body1post?.length ?? 0) > 0
  const body1PreDone = typed.body1pre?.length === FINDING_1_BODY_PRE.length
  const body1PostDone = typed.body1post?.length === FINDING_1_BODY_POST.length
  const hasTitle2 = (typed.title2?.length ?? 0) > 0
  const hasBody2 = (typed.body2?.length ?? 0) > 0
  const body2Done = typed.body2?.length === FINDING_2_BODY.length

  const currentSegment = (() => {
    let remaining = totalCharsTyped
    for (const seg of ALL_SEGMENTS) {
      if (remaining < seg.text.length) return seg.type
      remaining -= seg.text.length
    }
    return 'done' as const
  })()

  const highlightOutFade = lerp(time, highlightOut, highlightOut + highlightOutFadeDuration, 1, 0)
  const glowProg = Math.max(0, Math.min(1, (time - cursorClick) / 0.25))
  const glowIn = springEase(glowProg)
  const citationGlow = time >= cursorClick ? glowIn * highlightOutFade : 0
  const isCitationActive = time >= cursorClick && time < highlightOut + highlightOutFadeDuration

  const avatarOpacity = lerp(time, typeStart - 10 / 30, typeStart, 0, 1)

  return (
    <div
      style={{
        width: '100%',
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              borderBottom: '2px solid var(--color-primary)',
              paddingBottom: 2,
            }}
          >
            Chat
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 9,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              background: 'color-mix(in srgb, var(--color-text-primary) 6%, transparent)',
              padding: '2px 7px',
              borderRadius: 9999,
            }}
          >
            2 credits
          </span>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
              padding: '2px 7px',
              borderRadius: 9999,
            }}
          >
            better
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflow: 'hidden',
        }}
      >
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
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 10,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              marginTop: 4,
            }}
          >
            Aida
          </span>
        </div>

        {hasTitle1 && (
          <div style={{ paddingLeft: 32 }}>
            <p
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: '0 0 6px',
                lineHeight: 1.4,
              }}
            >
              {typed.title1}
              {showCursor && currentSegment === 'title1' && <BlinkingCursor time={time} visible />}
            </p>
            {hasBody1Pre && (
              <p
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 10,
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {typed.body1pre}
                {body1PreDone && (
                  <>
                    <CitationBadge number={1} isActive={isCitationActive} glowOpacity={citationGlow} visible />
                    <CitationBadge number={2} isActive={false} glowOpacity={0} visible />
                    <CitationBadge number={3} isActive={false} glowOpacity={0} visible />
                  </>
                )}
                {showCursor && currentSegment === 'body1pre' && <BlinkingCursor time={time} visible />}
                {hasBody1Post && (
                  <>
                    {typed.body1post}
                    {body1PostDone && <CitationBadge number={4} isActive={false} glowOpacity={0} visible />}
                    {showCursor && currentSegment === 'body1post' && <BlinkingCursor time={time} visible />}
                  </>
                )}
              </p>
            )}
          </div>
        )}

        {hasTitle2 && (
          <div style={{ paddingLeft: 32 }}>
            <p
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: '0 0 6px',
                lineHeight: 1.4,
              }}
            >
              {typed.title2}
              {showCursor && currentSegment === 'title2' && <BlinkingCursor time={time} visible />}
            </p>
            {hasBody2 && (
              <p
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 10,
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {typed.body2}
                {body2Done && (
                  <>
                    <CitationBadge number={5} isActive={false} glowOpacity={0} visible />
                    <CitationBadge number={6} isActive={false} glowOpacity={0} visible />
                    <CitationBadge number={7} isActive={false} glowOpacity={0} visible />
                  </>
                )}
                {showCursor && currentSegment === 'body2' && <BlinkingCursor time={time} visible />}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CitationDemo() {
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
  const containerOpacity = Math.min(entranceFade, loopFade)

  const revealProgress = Math.max(0, Math.min(1, (time - T.chatRevealStart) / (T.chatRevealEnd - T.chatRevealStart)))
  const chatRevealEased = springEase(revealProgress)
  const chatWidthPercent = chatRevealEased * 45

  const scrollProgress = Math.max(0, Math.min(1, (time - T.scrollStart) / (T.scrollEnd - T.scrollStart)))
  const scrollEased = springEase(scrollProgress)
  const scrollY = SCROLL_DISTANCE * scrollEased

  const highlightInProgress = Math.max(0, Math.min(1, (time - T.highlightIn) / T.highlightSpringDuration))
  const highlightInEase = springEase(highlightInProgress)
  const highlightOutFade = lerp(time, T.highlightOut, T.highlightOut + T.highlightOutFadeDuration, 1, 0)
  const highlightOpacity = time >= T.highlightIn ? highlightInEase * highlightOutFade : 0

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Chat citing a participant interview document"
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
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      role="img"
      aria-label="Animated demonstration of citations linking chat responses to interview transcript passages"
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
            inset: 16,
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--color-surface)',
            boxShadow: 'var(--elevation-3)',
            display: 'flex',
            border: '1px solid var(--color-divider)',
          }}
        >
          <DocumentPanel scrollY={scrollY} highlightOpacity={highlightOpacity} />
          {chatWidthPercent > 0.5 && (
            <div
              style={{
                width: `${chatWidthPercent}%`,
                height: '100%',
                overflow: 'hidden',
                flexShrink: 0,
                borderLeft: '1px solid var(--color-divider)',
              }}
            >
              <ChatPanelContent
                time={time}
                typeStart={T.typeStart}
                cursorClick={T.cursorClick}
                highlightOut={T.highlightOut}
                highlightOutFadeDuration={T.highlightOutFadeDuration}
              />
            </div>
          )}
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
  )
}
