import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'
import { TIMING } from './index'

/** Characters typed per frame (4 = readable speed) */
const CHARS_PER_FRAME = 4
/** Blinking cursor blink cycle in frames */
const CURSOR_BLINK_FRAMES = 16

// ── Content constants ──────────────────────────────────────

const USER_MESSAGE = 'tell me about the weather'

const RESPONSE_LINE_1 =
  'The current data does not contain sufficient evidence to answer this.'
const RESPONSE_LINE_2 =
  'Would you like me to assist you in another area or refine your request?'

const ALL_SEGMENTS = [
  { text: RESPONSE_LINE_1, type: 'line1' as const },
  { text: RESPONSE_LINE_2, type: 'line2' as const },
]

const TOTAL_CHARS = ALL_SEGMENTS.reduce((sum, s) => sum + s.text.length, 0)

// Token stats
const TOKEN_INPUT = 1047
const TOKEN_OUTPUT = 31
const TOKEN_TOTAL = 1078

// Processing info
const PROCESSING_TIME = '1154ms'
const MODEL_NAME = 'azure-gpt-4o-uk'

// System Context content
const SYSTEM_CONTEXT_LINES = 27
const SYSTEM_PROMPT_LINES = [
  '## 1. IDENTITY & PURPOSE',
  'You are Aida, the Co-Intelligent Research Partner for Beings.',
  'You are a Senior Qualitative Research Analyst with 20+ years of experience in Grounded Theory and Thematic Analysis.',
  'Your Goal: Amplify human expertise by synthesising unstructured qualitative data into rigorous, evidence-',
]

// ── Helpers ─────────────────────────────────────────────────

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

// ── Sub-components ──────────────────────────────────────────

const BlinkingCursor: React.FC<{ frame: number; visible: boolean }> = ({
  frame,
  visible,
}) => {
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

const TokenStat: React.FC<{
  label: string
  targetValue: number
  progress: number
}> = ({ label, targetValue, progress }) => {
  const displayValue = Math.round(targetValue * progress)
  const formatted = displayValue.toLocaleString()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 8,
          fontWeight: 500,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          fontWeight: 600,
          color: colors.text.primary,
        }}
      >
        {formatted}
      </span>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────

export const ChatPanel: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── User message animation ──
  const userMsgProgress = spring({
    frame: frame - TIMING.userMessageIn,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.userMessageEnd - TIMING.userMessageIn,
  })
  const userMsgOpacity = interpolate(userMsgProgress, [0, 1], [0, 1])
  const userMsgY = interpolate(userMsgProgress, [0, 1], [8, 0])

  // ── Typing progress ──
  const typeElapsed = Math.max(0, frame - TIMING.typeStart)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = frame >= TIMING.typeStart && !isTypingDone
  const typed = getTypedSegments(totalCharsTyped)
  const hasLine1 = (typed.line1?.length ?? 0) > 0

  const currentSegment = (() => {
    let remaining = totalCharsTyped
    for (const seg of ALL_SEGMENTS) {
      if (remaining < seg.text.length) return seg.type
      remaining -= seg.text.length
    }
    return 'done'
  })()

  // ── Aida avatar fade ──
  const avatarOpacity = interpolate(
    frame,
    [TIMING.typeStart - 10, TIMING.typeStart],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // ── Metrics animation ──
  const metricsElapsed = Math.max(0, frame - TIMING.metricsRevealStart)
  const metricsOpacity = interpolate(
    frame,
    [TIMING.metricsRevealStart, TIMING.metricsRevealStart + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Token counter progress (count up from 0 to final values)
  const tokenProgress = interpolate(
    frame,
    [TIMING.metricsRevealStart + 5, TIMING.tokenCountEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Processing time fade in
  const processingOpacity = interpolate(
    frame,
    [TIMING.processingInfoIn, TIMING.processingInfoIn + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Model info fade in
  const modelOpacity = interpolate(
    frame,
    [TIMING.modelInfoIn, TIMING.modelInfoIn + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // ── System Context accordion ──
  const accordionExpand = spring({
    frame: frame - TIMING.accordionExpandStart,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  })
  const accordionHeight = interpolate(accordionExpand, [0, 1], [0, 72])
  const accordionContentOpacity = interpolate(
    frame,
    [TIMING.accordionExpandStart + 10, TIMING.accordionExpandStart + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // System Context header visibility (appears with metrics)
  const sysContextHeaderOpacity = interpolate(
    frame,
    [TIMING.metricsRevealStart + 20, TIMING.metricsRevealStart + 35],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Chevron rotation
  const chevronRotation = interpolate(accordionExpand, [0, 1], [0, 90])

  // Subtle glow on accordion header when cursor clicks
  const accordionGlow = frame >= TIMING.cursorClick && frame < TIMING.cursorClick + 20
    ? interpolate(frame - TIMING.cursorClick, [0, 10, 20], [0, 0.3, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface.white,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: `1px solid ${colors.surface.gray200}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              fontWeight: 600,
              color: colors.text.primary,
              borderBottom: `2px solid ${colors.brand.primary}`,
              paddingBottom: 2,
            }}
          >
            Chat
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 9,
              fontWeight: 500,
              color: colors.text.secondary,
              background: colors.surface.gray100,
              padding: '2px 7px',
              borderRadius: radius.full,
            }}
          >
            1 credit
          </span>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 9,
              fontWeight: 600,
              color: colors.brand.primary,
              background: 'rgba(4, 156, 240, 0.08)',
              padding: '2px 7px',
              borderRadius: radius.full,
            }}
          >
            standard
          </span>
        </div>
      </div>

      {/* Chat content area */}
      <div
        style={{
          flex: 1,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        {/* User message bubble */}
        {frame >= TIMING.userMessageIn && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              opacity: userMsgOpacity,
              transform: `translateY(${userMsgY}px)`,
            }}
          >
            <div
              style={{
                background: colors.brand.primary,
                color: '#FFFFFF',
                fontFamily: fonts.sans,
                fontSize: 10,
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: '12px 12px 4px 12px',
                maxWidth: '75%',
                lineHeight: 1.5,
              }}
            >
              {USER_MESSAGE}
            </div>
          </div>
        )}

        {/* Aida avatar + response */}
        {frame >= TIMING.typeStart - 10 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              opacity: avatarOpacity,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.primaryLight})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>A</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  fontWeight: 500,
                  color: colors.text.secondary,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Aida
              </span>

              {/* Response text — typewriter */}
              {hasLine1 && (
                <div>
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      color: colors.text.primary,
                      margin: '0 0 6px',
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {typed.line1}
                    {showCursor && currentSegment === 'line1' && (
                      <BlinkingCursor frame={frame} visible />
                    )}
                  </p>
                  {(typed.line2?.length ?? 0) > 0 && (
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 10,
                        color: colors.text.secondary,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {typed.line2}
                      {showCursor && currentSegment === 'line2' && (
                        <BlinkingCursor frame={frame} visible />
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Metrics section ── */}
        {frame >= TIMING.metricsRevealStart && (
          <div style={{ paddingLeft: 30, opacity: metricsOpacity }}>
            {/* Token stats row */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                padding: '8px 0',
                borderTop: `1px solid ${colors.surface.gray200}`,
              }}
            >
              <TokenStat label="Input" targetValue={TOKEN_INPUT} progress={tokenProgress} />
              <TokenStat label="Output" targetValue={TOKEN_OUTPUT} progress={tokenProgress} />
              <TokenStat label="Total" targetValue={TOKEN_TOTAL} progress={tokenProgress} />
            </div>

            {/* Processing time */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                padding: '4px 0',
                opacity: processingOpacity,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 8,
                    color: colors.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Total:
                </span>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 9,
                    fontWeight: 600,
                    color: colors.text.secondary,
                  }}
                >
                  {PROCESSING_TIME}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  opacity: modelOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 8,
                    color: colors.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Model:
                </span>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 9,
                    fontWeight: 600,
                    color: colors.brand.primary,
                  }}
                >
                  {MODEL_NAME}
                </span>
              </div>
            </div>

            {/* System Context accordion */}
            <div
              style={{
                marginTop: 6,
                borderRadius: radius.sm,
                border: `1px solid ${colors.surface.gray200}`,
                overflow: 'hidden',
                opacity: sysContextHeaderOpacity,
                boxShadow: accordionGlow > 0
                  ? `0 0 ${12 * accordionGlow}px rgba(4, 156, 240, ${0.3 * accordionGlow})`
                  : 'none',
              }}
            >
              {/* Accordion header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: colors.surface.gray50,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Chevron */}
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    style={{
                      transform: `rotate(${chevronRotation}deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <path
                      d="M2 1L6 4L2 7"
                      stroke={colors.text.secondary}
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 9,
                      fontWeight: 600,
                      color: colors.text.primary,
                    }}
                  >
                    System Context
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 8,
                      color: colors.text.muted,
                    }}
                  >
                    {SYSTEM_CONTEXT_LINES} lines
                  </span>
                </div>
              </div>

              {/* Accordion content — expands on click */}
              <div
                style={{
                  height: accordionHeight,
                  overflow: 'hidden',
                  borderTop:
                    accordionHeight > 0
                      ? `1px solid ${colors.surface.gray200}`
                      : 'none',
                }}
              >
                <div
                  style={{
                    padding: '6px 10px',
                    opacity: accordionContentOpacity,
                  }}
                >
                  {SYSTEM_PROMPT_LINES.map((line, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 7.5,
                        color: i === 0 ? colors.text.primary : colors.text.secondary,
                        fontWeight: i === 0 ? 600 : 400,
                        margin: '0 0 3px',
                        lineHeight: 1.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
