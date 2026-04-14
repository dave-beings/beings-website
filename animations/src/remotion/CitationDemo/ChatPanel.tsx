import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

interface ChatPanelProps {
  clickFrame: number
  highlightOutFrame: number
  typeStartFrame: number
}

/** Characters typed per frame (higher = faster typing) */
const CHARS_PER_FRAME = 4
/** Blinking cursor blink cycle in frames */
const CURSOR_BLINK_FRAMES = 16

// All text content as a structured sequence for typing
const FINDING_1_TITLE = '1. Clarity and Accessibility'
const FINDING_1_BODY_PRE = 'Participants frequently mentioned the importance of clear communication about the study, its purpose, and what was expected of them.'
const FINDING_1_BODY_POST = ' Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats, including written and face-to-face explanations.'
const FINDING_2_TITLE = '2. Respectful and Supportive Staff Interaction'
const FINDING_2_BODY = 'A recurring sentiment was the desire to feel respected, valued, and listened to by the research team.'

// Concatenated full text for character counting
const ALL_SEGMENTS = [
  { text: FINDING_1_TITLE, type: 'title1' as const },
  { text: FINDING_1_BODY_PRE, type: 'body1pre' as const },
  { text: FINDING_1_BODY_POST, type: 'body1post' as const },
  { text: FINDING_2_TITLE, type: 'title2' as const },
  { text: FINDING_2_BODY, type: 'body2' as const },
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
  number: number
  isActive: boolean
  glowOpacity: number
  visible: boolean
}> = ({ number, isActive, glowOpacity, visible }) => {
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
        background: isActive
          ? colors.brand.primary
          : 'rgba(4, 156, 240, 0.12)',
        color: isActive ? '#fff' : colors.brand.primary,
        fontFamily: fonts.sans,
        fontSize: 10,
        fontWeight: 600,
        marginLeft: 3,
        verticalAlign: 'middle',
        position: 'relative' as const,
        boxShadow: glowOpacity > 0
          ? `0 0 ${10 * glowOpacity}px rgba(4, 156, 240, ${0.4 * glowOpacity})`
          : 'none',
      }}
    >
      {number}
    </span>
  )
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  clickFrame,
  highlightOutFrame,
  typeStartFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Typing progress
  const typeElapsed = Math.max(0, frame - typeStartFrame)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = frame >= typeStartFrame && !isTypingDone

  const typed = getTypedSegments(totalCharsTyped)
  const hasTitle1 = (typed.title1?.length ?? 0) > 0
  const hasBody1Pre = (typed.body1pre?.length ?? 0) > 0
  const hasBody1Post = (typed.body1post?.length ?? 0) > 0
  const body1PreDone = typed.body1pre?.length === FINDING_1_BODY_PRE.length
  const body1PostDone = typed.body1post?.length === FINDING_1_BODY_POST.length
  const hasTitle2 = (typed.title2?.length ?? 0) > 0
  const hasBody2 = (typed.body2?.length ?? 0) > 0
  const body2Done = typed.body2?.length === FINDING_2_BODY.length

  // Which segment is currently being typed (for cursor placement)
  const currentSegment = (() => {
    let remaining = totalCharsTyped
    for (const seg of ALL_SEGMENTS) {
      if (remaining < seg.text.length) return seg.type
      remaining -= seg.text.length
    }
    return 'done'
  })()

  // Citation [1] glow effect after click
  const glowIn = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  })
  const glowOut = interpolate(
    frame,
    [highlightOutFrame, highlightOutFrame + 25],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  const citationGlow = frame >= clickFrame ? glowIn * glowOut : 0
  const isCitationActive = frame >= clickFrame && frame < highlightOutFrame + 25

  // Aida avatar fades in at type start
  const avatarOpacity = interpolate(frame, [typeStartFrame - 10, typeStartFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

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
            2 credits
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
            better
          </span>
        </div>
      </div>

      {/* Chat content */}
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
        {/* Aida avatar + response header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: avatarOpacity }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.primaryLight})`,
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
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              color: colors.text.secondary,
              marginTop: 4,
            }}
          >
            Aida
          </span>
        </div>

        {/* Finding 1 */}
        {hasTitle1 && (
          <div style={{ paddingLeft: 32 }}>
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
              {typed.title1}
              {showCursor && currentSegment === 'title1' && (
                <BlinkingCursor frame={frame} visible />
              )}
            </p>
            {hasBody1Pre && (
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  color: colors.text.secondary,
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
                {showCursor && currentSegment === 'body1pre' && (
                  <BlinkingCursor frame={frame} visible />
                )}
                {hasBody1Post && (
                  <>
                    {typed.body1post}
                    {body1PostDone && (
                      <CitationBadge number={4} isActive={false} glowOpacity={0} visible />
                    )}
                    {showCursor && currentSegment === 'body1post' && (
                      <BlinkingCursor frame={frame} visible />
                    )}
                  </>
                )}
              </p>
            )}
          </div>
        )}

        {/* Finding 2 */}
        {hasTitle2 && (
          <div style={{ paddingLeft: 32 }}>
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
              {typed.title2}
              {showCursor && currentSegment === 'title2' && (
                <BlinkingCursor frame={frame} visible />
              )}
            </p>
            {hasBody2 && (
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  color: colors.text.secondary,
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
                {showCursor && currentSegment === 'body2' && (
                  <BlinkingCursor frame={frame} visible />
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
