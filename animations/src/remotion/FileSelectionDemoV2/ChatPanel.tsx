import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

interface ChatPanelProps {
  typeStartFrame: number
  summariseClickFrame: number
}

const CHARS_PER_FRAME = 4
const CURSOR_BLINK_FRAMES = 16

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

const BlinkingCursor: React.FC<{ frame: number; visible: boolean }> = ({
  frame,
  visible,
}) => {
  if (!visible) return null
  const opacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
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

const ACTION_BUTTONS = ['Summarise', 'Discuss', 'Evaluate']

export const ChatPanel: React.FC<ChatPanelProps> = ({
  typeStartFrame,
  summariseClickFrame,
}) => {
  const frame = useCurrentFrame()

  // Typing progress
  const typeElapsed = Math.max(0, frame - typeStartFrame)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = frame >= typeStartFrame && !isTypingDone
  const typed = getTypedSegments(totalCharsTyped)

  // Which segment is currently being typed (for cursor placement)
  const currentSegment = (() => {
    let remaining = totalCharsTyped
    for (const seg of ALL_SEGMENTS) {
      if (remaining < seg.text.length) return seg.type
      remaining -= seg.text.length
    }
    return 'done'
  })()

  // Aida avatar fades in just before typing starts
  const avatarOpacity = interpolate(frame, [typeStartFrame - 10, typeStartFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Summarise button highlight: brief blue tint after click, fades over ~25 frames
  const summariseHighlight =
    frame >= summariseClickFrame
      ? interpolate(frame - summariseClickFrame, [0, 5, 25], [0, 1, 0], {
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
          2 credits/query
        </span>
      </div>

      {/* Chat content area */}
      <div
        style={{
          flex: 1,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        {frame >= typeStartFrame - 10 && (
          <>
            {/* Aida avatar + label */}
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
            {(typed.title1?.length ?? 0) > 0 && (
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
                {(typed.body1?.length ?? 0) > 0 && (
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      color: colors.text.secondary,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {typed.body1}
                    {showCursor && currentSegment === 'body1' && (
                      <BlinkingCursor frame={frame} visible />
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Finding 2 */}
            {(typed.title2?.length ?? 0) > 0 && (
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
                {(typed.body2?.length ?? 0) > 0 && (
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
                    {showCursor && currentSegment === 'body2' && (
                      <BlinkingCursor frame={frame} visible />
                    )}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 14px',
          borderTop: `1px solid ${colors.surface.gray200}`,
          flexShrink: 0,
        }}
      >
        {ACTION_BUTTONS.map((label) => {
          const isSummarise = label === 'Summarise'
          return (
            <div
              key={label}
              style={{
                fontFamily: fonts.sans,
                fontSize: 9,
                fontWeight: 500,
                color: isSummarise && summariseHighlight > 0
                  ? colors.brand.primary
                  : colors.text.secondary,
                background:
                  isSummarise && summariseHighlight > 0
                    ? `rgba(4, 156, 240, ${0.15 * summariseHighlight})`
                    : colors.surface.gray100,
                padding: '5px 12px',
                borderRadius: radius.full,
              }}
            >
              {label}
            </div>
          )
        })}
        {/* Send button */}
        <div
          style={{
            marginLeft: 'auto',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: colors.brand.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M7 3l3 3-3 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
