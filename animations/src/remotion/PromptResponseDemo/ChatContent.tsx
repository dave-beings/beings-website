import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

interface ChatContentProps {
  headerOpacity: number
  userMsgStartFrame: number
  userMsgEndFrame: number
  typeStartFrame: number
}

/** Characters typed per frame (higher = faster typing) */
const CHARS_PER_FRAME = 4
/** Blinking cursor blink cycle in frames */
const CURSOR_BLINK_FRAMES = 16

// ── User question ──────────────────────────────────────────
const USER_QUESTION =
  'Can you explain any differences in response that came up from employed vs unemployed or self-employed participants'

// ── Response text segments ─────────────────────────────────
const INTRO =
  'The interviews reveal distinct challenges and feedback patterns based on participants\u2019 employment status, primarily revolving around logistical flexibility and the communication of information.'

const HEADING = 'Employed, Self-Employed, and Full-time Carers'

const BODY_PRE_CITATION =
  'This group consistently highlighted issues related to time commitment and scheduling flexibility. Participants in full-time employment, self-employment, or those with significant caring responsibilities frequently found it \u201Ctricky\u201D or \u201Cnot easy\u201D to fit appointments around work or other commitments. For example, a taxi driver noted the difficulty in \u201Cfitting it around work\u201D, a part-time retail worker found \u201Ctaking time off work wasn\u2019t easy\u201D, and a full-time carer struggled with \u201Cjuggling my caring responsibilities\u201D'

const BODY_POST_CITATION =
  '. Suggestions for improvement from these individuals included greater flexibility in appointment times, such as offering evening slots, reducing the number of visits, and providing remote participation options.'

// Structured sequence for character counting
const ALL_SEGMENTS = [
  { text: INTRO, type: 'intro' as const },
  { text: HEADING, type: 'heading' as const },
  { text: BODY_PRE_CITATION, type: 'bodyPre' as const },
  { text: BODY_POST_CITATION, type: 'bodyPost' as const },
]

const TOTAL_CHARS = ALL_SEGMENTS.reduce((sum, s) => sum + s.text.length, 0)

function getTypedSegments(totalCharsTyped: number) {
  let remaining = totalCharsTyped
  const result: Record<string, string> = {}

  for (const seg of ALL_SEGMENTS) {
    const chars = Math.min(remaining, seg.text.length)
    result[seg.type] = seg.text.slice(0, chars)
    remaining -= chars
    if (remaining <= 0) break
  }

  return result
}

// ── Sub-components ─────────────────────────────────────────

const BlinkingCursor: React.FC<{ frame: number; visible: boolean }> = ({ frame, visible }) => {
  if (!visible) return null
  const opacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  return (
    <span
      style={{
        opacity,
        color: colors.brand.primary,
        fontWeight: 400,
        marginLeft: 1,
      }}
    >
      {'\u258C'}
    </span>
  )
}

const CitationBadge: React.FC<{
  label: string
  visible: boolean
  frame: number
  appearFrame: number
  fps: number
}> = ({ label, visible, frame, appearFrame, fps }) => {
  if (!visible) return null
  const scale = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  })
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 16,
        padding: '0 5px',
        borderRadius: 4,
        background: 'rgba(4, 156, 240, 0.12)',
        color: colors.brand.primary,
        fontFamily: fonts.sans,
        fontSize: 9,
        fontWeight: 600,
        marginLeft: 4,
        verticalAlign: 'middle',
        transform: `scale(${scale})`,
      }}
    >
      {label}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────

export const ChatContent: React.FC<ChatContentProps> = ({
  headerOpacity,
  userMsgStartFrame,
  userMsgEndFrame,
  typeStartFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // User message slide-in
  const userMsgProgress = spring({
    frame: frame - userMsgStartFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: userMsgEndFrame - userMsgStartFrame,
  })
  const userMsgTranslateX = interpolate(userMsgProgress, [0, 1], [30, 0])
  const userMsgOpacity = interpolate(userMsgProgress, [0, 1], [0, 1])

  // Typing progress
  const typeElapsed = Math.max(0, frame - typeStartFrame)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = frame >= typeStartFrame && !isTypingDone

  const typed = getTypedSegments(totalCharsTyped)
  const hasIntro = (typed.intro?.length ?? 0) > 0
  const hasHeading = (typed.heading?.length ?? 0) > 0
  const hasBodyPre = (typed.bodyPre?.length ?? 0) > 0
  const bodyPreDone = typed.bodyPre?.length === BODY_PRE_CITATION.length
  const hasBodyPost = (typed.bodyPost?.length ?? 0) > 0

  // Which segment is currently being typed (for cursor placement)
  const currentSegment = (() => {
    let remaining = totalCharsTyped
    for (const seg of ALL_SEGMENTS) {
      if (remaining < seg.text.length) return seg.type
      remaining -= seg.text.length
    }
    return 'done'
  })()

  // Aida avatar fade-in
  const avatarOpacity = interpolate(frame, [typeStartFrame - 10, typeStartFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Frame when bodyPre finishes (for citation badge pop-in)
  const bodyPreCharStart = INTRO.length + HEADING.length
  const bodyPreDoneFrame =
    typeStartFrame + Math.ceil((bodyPreCharStart + BODY_PRE_CITATION.length) / CHARS_PER_FRAME)

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface.white,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ─────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: `1px solid ${colors.surface.gray200}`,
          flexShrink: 0,
          opacity: headerOpacity,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 600,
              color: colors.text.primary,
              borderBottom: `2px solid ${colors.brand.primary}`,
              paddingBottom: 2,
            }}
          >
            Chat
          </span>
          {/* Toggle switch */}
          <div
            style={{
              width: 28,
              height: 14,
              borderRadius: 7,
              background: '#22C55E',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 2,
                right: 2,
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 9,
              fontWeight: 500,
              color: colors.text.secondary,
              background: colors.surface.gray100,
              padding: '2px 8px',
              borderRadius: radius.full,
            }}
          >
            5 credits/query
          </span>
          {/* Settings gear icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke={colors.text.muted}
              strokeWidth="1.5"
            />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
              stroke={colors.text.muted}
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* ── Chat content area ──────────────────── */}
      <div
        style={{
          flex: 1,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflow: 'hidden',
        }}
      >
        {/* User message (blue pill, right-aligned) */}
        {frame >= userMsgStartFrame && (
          <div
            style={{
              alignSelf: 'flex-end',
              maxWidth: '85%',
              opacity: userMsgOpacity,
              transform: `translateX(${userMsgTranslateX}px)`,
            }}
          >
            <div
              style={{
                background: colors.brand.primary,
                color: '#fff',
                fontFamily: fonts.sans,
                fontSize: 10,
                fontWeight: 400,
                padding: '8px 14px',
                borderRadius: '14px 14px 4px 14px',
                lineHeight: 1.5,
              }}
            >
              {USER_QUESTION}
            </div>
          </div>
        )}

        {/* Aida response */}
        {frame >= typeStartFrame - 10 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              opacity: avatarOpacity,
            }}
          >
            {/* Aida avatar + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.primaryLight})`,
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
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  fontWeight: 500,
                  color: colors.text.secondary,
                }}
              >
                Aida
              </span>
            </div>

            {/* Response body */}
            <div style={{ paddingLeft: 26 }}>
              {/* Intro paragraph */}
              {hasIntro && (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    color: colors.text.secondary,
                    margin: '0 0 10px',
                    lineHeight: 1.65,
                  }}
                >
                  {typed.intro}
                  {showCursor && currentSegment === 'intro' && (
                    <BlinkingCursor frame={frame} visible />
                  )}
                </p>
              )}

              {/* Section heading */}
              {hasHeading && (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    fontWeight: 600,
                    color: colors.text.primary,
                    margin: '0 0 6px',
                    lineHeight: 1.4,
                  }}
                >
                  {typed.heading}
                  {showCursor && currentSegment === 'heading' && (
                    <BlinkingCursor frame={frame} visible />
                  )}
                </p>
              )}

              {/* Body paragraph with citation badge */}
              {hasBodyPre && (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    color: colors.text.secondary,
                    margin: 0,
                    lineHeight: 1.65,
                  }}
                >
                  {typed.bodyPre}
                  {bodyPreDone && (
                    <CitationBadge
                      label="B"
                      visible
                      frame={frame}
                      appearFrame={bodyPreDoneFrame}
                      fps={fps}
                    />
                  )}
                  {showCursor && currentSegment === 'bodyPre' && (
                    <BlinkingCursor frame={frame} visible />
                  )}
                  {hasBodyPost && (
                    <>
                      {typed.bodyPost}
                      {showCursor && currentSegment === 'bodyPost' && (
                        <BlinkingCursor frame={frame} visible />
                      )}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
